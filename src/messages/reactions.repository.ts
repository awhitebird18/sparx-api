import { DataSource, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { Reaction } from './entities/reaction.entity';

@Injectable()
export class ReactionRepository extends Repository<Reaction> {
  constructor(private dataSource: DataSource) {
    super(Reaction, dataSource.createEntityManager());
  }
  async addReaction(createReactionDto: Partial<Reaction>): Promise<Reaction> {
    const reaction = this.create(createReactionDto);
    return this.save(reaction);
  }

  findReactionByUuid(uuid: string): Promise<Reaction> {
    return this.findOne({ where: { uuid } });
  }

  async removeReaction(uuid: string) {
    const Reaction = await this.findReactionByUuid(uuid);
    if (Reaction) {
      return await this.softRemove(Reaction);
    } else {
      throw new Error(`Reaction with UUID: ${uuid} not found`);
    }
  }
}
