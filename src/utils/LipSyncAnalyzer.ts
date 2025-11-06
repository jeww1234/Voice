import { VisemeAnalyzer } from "./VisemeAnalyzer";
import { PhonemeVisemeMapper } from "./PhonemeVisemeMapper";

export class LipSyncAnalyzer {
  private visemeAnalyzer: VisemeAnalyzer;
  private phonemeMapper: PhonemeVisemeMapper;
  private lipDataBuffer: any[];
  private recordingStartTime: number;

  constructor() {
    this.lipDataBuffer = [];
    this.recordingStartTime = 0;
    this.visemeAnalyzer = new VisemeAnalyzer();
    this.phonemeMapper = new PhonemeVisemeMapper(this.visemeAnalyzer);
  }
  startRecording() {
    this.lipDataBuffer = [];
    this.recordingStartTime = Date.now();
  }
  captureLipData(landmarks, language) {
    const features = this.visemeAnalyzer.extractLipFeatures(landmarks);
    const classification = this.visemeAnalyzer.classifyViseme(
      features,
      language
    );
    this.lipDataBuffer.push(classification);
  }



  async analyzeLipSync(targetText, recognizedText, language) {
    const expectedPhonemes = this.phonemeMapper.textToPhonemes(
      targetText,
      language
    );
    const expectedVisemes = expectedPhonemes.map((phoneme) =>
      this.phonemeMapper.phonemeToExpectedViseme(phoneme, language)
    );
    const lipSyncScore = this.calculateLipSyncScore(
      expectedVisemes,
      this.lipDataBuffer
    );
    const speechScore = this.calculateSpeechAccuracy(
      targetText,
      recognizedText
    );
    const finalScore = Math.round(lipSyncScore * 0.4 + speechScore * 0.6);
    const detailedAnalysis = this.generateDetailedAnalysis(
      expectedVisemes,
      this.lipDataBuffer,
      expectedPhonemes
    );
    return {
      finalScore,
      lipSyncScore,
      speechScore,
      detailedAnalysis,
      lipDataCount: this.lipDataBuffer.length,
      expectedVisemeCount: expectedVisemes.length,
    };
  }



  calculateLipSyncScore(expectedVisemes, actualVisemes) {
    if (actualVisemes.length === 0) return 0;
    const dtw = this.dynamicTimeWarping(expectedVisemes, actualVisemes);
    const maxDistance = expectedVisemes.length * 2.0;
    const score = Math.max(0, 100 - (dtw / maxDistance) * 100);
    return score;
  }
  dynamicTimeWarping(expected, actual) {
    const n = expected.length;
    const m = actual.length;
    const dtw = Array(n + 1)
      .fill(null)
      .map(() => Array(m + 1).fill(Infinity));
    dtw[0][0] = 0;
    for (let i = 1; i <= n; i++) {
      for (let j = 1; j <= m; j++) {
        const cost = this.visemeDistance(expected[i - 1], actual[j - 1].viseme);
        dtw[i][j] =
          cost + Math.min(dtw[i - 1][j], dtw[i][j - 1], dtw[i - 1][j - 1]);
      }
    }
    return dtw[n][m];
  }
  visemeDistance(v1, v2) {
    if (v1.id === v2.id) return 0;
    const heightDiff = Math.abs(v1.lipHeight - v2.lipHeight);
    const widthDiff = Math.abs(v1.lipWidth - v2.lipWidth);
    return heightDiff * 0.6 + widthDiff * 0.4;
  }
  calculateSpeechAccuracy(original:string, recognized:string) {
    if (!recognized) return 0;

    const originalWords = original
      .replace(/[^\w\s가-힣]/g, "")
      .toLowerCase()
      .split(/\s+/);
    const recognizedWords = recognized
      .replace(/[^\w\s가-힣]/g, "")
      .toLowerCase()
      .split(/\s+/);
      
    let matches = 0;
    const maxLength = Math.max(originalWords.length, recognizedWords.length);
    for (
      let i = 0;
      i < Math.min(originalWords.length, recognizedWords.length);
      i++
    ) {
      if (originalWords[i] === recognizedWords[i]) {
        matches++;
      } else {
        const similarity = this.stringSimilarity(
          originalWords[i],
          recognizedWords[i]
        );
        if (similarity > 0.7) {
          matches += similarity;
        }
      }
    }
    return Math.round((matches / maxLength) * 100);
  }
  stringSimilarity(s1:string, s2:string) {
    const longer = s1.length > s2.length ? s1 : s2;
    const shorter = s1.length > s2.length ? s2 : s1;
    if (longer.length === 0) return 1.0;
    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }
  levenshteinDistance(s1:string, s2:string) {
    const costs = [];
    for (let i = 0; i <= s1.length; i++) {
      let lastValue = i;
      for (let j = 0; j <= s2.length; j++) {
        if (i === 0) {
          costs[j] = j;
        } else if (j > 0) {
          let newValue = costs[j - 1];
          if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
            newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
          }
          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }
      if (i > 0) costs[s2.length] = lastValue;
    }
    return costs[s2.length];
  }

