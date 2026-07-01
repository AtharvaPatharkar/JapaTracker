import { Component, Input, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '../../../pipes/translate-pipe';
import { LanguageService } from '../../../services/language';

interface ChatMessage {
  type: 'ai' | 'user';
  text: string;
  isTranslated?: boolean;
}

@Component({
  selector: 'app-ai-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './ai-chat.html',
  styleUrls: ['./ai-chat.css']
})
export class AiChat implements OnInit {
  @Input() totalMala: number = 0;
  @Input() currentStreak: number = 0;
  @Input() focusScore: number = 0;
  @Input() totalCount: number = 0;
  @Input() daysToReach: number = 0;
  @Input() peakHour: string = '';
  @Input() vibrationalFreq: number = 0;
  @Input() data: any[] = []; // 📊 Real japa logs passed dynamically

  messages: ChatMessage[] = [];
  userInput: string = '';
  suggestedQuestions: string[] = ['स्ट्रिक', 'लक्ष्य', 'सरासरी', 'लेव्हल', 'मन विचलित'];
  voiceEnabled: boolean = true;
  voiceType: 'male' | 'female' = 'female';
  aiAutoMode: boolean = true;
  showInputBox: boolean = true;
  currentQType: string = 'text';

  constructor(private cdr: ChangeDetectorRef, public langService: LanguageService) { }

  // 🧮 Compute actual best day statistics dynamically from real-time database logs
  getBestDay(): { day: string, val: number } {
    if (!this.data || this.data.length === 0) {
      return { day: 'N/A', val: 0 };
    }
    let maxMala = 0;
    let bestDate: Date | null = null;
    
    this.data.forEach(item => {
      const m = Number(item.mala) || 0;
      if (m > maxMala) {
        maxMala = m;
        bestDate = new Date(item.date);
      }
    });

    if (bestDate) {
      const lang = this.langService.getCurrentLang();
      const dayName = (bestDate as Date).toLocaleDateString(
        lang === 'mr' ? 'mr-IN' : 'en-US',
        { weekday: 'long' }
      );
      return { day: dayName, val: maxMala };
    }
    return { day: 'N/A', val: 0 };
  }

  // 🧮 Compute actual daily average mala count dynamically
  getAverage(): string {
    const activeLogs = this.data.filter(d => (Number(d.mala) || 0) > 0);
    if (activeLogs.length === 0) return '0';
    const sum = activeLogs.reduce((acc, curr) => acc + (Number(curr.mala) || 0), 0);
    return (sum / activeLogs.length).toFixed(1);
  }

  // 🧮 Compute actual target from the latest meditation log dynamically
  getLatestTarget(): number {
    if (this.data && this.data.length > 0) {
      const latest = this.data[0];
      return Number(latest.target) || 108;
    }
    return 108;
  }

  ngOnInit() {
    const welcome = this.langService.getTranslate('ai_welcome');
    this.messages.push({ type: 'ai', text: welcome, isTranslated: true });
  }

  // CORE CHAT LOGIC
  askAI(query: string) {
    this.messages.push({ type: 'user', text: query });
    this.messages.push({ type: 'ai', text: 'ai_typing', isTranslated: true });

    setTimeout(() => {
      const response = this.generateResponse(query);
      const i = this.messages.findIndex(m => m.text === 'ai_typing');
      if (i !== -1) {
        this.messages[i] = { type: 'ai', text: response, isTranslated: false };
        this.speak(response);
      }
      this.cdr.detectChanges();
    }, 1000);
  }

  sendMessage() {
    if (!this.userInput.trim()) return;
    this.askAI(this.userInput);
    this.userInput = '';
  }

  quickAnswer(val: string) {
    this.userInput = val;
    this.sendMessage();
  }

  // RESPONSE GENERATOR
  generateResponse(query: string): string {
    const q = query.toLowerCase().trim();
    const lang = this.langService.getCurrentLang();

    if (q.includes('स्ट्रिक') || q.includes('streak')) {
      return this.langService.getTranslate('resp_streak').replace('{val}', this.currentStreak.toString());
    }

    if (q === 'ध्येय' || q === 'goal' || q === 'target' || q === '🎯 ध्येय') {
      const targetVal = this.getLatestTarget();
      return this.langService.getTranslate('resp_target').replace('{val}', targetVal.toString());
    }

    if (q.includes('लेव्हल') || q.includes('level')) {
      let levelKey = this.totalMala >= 500 ? 'level_advanced' : (this.totalMala >= 100 ? 'level_intermediate' : 'level_beginner');
      const levelName = this.langService.getTranslate(levelKey);
      return lang === 'mr' ? `तुमची सध्याची लेव्हल ${levelName} आहे.` : `Your current level is ${levelName}.`;
    }

    if (q.includes('सरासरी') || q.includes('average')) {
      const avg = this.getAverage();
      return lang === 'mr' ? `तुमची सरासरी दररोज ${avg} माळ आहे.` : `Your average is ${avg} malas per day.`;
    }

    if (q.includes('सर्वोत्तम') || q.includes('best day')) {
      const best = this.getBestDay();
      if (best.val === 0) {
        return lang === 'mr' ? 'अद्याप कोणतीही सर्वोत्तम माळ मोजली नाही.' : 'No best day recorded yet.';
      }
      return this.langService.getTranslate('resp_best_day').replace('{day}', best.day).replace('{val}', best.val.toString());
    }

    if (q.includes('एकूण') || q.includes('total count')) {
      return this.langService.getTranslate('resp_total_japa').replace('{val}', this.totalCount.toLocaleString());
    }

    if (q.includes('कधी') || q.includes('prediction')) {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + (this.daysToReach || 0));
      const dateStr = targetDate.toLocaleDateString(lang === 'mr' ? 'mr-IN' : 'en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
      return this.langService.getTranslate('resp_prediction').replace('{date}', dateStr);
    }

    if (q.includes('ऊर्जा') || q.includes('vibration') || q.includes('कंपन')) {
      return this.langService.getTranslate('resp_energy').replace('{val}', this.vibrationalFreq.toString());
    }

    if (q.includes('ऑरा') || q.includes('aura')) {
      return this.langService.getTranslate('resp_aura');
    }

    if (q.includes('108') || q.includes('का')) {
      return this.langService.getTranslate('resp_why_108');
    }

    if (q.includes('विचलित') || q.includes('distract')) return this.langService.getTranslate('resp_focus');
    if (q.includes('प्रगती') || q.includes('improve')) return this.langService.getTranslate('resp_improve');
    if (q.includes('फोकस') || q.includes('focus score')) return this.langService.getTranslate('resp_focus_score').replace('{val}', this.focusScore.toString());

    return this.langService.getTranslate('resp_default');
  }

  // VOICE & AUDIO
  speak(text: string) {
    if (!this.voiceEnabled) return;
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);

    const lang = this.langService.getCurrentLang();
    utterance.lang = lang === 'mr' ? 'mr-IN' : (lang === 'hi' ? 'hi-IN' : 'en-GB');
    speechSynthesis.speak(utterance);
  }

  toggleVoice() { this.voiceEnabled = !this.voiceEnabled; }
  selectVoice(type: 'male' | 'female') { this.voiceType = type; }
  toggleAiAuto() { this.aiAutoMode = !this.aiAutoMode; }

  startListening() {
    const recognition = new (window as any).webkitSpeechRecognition();
    const lang = this.langService.getCurrentLang();
    recognition.lang = lang === 'mr' ? 'mr-IN' : 'hi-IN';

    recognition.onresult = (event: any) => {
      this.userInput = event.results[0][0].transcript;
      this.sendMessage();
    };
    recognition.start();
  }
}