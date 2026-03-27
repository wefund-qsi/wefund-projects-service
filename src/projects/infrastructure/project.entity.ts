import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn('uuid') 
  id: string;

  @Column()
  titre: string; 

  @Column('text')
  description: string; 

  @Column()
  photo: string;  

  @Column()
  porteurId: string; 

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}