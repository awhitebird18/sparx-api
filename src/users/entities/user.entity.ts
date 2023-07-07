import { Channel } from 'src/channels/entities/channel.entity';
import { BaseEntity } from 'src/common/entities/base.entity';
import { Company } from 'src/companies/entities/company.entity';
import { Section } from 'src/sections/entities/section.entity';
import { Space } from 'src/spaces/entities/space.entity';
import {
  Entity,
  Column,
  ManyToMany,
  JoinTable,
  ManyToOne,
  OneToMany,
} from 'typeorm';

@Entity()
export class User extends BaseEntity {
  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  email: string;

  @Column({ nullable: true })
  profileImage: string;

  @Column()
  theme: string;

  @Column()
  primaryColor: string;

  @ManyToMany(() => Space, (space) => space.users)
  spaces: Space[];

  @ManyToOne(() => Company, (company) => company.users)
  company: Company;

  @OneToMany(() => Section, (section) => section.user)
  sections: Section;

  @ManyToMany(() => Channel, (channel) => channel.users)
  @JoinTable()
  channels: Channel[];

  @Column()
  isAdmin: boolean;
}
