// src/utils/VisemeAnalyzer.ts
export class VisemeAnalyzer {
  private koreanVisemes: any[];
  private englishVisemes: any[];

  constructor() {
    this.koreanVisemes = [
      {
        id: "V_SILENT",
        phonemes: [""],
        lipHeight: 0.0,
        lipWidth: 0.0,
        description: "입 다문 상태",
      },
      {
        id: "V_AA",
        phonemes: ["ㅏ", "ㅐ", "ㅑ", "ㅒ"],
        lipHeight: 0.7,
        lipWidth: 0.5,
        description: "입을 크게 벌린 상태",
      },
      {
        id: "V_EE",
        phonemes: ["ㅣ", "ㅔ", "ㅖ"],
        lipHeight: 0.3,
        lipWidth: 0.8,
        description: "입을 옆으로 벌린 상태",
      },
      {
        id: "V_OO",
        phonemes: ["ㅜ", "ㅗ", "ㅠ", "ㅛ"],
        lipHeight: 0.4,
        lipWidth: 0.3,
        description: "입술을 오므린 상태",
      },
      {
        id: "V_UH",
        phonemes: ["ㅓ", "ㅕ", "ㅡ"],
        lipHeight: 0.4,
        lipWidth: 0.5,
        description: "입을 중간 정도 벌린 상태",
      },
      {
        id: "V_MM",
        phonemes: ["ㅁ", "ㅂ", "ㅍ"],
        lipHeight: 0.0,
        lipWidth: 0.4,
        description: "입술을 다문 상태",
      },
      {
        id: "V_SS",
        phonemes: ["ㅅ", "ㅆ", "ㅈ", "ㅉ", "ㅊ"],
        lipHeight: 0.2,
        lipWidth: 0.6,
        description: "치아를 드러낸 상태",
      },
      {
        id: "V_NN",
        phonemes: ["ㄴ", "ㅇ"],
        lipHeight: 0.3,
        lipWidth: 0.5,
        description: "입을 약간 벌린 상태",
      },
      {
        id: "V_RR",
        phonemes: ["ㄹ"],
        lipHeight: 0.3,
        lipWidth: 0.5,
        description: "혀를 말아올린 상태",
      },
      {
        id: "V_KK",
        phonemes: ["ㄱ", "ㄲ", "ㅋ"],
        lipHeight: 0.3,
        lipWidth: 0.5,
        description: "목구멍 소리",
      },
      {
        id: "V_TT",
        phonemes: ["ㄷ", "ㄸ", "ㅌ"],
        lipHeight: 0.3,
        lipWidth: 0.4,
        description: "혀를 윗니에 댄 상태",
      },
      {
        id: "V_HH",
        phonemes: ["ㅎ"],
        lipHeight: 0.4,
        lipWidth: 0.5,
        description: "입을 벌리고 숨을 내쉬는 상태",
      },
    ];
    this.englishVisemes = [
      {
        id: "V_SILENT",
        phonemes: [""],
        lipHeight: 0.0,
        lipWidth: 0.0,
        description: "Closed mouth",
      },
      {
        id: "V_AA",
        phonemes: ["AA", "AE", "AH", "AO"],
        lipHeight: 0.7,
        lipWidth: 0.5,
        description: "Wide open mouth",
      },
      {
        id: "V_EE",
        phonemes: ["IY", "IH", "EY", "EH"],
        lipHeight: 0.3,
        lipWidth: 0.8,
        description: "Spread lips",
      },
      {
        id: "V_OO",
        phonemes: ["UW", "UH", "OW"],
        lipHeight: 0.4,
        lipWidth: 0.3,
        description: "Rounded lips",
      },
      {
        id: "V_MM",
        phonemes: ["M", "B", "P"],
        lipHeight: 0.0,
        lipWidth: 0.4,
        description: "Lips together",
      },
      {
        id: "V_FF",
        phonemes: ["F", "V"],
        lipHeight: 0.2,
        lipWidth: 0.5,
        description: "Lower lip to upper teeth",
      },
      {
        id: "V_TH",
        phonemes: ["TH", "DH"],
        lipHeight: 0.3,
        lipWidth: 0.4,
        description: "Tongue between teeth",
      },
      {
        id: "V_SS",
        phonemes: ["S", "Z", "SH", "ZH"],
        lipHeight: 0.2,
        lipWidth: 0.6,
        description: "Teeth showing",
      },
      {
        id: "V_NN",
        phonemes: ["N", "NG"],
        lipHeight: 0.3,
        lipWidth: 0.5,
        description: "Mouth slightly open",
      },
      {
        id: "V_RR",
        phonemes: ["R", "L"],
        lipHeight: 0.3,
        lipWidth: 0.5,
        description: "Tongue curled up",
      },
      {
        id: "V_KK",
        phonemes: ["K", "G"],
        lipHeight: 0.3,
        lipWidth: 0.5,
        description: "Back of tongue raised",
      },
      {
        id: "V_TT",
        phonemes: ["T", "D"],
        lipHeight: 0.3,
        lipWidth: 0.4,
        description: "Tongue to upper teeth",
      },
    ];
  }

  extractLipFeatures(landmarks: any[]): any {
    const upperLipTop = landmarks[13];
    const upperLipBottom = landmarks[14];
    const lowerLipTop = landmarks[78];
    const lowerLipBottom = landmarks[308];
    const lipLeft = landmarks[61];
    const lipRight = landmarks[291];
    const lipHeight = this.calculateDistance(upperLipTop, lowerLipBottom);
    const lipWidth = this.calculateDistance(lipLeft, lipRight);
    const upperLipThickness = this.calculateDistance(
      upperLipTop,
      upperLipBottom
    );
    const lowerLipThickness = this.calculateDistance(
      lowerLipTop,
      lowerLipBottom
    );
    const mouthOpenness = this.calculateDistance(upperLipBottom, lowerLipTop);
    const normalizedHeight = Math.min(lipHeight / 0.1, 1.0);
    const normalizedWidth = Math.min(lipWidth / 0.15, 1.0);
    const normalizedOpenness = Math.min(mouthOpenness / 0.08, 1.0);
    return {
      lipHeight: normalizedHeight,
      lipWidth: normalizedWidth,
      upperLipThickness,
      lowerLipThickness,
      mouthOpenness: normalizedOpenness,
      timestamp: Date.now(),
    };
  }
  calculateDistance(point1: any, point2: any): number {
    const dx = point1.x - point2.x;
    const dy = point1.y - point2.y;
    const dz = (point1.z || 0) - (point2.z || 0);
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }
  classifyViseme(features: any, language: string): any {
    const visemeDB =
      language === "ko" ? this.koreanVisemes : this.englishVisemes;
    let bestMatch = null;
    let bestScore = -Infinity;
    for (const viseme of visemeDB) {
      const heightDiff = Math.abs(features.lipHeight - viseme.lipHeight);
      const widthDiff = Math.abs(features.lipWidth - viseme.lipWidth);
      const score = 1.0 - (heightDiff * 0.6 + widthDiff * 0.4);
      if (score > bestScore) {
        bestScore = score;
        bestMatch = viseme;
      }
    }
    return {
      viseme: bestMatch,
      confidence: bestScore,
      features,
    };
  }
  getVisemeDatabase(language: string): any[] {
    return language === "ko" ? this.koreanVisemes : this.englishVisemes;
  }
}
