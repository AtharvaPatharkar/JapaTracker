import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  OnInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth'; 
import { TranslatePipe } from '../../../pipes/translate-pipe';

type Quest = {
  task: string;      // येथे 'quest_1', 'quest_2' अशा कीज येतील
  completed: boolean;
  claimed?: boolean;
  reward?: number;
};

@Component({
  selector: 'app-daily-quests',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './daily-quests.html',
  styleUrls: ['./daily-quests.css']
})
export class DailyQuests implements OnChanges, OnInit {

  @Input() dailyQuests: Quest[] = [];
  @Output() claim = new EventEmitter<void>();

  completedCount = 0;
  totalRewards = 0;
  allCompleted = false;
  todayTotal = 0;
  allTimeTotal = 0;

  constructor(private auth: AuthService) {}
  
  async ngOnInit() {
    await this.loadFromFirebase();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['dailyQuests']) {
      this.recalculate();
    }
  }

  async loadFromFirebase() {
    const data = await this.auth.getDailyQuests();

if (data && data['quests']) {

    this.dailyQuests = data['quests'].map((q: any) => {
      let taskKey = q.task;

      if (q.task.includes('Complete 10 Mala')) taskKey = 'quest_1';
      else if (q.task.includes('Meditate')) taskKey = 'quest_2';
      else if (q.task.includes('Read 10 pages')) taskKey = 'quest_3';
      else if (q.task.includes('Wake up early')) taskKey = 'quest_4';
      else if (q.task.includes('Chanting')) taskKey = 'quest_5';

      return { ...q, task: taskKey };
    });
    
    this.todayTotal = data['todayTotal'] || 0;
    } else {
      this.dailyQuests = [
        { task: 'quest_1', completed: false, reward: 20 },
        { task: 'quest_2', completed: false, reward: 30 },
        { task: 'quest_3', completed: false, reward: 25 },
        { task: 'quest_4', completed: false, reward: 15 },
        { task: 'quest_5', completed: false, reward: 10 }
      ];
    }

    const user = this.auth.getCurrentUser();
    if (user) {
      const key = `allPoints_${user.uid}`;
      this.allTimeTotal = Number(localStorage.getItem(key) || 0);
    }

    this.recalculate();
  }

  toggleQuest(index: number) {
    const q = this.dailyQuests[index];
    if (!q || q.claimed) return;

    q.completed = !q.completed;

    if (q.completed) {
      this.playClickSound();
    }

    this.saveToFirebase();
    this.recalculate();
  }

  playClickSound() {
    const audio = new Audio('https://actions.google.com/sounds/v1/ui/click.ogg');
    audio.play();
  }

  recalculate() {
    this.completedCount = this.dailyQuests.filter(q => q.completed).length;

    this.totalRewards = this.dailyQuests
      .filter(q => q.completed && !q.claimed)
      .reduce((sum, q) => sum + (q.reward || 10), 0);

    this.allCompleted = this.dailyQuests.length > 0 && this.dailyQuests.every(q => q.claimed);
  }

  async onClaim() {
    if (this.totalRewards === 0) return;

    let earned = 0;
    this.dailyQuests.forEach(q => {
      if (q.completed && !q.claimed) {
        q.claimed = true;
        earned += (q.reward || 10);
      }
    });

    this.todayTotal += earned;

    await this.saveToFirebase();

    const user = this.auth.getCurrentUser();
    if (user) {
      const key = `allPoints_${user.uid}`;
      this.allTimeTotal += earned;
      localStorage.setItem(key, this.allTimeTotal.toString());
    }

    this.recalculate();
    this.claim.emit();
  }

  async saveToFirebase() {
    await this.auth.saveDailyQuests({
      quests: this.dailyQuests,
      todayTotal: this.todayTotal
    });
  }

  getProgress(): number {
    if (!this.dailyQuests.length) return 0;
    return Math.round((this.completedCount / this.dailyQuests.length) * 100);
  }
}