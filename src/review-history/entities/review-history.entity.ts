import { Flashcard } from 'src/card/entities/card.entity';
import { BaseEntity } from 'src/common/entities/base.entity';
import { User } from 'src/users/entities/user.entity';
import { Entity, ManyToOne, Column } from 'typeorm';

@Entity()
export class ReviewHistory extends BaseEntity {
  @ManyToOne(() => Flashcard, (flashcard) => flashcard.reviewHistories)
  flashcard: Flashcard;

  @ManyToOne(() => User, (user) => user.reviewHistories)
  user: User; // Direct reference to the User

  @Column({ type: 'date', default: () => 'CURRENT_DATE' })
  dateReviewed: Date;

  @Column()
  performanceRating: string;
}
