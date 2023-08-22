import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { plainToInstance } from 'class-transformer';
import { v4 as uuid } from 'uuid';
import { saveBase64Image } from 'src/utils';
import * as path from 'path';
import * as fs from 'fs';

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
    private userRepository: UsersRepository,
    private sectionsService: SectionsService,
    private userPreferencesService: UserPreferencesService,
    private usersGatway: UsersGateway,
  ) {}

  async createUser(registerDto: RegisterDto) {
    const existingUser = await this.userRepository.findOne({
      where: {
        email: registerDto.email,
      },
    });
    if (existingUser)
      throw new ConflictException('Email is already registered');

    // Creating new user
    const user = await this.userRepository.createUser(registerDto);

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

  async seedBot() {
    const botExists = await this.findOne({ isBot: true });

    if (botExists) {
      throw new ConflictException('Bot already exists!');
    }

    const newUser = await this.userRepository.createUser({
      firstName: 'Sparx',
      lastName: 'Bot',
      email: 'bot@sparx.com',
      password: 'password1',
      confirmPassword: 'password1',
      isBot: true,
    });

    // Get the absolute path to the bot.png file in the static folder.
    const botImagePath = path.join(__dirname, 'static', 'bot.png');

    // Read the bot.png file from the filesystem and convert it to base64 format.
    const botImageBase64 = fs.readFileSync(botImagePath).toString('base64');

    // Upload the bot profile image.
    await this.updateProfileImage(newUser.uuid, botImageBase64);

    const filteredUser = plainToInstance(UserDto, newUser);

    return filteredUser;
  }

  async findWorkspaceUsers() {
    return this.userRepository.find({ where: { isBot: false } });
  }

  async findOne(searchProperties: any) {
    return await this.userRepository.findOneBy(searchProperties);
  }

  async markAsVerified(email: string) {
    const user = await this.userRepository.findOneOrFail({ where: { email } });

    return await this.userRepository.updateUser(user.uuid, {
      isVerified: true,
    });
  }

  async initialUserFetch(userUuid: string) {
    const user = await this.userRepository.findOneBy({ uuid: userUuid });

    return user;
  }

  async findOneByEmail(email: string) {
    return await this.userRepository.findOneBy({ email });
  }

  async update(userUuid: string, updateUserDto: UpdateUserDto) {
    // Check for existing user
    const user = await this.userRepository.findOneBy({ uuid: userUuid });
    if (!user) {
      throw new NotFoundException(`User with UUID ${userUuid} not found`);
    }

    // Update user
    Object.assign(user, updateUserDto);
    const updatedUser = await this.userRepository.save(user);
    const filteredUser = plainToInstance(UserDto, updatedUser);

    // Send updated user over socket
    this.usersGatway.handleUserUpdateSocket(filteredUser);

    return updatedUser;
  }

  async updateProfileImage(userId: string, profileImage: string) {
    const user = await this.userRepository.findUserByUuid(userId);

    if (!user) {
      throw new NotFoundException(`User with UUID ${userId} not found`);
    }

    const imageId = uuid();

    // const clientId = 'clientA';

    const folderPath = `/static/`;

    const imagePath = path.join(folderPath, imageId);

    saveBase64Image(profileImage, imagePath);

    // Update user with image path
    user.profileImage = imagePath;

    const updatedUser = await this.userRepository.save(user);

    const filteredUser = plainToInstance(UserDto, updatedUser);

    this.usersGatway.handleUserUpdateSocket(filteredUser);

    return filteredUser;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
