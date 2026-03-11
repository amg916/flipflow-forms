import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma.service';
import { SESSION_MAX_AGE, SESSION_COOKIE_NAME } from '@flipflow/shared';
import { SignupDto, LoginDto } from './auth.dto';
import type { Response } from 'express';

const BCRYPT_ROUNDS = 12;

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async signup(dto: SignupDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        name: dto.name,
        passwordHash,
      },
    });

    this.logger.log(`User created: ${user.id}`);
    return { id: user.id, email: user.email, name: user.name };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + SESSION_MAX_AGE * 1000);

    await this.prisma.session.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
      },
    });

    return { token, expiresAt, user: { id: user.id, email: user.email, name: user.name } };
  }

  async logout(sessionToken: string) {
    await this.prisma.session.deleteMany({ where: { token: sessionToken } });
  }

  async validateSession(token: string) {
    const session = await this.prisma.session.findUnique({ where: { token } });
    if (!session || session.expiresAt < new Date()) {
      return null;
    }
    return this.prisma.user.findUnique({
      where: { id: session.userId },
      select: { id: true, email: true, name: true },
    });
  }

  setSessionCookie(res: Response, token: string) {
    res.cookie(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: this.config.get('NODE_ENV') === 'production',
      sameSite: 'lax',
      maxAge: SESSION_MAX_AGE * 1000,
      path: '/',
    });
  }

  clearSessionCookie(res: Response) {
    res.clearCookie(SESSION_COOKIE_NAME, { path: '/' });
  }

  async createPasswordResetToken(email: string): Promise<string | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      return null; // Don't reveal if user exists
    }

    // Invalidate existing tokens
    await this.prisma.passwordToken.updateMany({
      where: { userId: user.id, used: false },
      data: { used: true },
    });

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await this.prisma.passwordToken.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
      },
    });

    return token;
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const passwordToken = await this.prisma.passwordToken.findUnique({ where: { token } });

    if (!passwordToken || passwordToken.used || passwordToken.expiresAt < new Date()) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: passwordToken.userId },
        data: { passwordHash },
      }),
      this.prisma.passwordToken.update({
        where: { id: passwordToken.id },
        data: { used: true },
      }),
      // Invalidate all sessions for this user
      this.prisma.session.deleteMany({
        where: { userId: passwordToken.userId },
      }),
    ]);
  }
}
