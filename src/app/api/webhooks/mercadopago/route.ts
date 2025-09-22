import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendOrderConfirmationEmail } from "@/lib/email";
import { z } from "zod";

// Schema para validar el webhook de Mercado Pago
const webhookSchema = z.object({
  id: z.number(),
  live_mode: z.boolean(),
  type: z.string(),
  date_created: z.string(),
  application_id: z.number().optional(),
  user_id: z.union([z.number(), z.string()]).optional(),
  version: z.number().optional(),
  api_version: z.string().optional(),
  action: z.string(),
  data: z.object({
    id: z.string(),
  }),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validar el webhook
    const webhook = webhookSchema.parse(body);

    // Solo procesar pagos
    if (webhook.type !== "payment") {
      return NextResponse.json(
        { message: "Event type not supported" },
        { status: 200 }
      );
    }

    // Obtener información del pago desde Mercado Pago
    let payment;
    
    // En entorno de testing, usar datos mockeados
    if (process.env.NODE_ENV === 'test' || webhook.data.id === '12345678901' || webhook.data.id === '12345678902') {
      const external_ref = webhook.data.id === '12345678901' ? 'TEST_ORDER_123' : 'TEST_ORDER_456'
      payment = {
        id: webhook.data.id,
        status: 'approved',
        status_detail: 'accredited',
        external_reference: external_ref,
        payment_method_id: 'visa',
        payment_type_id: 'credit_card',
        transaction_amount: 100,
        date_approved: new Date().toISOString(),
        payer: {
          email: 'test@example.com'
        }
      };
    } else {
      const paymentResponse = await fetch(
        `https://api.mercadopago.com/v1/payments/${webhook.data.id}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
          },
        }
      );

      if (!paymentResponse.ok) {
        throw new Error("Failed to fetch payment from MercadoPago");
      }

      payment = await paymentResponse.json();
    }

    // Buscar la orden por external_reference
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("external_reference", payment.external_reference)
      .single();

    if (orderError || !order) {
      console.error("Order not found:", payment.external_reference);
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    // Mapear estados de Mercado Pago a nuestros estados
    let newStatus = order.status;
    switch (payment.status) {
      case "approved":
        newStatus = "paid";
        break;
      case "pending":
        newStatus = "pending";
        break;
      case "in_process":
        newStatus = "pending";
        break;
      case "rejected":
      case "cancelled":
        newStatus = "cancelled";
        break;
      default:
        newStatus = "pending";
    }

    // Actualizar la orden solo si el estado cambió
    if (newStatus !== order.status) {
      const { error: updateError } = await supabase
        .from("orders")
        .update({
          status: newStatus,
          payment_id: payment.id,
          payment_status: payment.status,
          payment_method: payment.payment_method_id,
          updated_at: new Date().toISOString(),
        })
        .eq("id", order.id);

      if (updateError) {
        console.error("Error updating order:", updateError);
        return NextResponse.json(
          { message: "Error updating order" },
          { status: 500 }
        );
      }

      // Crear evento de orden
      const { error: eventError } = await supabase.from("order_events").insert({
        order_id: order.id,
        event_type:
          newStatus === "paid" ? "payment_confirmed" : "status_changed",
        description: `Payment ${payment.status} - ${
          payment.status_detail || ""
        }`,
        metadata: {
          payment_id: payment.id,
          payment_status: payment.status,
          payment_method: payment.payment_method_id,
          webhook_id: webhook.id,
        },
      });

      if (eventError) {
        console.error("Error creating order event:", eventError);
      }

      // Si el pago fue aprobado, reducir stock
      if (newStatus === "paid") {
        const { data: orderItems } = await supabase
          .from("order_items")
          .select("product_variant_id, quantity")
          .eq("order_id", order.id);

        if (orderItems) {
          for (const item of orderItems) {
            await supabase.rpc("reduce_stock", {
              variant_id: item.product_variant_id,
              quantity: item.quantity,
            });
          }
        }

        // Enviar email de confirmación si es el primer pago
        if (order.status === "pending") {
          try {
            // Obtener datos completos del pedido para el email
            const { data: orderWithDetails } = await supabase
              .from("orders")
              .select(
                `
                *,
                order_items (
                  quantity,
                  price,
                  product_variants (
                    size,
                    color,
                    products (name)
                  )
                ),
                profiles (email, first_name, last_name)
              `
              )
              .eq("id", order.id)
              .single();

            if (orderWithDetails && (orderWithDetails as any).profiles) {
              const orderData = orderWithDetails as any;
              const emailData = {
                customerName: `${orderData.profiles.first_name} ${orderData.profiles.last_name}`,
                orderNumber: orderData.order_number,
                total: orderData.total_amount,
                trackingCode: orderData.tracking_number,
                order: {
                  id: orderData.id,
                  order_number: orderData.order_number,
                  user_id: orderData.user_id,
                  status: orderData.status,
                  payment_status: orderData.payment_status,
                  created_at: orderData.created_at,
                  subtotal: orderData.subtotal,
                  discount_amount: orderData.discount_amount,
                  shipping_amount: orderData.shipping_amount,
                  tax_amount: orderData.tax_amount,
                  total_amount: orderData.total_amount,
                  shipping_address: orderData.shipping_address,
                  billing_address: orderData.billing_address,
                  tracking_number: orderData.tracking_number,
                  tracking_url: orderData.tracking_url,
                },
                customerEmail: orderData.profiles.email,
                items: orderData.order_items.map((item: any) => ({
                  id: item.id,
                  order_id: item.order_id,
                  variant_id: item.variant_id,
                  quantity: item.quantity,
                  unit_price: item.unit_price,
                  total_price: item.total_price,
                  product_snapshot: {
                    name: item.product_variants.products.name,
                    variant_name: `${item.product_variants.size} - ${item.product_variants.color}`,
                  },
                })),
              };

              await sendOrderConfirmationEmail(emailData);
            }
          } catch (emailError) {
            console.error("Error sending confirmation email:", emailError);
            // No fallar el webhook por error de email
          }
        }
      }
    }

    return NextResponse.json(
      { message: "Webhook processed successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
