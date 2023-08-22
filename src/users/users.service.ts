import { ConflictException, Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { v4 as uuid } from 'uuid';
import { saveBase64Image } from 'src/utils';
import * as path from 'path';

import { UsersRepository } from './users.repository';
import { UsersGateway } from 'src/websockets/user.gateway';
import { SectionsService } from 'src/sections/sections.service';
import { UserPreferencesService } from 'src/user-preferences/user-preferences.service';

import { UpdateUserDto } from './dto/update-user.dto';
import { RegisterDto } from 'src/auth/dto/register.dto';
import { UserDto } from './dto/user.dto';

@Injectable()
export class UsersService {
  constructor(
    private usersRepository: UsersRepository,
    private sectionsService: SectionsService,
    private userPreferencesService: UserPreferencesService,
    private usersGatway: UsersGateway,
  ) {}

  async create(registerDto: RegisterDto) {
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

    const filteredUser = plainToInstance(UserDto, user);

    this.usersGatway.handleNewUserSocket(filteredUser);

    return filteredUser;
  }

  async createBot() {
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

    const serializeBotUser = plainToInstance(UserDto, newBotUser);

    return serializeBotUser;
  }

  async findOne(searchProperties: any) {
    return await this.usersRepository.findOneBy(searchProperties);
  }

  async findOneByEmail(email: string) {
    return await this.usersRepository.findOneBy({ email });
  }

  async findWorkspaceUsers() {
    return this.usersRepository.find({ where: { isBot: false } });
  }

  async markAsVerified(email: string) {
    // Find User
    const user = await this.usersRepository.findOneOrFail({ where: { email } });

    // Update User
    Object.assign(user, { isVerified: true });
    const updatedUser = await this.usersRepository.save(user);

    return updatedUser;
  }

  async update(userId: number, updateUserDto: UpdateUserDto) {
    // Check for existing user
    const user = await this.usersRepository.findOneOrFail({
      where: { id: userId },
    });

    // Update user
    Object.assign(user, updateUserDto);
    const updatedUser = await this.usersRepository.save(user);
    const serializedUser = plainToInstance(UserDto, updatedUser);

    // Send updated user over socket
    this.usersGatway.handleUserUpdateSocket(serializedUser);

    return serializedUser;
  }

  async updateProfileImage(userId: number, profileImage: string) {
    // Find User
    const user = await this.usersRepository.findOneOrFail({
      where: { id: userId },
    });

    const imageId = uuid();
    // const clientId = 'clientA';
    const folderPath = `/static/`;
    const imagePath = path.join(folderPath, imageId);
    saveBase64Image(profileImage, imagePath);

    // Update user with image path
    user.profileImage = imagePath;

    // Update User
    const updatedUser = await this.usersRepository.save(user);

    const serializedUser = plainToInstance(UserDto, updatedUser);

    // Send updated user over socket
    this.usersGatway.handleUserUpdateSocket(serializedUser);

    return serializedUser;
  }

  async remove(id: number) {
    return await this.usersRepository.softRemove({ id });
  }
}
