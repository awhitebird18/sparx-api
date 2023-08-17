import { Column, Entity, OneToOne } from 'typeorm';
import { Theme, PrimaryColor } from 'src/users/enums';
import { NotificationType } from '../enums';
import { User } from 'src/users/entities/user.entity';
import { BaseEntity } from 'src/common/entities/base.entity';

@Entity()
export class UserPreferences extends BaseEntity {
  @Column({ default: Theme.LIGHT })
  theme: Theme;

  @Column({ default: PrimaryColor.BLUE })
  primaryColor: PrimaryColor;

  @Column({ default: NotificationType.ALL })
  notificationType: NotificationType;

  @OneToOne(() => User, (user) => user.preferences)
  user: User;
}
