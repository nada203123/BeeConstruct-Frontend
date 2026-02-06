export interface Commande {
    id?: number;
    chantierId: number;
    nomFournisseur: string;
    prixHT: number;
    tva: number;
    prixTTC?: number;
    dateCommande: string;
    description?: string;
    situationId?: number;
  }