import { Component, OnInit } from '@angular/core';
import { Client } from '../../../models/client.model';
import { ClientService } from '../../../services/client.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-clients',
  templateUrl: './clients.component.html',
  styleUrl: './clients.component.css'
})
export class ClientsComponent implements OnInit {
  clients: Client[] = [];
  showAddClientModal = false;
  currentPage = 1;
  itemsPerPage = 5;
  clientsToDisplay: any[] = [];
  currentUserEmail: string | null = null;
  filteredClients: Client[] = [];
  searchQuery: string = '';
  isSuccess: boolean = false;
  selectedClient: any = null;
  showModifyClientModal: boolean = false;
  isSuccessModified: boolean = false;
  errorMessage: string = '';
  showArchiveConfirmModal: boolean = false; 
  selectedClientId: number| null = null; 
  isSuccessArchive: boolean = false;
  userRole: string = '';
  canPerformActions: boolean = false;

  constructor(private clientService: ClientService) { }

  ngOnInit(): void {
    this.getUserRole();
    this.loadClients();
  }

  get totalPages(): number {
    return Math.ceil(this.filteredClients.length / this.itemsPerPage);
  }

  getUserRole(): void {
    // Get role from localStorage or service
    const role = localStorage.getItem('user_role');
    this.userRole = role || '';
    
    this.canPerformActions = this.userRole === 'Administrateur' || this.userRole === 'Chargé commercial';
    console.log(this.canPerformActions)
    console.log("Role in archive:", this.userRole);
    console.log("Can perform actions:", this.canPerformActions);
    
  }


  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) {
      return;
    }
    this.currentPage = page;
    this.loadClientsForPage();
  }

  loadClientsForPage(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.clientsToDisplay = this.filteredClients.slice(startIndex, endIndex);
    console.log(this.clientsToDisplay)
  }

  loadClients(): void {
    this.clientService.getAllActiveClients().subscribe({
      next: (data) => {
        this.clients = data;
        
        console.log(data)
        this.applyFilter();
      },
      error: (err) => {
        console.error('Error fetching clients:', err);
      }
    });
  }


  openArchiveConfirmModal(userId: number): void {
    this.selectedClientId = userId;
    this.showArchiveConfirmModal = true;
  }

  confirmArchive(): void {
    if (this.selectedClientId ) {
      this.archiveClient(this.selectedClientId );
      this.showArchiveConfirmModal = false; 
      this.selectedClientId  = null; 
    }
  }

 
  cancelArchive(): void {
    this.showArchiveConfirmModal = false; 
    this.selectedClientId  = null; 
  }


  search(): void {
    this.currentPage = 1; 
    this.applyFilter();
  }

  applyFilter(): void {
    if (!this.searchQuery || this.searchQuery.trim() === '') {
      this.filteredClients = [...this.clients];
    } else {
      const query = this.searchQuery.toLowerCase().trim();
      this.filteredClients = this.clients.filter(client => 
        `${client.nomDirecteur} ${client.prenomDirecteur}`.toLowerCase().includes(query) ||
        client.nomSociete?.toLowerCase().includes(query) ||
        client.siegeSocial?.toLowerCase().includes(query) ||
        client.adresse?.toLowerCase().includes(query) ||
        client.telephoneDirecteur?.toLowerCase().includes(query)
      );
    }
    this.loadClientsForPage();
  }



  openAddClientModal(): void {
    this.showAddClientModal = true;
  }

  closeAddClientModal(): void {
    this.showAddClientModal = false;
  }

  onClientAdded(): void {
    this.isSuccess = true;
    this.loadClients();
    this.closeAddClientModal();
    setTimeout(() => {
      this.isSuccess = false;
    }, 1500);
  }

  getFullName(client: Client): string {
    return `${client.nomDirecteur} ${client.prenomDirecteur}`;
  }

  editClient(userId: number): void {
    this.errorMessage = ''; 
    const client = this.clients.find(u => u.id === userId);
    if (client) {
      this.selectedClient = { ...client };

      this.showModifyClientModal = true;
      console.log('Edit client:', userId);
      console.log("edited client", this.selectedClient)
    } else {
      console.error('Client not found with Id:', userId);
    }
  }


  updateClient(): void {

    
     if (this.selectedClient) {
        const clientIndex = this.clients.findIndex(client => client.id === this.selectedClient.id);
        console.log("client index", clientIndex)
        if (clientIndex !== -1) {
            // Update the client in the main array
            this.clients[clientIndex] = { ...this.selectedClient };
            
            // Reapply the current filter and pagination
            this.applyFilter();
        }
    }
    
    this.isSuccessModified = true;
    this.closeModifyUserModal();
    setTimeout(() => {
        this.isSuccessModified = false;
    }, 1500);
  
  }

  archiveClient(clientId: number): void {
    console.log('archiveClient called with clientId:', clientId);
    this.clientService.archiveClient(clientId).subscribe(
      (response) => {
        console.log('Client archived successfully, response:', response);
        
        this.clients = this.clients.filter(client => client.id !== clientId);

        this.applyFilter();
        
        if (this.clientsToDisplay.length === 0 && this.currentPage > 1) {
          this.currentPage = this.currentPage - 1;
          this.loadClientsForPage();
        }
        
        this.isSuccessArchive = true;
        console.log('isSuccessArchive set to true (success callback)');
        setTimeout(() => {
          this.isSuccessArchive = false;
          console.log('isSuccessArchive set to false (success callback)');
        }, 1500);
      },
      (error) => {
        
          console.error('Error archiving client:', error);
          console.error('Error status:', error.status);
          console.error('Error message:', error.message);
          console.error('Error details:', error.error);
        }
      
    );
  }

  closeModifyUserModal(): void {
    this.showModifyClientModal = false;
    this.selectedClient = null;
    this.loadClients();
  }

  

}
