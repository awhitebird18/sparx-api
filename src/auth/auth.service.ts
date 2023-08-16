import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import { CreateUserDto, UserDto } from 'src/users/dto';
import * as bcrypt from 'bcrypt';
import { Response } from 'express';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private mailerService: MailerService,
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

    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: false,
      domain: 'localhost',
      path: '/',
      sameSite: 'lax',
    });

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: false,
      domain: 'localhost',
      path: '/',
      sameSite: 'lax',
    });

    return {
      message: 'Success',
    };
  }

  async logout(res: Response) {
    res.cookie('access_token', '', {
      expires: new Date(0),
      httpOnly: true,
      secure: false,
      domain: 'localhost',
      sameSite: 'lax',
      path: '/',
    });
    res.cookie('refresh_token', '', {
      expires: new Date(0),
      httpOnly: true,
      secure: false,
      domain: 'localhost',
      sameSite: 'lax',
      path: '/',
    });

    return { message: 'Logged out successfully' };
  }

  async refresh(user: UserDto, res: any) {
    const payload = { email: user.email, sub: user.uuid };
    const accessToken = this.jwtService.sign(payload);

    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: false,
      domain: 'localhost',
      path: '/',
      sameSite: 'lax',
    });

    return {
      message: 'Success',
    };
  }

  async register(createUserDto: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = await this.usersService.createUser({
      ...createUserDto,
      password: hashedPassword,
    });

    // Generate a verification token
    const verificationPayload = {
      email: user.email,
      type: 'email-verification',
    };
    const verificationToken = this.jwtService.sign(verificationPayload, {
      expiresIn: '1d',
    });

    // Send the verification email
    await this.sendVerificationEmail(user.email, verificationToken);

    return user;
  }

  async sendVerificationEmail(userEmail: string, token: string) {
    try {
      const url = `http://localhost:3000/auth/new-user-verification?token=${token}`;

      await this.mailerService.sendMail({
        to: userEmail,
        subject: 'Please verify your email',
        template: 'verification',
        context: {
          url,
        },
      });
    } catch (err) {
      console.error(err);
    }
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
      return 'Invalid or expired verification link';
    }
  }
}
