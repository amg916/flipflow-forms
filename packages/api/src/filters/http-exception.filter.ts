import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  NotFoundException,
  ForbiddenException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { randomUUID } from 'crypto';

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
const STATUS_CODE_MAP = new Map<Function, string>([
  [NotFoundException, 'NOT_FOUND'],
  [ForbiddenException, 'FORBIDDEN'],
  [UnauthorizedException, 'UNAUTHORIZED'],
  [BadRequestException, 'BAD_REQUEST'],
]);

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const requestId = (request.headers['x-request-id'] as string) || randomUUID();

    const statusCode =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    const code = this.resolveErrorCode(exception);
    const message = this.resolveMessage(exception);
    const details = this.resolveDetails(exception);

    const logEntry = {
      level: statusCode >= 500 ? 'error' : 'warn',
      requestId,
      method: request.method,
      url: request.url,
      statusCode,
      message,
      stack: exception instanceof Error ? exception.stack : undefined,
    };

    if (statusCode >= 500) {
      console.error(JSON.stringify(logEntry));
    } else {
      console.warn(JSON.stringify(logEntry));
    }

    const body: Record<string, unknown> = {
      success: false,
      error: {
        code,
        message,
        ...(details ? { details } : {}),
        requestId,
      },
    };

    response.status(statusCode).json(body);
  }

  private resolveErrorCode(exception: unknown): string {
    if (exception instanceof HttpException) {
      for (const [ExceptionClass, code] of STATUS_CODE_MAP) {
        if (exception instanceof ExceptionClass) {
          return code;
        }
      }
      return 'HTTP_ERROR';
    }
    return 'INTERNAL_ERROR';
  }

  private resolveMessage(exception: unknown): string {
    if (exception instanceof HttpException) {
      const response = exception.getResponse();
      if (typeof response === 'string') {
        return response;
      }
      if (typeof response === 'object' && response !== null && 'message' in response) {
        const msg = (response as Record<string, unknown>).message;
        return Array.isArray(msg) ? msg.join(', ') : String(msg);
      }
      return exception.message;
    }
    if (exception instanceof Error) {
      return exception.message;
    }
    return 'Internal server error';
  }

  private resolveDetails(exception: unknown): unknown | undefined {
    if (exception instanceof BadRequestException) {
      const response = exception.getResponse();
      if (typeof response === 'object' && response !== null && 'message' in response) {
        const msg = (response as Record<string, unknown>).message;
        if (Array.isArray(msg)) {
          return msg;
        }
      }
    }
    return undefined;
  }
}
