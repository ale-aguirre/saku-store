import { CorreoArgentinoApi } from 'ylazzari-correoargentino';
import { Environment, DeliveredType, DocumentType, ProvinceCode } from 'ylazzari-correoargentino/enums';

// Tipos para el cliente
export interface ShippingDimensions {
  length: number;
  width: number;
  height: number;
  weight: number;
  quantity: number;
}

export interface ShippingRateRequest {
  dimensions: ShippingDimensions[];
  postalCodeOrigin: string;
  postalCodeDestination: string;
  deliveredType?: DeliveredType;
}

export interface ShippingRateResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export interface TrackingResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export interface AgencyResponse {
  success: boolean;
  data?: any;
  error?: string;
}

/**
 * Cliente para la API de Correo Argentino
 * Wrapper para ylazzari-correoargentino con funciones específicas para Sakú
 */
export class CorreoArgentinoClient {
  private api: CorreoArgentinoApi;
  private initialized: boolean = false;

  constructor() {
    this.api = new CorreoArgentinoApi();
  }

  /**
   * Inicializa el cliente con las credenciales de Correo Argentino
   * Las credenciales deben estar en las variables de entorno
   */
  async initialize(): Promise<void> {
    try {
      const userToken = process.env.CORREO_ARGENTINO_USER_TOKEN;
      const passwordToken = process.env.CORREO_ARGENTINO_PASSWORD_TOKEN;
      const email = process.env.CORREO_ARGENTINO_EMAIL;
      const password = process.env.CORREO_ARGENTINO_PASSWORD;
      const customerId = process.env.CORREO_ARGENTINO_CUSTOMER_ID;

      if (!userToken || !passwordToken) {
        throw new Error('Credenciales de Correo Argentino no configuradas');
      }

      // Si tenemos customerId, usar inicialización con customerId
      if (customerId) {
        await this.api.initializeWithCustomerId({
          userToken,
          passwordToken,
          customerId,
          environment: Environment.PROD
        });
      } else if (email && password) {
        // Si no tenemos customerId pero sí email/password, usar inicialización completa
        await this.api.initializeAll({
          userToken,
          passwordToken,
          email,
          password,
          environment: Environment.PROD
        });
      } else {
        throw new Error('Se requiere customerId o email/password para inicializar');
      }

      this.initialized = true;
    } catch (error) {
      console.error('Error al inicializar Correo Argentino:', error);
      throw error;
    }
  }

  /**
   * Obtiene las tarifas de envío para un paquete
   */
  async getShippingRates(request: ShippingRateRequest): Promise<ShippingRateResponse> {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      const data = {
        dimensions: request.dimensions,
        customerId: this.api.getVarCustomerId(),
        postalCodeOrigin: request.postalCodeOrigin,
        postalCodeDestination: request.postalCodeDestination,
        deliveredType: request.deliveredType || DeliveredType.D
      };

      const response = await this.api.getRates(data);
      
      return {
        success: true,
        data: response
      };
    } catch (error) {
      console.error('Error al obtener tarifas:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Obtiene el tracking de un envío
   * Nota: Esta función necesita ser implementada cuando tengamos acceso a la API de tracking
   */
  async getTracking(_trackingNumber: string): Promise<TrackingResponse> {
    try {
      // TODO: Implementar cuando tengamos acceso a la API de tracking
      // Por ahora retornamos un placeholder
      return {
        success: false,
        error: 'Función de tracking no implementada aún'
      };
    } catch (error) {
      console.error('Error al obtener tracking:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Obtiene las agencias de una provincia
   */
  async getAgencies(provinceCode: ProvinceCode): Promise<AgencyResponse> {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      const response = await this.api.getAgencies(provinceCode);
      
      return {
        success: true,
        data: response
      };
    } catch (error) {
      console.error('Error al obtener agencias:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Calcula el costo de envío para productos de Sakú
   * Función específica para el e-commerce
   */
  async calculateShippingCost(
    items: Array<{ weight: number; quantity: number }>,
    destinationPostalCode: string,
    originPostalCode: string = '5000' // Córdoba por defecto
  ): Promise<ShippingRateResponse> {
    try {
      // Calcular dimensiones totales basadas en los productos
      const totalWeight = items.reduce((sum, item) => sum + (item.weight * item.quantity), 0);
      
      // Dimensiones estándar para lencería (ajustar según productos reales)
      const dimensions: ShippingDimensions[] = [{
        length: 25, // cm
        width: 20,  // cm
        height: 5,  // cm
        weight: Math.max(totalWeight, 100), // mínimo 100g
        quantity: 1
      }];

      return await this.getShippingRates({
        dimensions,
        postalCodeOrigin: originPostalCode,
        postalCodeDestination: destinationPostalCode,
        deliveredType: DeliveredType.D // Domicilio
      });
    } catch (error) {
      console.error('Error al calcular costo de envío:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al calcular envío'
      };
    }
  }

  /**
   * Verifica si el cliente está inicializado
   */
  isInitialized(): boolean {
    return this.initialized;
  }
}

// Instancia singleton del cliente
let correoArgentinoClient: CorreoArgentinoClient | null = null;

/**
 * Obtiene la instancia del cliente de Correo Argentino
 */
export function getCorreoArgentinoClient(): CorreoArgentinoClient {
  if (!correoArgentinoClient) {
    correoArgentinoClient = new CorreoArgentinoClient();
  }
  return correoArgentinoClient;
}

// Exportar tipos y enums para uso en otros archivos
export { Environment, DeliveredType, DocumentType, ProvinceCode };
