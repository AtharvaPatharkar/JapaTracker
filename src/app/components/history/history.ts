import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  NgZone
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import confetti from 'canvas-confetti';
import { BehaviorSubject } from 'rxjs';
// ✅ SERVICES
import { AuthService } from '../../services/auth';
import { ChangeDetectorRef } from '@angular/core';


// ✅ CHILD COMPONENTS
import { HistoryHeader } from './header/header';
import { HistoryStats } from './history-stats/history-stats';
import { AchievementsTarget } from './achievements-target/achievements-target';
import { AiChat } from './ai-chat/ai-chat';
import { RecentLogs } from './recent-logs/recent-logs';
import { TimeAnalysis } from './time-analysis/time-analysis';
import { FocusMeter } from './focus-meter/focus-meter';
import { WeeklyInsights } from './weekly-insights/weekly-insights';
import { ProgressCircle } from './progress-circle/progress-circle';
import { FocusGraph } from './focus-graph/focus-graph';
import { DailyQuests } from './daily-quests/daily-quests';
import { Journey } from './journey/journey';
import { EnergyMeter } from './energy-meter/energy-meter';
import { Prediction } from './prediction/prediction';
import { Footer } from './footer/footer';
import { FooterComponent } from '../footer/footer';
import { ThemeService } from '../../services/theme';
import { LanguageService } from '../../services/language';



import jsPDF from 'jspdf';
import 'jspdf-autotable';
import html2canvas from 'html2canvas';
import { TranslatePipe } from "../../pipes/translate-pipe";

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, HistoryHeader, HistoryStats, AchievementsTarget, AiChat, RecentLogs, TimeAnalysis, FocusMeter, WeeklyInsights, ProgressCircle, FocusGraph, DailyQuests, Journey, EnergyMeter, Prediction, FooterComponent, TranslatePipe],
  templateUrl: './history.html',
  styleUrls: ['./history.css']
})


export class HistoryComponent implements OnInit, OnDestroy {
  nextTarget: number = 1000;
  isDownloadingPDF = false; // Tracks if PDF report is generating

  constructor(
    private router: Router,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private zone: NgZone,
    public themeService: ThemeService,
    private langService: LanguageService,
  ) { }

  data$ = new BehaviorSubject<any[]>([]);

  // ==============================
  // 🔴 SUBSCRIPTIONS / SYSTEM
  // ==============================
  unsubscribe: any;


  // ==============================
  // 📊 CORE DATA (RAW)
  // ==============================
  data: any[] = [];


  // ==============================
  // 📈 STATS
  // ==============================
  totalMala = 0;
  totalCount = 0;
  currentStreak = 0;
  longestStreak = 0;


  // ==============================
  // 🎯 TARGETS
  // ==============================
  targetStreak = 30;
  malasToNextTarget = 0;
  daysToReach = 0;


  // ==============================
  // 🧠 FOCUS SYSTEM
  // ==============================
  focusScore = 0;
  focusGrade = '';
  focusTip = '';
  focusGraphData: any[] = [];


  // ==============================
  // ⏰ TIME ANALYSIS
  // ==============================
  clockData: any[] = [];
  peakHour = '';
  currentYear = new Date().getFullYear();
  currentMonth = new Date().getMonth();


  // ==============================
  // 📿 ENERGY SYSTEM
  // ==============================
  vibrationalFreq = 0;
  // energyState = '';
  // auraColor = '';


  // ==============================
  // 🏆 ACHIEVEMENTS
  // ==============================
  achievements: any = {};
  achievementList: any[] = [];


  // ==============================
  // 🎮 DAILY QUESTS
  // ==============================
  dailyQuests: any[] = [];
  hasClaimedBonus = false;


  // ==============================
  // 📅 CALENDAR
  // ==============================
  calendarDays: any[] = [];

  // 1. LIFECYCLE

  ngOnInit() {

    if (!this.authService.isLoggedIn()) {
      alert(this.langService.getTranslate('login_required_alert'));
      this.router.navigate(['/dashboard']);
      return;
    }

    this.zone.run(() => {
      this.loadData();
      this.generateDailyQuests();
      this.checkDailyReset();
    });
  }

