import { BaseEntity } from 'src/common/entities/base.entity';
import { Entity, Column, ManyToMany, OneToMany } from 'typeorm';

import { User } from 'src/users/entities/user.entity';
import { Channel } from 'src/channels/entities/channel.entity';
import { Company } from 'src/companies/entities/company.entity';

@Entity()
export class Space extends BaseEntity {
  @Column()
  name: string;

  @OneToMany(() => Channel, (channel) => channel.space)
  channels: Channel[];

  @ManyToMany(() => User, (user) => user.spaces)
  users: User[];

  @OneToMany(() => Company, (company) => company.spaces)
  company: Company;
}
