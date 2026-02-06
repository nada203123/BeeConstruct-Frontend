

export interface Situation {
  id: number;
  nomSituation: string;
  dateSituation: Date;
  montantGlobal: number;
  chargeSituation?: number;
  montantNet?: number;
  portionBeehivePourcentage?: number;
  portionBeehiveMontant?: number;
  montantSalaire?: number;
  chantier: {
    id: number;
    titre: string;
    localisation: string;
    clientId: number;
    client: string;
    offreId: number;
    statut: string;
    coutTotal?: number;
    dateDeDebut?: Date;
    cumulPartBeehive?: number;
    progression?: number;
  };
  employeIds: number[];
  montantRestant?: number;
  pointages?: any[]; 
}