import {
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
  DeleteDateColumn,
  BeforeInsert,
} from 'typeorm';

import { v4 as uuidv4 } from 'uuid';

export abstract class BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  uuid: string;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  deletedAt: Date;

  @BeforeInsert()
  generateUuid() {
    this.uuid = uuidv4();
  }
}
