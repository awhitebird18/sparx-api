import { BaseEntity } from 'src/common/entities/base.entity';
import { UserChannel } from 'src/userchannels/entity/userchannel.entity';
import { User } from 'src/users/entities/user.entity';
import { Entity, Column, OneToMany, ManyToOne } from 'typeorm';

@Entity()
export class Section extends BaseEntity {
  @Column()
  name: string;

  @Column({ nullable: true })
  type?: string;

  @Column({ default: false, nullable: true })
  isSystem?: boolean;

  @Column({ nullable: true })
  emoji?: string;

  @OneToMany(() => UserChannel, (userchannel) => userchannel.section)
  channels: UserChannel[];

  @ManyToOne(() => User, (user) => user.sections)
  user?: User;
}
