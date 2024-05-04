import { BaseEntity } from 'src/common/entities/base.entity';
import { User } from 'src/users/entities/user.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { StatusDuration } from '../enums/status-duration.enum';

@Entity()
export class UserStatus extends BaseEntity {
  @Column({ nullable: false })
  emoji: string;

  @Column({ nullable: false })
  text: string;

  @Column({ enum: StatusDuration })
  duration: StatusDuration;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'timestamptz', nullable: false })
  dateExpire: Date;

  // ManyToOne Relationships
  @ManyToOne(() => User, (user) => user.customStatuses, {
    onDelete: 'CASCADE',
  })
  user: User;
}
