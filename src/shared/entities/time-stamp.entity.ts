import {
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';

export abstract class TimestampEntity {
  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt?: Date;

  @UpdateDateColumn({
    name: 'updated_at',
  })
  updatedAt?: Date;

  @DeleteDateColumn({
    name: 'deleted_at',
    nullable: true,
  })
  deletedAt?: Date;
}