import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('projets')
export class ProjetEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  titre: string;  // ← Remplace "nom"

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ length: 500 })  // URL ou chemin photo
  photo: string;

  @Column()
  porteurId: string;

  @CreateDateColumn()
  createdAt: Date;
}
