import { Injectable } from '@nestjs/common';
import { CreateSpaceDto } from './dto/CreateSpace.dto';
import { UpdateSpaceDto } from './dto/UpdateSpace.dto';

@Injectable()
export class SpacesService {
  create(createSpaceDto: CreateSpaceDto) {
    return 'This action adds a new space';
  }

  findAll() {
    return `This action returns all spaces`;
  }

  findOne(id: number) {
    return `This action returns a #${id} space`;
  }

  update(id: number, updateSpaceDto: UpdateSpaceDto) {
    return `This action updates a #${id} space`;
  }

  remove(id: number) {
    return `This action removes a #${id} space`;
  }
}
