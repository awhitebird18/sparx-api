import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/CreateUser.dto';
import { UpdateUserDto } from './dto/UpdateUser.dto';
import { UsersRepository } from './users.repository';
import { plainToInstance } from 'class-transformer';
import { UserDto } from './dto';
import { v4 as uuid } from 'uuid';
import { saveBase64Image } from 'src/utils/saveBase64Image';
import * as path from 'path';

@Injectable()
export class UsersService {
  constructor(private userRepository: UsersRepository) {}

  async createUser(createUserDto: CreateUserDto) {
    const newUser = await this.userRepository.createUser(createUserDto);

    return newUser;
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

  async findOneByProperties(searchProperties: any, relations?: string[]) {
    const user = await this.userRepository.findOneByProperties(
      searchProperties,
      relations,
    );

    return plainToInstance(UserDto, user);
  }

  async initialUserFetch(userUuid: string) {
    const user = await this.findOneByProperties({ uuid: userUuid });
    user.profileImage = 'http://localhost:3000' + user.profileImage;

    return user;
  }

  async findOneByEmail(email: string) {
    return await this.userRepository.findOneByProperties({ email });
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return updateUserDto;
  }

  async updateProfileImage(id: string, profileImage: string) {
    const user = await this.userRepository.findUserByUuid(id);

    if (!user) {
      throw new NotFoundException(`User with UUID ${id} not found`);
    }

    const imageId = uuid();

    // const clientId = 'clientA';

    const folderPath = `/static/`;

    const imagePath = path.join(folderPath, imageId);

    saveBase64Image(profileImage, imagePath);

    // Update user with image path
    user.profileImage = imagePath;

    const newUser = await this.userRepository.save(user);

    return newUser;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
