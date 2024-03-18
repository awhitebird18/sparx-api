import { Exclude } from 'class-transformer';
import { User } from 'src/users/entities/user.entity';
import {
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Column,
  DeleteDateColumn,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

export class BaseEntity {
  @Exclude()
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  uuid: string;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  createdBy?: User;

  @Column({ type: 'timestamptz', nullable: true })
  updatedAt: Date;

  @Exclude()
  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  deletedAt: Date;

  @BeforeInsert()
  generateUuid() {
    this.uuid = this.uuid || uuidv4();
  }

  @BeforeUpdate()
  updateTimestamp() {
    this.updatedAt = new Date();
  }
}
