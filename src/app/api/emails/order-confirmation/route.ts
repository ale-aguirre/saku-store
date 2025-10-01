import { NextRequest, NextResponse } from "next/server";
import { sendOrderConfirmationEmail } from "@/lib/email";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import nodemailer from "nodemailer";

const orderConfirmationSchema = z.object({
  orderId: z.string().uuid(),
  customerEmail: z.string().email(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, customerEmail } = orderConfirmationSchema.parse(body);

    // Crear cliente de Supabase
    const supabase = await createClient();

    // Obtener la orden con sus items
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select(
        `
        *,
        order_items (
          id,
          quantity,
          unit_price,
          total_price,
          product_name,
          variant_name
        )
      `
      )
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      console.error("Error obteniendo orden:", orderError);
      return NextResponse.json(
        { error: "Orden no encontrada" },
        { status: 404 }
      );
    }

    // Enviar email de confirmación
    const emailResult = await sendOrderConfirmationEmail({
      order,
      customerEmail,
      items: (order as any).order_items || [],
    });

    if (!emailResult.success) {
      console.error("Error enviando email:", emailResult.error);
      return NextResponse.json(
        { error: "Error enviando email de confirmación" },
        { status: 500 }
      );
    }

    // Registrar el evento de email enviado
    const { error: eventError } = await (supabase.from("order_events") as any).insert({
      order_id: orderId,
      type: "email_sent",
      metadata: {
        email_type: "order_confirmation",
        recipient: customerEmail,
        message_id: emailResult.messageId,
      },
      created_at: new Date().toISOString(),
    });

    if (eventError) {
      console.error("Error registrando evento:", eventError);
      // No fallar la respuesta por esto, solo loggear
    }

    return NextResponse.json({
      success: true,
      messageId: emailResult.messageId,
    });
  } catch (error) {
    console.error("Error en API de confirmación de orden:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// Endpoint para probar la configuración de email
export async function GET() {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.verify();

    return NextResponse.json({
      success: true,
      message: "Configuración de email válida",
      config: {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: process.env.SMTP_SECURE,
        from: process.env.SMTP_FROM,
      },
    });
  } catch (error) {
    console.error("Error verificando configuración de email:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error en configuración de email",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    );
  }
}
