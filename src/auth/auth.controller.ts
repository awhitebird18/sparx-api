import {
  Controller,
  Request,
  Get,
  Post,
  UseGuards,
  Body,
  Query,
  Res,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';

import { Public } from 'src/common/decorators/is-public';
import { GetUser } from 'src/common/decorators/get-user.decorator';

import { User } from 'src/users/entities/user.entity';

import { LocalAuthGuard } from './guards/local-auth.guard';
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
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password';
import { UserStatusesService } from 'src/user-statuses/user-statuses.service';
import { UserStatusDto } from 'src/user-statuses/dto/user-status.dto';
import { Logger } from 'nestjs-pino';

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
    private userStatusesService: UserStatusesService,
    private readonly logger: Logger,
  ) {}

  @Public()
  @UseGuards(LocalAuthGuard)
  @ApiBody({ type: LoginDto })
  @Post('login')
  async login(@Request() req, @Res() res: any) {
    this.logger.debug(req, 'logging login');
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
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Public()
  @UseGuards(RefreshJwtAuthGuard)
  @Post('refresh')
  async refreshToken(@Request() req, @Res() res: any) {
    const response = await this.authService.refresh(req.user, res);
    return res.send(response);
  }

  @Public()
  @Post('reset-password')
  sendResetPasswordEmail(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.sendResetPasswordEmail(resetPasswordDto.email);
  }

  @Public()
  @Post('change-password')
  async changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @Res() res: Response,
  ) {
    const user = await this.authService.changePassword(changePasswordDto);

    await this.authService.login(user, res);

    res.send('success');
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Get('client-boot')
  async clientBoot(@GetUser() currentUser: User): Promise<{
    currentUser: UserDto;
    users: UserDto[];
    userPreferences: UserPreferencesDto;
    sections: SectionDto[];
    channels: ChannelDto[];
    channelUnreads: ChannelUnreads[];
    userStatuses: UserStatusDto[];
  }> {
    this.logger.debug(currentUser, 'Logging!');
    const usersPromise = this.usersService.findWorkspaceUsers();

    const userPreferencesPromise =
      this.userPreferencesService.findUserPreferences(currentUser.id);

    const sectionsPromise = this.sectionsService.findUserSections(
      currentUser.id,
    );

    const channelsPromise = this.channelsService.findUserChannels(currentUser);

    const channelUnreadsPromise =
      this.channelSubscriptionsService.getUserUnreadMessagesCount(
        currentUser.id,
      );

    const userStatusesPromise = this.userStatusesService.findAllUserStatuses(
      currentUser.id,
    );

    const [
      users,
      userPreferences,
      sections,
      channels,
      channelUnreads,
      userStatuses,
    ] = await Promise.all([
      usersPromise,
      userPreferencesPromise,
      sectionsPromise,
      channelsPromise,
      channelUnreadsPromise,
      userStatusesPromise,
    ]);

    this.logger.debug('Logging 2!');

    return {
      currentUser,
      users,
      userPreferences,
      sections,
      channels,
      channelUnreads,
      userStatuses,
    };
  }

  @Public()
  @Get('new-user-verification')
  async verifyNewUser(@Query('token') token: string, @Res() res: Response) {
    const user = await this.authService.verifyNewUser(token);

    await this.authService.login(user, res);

    res.redirect(`${process.env.CLIENT_BASE_URL}/app`);
  }
}
