import { StatutCampagne } from './statut-campagne';

export interface Campagne {
  id: string;
  titre: string;
  description: string;
  objectif: number;
  montantCollecte: number;
  dateFin: Date;
  statut: StatutCampagne;
  porteurId: string;
  projetId: string;
  createdAt: Date;
  updatedAt: Date;
}
