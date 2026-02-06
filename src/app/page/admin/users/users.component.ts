import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../services/user.service';
import { HttpErrorResponse } from '@angular/common/http';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { environment } from '../../../environment/environment';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {
  users: any[] = [];
  usersToDisplay: any[] = [];
  currentUserEmail: string | null = null;
  currentPage = 1;
  totalPages = 1;
  usersPerPage = 3;
  showAddUserModal = false;
  showModifyUserModal: boolean = false;
  showArchiveConfirmModal: boolean = false; 
  selectedUserId: number | null = null; 
  selectedUser: any = null;
  deleteStatusMessage: string = '';
  errorMessage: string = '';
  loginFailed: boolean = false;
  isSuccess: boolean = false;
  isSuccessArchived: boolean = false;
  isSuccessModified: boolean = false;
  private apiUrl = environment.apiUrlUser;
  private sbUrl = environment.sbUrl;

  constructor(private userService: UserService,private sanitizer: DomSanitizer) {}

  ngOnInit(): void {
    const emailObj = this.userService.getEmailFromToken();
    if (emailObj && emailObj.email) {
      this.currentUserEmail = emailObj.email;
    }
    this.loadUsers();
  }

  isCurrentUser(user: any): boolean {

    return this.currentUserEmail === user.email;
  }


 

 
  getProfilePhotoUrl(photoPath: string | null): SafeUrl {
    if (!photoPath) {
      return 'assets/images/photo.jpg'; 
    }
  
  
    const normalizedPath = photoPath.replace(/\\/g, '/');
  
  
    const fullUrl = `${this.sbUrl}/beeconstruct/${normalizedPath}`;
  
    console.log('Photo URL construite:', fullUrl);
  
    return this.sanitizer.bypassSecurityTrustUrl(fullUrl);
  }
  
  
  loadUsers(): void {
    this.userService.getActiveUsers().subscribe(
      (data) => {
        this.users = data;
        console.log("dataaaa",data);
        this.totalPages = this.users.length > this.usersPerPage ? Math.ceil(this.users.length / this.usersPerPage) : 1;
        if (this.currentPage > this.totalPages) {
          this.currentPage = 1;
        }
        this.loadUsersForPage(this.currentPage);
      },
      (error) => {
        console.error('Error fetching users:', error);
      }
    );
  }

  loadUsersForPage(page: number): void {
    this.currentPage = page;
    const startIndex = (page - 1) * this.usersPerPage;
    const endIndex = startIndex + this.usersPerPage;
    this.usersToDisplay = this.users.slice(startIndex, endIndex);
  }

  editUser(userId: string): void {
    const user = this.users.find(u => u.keycloakId === userId);
    if (user) {
      this.selectedUser = { ...user };
      this.showModifyUserModal = true;
      console.log('Edit user:', userId);
    } else {
      console.error('User not found with keycloakId:', userId);
    }
  }

  updateUser(updatedUser: any): void {
    const userId = updatedUser.keycloakId;
    console.log('updateUser called with userId:', userId);


        const index = this.users.findIndex(u => u.keycloakId === userId);
        if (index !== -1) {
          this.users[index] = { ...this.users[index], ...updatedUser };
          this.loadUsersForPage(this.currentPage);
        }
       
        this.isSuccessModified = true;
        setTimeout(() => {
          this.isSuccessModified = false;
          console.log('isSuccessModified set to false');
        }, 1500);
      
        this.closeModifyUserModal();
    }
  

  openArchiveConfirmModal(userId: number): void {
    this.selectedUserId = userId;
    this.showArchiveConfirmModal = true;
  }

  confirmArchive(): void {
    if (this.selectedUserId) {
      console.log(this.selectedUserId)
      this.archiveUser(this.selectedUserId);
      this.showArchiveConfirmModal = false; 
      this.selectedUserId = null; 
    }
  }

 

  cancelArchive(): void {
    this.showArchiveConfirmModal = false; 
    this.selectedUserId = null; 
  }

  archiveUser(userId: number): void {
    console.log('deleteUser called with userId:', userId);
    this.userService.archiveUser(userId).subscribe(
      (response) => {
        console.log('User deleted successfully, response:', response);
        this.users = this.users.filter(user => user.id !== userId);
        this.loadUsersForPage(this.currentPage);
        this.loadUsers();
        this.isSuccessArchived = true;
        console.log('isSuccessDelete set to true (success callback)');
        setTimeout(() => {
          this.isSuccessArchived = false;
          console.log('isSuccessDelete set to false (success callback)');
        }, 1500);
      },
      (error: HttpErrorResponse) => {
        if (error.status === 200) {
          console.warn('Received 200 status but marked as error, treating as success:', error);
          this.users = this.users.filter(user => user.keycloakId !== userId);
          this.loadUsersForPage(this.currentPage);
          this.loadUsers();
          this.isSuccessArchived = true;
          console.log('isSuccessDelete set to true (error callback)');
          setTimeout(() => {
            this.isSuccessArchived = false;
            console.log('isSuccessDelete set to false (error callback)');
          }, 1500);
        } else {
          console.error('Error deleting user:', error);
          console.error('Error status:', error.status);
          console.error('Error message:', error.message);
          console.error('Error details:', error.error);
        }
      }
    );

  }



 /* deleteUser(userId: number): void {
    console.log('deleteUser called with userId:', userId);
    this.userService.deleteUser(userId).subscribe(
      (response) => {
        console.log('User deleted successfully, response:', response);
        this.users = this.users.filter(user => user.id !== userId);
        this.loadUsersForPage(this.currentPage);
        this.loadUsers();
        this.isSuccessDelete = true;
        console.log('isSuccessDelete set to true (success callback)');
        setTimeout(() => {
          this.isSuccessDelete = false;
          console.log('isSuccessDelete set to false (success callback)');
        }, 1500);
      },
      (error: HttpErrorResponse) => {
        if (error.status === 200) {
          console.warn('Received 200 status but marked as error, treating as success:', error);
          this.users = this.users.filter(user => user.keycloakId !== userId);
          this.loadUsersForPage(this.currentPage);
          this.loadUsers();
          this.isSuccessDelete = true;
          console.log('isSuccessDelete set to true (error callback)');
          setTimeout(() => {
            this.isSuccessDelete = false;
            console.log('isSuccessDelete set to false (error callback)');
          }, 1500);
        } else {
          console.error('Error deleting user:', error);
          console.error('Error status:', error.status);
          console.error('Error message:', error.message);
          console.error('Error details:', error.error);
        }
      }
    );
  }*/

  goToPage(page: number): void {
    this.loadUsersForPage(page);
  }

  closeModifyUserModal(): void {
    this.showModifyUserModal = false;
    this.selectedUser = null;
  }

 

  openAddUserModal(): void {
    this.showAddUserModal = true;
  }

  onUserAdded(): void {
    this.isSuccess = true;
    this.showAddUserModal = false;
    this.loadUsers();
    setTimeout(() => {
      this.isSuccess = false;
    }, 1500);
  }




  
}