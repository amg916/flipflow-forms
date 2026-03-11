import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

const BASE_POLICY = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com https://www.google.com https://www.gstatic.com",
  "style-src 'self' 'unsafe-inline'",
  "frame-ancestors 'self' *",
  "img-src 'self' data: https:",
  "connect-src 'self' https:",
].join('; ');

const EMBED_POLICY = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com https://www.google.com https://www.gstatic.com",
  "style-src 'self' 'unsafe-inline'",
  'frame-ancestors *',
  "img-src 'self' data: https:",
  "connect-src 'self' https:",
].join('; ');

@Injectable()
export class CspMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    const isEmbedRoute = req.path.includes('/forms/');
    const policy = isEmbedRoute ? EMBED_POLICY : BASE_POLICY;
    res.setHeader('Content-Security-Policy', policy);
    next();
  }
}
