import { Column, Entity, OneToOne } from 'typeorm';

import { User } from 'src/users/entities/user.entity';
import { BaseEntity } from 'src/common/entities/base.entity';

import { Theme } from 'src/users/enums/theme.enum';
import { PrimaryColor } from 'src/users/enums/primary-color.enum';
import { NotificationType } from '../enums/notification-type.enum';
import { Exclude } from 'class-transformer';

@Entity()
export class UserPreferences extends BaseEntity {
  @Column({ default: Theme.DARK })
  theme: Theme;

  @Column({ default: PrimaryColor.BLUE })
  primaryColor: PrimaryColor;

  @Column({ default: NotificationType.ALL })
  notificationType: NotificationType;

  @OneToOne(() => User, (user) => user.preferences)
  user: User;

  @Exclude()
  @Column({ nullable: true })
  userId: number;
}
