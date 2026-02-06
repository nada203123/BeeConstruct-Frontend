import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './page/user/login/login.component';
import { AccueilAdminComponent } from './page/admin/accueil-admin/accueil-admin.component';
import { UsersComponent } from './page/admin/users/users.component';
import { StatistiquesComponent } from './page/admin/statistiques/statistiques.component';
import { ModifyProfileComponent } from './page/user/modify-profile/modify-profile.component'; 
import { UpdatePasswordComponent } from './page/user/update-password/update-password.component';
import { ClientsComponent } from './page/client/clients/clients.component';
import { ArchiveComponent } from './page/archive/archive.component';
import { EmployesComponent } from './page/employe/employes/employes.component';
import { EquipmentComponent } from './page/equipment/equipment.component';
import { OffreComponent } from './page/offres/offre/offre.component';
import { DevisComponent } from './page/devis/devis/devis.component';
import { ChantiersComponent } from './page/chantiers/chantiers.component';

import { SousTraitantsComponent } from './page/employe/sous-traitant/sous-traitant.component';

import { ChantierDetailComponent } from './page/chantierDetails/chantier-detail/chantier-detail.component';
import { DocumentsComponent } from './page/documents/documents/documents.component';
import { SituationComponent } from './page/situation/situation/situation.component';
import { MarchandisesComponent } from './page/marchandises/marchandises.component';
import { PointageComponent } from './page/pointage/pointage.component';
import { SalaryComponent } from './page/salary/salary/salary.component';




const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' }, 
  { path: 'login', component: LoginComponent},
  { path: 'accueil', component: AccueilAdminComponent, children: [
    { path: 'statistiques', component: StatistiquesComponent },
    { path: 'users', component: UsersComponent },
    { path: 'modify-profile', component: ModifyProfileComponent },
    { path: 'update-password', component: UpdatePasswordComponent },
    {path:'clients', component : ClientsComponent},
    {path:'archives', component : ArchiveComponent},
    {path:'employes', component : EmployesComponent},
    {path:'equipment', component : EquipmentComponent},
    {path:'offre', component : OffreComponent},
    {path:'devis', component : DevisComponent},
    { path: 'chantiers', component: ChantiersComponent },

    { path: 'sous-traitants', component: SousTraitantsComponent },

    { path: 'chantiers/:id', component: ChantierDetailComponent },
    {path: 'chantiers/:id/documents', component: DocumentsComponent},
    {path: 'chantiers/:id/situations', component: SituationComponent} ,
    { path: 'chantiers/:id/marchandises', component: MarchandisesComponent },
    { path: 'chantiers/:id/pointage', component: PointageComponent } ,
    { path: 'chantiers/:id/salaires', component: SalaryComponent }


    
  ]
},



];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
