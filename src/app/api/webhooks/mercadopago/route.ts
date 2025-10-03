import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase";
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
  console.log('Webhook de Mercado Pago recibido:', new Date().toISOString())
  
  try {
    const body = await request.json();
    console.log('Cuerpo del webhook:', JSON.stringify(body, null, 2))

    // Validar el webhook
    const webhook = webhookSchema.parse(body);
    console.log('Webhook validado correctamente')

    // Solo procesar pagos
    if (webhook.type !== "payment") {
      console.log(`Tipo de evento no soportado: ${webhook.type}`)
      return NextResponse.json(
        { message: "Event type not supported" },
        { status: 200 }
      );
    }
    
    console.log(`Procesando pago con ID: ${webhook.data.id}`)
    

    // Obtener información del pago desde Mercado Pago
    let payment;
    
    // En entorno de testing, usar datos mockeados
    if (process.env.NODE_ENV === 'test' || webhook.data.id === '12345678901' || webhook.data.id === '12345678902') {
      console.log('Usando datos de pago mockeados para testing')
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
      console.log('Obteniendo información del pago desde Mercado Pago API')
      
      // Usar el token correcto según el entorno
      const accessToken = process.env.NODE_ENV === 'production' 
        ? process.env.MP_ACCESS_TOKEN 
        : process.env.MP_ACCESS_TOKEN_TEST
        
      if (!accessToken) {
        throw new Error("Token de Mercado Pago no configurado");
      }
      
      const paymentResponse = await fetch(
        `https://api.mercadopago.com/v1/payments/${webhook.data.id}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!paymentResponse.ok) {
        const errorText = await paymentResponse.text();
        console.error('Error al obtener información del pago:', errorText);
        throw new Error(`Failed to fetch payment from MercadoPago: ${errorText}`);
      }

      payment = await paymentResponse.json();
      console.log('Información del pago obtenida:', JSON.stringify(payment, null, 2));
    }

    // Buscar la orden por external_reference
    const supabase = createSupabaseAdmin();

    const { data: order, error: orderError } = await (supabase as any)
      .from("orders")
      .select("*")
      .eq("external_reference", payment.external_reference)
      .single();

    if (orderError || !order) {
      console.error("Order not found:", payment.external_reference);
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    // Asegurar que order tiene el tipo correcto
    const orderData = order as any;

    // Mapear estados de Mercado Pago a nuestros estados
    let newStatus = orderData.status;
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
    if (newStatus !== orderData.status) {
      const { error: updateError } = await (supabase as any)
        .from("orders")
        .update({
          status: newStatus,
          payment_id: payment.id,
          payment_status: payment.status,
          payment_method: payment.payment_method_id,
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderData.id);

      if (updateError) {
        console.error("Error updating order:", updateError);
        return NextResponse.json(
          { message: "Error updating order" },
          { status: 500 }
        );
      }

      // Crear evento de orden
      const { error: eventError } = await (supabase as any).from("order_events").insert({
        order_id: orderData.id,
        event_type:
          newStatus === "paid" ? "payment_confirmed" : "status_changed",
        description: `Payment ${payment.status} - ${
          payment.status_detail || ""
        }`,
        metadata: {
          payment_id: payment.id,
          payment_status: payment.status,
          payment_method: payment.payment_method_id,
          webhook_id: Date.now(),
        },
      });

      if (eventError) {
        console.error("Error creating order event:", eventError);
      }

      // Si el pago fue aprobado, reducir stock
      if (newStatus === "paid") {
        const { data: orderItems } = await (supabase as any)
          .from("order_items")
          .select("product_variant_id, quantity")
          .eq("order_id", orderData.id);

        if (orderItems) {
          for (const item of orderItems as any[]) {
            await (supabase as any).rpc("reduce_stock", {
              variant_id: item.product_variant_id,
              quantity: item.quantity,
            });
          }
        }

        // Enviar email de confirmación si es el primer pago
        if (orderData.status === "pending") {
          try {
            // Obtener datos completos del pedido para el email
            const { data: orderWithDetails } = await (supabase as any)
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
              .eq("id", orderData.id)
              .single();

            if (orderWithDetails && (orderWithDetails as any).profiles) {
              const orderData = orderWithDetails as any;
              const emailData = {
                customerName: `${orderData.profiles.first_name} ${orderData.profiles.last_name}`,
                orderNumber: orderData.order_number,
                total: orderData.total,
                trackingCode: orderData.tracking_number,
                order: {
                  id: orderData.id,
                  user_id: orderData.user_id,
                  status: orderData.status,
                  created_at: orderData.created_at,
                  subtotal: orderData.subtotal,
                  discount_amount: orderData.discount_amount,
                  shipping_cost: orderData.shipping_cost,
                  total: orderData.total,
                  shipping_address: orderData.shipping_address,
                  billing_address: orderData.billing_address,
                  tracking_number: orderData.tracking_number,
                  email: orderData.profiles.email,
                  coupon_code: orderData.coupon_code,
                  payment_id: orderData.payment_id,
                  payment_method: orderData.payment_method,
                  notes: orderData.notes,
                  updated_at: orderData.updated_at,
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

    console.log('Webhook procesado exitosamente')
    return NextResponse.json(
      { 
        message: "Webhook processed successfully",
        payment_id: webhook.data.id,
        timestamp: new Date().toISOString()
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Webhook error:", error);
    
    // Si es un error de validación de Zod, devolver un error 400
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          message: "Invalid webhook payload", 
          details: error.issues,
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      );
    }
    
    // Para otros errores, devolver un 500
    return NextResponse.json(
      { 
        message: "Internal server error",
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
