import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { Prisma } from '@prisma/client';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Error interno del servidor';
    let error = 'Internal Server Error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      
      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const responseObj = exceptionResponse as Record<string, any>;
        message = responseObj.message || exception.message;
        error = responseObj.error || 'Error';
      } else {
        message = exception.message;
      }
    } else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      const prismaResponse = this.handlePrismaError(exception);
      status = prismaResponse.status;
      message = prismaResponse.message;
      error = prismaResponse.error;
    } else if (exception instanceof Prisma.PrismaClientValidationError) {
      status = HttpStatus.BAD_REQUEST;
      message = 'Error de validación en la base de datos';
      error = 'Bad Request';
    }

    response.status(status).json({
      statusCode: status,
      error,
      message: Array.isArray(message) ? message : [message],
      timestamp: new Date().toISOString(),
    });
  }

  private handlePrismaError(exception: Prisma.PrismaClientKnownRequestError) {
    switch (exception.code) {
      case 'P2002': {
        const fields = (exception.meta?.target as string[])?.join(', ') || 'campos';
        return {
          status: HttpStatus.CONFLICT,
          message: `Ya existe un registro con ese ${fields}`,
          error: 'Conflict',
        };
      }
      case 'P2025':
        return {
          status: HttpStatus.NOT_FOUND,
          message: 'Registro no encontrado',
          error: 'Not Found',
        };
      case 'P2003':
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Referencia inválida: el registro relacionado no existe',
          error: 'Bad Request',
        };
      case 'P2014':
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'La operación violaría una relación requerida',
          error: 'Bad Request',
        };
      case 'P2021':
        return {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Error de esquema en la base de datos',
          error: 'Internal Server Error',
        };
      case 'P2022':
        return {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Columna no encontrada en la base de datos',
          error: 'Internal Server Error',
        };
      default:
        return {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Error interno de base de datos',
          error: 'Internal Server Error',
        };
    }
  }
}
