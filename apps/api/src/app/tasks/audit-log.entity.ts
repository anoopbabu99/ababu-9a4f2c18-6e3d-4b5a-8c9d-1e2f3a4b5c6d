import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  action: string; // "CREATE", "UPDATE", "DELETE"

  @Column()
  taskId: string;

  @Column()
  userId: string; // Who performed the action

  @Column()
  orgId: string; // Which Org did this happen in? (Crucial for filtering!)

  @Column({ nullable: true })
  details: string;

  @CreateDateColumn()
  timestamp: Date;
}