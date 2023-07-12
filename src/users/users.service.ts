import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/CreateUser.dto';
import { UpdateUserDto } from './dto/UpdateUser.dto';
import { UsersRepository } from './users.repository';
import { plainToInstance } from 'class-transformer';
import { UserDto } from './dto';

@Injectable()
export class UsersService {
  constructor(private userRepository: UsersRepository) {}

  async createUser(createUserDto: CreateUserDto) {
    const newUser = await this.userRepository.createUser(createUserDto);

    return newUser;
  }

  findAll() {
    return `This action returns all users`;
  }

  async findOne(searchProperties: any) {
    const user = await this.userRepository.findOneByProperties(
      searchProperties,
      ['company', 'spaces', 'sections', 'userChannels'],
    );

    return plainToInstance(UserDto, user);
  }

  async initialUserFetch(userUuid: string) {
    const user = await this.userRepository.findOneByProperties(
      { uuid: userUuid },
      ['sections', 'userChannels'],
    );

    return user;
  }

  findOneByEmail(email: string) {
    return this.userRepository.findOneByProperties({ email });
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return updateUserDto;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
