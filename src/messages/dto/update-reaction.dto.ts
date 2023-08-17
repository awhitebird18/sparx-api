import { PartialType } from '@nestjs/swagger';
import { ReactionDto } from './reaction.dto';

export class UpdateReactionDto extends PartialType(ReactionDto) {}
