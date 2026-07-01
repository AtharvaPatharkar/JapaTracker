import { Component, Input, Output, OnChanges, SimpleChanges, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChangeDetectorRef } from '@angular/core';
import { TranslatePipe } from '../../../pipes/translate-pipe';
import { LanguageService } from '../../../services/language';

type LogItem = {
  date: string | Date;
  mala: number;
  target: number;
};

@Component({
  selector: 'app-recent-logs',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './recent-logs.html',
  styleUrls: ['./recent-logs.css']
})
export class RecentLogs implements OnChanges {

  constructor(private cdr: ChangeDetectorRef, private langService: LanguageService) { }

  @Input() data: LogItem[] = [];

  @Output() onDelete = new EventEmitter<LogItem>();

  filteredLogs: LogItem[] = [];
  uniqueTargets: number[] = [];

  showAll = false;
  startDate: string = '';
  endDate: string = '';
  selectedTarget: string = '';

  sumMalas = 0;
  sumTotalCount = 0;

  isPopupOpen = false;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['data']) {
      this.extractUniqueTargets();
      this.applyFilters();
    }
  }

  extractUniqueTargets() {
    const targets = this.data.map(item => item.target || 0);
    this.uniqueTargets = [...new Set(targets)].sort((a, b) => a - b);
  }

  toggleView() {
    this.showAll = !this.showAll;
    this.applyFilters();
  }

  applyFilters() {

    let list = [...this.data].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    if (this.showAll) {
      if (this.startDate && this.endDate) {
        const start = new Date(this.startDate).setHours(0, 0, 0, 0);
        const end = new Date(this.endDate).setHours(23, 59, 59, 999);
        list = list.filter(item => {
          const itemDate = new Date(item.date).getTime();
          return itemDate >= start && itemDate <= end;
        });
      }
      if (this.selectedTarget) {
        list = list.filter(item => item.target == Number(this.selectedTarget));
      }
    } else {

      list = list.slice(0, 5);
    }

    this.filteredLogs = list;
    this.calculateSums();
    this.cdr.detectChanges();
  }

  calculateSums() {
    this.sumMalas = this.filteredLogs.reduce((acc, curr) => acc + (Number(curr.mala) || 0), 0);
    this.sumTotalCount = this.filteredLogs.reduce((acc, curr) => acc + ((Number(curr.mala) || 0) * (Number(curr.target) || 1)), 0);
  }

  getFullRangeText(): string {
    if (!this.data || this.data.length === 0) return 'No data';
    const sorted = [...this.data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const firstDate = this.formatDate(sorted[0].date);
    const lastDate = this.formatDate(new Date());
    const toLabel = this.langService.getTranslate('to_label');
    return `${firstDate} ${toLabel} ${lastDate}`;
  }

  formatDate(date: string | Date): string {
    const lang = this.langService.getCurrentLang();
    return new Date(date).toLocaleDateString(lang === 'mr' ? 'mr-IN' : 'en-GB', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  }

  formatTime(date: string | Date): string {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', year: 'numeric' });
  }

  trackByIndex(index: number) {
    return index;
  }

  // recent-logs.ts
  deleteLog(item: LogItem) {
    this.onDelete.emit(item);
  }
}