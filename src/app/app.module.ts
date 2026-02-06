import { LOCALE_ID, NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LoginComponent } from './page/user/login/login.component';
import { ResetPasswordComponent } from './page/user/reset-password/reset-password.component';
import { AccueilAdminComponent } from './page/admin/accueil-admin/accueil-admin.component';
import { SideBarAdminComponent } from './component/user/side-bar/side-bar-admin.component';
import { ProfileMenuComponent } from './component/user/profile-menu/profile-menu.component';
import { UsersComponent } from './page/admin/users/users.component';
import { CreateUserComponent } from './component/admin/create-user/create-user.component';
import { ModifyUserComponent } from './component/admin/modify-user/modify-user.component';
import { HTTP_INTERCEPTORS, provideHttpClient, withFetch } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { StatistiquesComponent } from './page/admin/statistiques/statistiques.component';
import { ModifyProfileComponent } from './page/user/modify-profile/modify-profile.component';
import { UpdatePasswordComponent } from './page/user/update-password/update-password.component';
import { ClientsComponent } from './page/client/clients/clients.component';
import { AddClientComponent } from './page/client/add-client/add-client.component';
import { ModifyClientComponent } from './page/client/modify-client/modify-client.component';
import { ArchiveComponent } from './page/archive/archive.component';
import { EmployesComponent } from './page/employe/employes/employes.component';
import { SousTraitantsComponent } from './page/employe/sous-traitant/sous-traitant.component';
import { AddEmployeComponent } from './page/employe/add-employe/add-employe.component';
import { ModifyEmployeComponent } from './page/employe/modify-employe/modify-employe.component';
import { EquipmentComponent } from './page/equipment/equipment.component'; 
import { OffreComponent } from './page/offres/offre/offre.component';
import { FilterComponent } from './page/offres/filter/filter.component';
import { AddOffreComponent } from './page/offres/add-offre/add-offre.component';
import { DevisComponent } from './page/devis/devis/devis.component';
import { ModifyOffreComponent } from './page/offres/modify-offre/modify-offre.component';
import { AddDevisComponent } from './page/devis/add-devis/add-devis.component';
import { ModifyDevisComponent } from './page/devis/modify-devis/modify-devis.component';
import { registerLocaleData } from '@angular/common';
import { ChantiersComponent } from './page/chantiers/chantiers.component'; 
import { ModifyChantierComponent } from './page/chantiers/modify-chantier/modify-chantier.component'; 

import localeFr from '@angular/common/locales/fr';
import { CommonModule } from '@angular/common';
import { ChantierDetailComponent } from './page/chantierDetails/chantier-detail/chantier-detail.component';
import { DocumentsComponent } from './page/documents/documents/documents.component';
import { AuthInterceptor } from './auth.interceptor';
import { SituationComponent } from './page/situation/situation/situation.component';
import { MarchandisesComponent } from './page/marchandises/marchandises.component';
import { AddCommandeComponent } from './page/marchandises/add-commande/add-commande.component';
import { ModifyCommandeComponent } from './page/marchandises/modify-commande/modify-commande.component';


import { AddSituationComponent } from './page/situation/add-situation/add-situation.component';
import { SituationDetailsComponent } from './page/situation/situation-details/situation-details.component';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { MatIconModule } from '@angular/material/icon';
import { NotificationComponentComponent } from './page/offres/notification-component/notification-component.component';
import { PointageComponent } from './page/pointage/pointage.component';
import { ModifySituationComponent } from './page/situation/modify-situation/modify-situation.component';
import { SalaryComponent } from './page/salary/salary/salary.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';







registerLocaleData(localeFr);

@NgModule({
  declarations: [ AppComponent,
    LoginComponent,
    ResetPasswordComponent,
    AccueilAdminComponent,
    SideBarAdminComponent,
    ProfileMenuComponent,
    UsersComponent,
    CreateUserComponent,
    ModifyUserComponent,
    StatistiquesComponent ,
    ModifyProfileComponent,
    UpdatePasswordComponent,
    ClientsComponent,
    AddClientComponent,
    ModifyClientComponent,
    ArchiveComponent,
    EmployesComponent,
    AddEmployeComponent,
    ModifyEmployeComponent,
    EquipmentComponent,
    OffreComponent,
    FilterComponent,
    AddOffreComponent,
    DevisComponent,
    ModifyOffreComponent,
    AddDevisComponent,
   ModifyDevisComponent,
   ChantiersComponent,

   SousTraitantsComponent,

   ChantierDetailComponent,
   DocumentsComponent,
   ModifyChantierComponent,
   SituationComponent,
   AddSituationComponent,

   SituationDetailsComponent,

   MarchandisesComponent,
   AddCommandeComponent,
   ModifyCommandeComponent,
   NotificationComponentComponent,
   PointageComponent,
   ModifySituationComponent,
   SalaryComponent




    ],
  imports: [ 
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    NgxChartsModule,
    MatIconModule,
    MatDatepickerModule,
    MatInputModule,
    MatNativeDateModule,
    MatSelectModule,
    MatFormFieldModule
    
    


  ],
  providers: [provideHttpClient(withFetch()), provideAnimationsAsync(),{ provide: LOCALE_ID, useValue: 'fr' },{
    provide: HTTP_INTERCEPTORS,
    useClass: AuthInterceptor,
    multi: true
  }],
  bootstrap: [AppComponent]
})
export class AppModule { }
