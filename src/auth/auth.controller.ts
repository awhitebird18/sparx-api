import {
  Controller,
  Request,
  Get,
  Post,
  UseGuards,
  Body,
  Query,
  Res,
} from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { AuthService } from './auth.service';
import { Public } from 'src/common/decorators/is-public';
import { RegisterDto } from './dto/register.dto';
import { UsersService } from 'src/users/users.service';
import { SectionsService } from 'src/sections/sections.service';
import { ChannelSubscriptionsService } from 'src/channel-subscriptions/channel-subscriptions.service';
import { UserPreferencesService } from 'src/user-preferences/user-preferences.service';
import { RefreshJwtAuthGuard } from './guards/jwt-refresh.guard';
import { Response } from 'express';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
    private sectionsService: SectionsService,
    private channelSubscriptionsService: ChannelSubscriptionsService,
    private userPreferencesService: UserPreferencesService,
  ) {}

  @Public()
  @UseGuards(LocalAuthGuard)
  @ApiBody({ type: LoginDto })
  @Post('login')
  async login(@Request() req, @Res() res: any) {
    const response = await this.authService.login(req.user, res);
    return res.send(response);
  }

  @Post('logout')
  async logout(@Res() res: Response) {
    await this.authService.logout(res);
    return res.send({ message: 'Logged out successfully' });
  }

  @Public()
  @ApiBody({ type: RegisterDto })
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Public()
  @UseGuards(RefreshJwtAuthGuard)
  @Post('refresh')
  async refreshToken(@Request() req, @Res() res: any) {
    const response = await this.authService.refresh(req.user, res);
    return res.send(response);
  }

  @UseGuards(JwtAuthGuard)
  @Post('verify')
  async verifyToken(@Request() req) {
    const user = await this.usersService.initialUserFetch(req.user.uuid);
    const sectionsPromise = this.sectionsService.findUserSections(
      req.user.uuid,
    );
    const channelsPromise =
      this.channelSubscriptionsService.getUserSubscribedChannels(req.user.uuid);
    const userPreferencesPromise =
      this.userPreferencesService.findUserPreferences(user.id);
    const channelUnreadsPromise =
      this.channelSubscriptionsService.getUserUnreadMessagesCount(
        req.user.uuid,
      );
    const workspaceUsersPromise = this.usersService.findAll();

    const [
      sections,
      channels,
      userPreferences,
      channelUnreads,
      workspaceUsers,
    ] = await Promise.all([
      sectionsPromise,
      channelsPromise,
      userPreferencesPromise,
      channelUnreadsPromise,
      workspaceUsersPromise,
    ]);

    return {
      user,
      sections,
      channels,
      workspaceUsers,
      channelUnreads,
      userPreferences,
    };
  }

  @Public()
  @Get('new-user-verification')
  async verifyNewUser(@Query('token') token: string, @Res() res: Response) {
    const user = await this.authService.verifyNewUser(token);

    await this.authService.login(user, res);

    res.redirect(`http://localhost:5173/app/verification-success`);
  }
}
