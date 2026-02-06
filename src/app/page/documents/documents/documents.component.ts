import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DocumentService } from '../../../services/documents/document.service';
import { ChantierService } from '../../../services/chantier/chantier.service';
import { Document } from '../../../models/document.model';

@Component({
  selector: 'app-document',
  templateUrl: './documents.component.html',
  styleUrls: ['./documents.component.css']
})
export class DocumentsComponent implements OnInit {
  chantierId: number | null = null;
  chantierTitre: string = '';
  documents: Document[] = [];
  documentsToDisplay: Document[] = [];
  selectedFile: File | null = null;
  markAsContract: boolean = false;
  currentPage: number = 1;
  itemsPerPage: number = 4;
  showDeleteConfirmModal: boolean = false;
  selectedDocumentId: number | null = null;
  missingContractAlert: boolean = false;
  isSuccessDelete: boolean = false;
  errorMessage: string = ''; // Added to display download errors
   role: string | null | undefined;

  constructor(
    private route: ActivatedRoute,
    private documentService: DocumentService,
    private chantierService: ChantierService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.chantierId = +id;
      this.loadChantierDetails();
      this.loadDocuments();
    }
    this.role = localStorage.getItem('user_role');
  }

  loadChantierDetails(): void {
    if (this.chantierId) {
      this.chantierService.getChantierById(this.chantierId).subscribe({
        next: (data) => {
          this.chantierTitre = data.titre || 'Unknown Chantier';
          console.log('Chantier data:', data);
        },
        error: (err) => {
          console.error('Error fetching chantier details:', err);
          this.chantierTitre = 'Error Loading Chantier';
        }
      });
    }
  }

  loadDocuments(): void {
    if (this.chantierId) {
      this.documentService.getDocumentsByChantierId(this.chantierId).subscribe({
        next: (docs) => {
          console.log('Raw documents from backend:', docs);
          this.documents = docs.map(doc => ({
            ...doc,
            createdAt: new Date(doc.createdAt)
          }));
          console.log('Loaded documents:', this.documents);
          this.currentPage = 1;
          this.loadDocumentsForPage();
          this.checkForMissingContract();
        },
        error: (err) => console.error('Failed to load documents:', err)
      });
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  checkForMissingContract(): void {
    console.log('Checking for contract document...');
    console.log('Documents:', this.documents);
    if (this.documents.length < 2) {
      this.missingContractAlert = false;
      return;
    }
    const hasContract = this.documents.some(doc => doc.contract === true);
    console.log('Has contract?', hasContract);
    this.missingContractAlert = !hasContract;
  }

  uploadDocument(): void {
    if (!this.selectedFile || !this.chantierId) {
      alert('Please select a file to upload.');
      return;
    }
    console.log('Uploading file:', this.selectedFile.name);
    console.log('Marked as contract:', this.markAsContract);
    this.documentService.uploadDocument(this.chantierId, this.selectedFile, this.markAsContract).subscribe({
      next: () => {
        console.log('Upload successful');
        this.selectedFile = null;
        this.markAsContract = false;
        this.loadDocuments();
      },
      error: (err) => console.error('Failed to upload document:', err)
    });
  }

  downloadDocument(id: number): void {
    this.documentService.downloadDocument(id).subscribe({
      next: (blob) => {
        // Download is handled in the service, no action needed here
      },
      error: (err) => {
        console.error('Error downloading document:', err);
        this.errorMessage = err.message || 'Failed to download document'; // Display error message
      }
    });
  }

  deleteDocument(id: number): void {
    if (confirm('Are you sure you want to delete this document?')) {
      this.documentService.deleteDocument(id).subscribe({
        next: () => this.loadDocuments(),
        error: (err) => console.error('Failed to delete document:', err)
      });
    }
  }

  get totalPages(): number {
    return Math.ceil(this.documents.length / this.itemsPerPage);
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) {
      return;
    }
    this.currentPage = page;
    this.loadDocumentsForPage();
  }

  loadDocumentsForPage(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.documentsToDisplay = this.documents.slice(startIndex, endIndex);
  }

  openDeleteConfirmModal(id: number): void {
    this.selectedDocumentId = id;
    this.showDeleteConfirmModal = true;
  }

  confirmDelete(): void {
    if (this.selectedDocumentId) {
      console.log('confirmDelete called with documentId:', this.selectedDocumentId);
      this.documentService.deleteDocument(this.selectedDocumentId).subscribe({
        next: (response) => {
          console.log('Document deleted successfully, response:', response);
          this.loadDocuments();
          this.loadDocumentsForPage();
          this.showDeleteConfirmModal = false;
          this.selectedDocumentId = null;
          this.isSuccessDelete = true;
          console.log('isSuccessDelete set to true (success callback)');
          setTimeout(() => {
            this.isSuccessDelete = false;
            console.log('isSuccessDelete set to false (success callback)');
          }, 1800);
        },
        error: (err) => {
          console.error('Error deleting document:', err);
          console.error('Error status:', err.status);
          console.error('Error message:', err.message);
          console.error('Error details:', err.error);
          this.showDeleteConfirmModal = false;
          this.selectedDocumentId = null;
        }
      });
    }
  }

  cancelDelete(): void {
    this.showDeleteConfirmModal = false;
    this.selectedDocumentId = null;
  }

  getFileIcon(fileName: string): string {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return 'fa-file-pdf text-red-500';
      case 'doc':
      case 'docx':
        return 'fa-file-word text-blue-500';
      default:
        return 'fa-file text-gray-500';
    }
  }
}