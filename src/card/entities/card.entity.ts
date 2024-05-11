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
  @Column({ default: 0 })
  interval: number;

  @Column({ type: 'float', default: 2.5 })
  easeFactor: number;

  @Column({ default: 0 })
  repetitions: number;

  @Column({ type: 'date', default: () => 'CURRENT_DATE' })
  nextReviewDate: Date;

  // ManyToOne Relationships
  @ManyToOne(() => User, (user) => user.flashcards, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => CardNote, (note) => note.flashcards, { onDelete: 'CASCADE' })
  note: CardNote;

  @ManyToOne(() => CardVariant, (cardVariant) => cardVariant.flashcards, {
    onDelete: 'CASCADE',
  })
  cardVariant: CardVariant;

  @ManyToOne(() => Channel, (channel) => channel.flashcards, {
    onDelete: 'CASCADE',
  })
  channel: Channel;

  @ManyToOne(() => Workspace, (workspace) => workspace.flashcards, {
    onDelete: 'CASCADE',
  })
  workspace: Workspace;

  // OneToMany Relationships
  @OneToMany(() => ReviewHistory, (reviewHistory) => reviewHistory.flashcard)
  reviewHistories: ReviewHistory[];
}
