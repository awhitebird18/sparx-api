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
    return await this.findOneByProperties({ uuid: userUuid });
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
