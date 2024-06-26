import { ConflictException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { MailerService } from '@nestjs-modules/mailer';
import * as bcrypt from 'bcrypt';
import { Response } from 'express';

import { UsersService } from 'src/users/users.service';

import { UserDto } from 'src/users/dto/user.dto';
import { RegisterDto } from './dto/register.dto';
import { ChangePasswordDto } from './dto/change-password';
import { User } from 'src/users/entities/user.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private mailerService: MailerService,
    private events: EventEmitter2,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findOneByEmail(email);

    if (user && (await bcrypt.compare(pass, user.password))) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user;
      return result;
    }

    return null;
  }

  async login(user: any, res: Response) {
    const payload = { email: user.email, sub: user.uuid };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    const accessTokenMaxAge = 15 * 60 * 1000; // 15 minutes in milliseconds
    const refreshTokenMaxAge = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

    // Extract the domain from CLIENT_BASE_URL
    const clientDomain = new URL(process.env.CLIENT_BASE_URL).hostname;

    // For subdomain cookies, the domain should be prefixed with a dot
    const cookieDomain =
      process.env.NODE_ENV === 'production' ? '.' + clientDomain : undefined;

    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: true,
      domain: cookieDomain,
      path: '/',
      sameSite: 'none',
      maxAge: accessTokenMaxAge,
    });

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: true,
      domain: cookieDomain,
      path: '/',
      sameSite: 'none',
      maxAge: refreshTokenMaxAge,
    });

    return {
      message: 'Success',
    };
  }

  async logout(res: Response) {
    // Extract the domain from CLIENT_BASE_URL
    const clientDomain = new URL(process.env.CLIENT_BASE_URL).hostname;

    // For subdomain cookies, the domain should be prefixed with a dot
    const cookieDomain =
      process.env.NODE_ENV === 'production' ? '.' + clientDomain : undefined;

    res.cookie('access_token', '', {
      httpOnly: true,
      secure: true,
      domain: cookieDomain,
      sameSite: 'none',
      path: '/',
      maxAge: 0,
    });
    res.cookie('refresh_token', '', {
      httpOnly: true,
      secure: true,
      domain: cookieDomain,
      sameSite: 'none',
      path: '/',
      maxAge: 0,
    });

    return { message: 'Logged out successfully' };
  }

  async refresh(user: UserDto, res: any) {
    const payload = { email: user.email, sub: user.uuid };
    const accessToken = this.jwtService.sign(payload);
    const accessTokenMaxAge = 15 * 60 * 1000; // 15 minutes in milliseconds

    // Extract the domain from CLIENT_BASE_URL
    const clientDomain = new URL(process.env.CLIENT_BASE_URL).hostname;

    // For subdomain cookies, the domain should be prefixed with a dot
    const cookieDomain =
      process.env.NODE_ENV === 'production' ? '.' + clientDomain : undefined;

    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: true,
      domain: cookieDomain,
      path: '/',
      sameSite: 'none',
      maxAge: accessTokenMaxAge,
    });

    return {
      message: 'Success',
    };
  }

  async register(registerDto: RegisterDto) {
    // Convert password to hash
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // Create user
    const newUser = await this.usersService.create({
      ...registerDto,
      password: hashedPassword,
    });
    const user = await this.usersService.markAsVerified(newUser.email);

    // Generate a verification token
    // const verificationPayload = {
    //   email: user.email,
    //   type: 'email-verification',
    // };
    // const verificationToken = this.jwtService.sign(verificationPayload, {
    //   expiresIn: '1d',
    // });

    // await this.sendVerificationEmail(user.email, user, verificationToken);

    return user;
  }

  async sendVerificationEmail(userEmail: string, user: User, token: string) {
    try {
      const url = `${process.env.BASE_URL}:${process.env.PORT}/auth/new-user-verification?token=${token}`;

      const username = `${user.firstName[0].toUpperCase()}${user.firstName
        .substring(1)
        .toLowerCase()} ${user.lastName[0].toUpperCase()}${user.lastName
        .substring(1)
        .toLowerCase()}`;

      await this.mailerService.sendMail({
        to: userEmail,
        subject: 'Please verify your email',
        template: 'verification',
        context: {
          url,
          username,
        },
      });
    } catch (err) {
      console.error(err);
    }
  }

  async changePassword(changePasswordDto: ChangePasswordDto) {
    const { password, token, email } = changePasswordDto;

    // Extract jwt token
    let decodedToken;

    if (token) {
      decodedToken = this.jwtService.verify(token);
    }

    if (decodedToken && decodedToken.type !== 'password-reset') {
      throw new ConflictException('Could not change password');
    }

    // Find if user exists
    const user = await this.usersService.findOneByEmail(
      decodedToken?.email || email,
    );

    if (!user) throw new ConflictException('Could not change password');

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user
    await this.usersService.updateUserPassword(user.id, hashedPassword);

    const username = `${user.firstName[0].toUpperCase()}${user.firstName
      .substring(1)
      .toLowerCase()} ${user.lastName[0].toUpperCase()}${user.lastName
      .substring(1)
      .toLowerCase()}`;

    // Email user informing of the password change
    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Password changed',
      template: 'password-changed',
      context: {
        username,
      },
    });

    return user;
  }

  async sendResetPasswordEmail(email: string) {
    // Verify user exists. If not, dont send email. However, should not produce error.
    const user = await this.usersService.findOneByEmail(email);
    if (!user) return;

    // Generate payload for token
    const verificationPayload = {
      email: user.email,
      type: 'password-reset',
    };

    // Generate a password reset token
    const passwordResetToken = this.jwtService.sign(verificationPayload, {
      expiresIn: '120m',
    });

    // Send email to user
    const url = `${process.env.CLIENT_BASE_URL}/change-password?token=${passwordResetToken}`;

    const username = `${user.firstName[0].toUpperCase()}${user.firstName
      .substring(1)
      .toLowerCase()} ${user.lastName[0].toUpperCase()}${user.lastName
      .substring(1)
      .toLowerCase()}`;

    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Password reset request',
      template: 'password-reset',
      context: {
        url,
        username,
      },
    });
  }

  async verifyNewUser(token: string) {
    // Decode and validate the token
    try {
      const decodedToken = this.jwtService.verify(token);

      // Check if the token type is correct (if you've used the 'type' in the payload)
      if (decodedToken.type !== 'email-verification') {
        throw new Error('Invalid token type');
      }

      // Mark the user as verified in your database
      const user = await this.usersService.markAsVerified(decodedToken.email);

      return user;
    } catch (error) {
      // Handle expired or invalid tokens
      throw new Error('Invalid or expired verification link');
    }
  }
}
