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
import { Response } from 'express';

import { Public } from 'src/common/decorators/is-public';
import { GetUser } from 'src/common/decorators/get-user.decorator';

import { User } from 'src/users/entities/user.entity';

import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RefreshJwtAuthGuard } from './guards/jwt-refresh.guard';

import { AuthService } from './auth.service';
import { ChannelsService } from 'src/channels/channels.service';
import { UsersService } from 'src/users/users.service';
import { SectionsService } from 'src/sections/sections.service';
import { ChannelSubscriptionsService } from 'src/channel-subscriptions/channel-subscriptions.service';
import { UserPreferencesService } from 'src/user-preferences/user-preferences.service';

import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ChannelUnreads } from 'src/channel-subscriptions/dto/channel-unreads.dto';
import { UserDto } from 'src/users/dto/user.dto';
import { SectionDto } from 'src/sections/dto/section.dto';
import { ChannelDto } from 'src/channels/dto/channel.dto';
import { UserPreferencesDto } from 'src/user-preferences/dto/user-preferences.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
    private sectionsService: SectionsService,
    private channelsService: ChannelsService,
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

  // @UseGuards(JwtAuthGuard)
  // @Post('verify')
  // async verifyToken() {
  //   return;
  // }

  @UseGuards(JwtAuthGuard)
  @Get('client-boot')
  async clientBoot(@GetUser() user: User): Promise<{
    user: UserDto;
    sections: SectionDto[];
    channels: ChannelDto[];
    channelUnreads: ChannelUnreads[];
    users: UserDto[];
    userPreferences: UserPreferencesDto;
  }> {
    const sectionsPromise = this.sectionsService.findUserSections(user.id);

    const channelsPromise = this.channelsService.findUserChannels(user.id);

    const channelUnreadsPromise =
      this.channelSubscriptionsService.getUserUnreadMessagesCount(user.id);

    const usersPromise = this.usersService.findWorkspaceUsers();

    const userPreferencesPromise =
      this.userPreferencesService.findUserPreferences(user.id);

    const [sections, channels, channelUnreads, users, userPreferences] =
      await Promise.all([
        sectionsPromise,
        channelsPromise,
        channelUnreadsPromise,
        usersPromise,
        userPreferencesPromise,
      ]);

    return {
      user,
      sections,
      channels,
      channelUnreads,
      users,
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
