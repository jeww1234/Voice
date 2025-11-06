import { VisemeAnalyzer } from "./VisemeAnalyzer";

export class PhonemeVisemeMapper {
  private visemeAnalyzer: VisemeAnalyzer;
  constructor(visemeAnalyzer) {
    this.visemeAnalyzer = visemeAnalyzer;
  }
  textToPhonemes(text, language) {
    if (language === "ko") {
      return this.koreanTextToPhonemes(text);
    } else {
      return this.englishTextToPhonemes(text);
    }
  }
  koreanTextToPhonemes(text) {
    const phonemes = [];
    const HANGUL_BASE = 0xac00;
    const HANGUL_END = 0xd7a3;
    const CHOSUNG = [
      "ㄱ",
      "ㄲ",
      "ㄴ",
      "ㄷ",
      "ㄸ",
      "ㄹ",
      "ㅁ",
      "ㅂ",
      "ㅃ",
      "ㅅ",
      "ㅆ",
      "ㅇ",
      "ㅈ",
      "ㅉ",
      "ㅊ",
      "ㅋ",
      "ㅌ",
      "ㅍ",
      "ㅎ",
    ];
    const JUNGSUNG = [
      "ㅏ",
      "ㅐ",
      "ㅑ",
      "ㅒ",
      "ㅓ",
      "ㅔ",
      "ㅕ",
      "ㅖ",
      "ㅗ",
      "ㅘ",
      "ㅙ",
      "ㅚ",
      "ㅛ",
      "ㅜ",
      "ㅝ",
      "ㅞ",
      "ㅟ",
      "ㅠ",
      "ㅡ",
      "ㅢ",
      "ㅣ",
    ];
    const JONGSUNG = [
      "",
      "ㄱ",
      "ㄲ",
      "ㄳ",
      "ㄴ",
      "ㄵ",
      "ㄶ",
      "ㄷ",
      "ㄹ",
      "ㄺ",
      "ㄻ",
      "ㄼ",
      "ㄽ",
      "ㄾ",
      "ㄿ",
      "ㅀ",
      "ㅁ",
      "ㅂ",
      "ㅄ",
      "ㅅ",
      "ㅆ",
      "ㅇ",
      "ㅈ",
      "ㅊ",
      "ㅋ",
      "ㅌ",
      "ㅍ",
      "ㅎ",
    ];
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const code = char.charCodeAt(0);
      // 한글 음절인 경우
      if (code >= HANGUL_BASE && code <= HANGUL_END) {
        const hangulCode = code - HANGUL_BASE;
        const chosungIndex = Math.floor(hangulCode / 588);
        const jungsungIndex = Math.floor((hangulCode % 588) / 28);
        const jongsungIndex = hangulCode % 28;
        const syllable = char; // 원본 글자 저장
        // 초성
        phonemes.push({
          symbol: CHOSUNG[chosungIndex],
          duration: 100,
          timestamp: phonemes.length * 100,
          originalChar: syllable,
        });
        // 중성
        phonemes.push({
          symbol: JUNGSUNG[jungsungIndex],
          duration: 150,
          timestamp: phonemes.length * 100,
          originalChar: syllable,
        });
        // 종성 (있을 경우)
        if (jongsungIndex > 0) {
          phonemes.push({
            symbol: JONGSUNG[jongsungIndex],
            duration: 100,
            timestamp: phonemes.length * 100,
            originalChar: syllable,
          });
        }
      }
      // 공백이 아닌 경우 (특수문자, 숫자 등)
      else if (char !== " " && char.trim() !== "") {
        phonemes.push({
          symbol: char,
          duration: 100,
          timestamp: phonemes.length * 100,
          originalChar: char,
        });
      }
      // 공백은 무시 (음소로 추가하지 않음)
    }
    return phonemes;
  }
  englishTextToPhonemes(text) {
    const phonemes = [];
    // 특수문자 제거하고 소문자로 변환
    const cleanText = text.toLowerCase().replace(/[^a-z\s]/g, "");
    const words = cleanText.split(/\s+/).filter((word) => word.length > 0);
    for (const word of words) {
      for (const char of word) {
        phonemes.push({
          symbol: char.toUpperCase(),
          duration: 100,
          timestamp: phonemes.length * 100,
          originalChar: char,
        });
      }
    }
    return phonemes;
  }
  phonemeToExpectedViseme(phoneme, language) {
    const visemeDB = this.visemeAnalyzer.getVisemeDatabase(language);
    for (const viseme of visemeDB) {
      if (viseme.phonemes.includes(phoneme.symbol)) {
        return viseme;
      }
    }
    return visemeDB[0];
  }
}
