import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ProjectEntity } from '../../projects/infrastructure/project.entity';
import { StatutCampagne } from '../domain/statut-campagne';


@Entity('campagnes')
export class CampagneEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  titre: string;

  @Column({ type: 'text' })
  description: string;

  @Column('decimal', { precision: 10, scale: 2 })
  objectif: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  montantCollecte: number;

  @Column({ type: 'timestamp' })
  dateFin: Date;

  @Column({ type: 'enum', enum: StatutCampagne, default: StatutCampagne.BROUILLON })
  statut: StatutCampagne;

  @Column()
  porteurId: string;

  @Column()
  projetId: string;

  @ManyToOne(() => ProjectEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'projetId' })
  projet: ProjectEntity;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}