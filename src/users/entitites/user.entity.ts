import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Task } from '../../tasks/entities/task.entity';
@Entity()
export class User {
@PrimaryGeneratedColumn()
    id: number;

@Column({ unique: true })
    email: string;

@Column()
    password: string;

@Column({ nullable: true })
denemeKolonu: string;

@OneToMany(() => Task, (task) => task.user)
    tasks: Task[];
} 