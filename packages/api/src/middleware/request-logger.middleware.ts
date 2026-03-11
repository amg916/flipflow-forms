import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    const start = Date.now();

    res.on('finish', () => {
      const durationMs = Date.now() - start;
      const logEntry = {
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        durationMs,
        requestId: req.headers['x-request-id'] as string | undefined,
      };
      console.log(JSON.stringify(logEntry));
    });

    next();
  }
}
