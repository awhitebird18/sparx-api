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
import { OpenAI } from 'openai';
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
import { WorkspacesService } from 'src/workspaces/workspaces.service';
import { Workspace } from 'src/workspaces/entities/workspace.entity';
import { UserWorkspacesService } from 'src/user-workspaces/user-workspaces.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CreateChannelConnectorDto } from 'src/channel-connectors/dto/create-channel-connector.dto';
import { ChannelType } from 'src/channels/enums/channel-type.enum';
import { ConnectionSide } from 'src/channel-connectors/enums/connectionSide.enum';
import { ChannelConnectorsService } from 'src/channel-connectors/channel-connectors.service';
import { faker } from '@faker-js/faker';
import * as bcrypt from 'bcrypt';
import { UsersRepository } from 'src/users/users.repository';
import { seedWorkspace } from 'src/seed/seedAnonymousWorkspace';
import { CardTemplateRepository } from 'src/card-template/card-template.repository';
import { CardFieldRepository } from 'src/card-field/card-field.repository';
import { CardTypeRepository } from 'src/card-type/card-type.repository';

const subTopicYCoords = [0, 0, 120, 120, -120, -120, 240, 240, -240, -240];

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
    private userRepository: UsersRepository,
    private cardTemplateRepository: CardTemplateRepository,
    private cardFieldRepository: CardFieldRepository,
    private cardTypeRepository: CardTypeRepository,
    private sectionsService: SectionsService,
    private channelsService: ChannelsService,
    private channelSubscriptionsService: ChannelSubscriptionsService,
    private channelConnectorService: ChannelConnectorsService,
    private userPreferencesService: UserPreferencesService,
    private userStatusesService: UserStatusesService,
    private workspaceService: WorkspacesService,
    private userWorkspaceService: UserWorkspacesService,
    private readonly logger: Logger,
    private events: EventEmitter2,
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

  @Post('generate-roadmap')
  async generateRoadmap(
    @Body() body: { topic: string; workspaceId: string },
    @GetUser() user: User,
  ) {
    try {
      const openAIClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const chatCompletion = await openAIClient.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            content: `Please generate a roadmap of major topics for learning ${body.topic}. For example, if I am learning Frontend Development a roadmap map look like [{topic: "Internet", subtopics: ["How does the internet work?", "What is HTTP?". "What is domain name?", "What is hosting?", "DNS and how it works?", "Browsers and how they work?"]}, {topic: "HTML", subtopics: ["Learn the basics", "Writing semantic HTML", "Forms and Validations", "Accessibility", "SEO Basics"]}, {topic: "CSS", subtopics: ["Learn the basics", "Making Layouts", "Responsive Design"]}...]. Please generate this format and keep the titles short. Please provide an array of objects and in json format.`,
            role: 'user',
          },
        ],
      });

      const clearNodemap = async (workspaceId: string) => {
        await this.channelConnectorService.removeChannelConnectorsByWorkspace(
          workspaceId,
        );
        await this.channelsService.removeChannelsByWorkspace(workspaceId);
      };

      const createNodemap = async (
        data: { topic: string; subtopics: string[] }[],
      ) => {
        let previousMainChannel;

        for (let i = 0; i < data.length; i++) {
          const entry = data[i];
          // Main topic
          const mainTopic = {
            name: entry.topic,
            type: ChannelType.CHANNEL,
            x: 4000,
            y: 500 * (i + 2),
            workspaceId: body.workspaceId,
            isDefault: i === 0,
          };

          const newMainChannel = await this.channelsService.createChannel(
            mainTopic,
            body.workspaceId,
          );

          if (i === 0) {
            await this.channelSubscriptionsService.joinChannel(
              user,
              newMainChannel.uuid,
            );
          }

          // Create Main Channel Connector
          // Channel Connectors

          if (i < data.length) {
            if (previousMainChannel) {
              const channelConnector: CreateChannelConnectorDto = {
                parentChannelId: previousMainChannel.uuid,
                childChannelId: newMainChannel.uuid,
                parentSide: ConnectionSide.BOTTOM,
                childSide: ConnectionSide.TOP,
              };

              await this.channelConnectorService.createConnection(
                channelConnector,
                body.workspaceId,
              );
            }

            previousMainChannel = newMainChannel;
          }

          // Secondary topics
          const subtopics = entry.subtopics;

          for (let j = 0; j < subtopics.length; j++) {
            const subTopic = subtopics[j];

            const isEven = j % 2 === 0;

            const topic = {
              name: subTopic,
              type: ChannelType.CHANNEL,
              x: 4000 + (isEven ? -1 : 1) * 480,
              y: 500 * (i + 2) + subTopicYCoords[j],
            };
            const newSubChannel = await this.channelsService.createChannel(
              topic,
              body.workspaceId,
            );

            // Channel Connectors
            const channelConnector: CreateChannelConnectorDto = {
              parentChannelId: newMainChannel.uuid,
              childChannelId: newSubChannel.uuid,
              parentSide: isEven ? ConnectionSide.LEFT : ConnectionSide.RIGHT,
              childSide: isEven ? ConnectionSide.RIGHT : ConnectionSide.LEFT,
            };

            await this.channelConnectorService.createConnection(
              channelConnector,
              body.workspaceId,
            );
          }
        }
      };

      const parsedData = JSON.parse(chatCompletion.choices[0].message.content);

      await clearNodemap(body.workspaceId);
      await createNodemap(parsedData);

      await seedWorkspace(body.workspaceId, user.uuid);

      return await this.channelsService.findWorkspaceChannels(
        user.id,
        body.workspaceId,
      );
    } catch (err) {
      console.error(err);
    }
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
    await this.userPreferencesService.createUserPreferences({
      userId: user.id,
    });

    await this.sectionsService.seedUserDefaultSections(user.id);

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
    const cardType = this.cardTypeRepository.create({
      title: 'Front > Back',
      template: savedTemplate,
      frontFields: [savedFields[0]],
      backFields: [savedFields[1]],
    });

    await this.cardTypeRepository.save(cardType);

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

  @UseInterceptors(ClassSerializerInterceptor)
  @Get('client-boot')
  async clientBoot(@GetUser() currentUser: User): Promise<{
    currentUser: UserDto;
    users?: UserDto[];
    userPreferences?: UserPreferencesDto;
    sections?: SectionDto[];
    channels?: ChannelDto[];
    channelUnreads?: ChannelUnreads[];
    userStatuses?: UserStatusDto[];
    workspaces?: Workspace[];
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
