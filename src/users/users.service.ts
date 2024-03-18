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
import { MailerService } from '@nestjs-modules/mailer';
import { JwtService } from '@nestjs/jwt';
import { UserDto } from './dto/user.dto';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CardFieldRepository } from 'src/card-field/card-field.repository';
import { CardTypeRepository } from 'src/card-type/card-type.repository';
import { CardTemplateRepository } from 'src/card-template/card-template.repository';

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
    private cardTemplateRepository: CardTemplateRepository,
    private cardFieldRepository: CardFieldRepository,
    private cardTypeRepository: CardTypeRepository,
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
      this.seedUserDefaultTemplate(user),
      this.sectionsService.seedUserDefaultSections(user.id),
      this.userPreferencesService.createUserPreferences({
        userId: user.id,
      }),
    ]);

    return user;
  }

  async seedUserDefaultTemplate(user: User) {
    const defaultExists = await this.cardTemplateRepository.find({
      where: { user: { id: user.id }, isDefault: true },
    });
    if (defaultExists) return;
    // Create template
    const newTemplate = this.cardTemplateRepository.create({
      user,
      title: 'Default',
      isDefault: true,
    });

    const template = await this.cardTemplateRepository.save(newTemplate);

    // Create card fields
    const frontField = await this.cardFieldRepository.create({
      template,
      title: 'Front side',
    });
    const backField = await this.cardFieldRepository.create({
      template,
      title: 'Back side',
    });

    await Promise.all([
      this.cardFieldRepository.save(frontField),
      this.cardFieldRepository.save(backField),
    ]);

    // Create card type
    const cardType = await this.cardTypeRepository.create({
      template,
      title: 'Card 1: Front side > Back side',
      frontFields: [frontField],
      backFields: [backField],
    });
    await this.cardTypeRepository.save(cardType);
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

  async findOneByEmail(email: string): Promise<User> {
    return this.usersRepository.findOne({ where: { email, isVerified: true } });
  }

  async findWorkspaceUsers(workspaceId: string): Promise<UserDto[]> {
    const users = await this.usersRepository.findWorkspaceUsers(workspaceId);

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

  async update(userId: string, updateUserDto: UpdateUserDto): Promise<User> {
    // Check for existing user
    const user = await this.usersRepository.findOneOrFail({
      where: { uuid: userId },
    });

    // Update user
    Object.assign(user, updateUserDto);
    const updatedUser = await this.usersRepository.save(user);

    // Send updated user over socket
    this.events.emit('websocket-event', 'updateUser', updatedUser);

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

    const uploadedImageUrl = await this.cloudinaryService.upload(
      profileImage,
      user.uuid,
    );

    // Update user with image path
    user.profileImage = uploadedImageUrl;

    // Update User
    const updatedUser = await this.usersRepository.save(user);

    // Send updated user over socket
    this.events.emit('websocket-event', 'updateUser', updatedUser);

    return updatedUser;
  }

  async remove(uuid: string): Promise<void> {
    const removedUser = await this.usersRepository.removeUserByUuid(uuid);

    if (!removedUser)
      throw new NotFoundException(`Unable to find user with id ${uuid}`);

    this.events.emit('websocket-event', 'removeUser', removedUser.uuid);
  }
}
