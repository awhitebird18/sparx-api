import { CardVariant } from 'src/card-variant/entities/card-variant.entity';
import { ReviewHistory } from 'src/review-history/entities/review-history.entity';
import { User } from 'src/users/entities/user.entity';
import { Entity, ManyToOne, Column, OneToMany } from 'typeorm';
import { BaseEntity } from 'src/common/entities/base.entity';
import { CardNote } from 'src/card-note/entities/card-note.entity';
import { Channel } from 'src/channels/entities/channel.entity';
import { Workspace } from 'src/workspaces/entities/workspace.entity';

@Entity()
export class Card extends BaseEntity {
  @ManyToOne(() => User, (user) => user.flashcards)
  user: User;

  @ManyToOne(() => CardNote, (note) => note.flashcards)
  note: CardNote;

  @ManyToOne(() => CardVariant, (cardVariant) => cardVariant.flashcards)
  cardVariant: CardVariant;

  @Column({ default: 0 })
  interval: number;

  @Column({ type: 'float', default: 2.5 })
  easeFactor: number;

  @Column({ default: 0 })
  repetitions: number;

  @Column({ type: 'date', default: () => 'CURRENT_DATE' })
  nextReviewDate: Date;

  @OneToMany(() => ReviewHistory, (reviewHistory) => reviewHistory.flashcard)
  reviewHistories: ReviewHistory[];

  @ManyToOne(() => Channel, (channel) => channel.flashcards, {
    cascade: ['soft-remove'],
  })
  channel: Channel;

  @ManyToOne(() => Workspace, (workspace) => workspace.flashcards, {
    cascade: ['soft-remove'],
  })
  workspace: Workspace;
}
