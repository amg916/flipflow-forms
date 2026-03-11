import { Controller, Post, Body, Res, Get, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Response } from 'express';
import { SESSION_COOKIE_NAME } from '@flipflow/shared';
import { AuthService } from './auth.service';
import { SignupDto, LoginDto } from './auth.dto';
import { ForgotPasswordDto, ResetPasswordDto } from './forgot-password.dto';
import { EmailService } from './email.service';
import { Cookies } from './cookies.decorator';
import { CurrentUser } from './current-user.decorator';
import { AuthGuard } from './auth.guard';
@Controller('auth')
@Throttle({ short: { ttl: 1000, limit: 3 }, medium: { ttl: 900000, limit: 10 } })
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly emailService: EmailService,
  ) {}

  @Post('signup')
  async signup(@Body() dto: SignupDto, @Res({ passthrough: true }) res: Response) {
    const user = await this.authService.signup(dto);
    const session = await this.authService.login({ email: dto.email, password: dto.password });
    this.authService.setSessionCookie(res, session.token);
    return { success: true, data: user };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const session = await this.authService.login(dto);
    this.authService.setSessionCookie(res, session.token);
    return { success: true, data: session.user };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @Cookies(SESSION_COOKIE_NAME) token: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    if (token) {
      await this.authService.logout(token);
    }
    this.authService.clearSessionCookie(res);
    return { success: true };
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    const token = await this.authService.createPasswordResetToken(dto.email);
    if (token) {
      await this.emailService.sendPasswordResetEmail(dto.email, token);
    }
    // Always return success to not reveal if email exists
    return { success: true, message: 'If the email exists, a reset link has been sent.' };
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() dto: ResetPasswordDto) {
    await this.authService.resetPassword(dto.token, dto.password);
    return { success: true, message: 'Password has been reset.' };
  }

  @Get('me')
  @UseGuards(AuthGuard)
  async me(@CurrentUser() user: { id: string; email: string; name: string }) {
    return { success: true, data: user };
  }
}
