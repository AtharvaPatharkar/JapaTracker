import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  AfterViewInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../../pipes/translate-pipe';
import { LanguageService } from '../../../services/language';

type DataItem = {
  date: string | Date;
  mala: number;
};

@Component({
  selector: 'app-weekly-insights',
  standalone: true,
  imports: [CommonModule,TranslatePipe],
  templateUrl: './weekly-insights.html',
  styleUrls: ['./weekly-insights.css']
})
export class WeeklyInsights implements OnChanges, AfterViewInit {

  // =========================
  // INPUT
  // =========================
  @Input() data: DataItem[] = [];

  // =========================
  // STATE
  // =========================
  weeklyData: number[] = [0, 0, 0, 0, 0, 0, 0];
  labels: string[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  totalWeek = 0;
  avg = 0;
  bestDay = '';
  bestValue = 0;
  growth = 0;

  constructor(private langService: LanguageService) {}

  // =========================
  // LIFECYCLE
  // =========================
  ngOnChanges(changes: SimpleChanges) {
    if (changes['data']) {
      this.processWeekly();
    }
  }

  ngAfterViewInit() {
    this.renderChart();
  }

  // =========================
  // PROCESS DATA
  // =========================
  // ... मागील कोड तसेच ठेवा, फक्त processWeekly() अपडेट करा

processWeekly() {
    if (!this.data || this.data.length === 0) {
      this.reset();
      return;
    }

    const today = new Date();
    const weekLabels = [];
    const weekData = new Array(7).fill(0);
    const lang = this.langService.getCurrentLang(); // 👈 सध्याची भाषा मिळवा

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      
      // भाषेनुसार वार आणि तारीख फॉरमॅट करा
      const dayName = d.toLocaleDateString(lang, { weekday: 'short' });
      const dateStr = d.toLocaleDateString(lang, { day: '2-digit', month: 'short' });
      weekLabels.push(`${dayName} (${dateStr})`);
    }
    this.labels = weekLabels;

    const minDate = new Date(); minDate.setDate(today.getDate() - 6);
    this.dateRange = `${this.formatDate(minDate)} - ${this.formatDate(today)}`;

    this.data.forEach(item => {
      const itemDate = new Date(item.date).setHours(0, 0, 0, 0);
      for (let i = 0; i < 7; i++) {
        const d = new Date();
        d.setDate(today.getDate() - (6 - i)); // जुना डेटा ०-६ इंडेक्समध्ये मॅप करण्यासाठी
        if (itemDate === d.setHours(0, 0, 0, 0)) {
          weekData[i] += item.mala;
        }
      }
    });

    this.weeklyData = weekData;

    // 🔥 GROWTH CALCULATION (येथे ग्रोथ कॅल्क्युलेट करा)
    const last = weekData[6]; // आजचा डेटा
    const prev = weekData[5]; // कालचा डेटा
    this.growth = prev > 0 ? Math.round(((last - prev) / prev) * 100) : (last > 0 ? 100 : 0);

    // स्केल आणि इतर गणिते
    const maxMala = Math.max(...this.weeklyData, 1);
    this.barScale = 140 / maxMala;
    this.totalWeek = this.weeklyData.reduce((a, b) => a + b, 0);
    this.avg = Math.round(this.totalWeek / 7);

    const max = Math.max(...this.weeklyData);
    const idx = this.weeklyData.indexOf(max);
    this.bestDay = this.labels[idx].split(' ')[0]; // फक्त वार दाखवण्यासाठी
    this.bestValue = max;
  }

  // नवीन Helper Function
formatDate(d: Date): string {
    const lang = this.langService.getCurrentLang();
    return d.toLocaleDateString(lang, { day: '2-digit', month: 'short' });
  }

  dateRange: string = '';
  barScale: number = 1;

  // =========================
  // RESET
  // =========================
  reset() {
    this.weeklyData = [0, 0, 0, 0, 0, 0, 0];
    this.totalWeek = 0;
    this.avg = 0;
    this.bestDay = '-';
    this.bestValue = 0;
    this.growth = 0;
  }

  // =========================
  // CHART (READY HOOK)
  // =========================
  renderChart() {

    // 👉 इथे तू Chart.js / ApexCharts integrate करू शकतोस

    // Example placeholder (console debug)
    console.log('Weekly Data:', this.weeklyData);

    // future:
    // this.chart = new Chart(ctx, {...});
  }

  // =========================
  // HELPERS
  // =========================
  // हे तुमच्या क्लासमध्ये चेक करा
  getGrowthColor(): string {
    // console.log("Current Growth:", this.growth); // डीबग करण्यासाठी हे वापरा
    if (this.growth > 0) return '#22c55e'; // हिरवा रंग (Green)
    if (this.growth < 0) return '#ef4444'; // लाल रंग (Red)
    return '#64748b'; // राखाडी (Gray)
  }

  selectedIndex: number | null = null;

getBarColor(i: number, val: number): string {
  if (val === this.bestValue) return '#6366f1'; // best day

  const colors = [
    '#60a5fa', // blue
    '#34d399', // green
    '#fbbf24', // yellow
    '#f87171', // red
    '#a78bfa', // purple
    '#fb923c', // orange
    '#22d3ee'  // cyan
  ];

  return colors[i % colors.length];
}

// क्लासमध्ये हे व्हेरिएबल ॲड करा
isLineChart: boolean = true;

// नवीन फंक्शन जे लाईनसाठी पॉईंट्स देईल
getLinePoints(): string {
  const maxMala = Math.max(...this.weeklyData, 1);
  let path = '';
  
  this.weeklyData.forEach((val, i) => {
    const x = i * (400 / 6);
    const y = 140 - ((val / maxMala) * 140);
    
    if (i === 0) {
      path += `M ${x},${y}`; // सुरूवातीचा पॉईंट
    } else {
      const prevX = (i - 1) * (400 / 6);
      const prevY = 140 - ((this.weeklyData[i - 1] / maxMala) * 140);
      // C कमांड वापरून वक्र रेषा तयार करा
      path += ` C ${(prevX + x) / 2},${prevY} ${(prevX + x) / 2},${y} ${x},${y}`;
    }
  });
  return path;
}

getLineColor(): string {
  // १. जर ग्रोथ पॉझिटिव्ह असेल तर हिरव्याचे शेड्स (५०% पेक्षा जास्त ग्रोथ असेल तर गडद हिरवा)
  if (this.growth > 0) {
    return this.growth > 50 ? '#166534' : '#22c55e';
  }
  
  // २. जर ग्रोथ निगेटिव्ह असेल तर लालचे शेड्स
  if (this.growth < 0) {
    return this.growth < -50 ? '#991b1b' : '#ef4444';
  }

  // ३. अन्यथा, टोटल व्हॅल्यू (totalWeek) नुसार १० शेड्स (Range 0 to 500)
  const colors = [
    '#f87171', // 0-50
    '#fb923c', // 50-100
    '#fbbf24', // 100-150
    '#facc15', // 150-200
    '#a3e635', // 200-250
    '#4ade80', // 250-300
    '#22d3ee', // 300-350
    '#38bdf8', // 350-400
    '#818cf8', // 400-450
    '#c084fc'  // 450-500+
  ];

  // totalWeek ला ५०० पर्यंतच्या इंडेक्समध्ये मॅप करा
  const index = Math.min(Math.floor(this.totalWeek / 50), 9);
  return colors[index];
}
}