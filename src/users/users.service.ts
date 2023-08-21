import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersRepository } from './users.repository';
import { plainToInstance } from 'class-transformer';
import { UserDto } from './dto';
import { v4 as uuid } from 'uuid';
import { saveBase64Image } from 'src/utils';
import * as path from 'path';
import { UsersGateway } from 'src/websockets/user.gateway';
import { SectionsService } from 'src/sections/sections.service';
import * as fs from 'fs';
import { UserPreferencesService } from 'src/user-preferences/user-preferences.service';

@Injectable()
export class UsersService {
  constructor(
    private userRepository: UsersRepository,
    private sectionsService: SectionsService,
    private userPreferencesService: UserPreferencesService,
    private usersGatway: UsersGateway,
  ) {}

  async createUser(createUserDto: CreateUserDto) {
    const existingUser = await this.userRepository.findOneByProperties({
      email: createUserDto.email,
    });
    if (existingUser) {
      throw new ConflictException('Email is already registered');
    }

    // Creating new user
    const user = await this.userRepository.createUser(createUserDto);

    // Creating user section and userPreferences
    await Promise.all([
      this.sectionsService.seedUserDefaultSections(user),
      this.userPreferencesService.createUserPreferences(user),
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

  async findAll() {
    return this.userRepository.find();
  }

  async findOne(searchProperties: any) {
    return await this.userRepository.findOneBy(searchProperties);
  }

  async markAsVerified(email: string) {
    const user = await this.userRepository.findOneBy({ email });

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
