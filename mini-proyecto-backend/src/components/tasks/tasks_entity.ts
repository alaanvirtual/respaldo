// src/components/tasks/tasks_entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Users } from '../users/users_entity';
import { Projects } from '../projects/projects_entity';

export enum Status {
  NotStarted = 'Not-Started',
  InProgress = 'In-Progress',
  Completed = 'Completed'
}

export enum Priority {
  Low = 'Low',
  Medium = 'Medium',
  High = 'High'
}

@Entity()
export class Tasks {
  @PrimaryGeneratedColumn('uuid')
  task_id!: string;

  @Column({ length: 60, nullable: false })
  name!: string;

  @Column({ length: 500, nullable: true })
  description!: string;

  @ManyToOne(() => Projects, (project) => project.tasks, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'project_id' })
  project!: Projects;

  @ManyToOne(() => Users, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  assignedUser!: Users;

  @Column({ type: 'timestamp', nullable: true })
  estimated_start_time!: Date;

  @Column({ type: 'timestamp', nullable: true })
  estimated_end_time!: Date;

  @Column({ type: 'timestamp', nullable: true })
  actual_start_time!: Date;

  @Column({ type: 'timestamp', nullable: true })
  actual_end_time!: Date;

  @Column({ type: 'varchar', length: 20, default: 'Medium' })
  priority!: string;

  @Column({ type: 'varchar', length: 20, default: 'Not-Started' })
  status!: string;

  @Column({ type: 'text', nullable: true })
  supported_files!: string;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
