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
  Param,
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
import { ChannelUnreadsDto } from 'src/channel-subscriptions/dto/channel-unreads.dto';
import { UserDto } from 'src/users/dto/user.dto';
import { SectionDto } from 'src/sections/dto/section.dto';
import { ChannelDto } from 'src/channels/dto/channel.dto';
import { UserPreferencesDto } from 'src/user-preferences/dto/user-preferences.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password';
import { UserStatusesService } from 'src/user-statuses/user-statuses.service';
import { UserStatusDto } from 'src/user-statuses/dto/user-status.dto';
import { Logger } from 'nestjs-pino';
import { WorkspacesService } from 'src/workspaces/workspaces.service';
import { UserWorkspacesService } from 'src/user-workspaces/user-workspaces.service';
import { faker } from '@faker-js/faker';
import * as bcrypt from 'bcrypt';
import { UsersRepository } from 'src/users/users.repository';
import { CardTemplateRepository } from 'src/card-template/card-template.repository';
import { CardFieldRepository } from 'src/card-field/card-field.repository';
import { CardVariantRepository } from 'src/card-variant/card-variant.repository';
import { AssistantService } from 'src/assistant/assistant.service';
import { seedWorkspaceData } from 'src/seed/seedWorkspaceData';
import { WorkspaceDto } from 'src/workspaces/dto/workspace.dto';
import { PrimaryColor } from 'src/users/enums/primary-color.enum';
import { Theme } from 'src/users/enums/theme.enum';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private assistantService: AssistantService,
    private authService: AuthService,
    private usersService: UsersService,
    private userRepository: UsersRepository,
    private cardTemplateRepository: CardTemplateRepository,
    private cardFieldRepository: CardFieldRepository,
    private cardTypeRepository: CardVariantRepository,
    private sectionsService: SectionsService,
    private channelsService: ChannelsService,
    private channelSubscriptionsService: ChannelSubscriptionsService,
    private userPreferencesService: UserPreferencesService,
    private userStatusesService: UserStatusesService,
    private workspaceService: WorkspacesService,
    private userWorkspaceService: UserWorkspacesService,
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

  @Public()
  @Post('logout')
  async logout(@Res() res: Response) {
    await this.authService.logout(res);
    return res.send({ message: 'Logged out successfully' });
  }

  @Public()
  @ApiBody({ type: RegisterDto })
  @Post('register')
  async register(@Body() registerDto: RegisterDto, @Res() res: Response) {
    const user = await this.authService.register(registerDto);

    const message = await this.authService.login(user, res);

    res.send(message);
  }

  @Public()
  @Post('register-anonymous')
  async registerAnonymous(@Res() res: Response) {
    const hashedPassword = await bcrypt.hash('Password1', 10);

    const email = faker.internet.email();

    const anonymousUser = this.userRepository.create({
      firstName: 'Anonymous',
      lastName: 'User',
      email,
      isAdmin: true,
      password: hashedPassword,
      isVerified: true,
    });

    const user = await this.userRepository.save(anonymousUser);

    // Seed preferences
    await this.userPreferencesService.createUserPreferences(user, {
      primaryColor: PrimaryColor.PURPLE,
      theme: Theme.DARK,
    });

    await this.sectionsService.seedUserDefaultSections(user);

    //   Seed flashcard template
    const cardTemplate = this.cardTemplateRepository.create({
      isDefault: true,
      user,
      title: 'Basic',
    });

    const savedTemplate = await this.cardTemplateRepository.save(cardTemplate);

    //   Fields
    const frontField = this.cardFieldRepository.create({
      title: 'Front',
      template: savedTemplate,
    });

    const backField = this.cardFieldRepository.create({
      title: 'Back',
      template: savedTemplate,
    });

    const savedFields = await this.cardFieldRepository.insert([
      frontField,
      backField,
    ]);

    //   Variant
    const cardVariant = this.cardTypeRepository.create({
      title: 'Front > Back',
      template: savedTemplate,
      frontFields: [savedFields[0]],
      backFields: [savedFields[1]],
    });

    await this.cardTypeRepository.save(cardVariant);

    const data = await this.authService.login(user, res);

    return res.send(data);
  }

  @Public()
  @UseGuards(RefreshJwtAuthGuard)
  @Post('refresh')
  async refreshToken(@Request() req, @Res() res: Response) {
    try {
      const response = await this.authService.refresh(req.user, res);

      return res.send(response);
    } catch (err) {
      // On failure, clear the 'access_token' and 'refresh_token' cookies
      res.clearCookie('access_token', { httpOnly: true, path: '/' });
      res.clearCookie('refresh_token', { httpOnly: true, path: '/' });

      // Optionally, you can return an appropriate response here, e.g., an error message or status code
      return res
        .status(401)
        .json({ message: 'Refresh token failed, cookies cleared' });
    }
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

  @Get('seed-workspace-data/:workspaceId')
  async seedWorkspaceData(
    @GetUser() user: User,
    @Param('workspaceId') workspaceId: string,
  ) {
    await seedWorkspaceData(workspaceId, user.uuid);
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Get('client-boot')
  async clientBoot(@GetUser() currentUser: User): Promise<{
    currentUser: UserDto;
    users?: UserDto[];
    userPreferences?: UserPreferencesDto;
    sections?: SectionDto[];
    channels?: ChannelDto[];
    channelUnreads?: ChannelUnreadsDto[];
    userStatuses?: UserStatusDto[];
    workspaces?: WorkspaceDto[];
    userWorkspaces?: any[];
  }> {
    const lastViewedWorkspace =
      await this.userWorkspaceService.findLastViewedWorkspace(currentUser.uuid);

    if (!lastViewedWorkspace) {
      return { currentUser };
    }

    const usersPromise = this.usersService.findWorkspaceUsers(
      lastViewedWorkspace.uuid,
    );

    const userPreferencesPromise =
      this.userPreferencesService.findUserPreferences(currentUser.id);

    const sectionsPromise = this.sectionsService.findUserSections(
      currentUser.id,
    );

    const channelsPromise = this.channelsService.findWorkspaceChannels(
      currentUser.id,
      lastViewedWorkspace.uuid,
    );

    const channelUnreadsPromise =
      this.channelSubscriptionsService.getUserUnreadMessagesCount(
        currentUser.id,
      );

    const userStatusesPromise = this.userStatusesService.findAllUserStatuses(
      currentUser.id,
    );

    const workspacesPromise = this.workspaceService.findUserWorkspaces(
      currentUser.id,
    );

    const userWorkspacesPromise = this.userWorkspaceService.findUserWorkspaces(
      currentUser.uuid,
    );

    const [
      users,
      userPreferences,
      sections,
      channels,
      channelUnreads,
      userStatuses,
      workspaces,
      userWorkspaces,
    ] = await Promise.all([
      usersPromise,
      userPreferencesPromise,
      sectionsPromise,
      channelsPromise,
      channelUnreadsPromise,
      userStatusesPromise,
      workspacesPromise,
      userWorkspacesPromise,
    ]);

    return {
      currentUser,
      users,
      userPreferences,
      sections,
      channels,
      channelUnreads,
      userStatuses,
      workspaces,
      userWorkspaces,
    };
  }

  @Public()
  @Get('new-user-verification')
  async verifyNewUser(@Query('token') token: string, @Res() res: Response) {
    const user = await this.authService.verifyNewUser(token);

    await this.authService.login(user, res);

    res.redirect(`${process.env.CLIENT_BASE_URL}/verified`);
  }
}
