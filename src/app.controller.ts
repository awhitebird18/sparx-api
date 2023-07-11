import { Controller, Request, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBody } from '@nestjs/swagger';
import { LoginDto } from './auth/dto/LoginDto';
import { LocalAuthGuard } from './auth/localAuthGuard.guard';
import { AuthService } from './auth/auth.service';
import { Public } from './common/decorators/isPublic.decorator';

@Controller()
export class AppController {
  constructor(private authService: AuthService) {}

  @Public()
  @UseGuards(LocalAuthGuard)
  @ApiBody({ type: LoginDto })
  @Post('auth/login')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  @Get('auth/verify')
  async verifyToken(@Request() req) {
    console.log('end', req.user);
    // If the token is valid, we will reach this point, and we can return the user details.
    return req.user;
  }
}
