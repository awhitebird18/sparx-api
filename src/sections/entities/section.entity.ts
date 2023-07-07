import { Channel } from 'src/channels/entities/channel.entity';
import { BaseEntity } from 'src/common/entities/base.entity';
import { User } from 'src/users/entities/user.entity';
import { Entity, Column, OneToMany, ManyToOne } from 'typeorm';

@Entity()
export class Section extends BaseEntity {
  @Column()
  name: string;

  @Column({ nullable: true })
  type?: string;

  @Column({ nullable: true })
  emoji?: string;

  @OneToMany(() => Channel, (channel) => channel.section)
  channels: Channel[];

  @ManyToOne(() => User, (user) => user.sections)
  user: User;
}
