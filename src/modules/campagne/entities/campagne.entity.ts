import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ProjetEntity } from '../../projet/entities/projet.entity';

export enum StatutCampagne {
  BROUILLON = 'BROUILLON',
  EN_ATTENTE = 'EN_ATTENTE',
  ACTIVE = 'ACTIVE',
  REUSSIE = 'REUSSIE',
  ECHOUEE = 'ECHOUEE',
  REFUSEE = 'REFUSEE',
}

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

  @ManyToOne(() => ProjetEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'projetId' })
  projet: ProjetEntity;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
