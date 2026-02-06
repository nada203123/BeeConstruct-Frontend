export interface Employe {
  id?: number;
  firstName: string;
  lastName: string;
  telephone: string;
  adresse: string;
  rib: string;
  type: string;
  archived: boolean;
  companyName?: string;    
  legalRepresentative?: string;
  soustraitant?: string;
  nomRepresentant?: string;
  prenomRepresentant?: string;
  telephoneRepresentant?: string; 
  adresseRepresentant?: string; 

}