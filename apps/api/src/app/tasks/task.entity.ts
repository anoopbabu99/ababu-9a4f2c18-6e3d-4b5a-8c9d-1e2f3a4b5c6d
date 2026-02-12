import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from '../users/user.entity';

export enum TaskStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
}

@Entity()
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column({ type: 'simple-enum', enum: TaskStatus, default: TaskStatus.OPEN })
  status: TaskStatus;

  // --- NEW FIELDS ---
  @Column({ default: 'General' }) // Default category
  category: string;

  @Column({ default: 0 }) // For Drag-and-Drop ordering
  order: number;

  @CreateDateColumn() // Auto-timestamps for Charts
  createdAt: Date;
  // ------------------

  @ManyToOne(() => User, (user) => user.tasks)
  user: User;
}