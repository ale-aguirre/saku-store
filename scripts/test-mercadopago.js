/**
 * Script para probar la integración con Mercado Pago
 * 
 * Este script permite:
 * 1. Probar la creación de una preferencia de pago
 * 2. Simular un webhook de Mercado Pago
 * 
 * Uso:
 * - node test-mercadopago.js create-preference
 * - node test-mercadopago.js simulate-webhook
 */

const fetch = require('node-fetch');
require('dotenv').config();

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

// Datos de prueba para crear una preferencia
const testCheckoutData = {
  items: [
    {
      id: 'test-product-1',
      name: 'Producto de Prueba',
      price: 10000, // $100.00
      quantity: 1,
      size: '85',
      color: 'Negro',
      image: '/images/placeholder-product.svg'
    }
  ],
  shippingData: {
    firstName: 'Usuario',
    lastName: 'De Prueba',
    email: 'test@example.com',
    phone: '1234567890',
    address: 'Calle Falsa 123',
    city: 'Córdoba',
    postalCode: '5000',
    province: 'Córdoba',
    shippingMethod: 'cadete',
    notes: 'Esto es una prueba'
  },
  shippingCost: 2500, // $25.00
  total: 12500 // $125.00
};

// Datos de prueba para simular un webhook
const testWebhookData = {
  id: 12345678,
  live_mode: false,
  type: 'payment',
  date_created: new Date().toISOString(),
  application_id: 123456,
  user_id: 987654,
  version: 1,
  api_version: 'v1',
  action: 'payment.created',
  data: {
    id: '12345678901'
  }
};

// Función para crear una preferencia de pago
async function createPreference() {
  console.log('Creando preferencia de pago de prueba...');
  
  try {
    const response = await fetch(`${BASE_URL}/api/checkout/create-preference`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testCheckoutData),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      console.error('Error al crear la preferencia:', data);
      return;
    }
    
    console.log('Preferencia creada exitosamente:');
    console.log(JSON.stringify(data, null, 2));
    console.log('\nURL de pago:');
    console.log(data.initPoint);
  } catch (error) {
    console.error('Error al crear la preferencia:', error);
  }
}

// Función para simular un webhook
async function simulateWebhook() {
  console.log('Simulando webhook de Mercado Pago...');
  
  try {
    const response = await fetch(`${BASE_URL}/api/webhooks/mercadopago`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testWebhookData),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      console.error('Error al simular el webhook:', data);
      return;
    }
    
    console.log('Webhook simulado exitosamente:');
    console.log(JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error al simular el webhook:', error);
  }
}

// Función principal
async function main() {
  const command = process.argv[2];
  
  if (!command) {
    console.log('Uso: node test-mercadopago.js [create-preference|simulate-webhook]');
    return;
  }
  
  switch (command) {
    case 'create-preference':
      await createPreference();
      break;
    case 'simulate-webhook':
      await simulateWebhook();
      break;
    default:
      console.log('Comando no reconocido. Uso: node test-mercadopago.js [create-preference|simulate-webhook]');
  }
}

main().catch(console.error);