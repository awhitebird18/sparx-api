import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/CreateUser.dto';
import { UpdateUserDto } from './dto/UpdateUser.dto';
import { UsersRepository } from './users.repository';
import { plainToInstance } from 'class-transformer';
import { UserDto } from './dto';
import { v4 as uuid } from 'uuid';
import { saveBase64Image } from 'src/utils/saveBase64Image';
import * as path from 'path';
import { UsersGateway } from 'src/websockets/user.gateway';
import { SectionsService } from 'src/sections/sections.service';
import { UserpreferencesService } from 'src/userpreferences/userpreferences.service';
import * as fs from 'fs';

@Injectable()
export class UsersService {
  constructor(
    private userRepository: UsersRepository,
    private usersGatway: UsersGateway,
    private sectionsService: SectionsService,
    private userPreferencesService: UserpreferencesService,
  ) {}

  async createUser(createUserDto: CreateUserDto) {
    const existingUser = await this.userRepository.findOneByProperties({
      email: createUserDto.email,
    });

    if (existingUser) {
      throw new ConflictException('Email is already registered');
    }

    const newUser = await this.userRepository.createUser(createUserDto);

    await this.sectionsService.seedUserDefaultSections(newUser);

    await this.userPreferencesService.createUserPreferences(newUser);

    const filteredUser = plainToInstance(UserDto, newUser);

    this.usersGatway.handleNewUserSocket(filteredUser);

    return newUser;
  }

  async seedBot() {
    const botExists = await this.findOneByProperties({ isBot: true });

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
    const user = await this.userRepository.findOneByProperties(
      searchProperties,
    );

    return plainToInstance(UserDto, user);
  }

  async markAsVerified(email: any) {
    const user = await this.userRepository.findOneByProperties({ email });

    return await this.userRepository.updateUser(user.uuid, {
      isVerified: true,
    });
  }

  async findOneByProperties(searchProperties: any, relations?: string[]) {
    const user = await this.userRepository.findOneByProperties(
      searchProperties,
      relations,
    );

    return plainToInstance(UserDto, user);
  }

  async initialUserFetch(userUuid: string) {
    const user = await this.findOneByProperties({ uuid: userUuid });

    return user;
  }

  async findOneByEmail(email: string) {
    return await this.userRepository.findOneByProperties({ email });
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.userRepository.findUserByUuid(id);

    if (!user) {
      throw new NotFoundException(`User with UUID ${id} not found`);
    }

    Object.assign(user, updateUserDto);

    const updatedUser = await this.userRepository.save(user);

    const filteredUser = plainToInstance(UserDto, updatedUser);

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
