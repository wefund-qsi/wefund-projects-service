import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('projets')
export class ProjetEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  titre: string;  

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ length: 500 })  
  photo: string;

  @Column()
  porteurId: string;

  @CreateDateColumn()
  createdAt: Date;
}
