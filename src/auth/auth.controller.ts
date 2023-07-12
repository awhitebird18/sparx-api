import {
  Controller,
  Request,
  Get,
  Post,
  UseGuards,
  Body,
} from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { LoginDto } from './dto/LoginDto';
import { LocalAuthGuard } from './localAuthGuard.guard';
import { AuthService } from './auth.service';
import { Public } from 'src/common/decorators/isPublic.decorator';
import { RegisterDto } from './dto/RegisterDto';
import { CreateUserDto } from 'src/users/dto';
import { UsersService } from 'src/users/users.service';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UsersService,
  ) {}

  @Public()
  @UseGuards(LocalAuthGuard)
  @ApiBody({ type: LoginDto })
  @Post('login')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  @Public()
  @ApiBody({ type: RegisterDto })
  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @Get('verify')
  async verifyToken(@Request() req) {
    const populatedUser = await this.userService.initialUserFetch(
      req.user.uuid,
    );
    return populatedUser;
  }
}
