// src/components/projects/projects_entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Users } from '../users/users_entity';
import { Tasks } from '../tasks/tasks_entity';

@Entity()
export class Projects {
  @PrimaryGeneratedColumn('uuid')
  project_id!: string;

  @Column({ length: 60, nullable: false, unique: true })
  name!: string;

  @Column({ length: 500, nullable: true })
  description!: string;

  @Column({ length: 30, default: 'active' })
  status!: string;

  @Column('text', { array: true, default: '{}' })
  user_ids!: string[];

  @Column({ type: 'timestamp', nullable: true })
  start_time!: Date;

  @Column({ type: 'timestamp', nullable: true })
  end_time!: Date;

  @ManyToOne(() => Users, { nullable: true })
  @JoinColumn({ name: 'owner_id' })
  owner!: Users;

  @OneToMany(() => Tasks, (task) => task.project)
  tasks!: Tasks[];

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
