import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/CreateUser.dto';
import { UpdateUserDto } from './dto/UpdateUser.dto';

@Injectable()
export class UsersService {
  private readonly users = [
    {
      uuid: '3c82abba-2ce9-4805-a978-1bedf848dfe9',
      email: 'aaron@gmail.com',
      firstName: 'Aaron',
      lastName: 'Whitebird',
      image: '/images/profile-image-1.png',
      theme: 'dark',
      password: 'password',
    },
    {
      uuid: '3c82abba-2ce9-4805-a978-1bedf848dfe9',
      email: 'shanu@gmail.com',
      firstName: 'Shanu',
      lastName: 'Shanu',
      image: '/images/profile-image-1.png',
      theme: 'dark',
      password: 'password',
    },
  ];

  create(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
  }

  findAll() {
    return `This action returns all users`;
  }

  findOne(email: string) {
    return this.users.find((user) => user.email === email);
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
