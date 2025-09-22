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
  application_id: z.number(),
  user_id: z.number(),
  version: z.number(),
  api_version: z.string(),
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

    const payment = await paymentResponse.json();

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
                orderNumber: orderData.external_reference,
                customerName: `${orderData.profiles.first_name} ${orderData.profiles.last_name}`,
                total: orderData.total,
                items: orderData.order_items.map((item: any) => ({
                  name: item.product_variants.products.name,
                  quantity: item.quantity,
                  price: item.price,
                  size: item.product_variants.size,
                  color: item.product_variants.color,
                })),
                shippingAddress: orderData.shipping_address,
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
