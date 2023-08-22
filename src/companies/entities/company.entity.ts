import { Entity, Column, OneToMany } from 'typeorm';

import { Channel } from 'src/channels/entities/channel.entity';
import { BaseEntity } from 'src/common/entities/base.entity';
import { User } from 'src/users/entities/user.entity';

@Entity()
export class Company extends BaseEntity {
  @Column()
  name: string;

  @Column()
  email: string;

  @OneToMany(() => Channel, (channel) => channel.company)
  channels: Channel[];

  @OneToMany(() => User, (user) => user.company)
  users: User[];
}
