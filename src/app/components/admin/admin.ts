import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.html',
  styleUrls: ['./admin.css']
})
export class AdminComponent implements OnInit, OnDestroy {

  users: any[] = [];
  loading = true;
  unsubscribe: any;

  // 🔍 search + sort
  searchText: string = '';
  sortField: string = 'createdAt';
  sortDirection: 'asc' | 'desc' = 'desc';

  // 📅 filters
  startDate: string = '';
  endDate: string = '';
  showActiveOnly: boolean = false;

  // 📊 stats
  totalUsers: number = 0;
  activeUsers: number = 0;

  // 📄 pagination
  currentPage: number = 1;
  pageSize: number = 5;

  constructor(
    private auth: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

async ngOnInit() {

  const isAdmin = await this.auth.isAdmin();

  if (!isAdmin) {
    this.router.navigate(['/dashboard']);
    return;
  }

  this.unsubscribe = this.auth.getAllUsersRealtime((users) => {
    this.users = users;
    this.loading = false;
    this.cdr.detectChanges();
  });
}

  ngOnDestroy() {
    if (this.unsubscribe) this.unsubscribe();
  }

  // 📅 format
  formatDate(dateStr: string) {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString();
  }

  // 🟢 active check (5 min)
  isActive(lastActive: string): boolean {
    if (!lastActive) return false;
    const diff = (Date.now() - new Date(lastActive).getTime()) / 1000;
    return diff < 300;
  }

  // 🔽 sort
  setSort(field: string) {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'desc';
    }
  }

  // 🔍 FILTER + STATS
  get filteredUsers() {
    let filtered = [...this.users];

    // search
    if (this.searchText) {
      const t = this.searchText.toLowerCase();
      filtered = filtered.filter(u =>
        (u.name || '').toLowerCase().includes(t) ||
        (u.email || '').toLowerCase().includes(t)
      );
    }

    // date filter
    if (this.startDate) {
      filtered = filtered.filter(u =>
        new Date(u.createdAt) >= new Date(this.startDate)
      );
    }

    if (this.endDate) {
      filtered = filtered.filter(u =>
        new Date(u.createdAt) <= new Date(this.endDate)
      );
    }

    // active filter
    if (this.showActiveOnly) {
      filtered = filtered.filter(u => this.isActive(u.lastActive));
    }

    // sort
    filtered.sort((a, b) => {
      const aVal = new Date(a[this.sortField] || 0).getTime();
      const bVal = new Date(b[this.sortField] || 0).getTime();
      return this.sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
    });

    // stats
    this.totalUsers = this.users.length;
    this.activeUsers = this.users.filter(u => this.isActive(u.lastActive)).length;

    return filtered;
  }

  // 📄 pagination
  get paginatedUsers() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredUsers.slice(start, start + this.pageSize);
  }

  get totalPages() {
    return Math.ceil(this.filteredUsers.length / this.pageSize);
  }

  nextPage() {
    if (this.currentPage < this.totalPages) this.currentPage++;
  }

  prevPage() {
    if (this.currentPage > 1) this.currentPage--;
  }

  async deleteUser(uid: string) {
    if (confirm("Delete this user?")) {
      await this.auth.adminDeleteUser(uid);
    }
  }

  goLogin() {
    this.router.navigate(['/login']);
  }
}