  generateDetailedAnalysis(expectedVisemes, actualVisemes, phonemes) {
    const errors = [];
    const timeline = [];
    const alignment = this.getOptimalAlignment(expectedVisemes, actualVisemes);
    for (let i = 0; i < alignment.length; i++) {
      const { expectedIndex, actualIndex, distance } = alignment[i];
      if (
        expectedIndex >= 0 &&
        actualIndex >= 0 &&
        expectedIndex < expectedVisemes.length &&
        actualIndex < actualVisemes.length
      ) {
        const expected = expectedVisemes[expectedIndex];
        const actual = actualVisemes[actualIndex];
        timeline.push({
          timestamp: actual.features.timestamp,
          expectedViseme: expected.id,
          actualViseme: actual.viseme.id,
          confidence: actual.confidence,
          isCorrect: distance < 0.3,
        });
        // 🔥 에러 감지 개선
        if (distance > 0.5 && expectedIndex < phonemes.length) {
          const phoneme = phonemes[expectedIndex];
          // 표시할 텍스트 결정
          let displayText = phoneme.symbol;
          if (phoneme.originalChar && phoneme.originalChar !== phoneme.symbol) {
            displayText = `${phoneme.originalChar}(${phoneme.symbol})`;
          }
          errors.push({
            position: expectedIndex,
            phoneme: displayText, // 🔥 원본 글자 포함
            expectedViseme: expected.id,
            actualViseme: actual.viseme.id,
            errorType: this.classifyError(expected, actual.viseme),
            severity: distance > 0.8 ? "high" : "medium",
          });
        }
      }
    }
    return {
      errors,
      timeline,
      totalPhonemes: phonemes.length,
      correctVisemes: timeline.filter((t) => t.isCorrect).length,
      avgConfidence:
        actualVisemes.length > 0
          ? actualVisemes.reduce((sum, v) => sum + v.confidence, 0) /
            actualVisemes.length
          : 0,
    };
  }
  getOptimalAlignment(expected, actual) {
    const n = expected.length;
    const m = actual.length;
    const dtw = Array(n + 1)
      .fill(null)
      .map(() => Array(m + 1).fill(Infinity));
    const path = Array(n + 1)
      .fill(null)
      .map(() => Array(m + 1).fill(""));
    dtw[0][0] = 0;
    for (let i = 1; i <= n; i++) {
      for (let j = 1; j <= m; j++) {
        const cost = this.visemeDistance(expected[i - 1], actual[j - 1].viseme);
        const candidates = [
          { value: dtw[i - 1][j], direction: "up" },
          { value: dtw[i][j - 1], direction: "left" },
          { value: dtw[i - 1][j - 1], direction: "diag" },
        ];
        const min = candidates.reduce((prev, curr) =>
          curr.value < prev.value ? curr : prev
        );
        dtw[i][j] = cost + min.value;
        path[i][j] = min.direction;
      }
    }
    const alignment = [];
    let i = n,
      j = m;
    while (i > 0 || j > 0) {
      if (i > 0 && j > 0) {
        alignment.unshift({
          expectedIndex: i - 1,
          actualIndex: j - 1,
          distance: this.visemeDistance(expected[i - 1], actual[j - 1].viseme),
        });
      }
      const direction = path[i][j];
      if (direction === "diag") {
        i--;
        j--;
      } else if (direction === "up") {
        i--;
      } else {
        j--;
      }
    }
    return alignment;
  }
  classifyError(expected, actual) {
    const heightDiff = Math.abs(expected.lipHeight - actual.lipHeight);
    const widthDiff = Math.abs(expected.lipWidth - actual.lipWidth);
    if (heightDiff > 0.4) {
      return expected.lipHeight > actual.lipHeight
        ? "입을 더 크게 벌려야 합니다"
        : "입을 덜 벌려야 합니다";
    }
    if (widthDiff > 0.4) {
      return expected.lipWidth > actual.lipWidth
        ? "입을 더 옆으로 벌려야 합니다"
        : "입술을 더 오므려야 합니다";
    }
    return "입 모양이 정확하지 않습니다";
  }
}
