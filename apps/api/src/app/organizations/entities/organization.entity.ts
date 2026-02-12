import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from '../../users/user.entity';

@Entity()
export class Organization {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @CreateDateColumn()
  createdAt: Date;

  // --- HIERARCHY (The Critical Part) ---
  
  // The Parent Organization (e.g., "SpaceX")
  // If NULL, this is a Root Org.
  @ManyToOne(() => Organization, (org) => org.children, { nullable: true, onDelete: 'CASCADE' })
  parent: Organization; 

  // The Sub-Organizations (e.g., "Engineering")
  @OneToMany(() => Organization, (org) => org.parent)
  children: Organization[]; 
  
  // -------------------------------------

  @OneToMany(() => User, (user) => user.organization)
  users: User[];
}