import { CardType } from 'src/card-type/entities/card-type.entity';
import { ReviewHistory } from 'src/review-history/entities/review-history.entity';
import { User } from 'src/users/entities/user.entity';
import { Entity, ManyToOne, Column, OneToMany } from 'typeorm';
import { BaseEntity } from 'src/common/entities/base.entity';
import { CardNote } from 'src/card-note/entities/card-note.entity';
import { Channel } from 'src/channels/entities/channel.entity';
import { Workspace } from 'src/workspaces/entities/workspace.entity';

@Entity()
export class Flashcard extends BaseEntity {
  @ManyToOne(() => User, (user) => user.flashcards)
  user: User;

  @ManyToOne(() => CardNote, (note) => note.flashcards)
  note: CardNote;

  @ManyToOne(() => CardType, (cardType) => cardType.flashcards)
  cardType: CardType;

  @Column({ default: 0 }) // Initially, the card has not been reviewed
  interval: number; // days until the card is due again

  @Column({ type: 'float', default: 2.5 }) // Standard starting ease factor in many SRS algorithms
  easeFactor: number; // affects how quickly the interval grows

  @Column({ default: 0 }) // Initially, the card has not been reviewed
  repetitions: number; // number of times the card has been reviewed

  @Column({ type: 'date', default: () => 'CURRENT_DATE' })
  nextReviewDate: Date; // when the card is next due for review

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