  ngOnDestroy() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }


  // 2. DATA LAYER (CRITICAL)
  async loadData() {
    const user = await this.authService.getCurrentUserAsync();
    if (!user) return;

    const profile = await this.authService.getUserProfile();
    let storedMaxStreak = profile?.['maxStreak'] || 0;

    this.unsubscribe = this.authService.getMyJapaRealtime(async (res: any[]) => {

      this.zone.run(async () => {
        console.log("🔥 Raw Firebase Data:", res);

        if (!res || res.length === 0) {
          this.data = [];
          this.totalMala = 0;
          this.totalCount = 0;
          this.currentStreak = 0;
          this.longestStreak = storedMaxStreak;
          this.cdr.detectChanges();
          return;
        }

        this.data = [...res].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        const sorted = [...res].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        let currentStreak = 0;
        let calculatedMax = 0;
        let lastDate: Date | null = null;

        sorted.forEach((d) => {
          if (Number(d.mala) > 0) {
            const dDate = new Date(d.date);
            dDate.setHours(0, 0, 0, 0);
            if (!lastDate) {
              currentStreak = 1;
            } else {
              const diffDays = Math.round((dDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
              if (diffDays === 1) currentStreak++;
              else if (diffDays > 1) currentStreak = 1;
            }
            if (currentStreak > calculatedMax) calculatedMax = currentStreak;
            lastDate = new Date(dDate);
          }
        });

        this.currentStreak = currentStreak;
        this.longestStreak = Math.max(calculatedMax, storedMaxStreak);
        if (calculatedMax > storedMaxStreak) {
          await this.authService.updateUser({ maxStreak: calculatedMax });
        }

        this.totalMala = res.reduce((sum, r) => sum + (Number(r.mala) || 0), 0);
        this.totalCount = res.reduce((sum, r) => {
          const mala = Number(r.mala) || 0;
          const target = Number(r.target) || 108;
          return sum + (Number(r.totalJapa) || (mala * target));
        }, 0);


        this.focusGraphData = res.map(item => ({
          date: item.date,
          score: Math.min(((Number(item.mala) || 0) / (Number(item.target) || 1)) * 100, 100)
        }));

        this.calculateFocusScore();
        await this.loadAchievements();
        await this.checkAchievements();
        this.updateCalendarView();
        this.updateEnergyMeter(res);
        this.nextTarget = this.calculateNextTarget(this.totalMala);
        this.calculatePrediction();
        this.generateTimeAnalysis();
        this.cdr.detectChanges();
      });
    });
  }

  updateEnergyMeter(res: any[]) {

    if (!res || res.length === 0) {
      this.vibrationalFreq = 0;
      return;
    }

    // 🔥 last entry (latest)
    const last = res[res.length - 1];

    const mala = Number(last.mala || 0);

    this.vibrationalFreq = Math.min(mala * 10, 100);
  }

  calculateFocusScore() {

    const streakScore = Math.min(this.currentStreak * 10, 50);
    const activityScore = Math.min(this.totalMala / 40, 50);

    this.focusScore = Math.round(streakScore + activityScore);
    if (this.focusScore >= 80) {
      this.focusGrade = this.langService.getTranslate('grade_excellent');
      this.focusTip = this.langService.getTranslate('tip_excellent');
    } else if (this.focusScore >= 40) {
      this.focusGrade = this.langService.getTranslate('grade_good');
      this.focusTip = this.langService.getTranslate('tip_good');
    } else {
      this.focusGrade = this.langService.getTranslate('grade_need_focus');
      this.focusTip = this.langService.getTranslate('tip_need_focus');
    }
  }

  calculatePrediction() {

    // 🔥 safety
    if (!this.data || this.data.length === 0) {
      this.daysToReach = 0;
      return;
    }

    // १. target update
    if (this.totalMala >= this.nextTarget) {
      this.nextTarget = this.calculateNextTarget(this.totalMala);
    }

    const remainingMala = Math.max(0, this.nextTarget - this.totalMala);

    // 🔥 ONLY active days count कर
    const activeDays = this.data.filter(d => Number(d.mala) > 0).length;

    // 🔥 correct average
    const avgMalaPerDay = activeDays > 0
      ? this.totalMala / activeDays
      : 1;

    // 🔥 main formula
    let days = Math.ceil(remainingMala / avgMalaPerDay);

    // 🔥 fix zero case
    if (remainingMala === 0) {
      days = 0;
    } else if (days <= 0) {
      days = 1;
    }

    this.daysToReach = days;

    this.cdr.detectChanges();
  }

  calculateNextTarget(totalMala: number): number {

    const milestones = this.generateMilestones();

    const next = milestones.find(m => m > totalMala);

    if (next) return next;

    // 🔥 fallback (beyond limit)
    const magnitude = Math.pow(10, Math.floor(Math.log10(totalMala)));
    return Math.ceil(totalMala / magnitude) * magnitude;
  }


  generateMilestones(limit: number = 10000000): number[] {
    const steps = [1, 2, 5];  // 🔥 industry pattern
    const milestones: number[] = [];

    let base = 100;  // starting point

    while (base <= limit) {
      for (const step of steps) {
        const value = step * base;

        if (value > limit) break;

        milestones.push(value);
      }

      base *= 10; // next magnitude (100 → 1000 → 10000)
    }

    return milestones;
  }

  generateTimeAnalysis() {

    const hourlyCounts = new Array(24).fill(0);

    this.data.forEach(log => {

      const dateObj = new Date(log.date);

      // 🔥 fallback safe
      const hour = isNaN(dateObj.getTime())
        ? 0
        : dateObj.getHours();

      hourlyCounts[hour] += Number(log.mala) || 0;
    });

    this.clockData = hourlyCounts.map((count, hour) => ({
      hour,
      count
    }));

    const maxMala = Math.max(...hourlyCounts);

    if (maxMala === 0) {
      this.peakHour = '';
    } else {
      const peakIndex = hourlyCounts.indexOf(maxMala);
      this.peakHour = this.formatHour(peakIndex);
    }
  }


  // 4. ACHIEVEMENTS SYSTEM

  getAchievementConfig() {
    const getLabel = (value: any, unitKey: string, emoji: string) => {
      const unit = this.langService.getTranslate(unitKey);
      return `${emoji} ${value} ${unit}`;
    };

    return [
      // ================= 🌱 STREAK  =================
      { key: 'streak_1', label: getLabel(1, 'unit_day', '🌱'), type: 'streak', value: 1 },
      { key: 'streak_2', label: getLabel(2, 'unit_day', '🌱'), type: 'streak', value: 2 },
      { key: 'streak_3', label: getLabel(3, 'unit_day', '🔥'), type: 'streak', value: 3 },
      { key: 'streak_5', label: getLabel(5, 'unit_day', '🔥'), type: 'streak', value: 5 },
      { key: 'streak_7', label: getLabel(7, 'unit_day', '🔥'), type: 'streak', value: 7 },
      { key: 'streak_10', label: getLabel(10, 'unit_day', '🔥'), type: 'streak', value: 10 },
      { key: 'streak_15', label: getLabel(15, 'unit_day', '🔥'), type: 'streak', value: 15 },
      { key: 'streak_21', label: getLabel(21, 'unit_day', '🧠'), type: 'streak', value: 21 },
      { key: 'streak_30', label: getLabel(30, 'unit_day', '🏆'), type: 'streak', value: 30 },
      { key: 'streak_45', label: getLabel(45, 'unit_day', '🏅'), type: 'streak', value: 45 },
      { key: 'streak_60', label: getLabel(60, 'unit_day', '🏅'), type: 'streak', value: 60 },
      { key: 'streak_90', label: getLabel(90, 'unit_day', '🔥'), type: 'streak', value: 90 },
      { key: 'streak_100', label: getLabel(100, 'unit_day', '👑'), type: 'streak', value: 100 },
      { key: 'streak_150', label: getLabel(150, 'unit_day', '🌟'), type: 'streak', value: 150 },
      { key: 'streak_200', label: getLabel(200, 'unit_day', '🌟'), type: 'streak', value: 200 },
      { key: 'streak_300', label: getLabel(300, 'unit_day', '🔱'), type: 'streak', value: 300 },
      { key: 'streak_365', label: getLabel(1, 'unit_year', '🧘'), type: 'streak', value: 365 },
      { key: 'streak_500', label: getLabel(500, 'unit_day', '🔱'), type: 'streak', value: 500 },
      { key: 'streak_730', label: getLabel(2, 'unit_year', '🔥'), type: 'streak', value: 730 },
      { key: 'streak_1000', label: getLabel(1000, 'unit_day', '🕉️'), type: 'streak', value: 1000 },
      { key: 'streak_1460', label: getLabel(4, 'unit_year', '🌌'), type: 'streak', value: 1460 },
      { key: 'streak_1825', label: getLabel(5, 'unit_year', '✨'), type: 'streak', value: 1825 },

      // ================= 📿 MALA (माळ) =================
      { key: 'mala_10', label: getLabel(10, 'unit_mala', '📿'), type: 'mala', value: 10 },
      { key: 'mala_20', label: getLabel(20, 'unit_mala', '📿'), type: 'mala', value: 20 },
      { key: 'mala_30', label: getLabel(30, 'unit_mala', '📿'), type: 'mala', value: 30 },
      { key: 'mala_50', label: getLabel(50, 'unit_mala', '📿'), type: 'mala', value: 50 },
      { key: 'mala_75', label: getLabel(75, 'unit_mala', '📿'), type: 'mala', value: 75 },
      { key: 'mala_100', label: getLabel(100, 'unit_mala', '📿'), type: 'mala', value: 100 },
      { key: 'mala_150', label: getLabel(150, 'unit_mala', '📿'), type: 'mala', value: 150 },
      { key: 'mala_250', label: getLabel(250, 'unit_mala', '📿'), type: 'mala', value: 250 },
      { key: 'mala_500', label: getLabel(500, 'unit_mala', '📿'), type: 'mala', value: 500 },
      { key: 'mala_750', label: getLabel(750, 'unit_mala', '📿'), type: 'mala', value: 750 },
      { key: 'mala_1000', label: getLabel('1K', 'unit_mala', '📿'), type: 'mala', value: 1000 },
      { key: 'mala_2500', label: getLabel('2.5K', 'unit_mala', '📿'), type: 'mala', value: 2500 },
      { key: 'mala_5000', label: getLabel('5K', 'unit_mala', '📿'), type: 'mala', value: 5000 },
      { key: 'mala_10000', label: getLabel('10K', 'unit_mala', '📿'), type: 'mala', value: 10000 },
      { key: 'mala_25000', label: getLabel('25K', 'unit_mala', '📿'), type: 'mala', value: 25000 },
      { key: 'mala_50000', label: getLabel('50K', 'unit_mala', '📿'), type: 'mala', value: 50000 },
      { key: 'mala_100000', label: getLabel('100K', 'unit_mala', '📿'), type: 'mala', value: 100000 },
      { key: 'mala_250000', label: getLabel('250K', 'unit_mala', '📿'), type: 'mala', value: 250000 },
      { key: 'mala_500000', label: getLabel('500K', 'unit_mala', '📿'), type: 'mala', value: 500000 },
      { key: 'mala_1000000', label: getLabel('1M', 'unit_mala', '📿'), type: 'mala', value: 1000000 },
      { key: 'mala_10000000', label: getLabel('10M', 'unit_mala', '📿'), type: 'mala', value: 10000000 },
      { key: 'mala_100000000', label: getLabel('100M', 'unit_mala', '📿'), type: 'mala', value: 100000000 },

      // ================= 🔢 JAPA (जप) =================
      { key: 'count_1000', label: getLabel('1K', 'unit_japa', '🔢'), type: 'count', value: 1000 },
      { key: 'count_2000', label: getLabel('2K', 'unit_japa', '🔢'), type: 'count', value: 2000 },
      { key: 'count_5000', label: getLabel('5K', 'unit_japa', '🔢'), type: 'count', value: 5000 },
      { key: 'count_10000', label: getLabel('10K', 'unit_japa', '🔢'), type: 'count', value: 10000 },
      { key: 'count_20000', label: getLabel('20K', 'unit_japa', '🔢'), type: 'count', value: 20000 },
      { key: 'count_50000', label: getLabel('50K', 'unit_japa', '🔢'), type: 'count', value: 50000 },
      { key: 'count_100000', label: getLabel('100K', 'unit_japa', '🔢'), type: 'count', value: 100000 },
      { key: 'count_200000', label: getLabel('200K', 'unit_japa', '🔢'), type: 'count', value: 200000 },
      { key: 'count_500000', label: getLabel('500K', 'unit_japa', '🔢'), type: 'count', value: 500000 },
      { key: 'count_1000000', label: getLabel('1M', 'unit_japa', '🔢'), type: 'count', value: 1000000 },
      { key: 'count_2000000', label: getLabel('2M', 'unit_japa', '🔢'), type: 'count', value: 2000000 },
      { key: 'count_5000000', label: getLabel('5M', 'unit_japa', '🔢'), type: 'count', value: 5000000 },
      { key: 'count_10000000', label: getLabel('10M', 'unit_japa', '🔢'), type: 'count', value: 10000000 },
      { key: 'count_50000000', label: getLabel('50M', 'unit_japa', '🔢'), type: 'count', value: 50000000 },
      { key: 'count_100000000', label: getLabel('100M', 'unit_japa', '🔢'), type: 'count', value: 100000000 },
      { key: 'count_200000000', label: getLabel('200M', 'unit_japa', '🔢'), type: 'count', value: 200000000 },
      { key: 'count_500000000', label: getLabel('500M', 'unit_japa', '🔢'), type: 'count', value: 500000000 },
      { key: 'count_600000000', label: getLabel('600M', 'unit_japa', '🔢'), type: 'count', value: 600000000 },
      { key: 'count_700000000', label: getLabel('700M', 'unit_japa', '🔢'), type: 'count', value: 700000000 },
      { key: 'count_800000000', label: getLabel('800M', 'unit_japa', '🔢'), type: 'count', value: 800000000 },
      { key: 'count_900000000', label: getLabel('900M', 'unit_japa', '🔢'), type: 'count', value: 900000000 },

      // ================= 🌌 BILLIONS =================
      { key: 'count_1000000000', label: getLabel('1B', 'unit_japa', '🌌'), type: 'count', value: 1000000000 },
      { key: 'count_2000000000', label: getLabel('2B', 'unit_japa', '🌌'), type: 'count', value: 2000000000 },
      { key: 'count_3000000000', label: getLabel('3B', 'unit_japa', '🌌'), type: 'count', value: 3000000000 },
      { key: 'count_4000000000', label: getLabel('4B', 'unit_japa', '🌌'), type: 'count', value: 4000000000 },
      { key: 'count_5000000000', label: getLabel('5B', 'unit_japa', '🌌'), type: 'count', value: 5000000000 },
      { key: 'count_6000000000', label: getLabel('6B', 'unit_japa', '🌌'), type: 'count', value: 6000000000 },
      { key: 'count_7000000000', label: getLabel('7B', 'unit_japa', '🌌'), type: 'count', value: 7000000000 },
      { key: 'count_8000000000', label: getLabel('8B', 'unit_japa', '🌌'), type: 'count', value: 8000000000 },
    ];
  }

  async loadAchievements() {
    this.achievements = await this.authService.getAchievements() || {};
  }

  async checkAchievements() {

    const config = this.getAchievementConfig();
    let changed = false;

    config.forEach(a => {

      if (this.achievements[a.key]) return;

      let unlocked = false;

      if (a.type === 'count' && this.totalCount >= a.value) unlocked = true;
      if (a.type === 'mala' && this.totalMala >= a.value) unlocked = true;
      if (a.type === 'streak' && this.currentStreak >= a.value) unlocked = true;

      if (unlocked) {
        this.achievements[a.key] = true;
        changed = true;

        // 🎉 CONFETTI + ALERT (FIRST TIME ONLY)
        this.launchConfetti();
        setTimeout(() => {
          const msg = this.langService.getTranslate('achievement_unlock_msg').replace('{label}', a.label);
          alert(msg);
        }, 200);
      }
    });

    if (changed) {
      await this.authService.saveAchievements(this.achievements);
    }

    this.prepareAchievementList();
  }

  prepareAchievementList() {
    const config = this.getAchievementConfig();

    const list = config.map(a => ({
      ...a,
      unlocked: !!this.achievements[a.key]
    }));

    // 🔥 unlocked first → locked बाद
    this.achievementList = list.sort((a, b) => {
      return Number(b.unlocked) - Number(a.unlocked);
    });
  }

  launchConfetti() {
    const duration = 1500;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 6,
        spread: 70,
        origin: { y: 0.6 }
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };

    frame();
  }



  //5. DAILY QUESTS

  generateDailyQuests() {
    this.dailyQuests = [
      { task: this.langService.getTranslate('quest_1'), completed: false, claimed: false, reward: 20 },
      { task: this.langService.getTranslate('quest_2'), completed: false, claimed: false, reward: 30 },
      { task: this.langService.getTranslate('quest_3'), completed: false, claimed: false, reward: 25 },
      { task: this.langService.getTranslate('quest_4'), completed: false, claimed: false, reward: 15 },
      { task: this.langService.getTranslate('quest_5'), completed: false, claimed: false, reward: 10 }
    ];
  }

  claimDailyBonus() {
    this.hasClaimedBonus = true;

    localStorage.setItem('claimedToday', 'true');

    const totalEarned = this.dailyQuests
      .filter(q => q.completed)
      .reduce((sum, q) => sum + (q.reward || 0), 0);

    this.launchConfetti();

    const alertMsg = this.langService.getTranslate('bonus_claimed_alert')
      .replace('{points}', totalEarned.toString());
    alert(alertMsg);
  }

  checkDailyReset() {
    const today = new Date().toDateString();
    const savedDate = localStorage.getItem('questDate');

    if (savedDate !== today) {
      localStorage.setItem('questDate', today);
      localStorage.removeItem('claimedToday');
    }

    this.hasClaimedBonus = localStorage.getItem('claimedToday') === 'true';
  }



  // 6. CALENDAR SYSTEM

  updateCalendarView() {

    const monthsData = [];

    // 🔥 fast lookup
    const dataMap = new Map<string, number>();

    this.data.forEach(item => {
      const key = this.formatLocalDate(new Date(item.date));
      dataMap.set(key, Number(item.mala) || 0);
    });

    // 🔥 today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = this.formatLocalDate(new Date());

    // 3 months
    for (let m = this.currentMonth - 1; m <= this.currentMonth + 1; m++) {

      const d = new Date(this.currentYear, m, 1);
      const monthName = d.toLocaleString('default', { month: 'short' });

      const daysInMonth = new Date(
        d.getFullYear(),
        d.getMonth() + 1,
        0
      ).getDate();

      const days = [];

      for (let i = 1; i <= daysInMonth; i++) {

        const dateObj = new Date(d.getFullYear(), d.getMonth(), i);
        const dateStr = this.formatLocalDate(dateObj);

        const count = dataMap.get(dateStr) || 0;

        // 🎯 level
        let level = 0;
        if (count >= 1 && count <= 2) level = 1;
        else if (count >= 3 && count <= 5) level = 2;
        else if (count >= 6) level = 3;

        days.push({
          date: dateStr,
          count: count,
          level: level,
          isToday: dateStr === todayStr   // 🔥 highlight
        });
      }

      monthsData.push({
        name: monthName,
        days: days
      });
    }

    this.calendarDays = monthsData;
    this.cdr.detectChanges();
  }

  handleYearChange(offset: number) {
    this.currentYear += offset;
    this.updateCalendarView();
  }

  handleMonthChange(direction: 'left' | 'right') {

    if (direction === 'left') {
      this.currentMonth--;
    } else {
      this.currentMonth++;
    }

    // 🔥 year adjust
    if (this.currentMonth < 0) {
      this.currentMonth = 11;
      this.currentYear--;
    }

    if (this.currentMonth > 11) {
      this.currentMonth = 0;
      this.currentYear++;
    }

    this.updateCalendarView();
  }

  formatLocalDate(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  generateGroupedMonths() {
    const monthsData: any[] = [];
    const today = new Date();
    // ... तुमचा कोड ...
    this.calendarDays = monthsData;
  }




  selectYear(year: number) {
    this.currentYear = year;
    this.updateCalendarView();
  }




  // 7. UI HELPERS

  getCurrentLevelName(): string {
    if (this.totalMala < 100) return this.langService.getTranslate('level_beginner');
    if (this.totalMala < 500) return this.langService.getTranslate('level_intermediate');
    return this.langService.getTranslate('level_advanced');
  }

  formatHour(hour: number): string {
    const suffix = hour >= 12 ? 'PM' : 'AM';
    const h = hour % 12 || 12;
    return `${h} ${suffix}`;
  }

  groupByWeek(data: any[]) {
    const weeks: any[] = [];
    let week: any[] = [];

    data.forEach((d) => {
      week.push({
        date: d.date,
        count: d.mala || 0
      });

      if (week.length === 7) {
        weeks.push(week);
        week = [];
      }
    });

    if (week.length) weeks.push(week);

    return weeks;
  }

  // 8. USER ACTIONS
  async handleDelete(item: any) {
    if (!confirm(this.langService.getTranslate('delete_confirm'))) return;

    try {
      await this.authService.deleteJapa(item.id);
    } catch (error) {
      alert(this.langService.getTranslate('delete_fail'));
    }
  }

  goToDashboard() {
    this.router.navigate(['/dashboard']);
  }

  toggleTheme() {
    document.body.classList.toggle('light-mode');
  }








  async downloadPDF() {
    this.isDownloadingPDF = true;
    this.cdr.detectChanges();

    try {
      // 1. Initialize jsPDF in A4 portrait mode
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      // Page dimensions
      const pageWidth = pdf.internal.pageSize.width; // 210
      const pageHeight = pdf.internal.pageSize.height; // 297
      const margin = 15;
      
      // Load user profile details
      const user = await this.authService.getCurrentUserAsync();
      const userName = user?.name || user?.email?.split('@')[0] || 'Meditator';
      const userEmail = user?.email || 'N/A';
      const joinedDate = user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A';
      
      // 2. Draw Decorative Header
      const currentTheme = this.themeService.getCurrentTheme();
      let primaryColor = [234, 88, 12]; // Default Warm Orange/Gold (#ea580c)
      let secondaryColor = [194, 65, 12];
      
      if (currentTheme === 'dark-gold') {
        primaryColor = [250, 204, 21]; // Gold (#facc15)
        secondaryColor = [245, 158, 11];
      } else if (currentTheme === 'deep-ocean') {
        primaryColor = [59, 130, 246]; // Ocean Blue (#3b82f6)
        secondaryColor = [37, 99, 235];
      }
      
      // Top elegant accent line
      pdf.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      pdf.rect(0, 0, pageWidth, 6, 'F');
      
      // Title Block
      pdf.setTextColor(30, 41, 59); // Dark slate
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(22);
      pdf.text('JAPA TRACKER', margin, 20);
      
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      pdf.setTextColor(100, 116, 139);
      pdf.text('MIND-BODY MEDITATION PROGRESS REPORT', margin, 25);
      
      // Right-aligned report label/date
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(9);
      pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      pdf.text('OFFICIAL RECORD', pageWidth - margin - 35, 18);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(100, 116, 139);
      pdf.text('Generated: ' + new Date().toLocaleDateString(), pageWidth - margin - 35, 23);
      
      // Divider line
      pdf.setDrawColor(226, 232, 240); // Slate-200
      pdf.setLineWidth(0.5);
      pdf.line(margin, 28, pageWidth - margin, 28);
      
      // 3. User Details Card Section
      pdf.setFillColor(248, 250, 252); // Very light slate-50
      pdf.setDrawColor(226, 232, 240);
      pdf.roundedRect(margin, 32, pageWidth - (margin * 2), 26, 3, 3, 'FD');
      
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(10);
      pdf.setTextColor(71, 85, 105);
      pdf.text('PRACTITIONER PROFILE', margin + 5, 38);
      
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      pdf.setTextColor(100, 116, 139);
      pdf.text('Name:', margin + 5, 45);
      pdf.text('Email:', margin + 5, 51);
      
      pdf.setTextColor(30, 41, 59);
      pdf.setFont('helvetica', 'bold');
      pdf.text(userName, margin + 20, 45);
      pdf.text(userEmail, margin + 20, 51);
      
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(100, 116, 139);
      pdf.text('Joined Date:', margin + 110, 45);
      pdf.text('Meditation Level:', margin + 110, 51);
      
      pdf.setTextColor(30, 41, 59);
      pdf.setFont('helvetica', 'bold');
      pdf.text(joinedDate, margin + 138, 45);
      pdf.text(this.getCurrentLevelName(), margin + 138, 51);
      
      // 4. Statistics Overview Section
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(10);
      pdf.setTextColor(71, 85, 105);
      pdf.text('MEDITATION LIFETIME METRICS', margin, 66);
      
      // Render 4 metric boxes side-by-side
      const cardWidth = (pageWidth - (margin * 2) - 9) / 4; // Width of each stats box
      const cardHeight = 18;
      const cardY = 70;
      
      const stats = [
        { label: 'Total Malas', value: this.totalMala.toString(), icon: '📿' },
        { label: 'Total Japa', value: this.totalCount.toLocaleString(), icon: '🔢' },
        { label: 'Current Streak', value: this.currentStreak.toString() + ' Days', icon: '🔥' },
        { label: 'Focus Score', value: this.focusScore.toString() + '%', icon: '🧠' }
      ];
      
      stats.forEach((stat, i) => {
        const cardX = margin + i * (cardWidth + 3);
        
        // Background card
        pdf.setFillColor(248, 250, 252);
        pdf.setDrawColor(226, 232, 240);
        pdf.roundedRect(cardX, cardY, cardWidth, cardHeight, 2, 2, 'FD');
        
        // Left color accent bar for card
        pdf.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        pdf.rect(cardX, cardY, 1.5, cardHeight, 'F');
        
        // Icon & Label
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(7.5);
        pdf.setTextColor(100, 116, 139);
        pdf.text(stat.icon + ' ' + stat.label.toUpperCase(), cardX + 4, cardY + 5.5);
        
        // Value
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(11);
        pdf.setTextColor(30, 41, 59);
        pdf.text(stat.value, cardX + 4, cardY + 13);
      });
      
      // 5. Meditation Logs Table using jspdf-autotable
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(10);
      pdf.setTextColor(71, 85, 105);
      pdf.text('DETAILED MEDITATION JOURNAL LOGS', margin, 96);
      
      // Create rows
      const tableRows = this.data.map((item, index) => {
        const itemDate = new Date(item.date);
        const formattedDate = itemDate.toLocaleDateString() + ' ' + itemDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const malaCount = Number(item.mala) || 0;
        const target = Number(item.target) || 108;
        const totalJapa = malaCount * target;
        
        return [
          (index + 1).toString(),
          formattedDate,
          malaCount.toString(),
          target.toString(),
          totalJapa.toLocaleString()
        ];
      });
      
      // Generate Table
      (pdf as any).autoTable({
        head: [['#', 'Date & Time', 'Malas Counted', 'Target count', 'Total Japa']],
        body: tableRows,
        startY: 100,
        margin: { left: margin, right: margin },
        theme: 'striped',
        headStyles: {
          fillColor: [primaryColor[0], primaryColor[1], primaryColor[2]],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 9,
          halign: 'left',
          valign: 'middle'
        },
        bodyStyles: {
          fontSize: 8.5,
          textColor: [51, 65, 85]
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252]
        },
        columnStyles: {
          0: { width: 10 },
          1: { cellWidth: 'auto' },
          2: { cellWidth: 35, halign: 'right' },
          3: { cellWidth: 35, halign: 'right' },
          4: { cellWidth: 40, halign: 'right' }
        },
        didDrawPage: (data: any) => {
          // Bottom border banner
          pdf.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
          pdf.rect(0, pageHeight - 3, pageWidth, 3, 'F');
          
          // Footer text
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(7.5);
          pdf.setTextColor(148, 163, 184);
          
          const footerText = 'JapaTracker Journal - Maintain your focus, elevate your vibration.';
          pdf.text(footerText, margin, pageHeight - 6);
          pdf.text('Page ' + data.pageNumber, pageWidth - margin - 15, pageHeight - 6);
        }
      });
      
      // Save PDF
      pdf.save(`JapaTracker_Report_${new Date().getTime()}.pdf`);
      
    } catch (error) {
      console.error("PDF generation failed:", error);
      alert("Error generating report. Please try again.");
    } finally {
      this.isDownloadingPDF = false;
      this.cdr.detectChanges();
    }
  }

  async shareStats() {
    const shareText = `📿 *माझा जपा प्रोग्रेस रिपोर्ट* \n\n✨ एकूण माळ: ${this.totalMala}\n🔥 स्ट्रीक: ${this.currentStreak} दिवस\n🎯 पुढील लक्ष्य: ${this.nextTarget}\n\n🙏 'जपा ट्रॅकर' सोबत तुमची साधना सुरू करा!`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'माझा जपा रिपोर्ट',
          text: shareText,
          url: window.location.href
        });
      } catch (err) {
        console.log('Sharing failed', err);
      }
    } else {
      // लॅपटॉपवर असल्यास क्लिपबोर्डवर कॉपी होईल
      await navigator.clipboard.writeText(shareText);
      alert("रिपोर्ट कॉपी केला आहे! तुम्ही व्हॉट्सअ‍ॅपवर पेस्ट करू शकता.");
    }
  }

  printPage() {
    // प्रिंट करण्यापूर्वी थोडा वेळ द्या जेणेकरून सर्व ग्राफ्स लोड होतील
    window.print();
  }

}