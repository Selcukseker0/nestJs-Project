import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('alarms')
export class Alarm {
@PrimaryGeneratedColumn()
id: number;

@Column()
  type: string;

@Column('jsonb', { nullable: true })
  payload: any;

@Column()
userId: number;

@Column({ default: false })
  isRead: boolean;

@CreateDateColumn()
createdAt: Date;
}