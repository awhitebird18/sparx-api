import { PartialType } from '@nestjs/swagger';
import { ReactionDto } from './Reaction.dto';

export class UpdateReactionDto extends PartialType(ReactionDto) {}
