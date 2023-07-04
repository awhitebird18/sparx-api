import { Channel } from 'src/channels/entities/channel.entity';
import { BaseEntity } from 'src/common/entities/base.entity';
import { Space } from 'src/spaces/entities/space.entity';
import { User } from 'src/users/entities/user.entity';
import { Entity, Column, OneToMany, ManyToOne } from 'typeorm';

@Entity()
export class Company extends BaseEntity {
  @Column()
  name: string;

  @Column()
  email: string;

  @OneToMany(() => Channel, (channel) => channel.company)
  channels: Channel[];

  @ManyToOne(() => Space, (space) => space.company)
  spaces: Space[];

  @OneToMany(() => User, (user) => user.company)
  users: User[];
}
