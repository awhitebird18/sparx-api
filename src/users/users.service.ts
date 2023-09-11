import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as path from 'path';

import { UsersRepository } from './users.repository';
import { SectionsService } from 'src/sections/sections.service';
import { UserPreferencesService } from 'src/user-preferences/user-preferences.service';

import { UpdateUserDto } from './dto/update-user.dto';
import { RegisterDto } from 'src/auth/dto/register.dto';
import { User } from './entities/user.entity';
import { InviteUserDto } from './dto/invite-user.dto';
import { MailerService } from '@nestjs-modules/mailer';
import { JwtService } from '@nestjs/jwt';
import { UserDto } from './dto/user.dto';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class UsersService {
  constructor(
    private usersRepository: UsersRepository,
    private sectionsService: SectionsService,
    private userPreferencesService: UserPreferencesService,
    private mailerService: MailerService,
    private jwtService: JwtService,
    private cloudinaryService: CloudinaryService,
    private events: EventEmitter2,
  ) {}

  async create(registerDto: RegisterDto): Promise<User> {
    const existingUser = await this.usersRepository.findOne({
      where: {
        email: registerDto.email,
      },
    });
    if (existingUser)
      throw new ConflictException('Email is already registered');

    // Creating new user
    const user = await this.usersRepository.createUser(registerDto);

    // Creating user section and userPreferences
    await Promise.all([
      this.sectionsService.seedUserDefaultSections(user.id),
      this.userPreferencesService.createUserPreferences({
        userId: user.id,
      }),
    ]);

    return user;
  }

  async createBot(): Promise<User> {
    // Check if bot exists
    const existingBot = await this.usersRepository.findOne({
      where: { isBot: true },
    });

    if (existingBot) throw new ConflictException('Bot already exists!');

    // Find default bot image
    const botImagePath = path.join(__dirname, 'static', 'bot.png');

    // Create bot user
    const newBotUser = await this.usersRepository.createUser({
      firstName: 'Sparx',
      lastName: 'Bot',
      email: 'bot@sparx.com',
      password: 'password1',
      confirmPassword: 'password1',
      isBot: true,
      profileImage: `/static/${botImagePath}`,
    });

    return newBotUser;
  }

  async updateUserPassword(userId: number, hashedPassword: string) {
    const res = await this.usersRepository.update(userId, {
      password: hashedPassword,
    });

    if (res.affected === 0) {
      throw new Error('Unable to update user');
    }
  }

  findOne(searchProperties: any): Promise<User> {
    return this.usersRepository.findOneBy(searchProperties);
  }

  async sendInvite(user: User, inviteUser: InviteUserDto): Promise<void> {
    const { email } = inviteUser;

    // Todo: once workspaces are implemented, need to find the users workspace to
    // to be able to add workspace name and details in the email.

    const userWithEmailExists = await this.usersRepository.findOne({
      where: { email },
    });
    if (userWithEmailExists)
      throw new ConflictException(
        'This email is already registered as part of this workspace',
      );

    // Format name of user who is sending the invite
    const username = `${user.firstName[0].toUpperCase()}${user.firstName
      .substring(1)
      .toLowerCase()} ${user.lastName[0].toUpperCase()}${user.lastName
      .substring(1)
      .toLowerCase()}`;

    // Format name of workspace
    const workspaceName = 'Bananas!';

    // Generate payload for token
    const userInvitePayload = {
      userId: user.uuid,
      type: 'userInvite',
    };

    // Generate a password reset token
    const passwordResetToken = this.jwtService.sign(userInvitePayload, {
      expiresIn: '1d',
    });

    const url = `${process.env.CLIENT_BASE_URL}/register?token=${passwordResetToken}`;

    // Email user informing of the password change
    await this.mailerService.sendMail({
      to: email,
      subject: `Sparx - Invitation to join ${workspaceName}`,
      template: 'invitation',
      context: {
        username,
        workspaceName,
        url,
      },
    });
  }

  async findOneByEmail(email: string): Promise<User> {
    return this.usersRepository.findOne({ where: { email, isVerified: true } });
  }

  async findWorkspaceUsers(): Promise<UserDto[]> {
    const users = await this.usersRepository.findWorkspaceUsers();

    const result = users.map((u: any) => {
      if (u.customStatuses.length) {
        u.status = u.customStatuses[0];
      }
      delete u.customStatuses;

      return u;
    });

    return result;
  }

  async markAsVerified(email: string): Promise<User> {
    // Find User
    const user = await this.usersRepository.findOneOrFail({ where: { email } });

    // Update User
    Object.assign(user, { isVerified: true });
    const updatedUser = await this.usersRepository.save(user);

    return updatedUser;
  }

  async update(userId: number, updateUserDto: UpdateUserDto): Promise<User> {
    // Check for existing user
    const user = await this.usersRepository.findOneOrFail({
      where: { id: userId },
    });

    // Update user
    Object.assign(user, updateUserDto);
    const updatedUser = await this.usersRepository.save(user);

    // Send updated user over socket
    this.events.emit('websocket', 'updateUser', updatedUser);

    return updatedUser;
  }

  async updateProfileImage(
    userId: number,
    profileImage: string,
  ): Promise<User> {
    // Find User
    const user = await this.usersRepository.findOneOrFail({
      where: { id: userId },
    });

    const uploadedImageUrl = await this.cloudinaryService.upload(profileImage);

    // Update user with image path
    user.profileImage = uploadedImageUrl;

    // Update User
    const updatedUser = await this.usersRepository.save(user);

    // Send updated user over socket
    this.events.emit('websocket', 'updateUser', updatedUser);

    return updatedUser;
  }

  async remove(uuid: string): Promise<void> {
    const removedUser = await this.usersRepository.removeUserByUuid(uuid);

    if (!removedUser)
      throw new NotFoundException(`Unable to find user with id ${uuid}`);

    this.events.emit('websocket-event', 'removeUser', removedUser.uuid);
  }
}
