import { TranslatePipe } from './translate-pipe';
import { LanguageService } from '../services/language';

describe('TranslatePipe', () => {
  it('create an instance', () => {
    const mockLangService = {} as LanguageService; 
    const pipe = new TranslatePipe(mockLangService);
    expect(pipe).toBeTruthy();
  });
});