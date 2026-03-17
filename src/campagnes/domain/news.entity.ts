import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { CampagneEntity } from './campagne.entity';

@Entity('news')
export class NewsEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 200 })
  titre: string;

  @Column({ type: 'text' })
  contenu: string;

  @Column()
  campagneId: string;

  @ManyToOne(() => CampagneEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'campagneId' })
  campagne: CampagneEntity;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
}