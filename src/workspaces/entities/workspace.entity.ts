import { Channel } from 'src/channels/entities/channel.entity';
import { BaseEntity } from 'src/common/entities/base.entity';
import { User } from 'src/users/entities/user.entity';
import { Column, Entity, OneToMany } from 'typeorm';

@Entity()
export class Workspace extends BaseEntity {
  @Column()
  name: string;

  @OneToMany(() => User, (user) => user.workspace)
  users: User[];

  @OneToMany(() => Channel, (channel) => channel.workspace)
  channels: Channel[];
}
