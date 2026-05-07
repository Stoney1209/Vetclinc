import { toast } from 'sonner';

export interface ApiError {
  message: string;
  statusCode?: number;
  code?: string;
  details?: any;
}

export class ErrorHandler {
  static handle(error: any): string {
    console.error('API Error:', error);

    // Error de respuesta de API
    if (error.response?.data) {
      const apiError: ApiError = error.response.data;
      
      // Manejar errores específicos según el código de estado
      switch (error.response.status) {
        case 400:
          return this.handleBadRequest(apiError);
        case 401:
          return this.handleUnauthorized(apiError);
        case 403:
          return this.handleForbidden(apiError);
        case 404:
          return this.handleNotFound(apiError);
        case 409:
          return this.handleConflict(apiError);
        case 422:
          return this.handleValidationError(apiError);
        case 429:
          return this.handleRateLimit(apiError);
        case 500:
          return this.handleServerError(apiError);
        default:
          return apiError.message || 'Error inesperado';
      }
    }

    // Error de red o conexión
    if (error.code === 'ECONNREFUSED' || error.code === 'NETWORK_ERROR') {
      return 'Error de conexión. Verifica tu conexión a internet.';
    }

    // Error de timeout
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      return 'La solicitud tardó demasiado tiempo. Intenta nuevamente.';
    }

    // Error genérico
    return error.message || 'Ocurrió un error inesperado';
  }

  private static handleBadRequest(error: ApiError): string {
    return error.message || 'Solicitud inválida';
  }

  private static handleUnauthorized(error: ApiError): string {
    return 'No autorizado. Inicia sesión nuevamente.';
  }

  private static handleForbidden(error: ApiError): string {
    return 'No tienes permisos para realizar esta acción.';
  }

  private static handleNotFound(error: ApiError): string {
    return error.message || 'Recurso no encontrado';
  }

  private static handleConflict(error: ApiError): string {
    return error.message || 'Conflicto de datos';
  }

  private static handleValidationError(error: ApiError): string {
    if (error.details && Array.isArray(error.details)) {
      return error.details.map((detail: any) => detail.message).join(', ');
    }
    return error.message || 'Datos inválidos';
  }

  private static handleRateLimit(error: ApiError): string {
    return 'Demasiadas solicitudes. Espera un momento e intenta nuevamente.';
  }

  private static handleServerError(error: ApiError): string {
    return 'Error del servidor. Intenta nuevamente más tarde.';
  }

  // Método para mostrar toast con error
  static showError(error: any, customMessage?: string) {
    const message = customMessage || this.handle(error);
    toast.error(message);
  }

  // Método para mostrar toast con éxito
  static showSuccess(message: string) {
    toast.success(message);
  }

  // Método para mostrar toast informativo
  static showInfo(message: string) {
    toast.info(message);
  }

  // Método para mostrar toast de advertencia
  static showWarning(message: string) {
    toast.warning(message);
  }
}

// Hook para manejo de errores en componentes
export const useErrorHandler = () => {
  return {
    handleError: ErrorHandler.handle.bind(ErrorHandler),
    showError: ErrorHandler.showError.bind(ErrorHandler),
    showSuccess: ErrorHandler.showSuccess.bind(ErrorHandler),
    showInfo: ErrorHandler.showInfo.bind(ErrorHandler),
    showWarning: ErrorHandler.showWarning.bind(ErrorHandler),
  };
};
