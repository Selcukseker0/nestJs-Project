import {Entity,PrimaryGeneratedColumn,Column,ManyToOne,CreateDateColumn,UpdateDateColumn,} from 'typeorm';
import { User } from '../../users/user.entity'; 

export enum TaskStatus {
PENDING = 'PENDING',
IN_PROGRESS = 'IN_PROGRESS',
COMPLETED = 'COMPLETED',
}

@Entity()
export class Task {
@PrimaryGeneratedColumn()
id: number;

@Column()
title: string;

@Column({ type: 'text', nullable: true })
description: string;

@Column({
    type: 'enum',
    enum: TaskStatus,
    default: TaskStatus.PENDING,
})
status: TaskStatus;

  // Senin istediğin Expire Time (Bitiş Süresi)
@Column({ type: 'timestamp', nullable: true })
expireTime: Date;

  // Bu görevin sahibi kim? (Relationship)
@ManyToOne(() => User, (user) => user.tasks, { onDelete: 'CASCADE' })
user: User;

  // Otomatik zaman damgaları
@CreateDateColumn()
createdAt: Date;

@UpdateDateColumn()
updatedAt: Date;
}
