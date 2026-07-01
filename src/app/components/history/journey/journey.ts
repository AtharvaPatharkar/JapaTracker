import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { TranslatePipe } from '../../../pipes/translate-pipe';
import { LanguageService } from '../../../services/language';

@Component({
  selector: 'app-journey',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './journey.html',
  styleUrls: ['./journey.css']
})
export class Journey implements OnChanges, AfterViewInit {
  ngAfterViewInit(): void {
      setTimeout(() => {
    this.autoScrollToCurrentMonth();
  }, 100);

  }
  @Input() calendarDays: any[] = [];
  @Input() currentYear: number = new Date().getFullYear();
  
  @Output() yearChange = new EventEmitter<number>();
  @Output() scrollAction = new EventEmitter<'left' | 'right'>();

  @ViewChild('container') containerRef!: ElementRef;

  constructor(private langService: LanguageService) {}

  ngOnInit() {

    this.langService.selectedLang$.subscribe(() => {
      this.processCalendar();
    });
  }

  processedMonths: any[] = [];
ngOnChanges(changes: SimpleChanges) {
  if (changes['calendarDays']) {
    this.processCalendar();

    setTimeout(() => {
      this.autoScrollToCurrentMonth();
    }, 100);
  }
}



processCalendar() {
    const lang = this.langService.getCurrentLang(); //

    this.processedMonths = this.calendarDays.map(month => {
      const weeks: any[] = [];
      for (let i = 0; i < month.days.length; i += 7) {
        weeks.push(month.days.slice(i, i + 7));
      }

      const dateForMonth = new Date(this.currentYear, month.days[0].date.split('-')[1] - 1);
      const translatedName = dateForMonth.toLocaleString(lang, { month: 'short' });

      return { ...month, name: translatedName, weeks: weeks };
    });
  }

  changeYear(offset: number) {
    this.yearChange.emit(offset);
  }

scroll(direction: 'left' | 'right') {
  this.scrollAction.emit(direction);
}

autoScrollToCurrentMonth() {
  const container = this.containerRef?.nativeElement;
  if (!container) return;

  const monthWidth = container.scrollWidth / 3; 
  container.scrollLeft = monthWidth; // 
}
}