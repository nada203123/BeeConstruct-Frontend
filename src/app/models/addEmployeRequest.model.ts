export interface AddEmployeRequest  {
  id?: number;
  
  // Common fields
  adresse: string;
  type: string;
  archived: boolean;
  
  // Interne employee fields
  firstName: string;
  lastName: string;
  telephone: string;
  rib: string;
  
  // Sous-traitant fields
  soustraitant?: string;     
  nomRepresentant?: string;  
  prenomRepresentant?: string; 
  telephoneRepresentant?: string; 
  adresseRepresentant?: string;
}