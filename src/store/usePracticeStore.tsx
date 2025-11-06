import { create } from "zustand";

type SentenceMap = {
  [lang: string]: {
    [category: string]: {
      short: string[];
      long: string[];
    };
  };
};

interface PracticeState {
  speechResult: string | null; // 음성 인식 결과
  language: string | null;
  length: string | null;
  category: string | null;
  currentSentence: string;
  isRecording: boolean;
  recordedChunks: Blob[];
  sentences: SentenceMap;
  setLanguage: (lang: string) => void;
  setLength: (len: string) => void;
  setCategory: (cat: string) => void;
  setSentence: (text: string) => void;
  setRecording: (state: boolean) => void;
  addChunk: (chunk: Blob) => void;
  setSpeechResult: (text: string) => void; // 음성 인식 결과 업데이트 함수
  analysisResult: any | null;
  setAnalysisResult: (result: any) => void;
}

export const usePracticeStore = create<PracticeState>((set) => ({
  speechResult: null, // 초기값은 null
  language: null,
  length: null,
  category: null,
  currentSentence: "",
  isRecording: false,
  recordedChunks: [],
  sentences: {
    ko: {
      quote: {
        short: [
          "행복은 습관이다. 그것을 몸에 지녀라.",
          "꿈을 지녀라. 그러면 어려운 현실을 이길 수 있다.",
        ],
        long: [
          "인생은 자전거를 타는 것과 같다. 균형을 유지하려면 계속 움직여야 한다.",
          "성공은 최종적인 것이 아니며 실패는 치명적인 것이 아니다. 중요한 것은 계속할 수 있는 용기다.",
        ],
      },
      book: {
        short: [
          "모든 것은 연습이다.",
          "책은 시간을 넘어 대화할 수 있게 해준다.",
        ],
        long: [
          "우리가 사랑하는 것들은 우리가 누구인지를 말해준다. 우리의 선택이 우리를 정의한다.",
          "인간은 자신이 생각하는 것보다 훨씬 더 많은 것을 견딜 수 있다.",
        ],
      },
      movie: {
        short: ["인생은 초콜릿 상자와 같아.", "포기하지 마. 기적은 일어나."],
        long: [
          "과거는 아프지만 내 생각엔 과거에서 도망칠 수도 있고 과거에서 배울 수도 있어.",
          "두려움은 항상 존재한다. 하지만 용기는 두려움을 극복하는 것이다.",
        ],
      },
      music: {
        short: ["음악은 영혼의 언어다.", "노래는 마음을 치유한다."],
        long: [
          "우리가 함께 부르는 노래는 우리를 하나로 만들고 희망을 주는 힘이 있다.",
          "멜로디는 말보다 더 깊은 감정을 전달할 수 있는 마법 같은 힘을 가지고 있다.",
        ],
      },
      news: {
        short: [
          "오늘의 뉴스를 전해드립니다.",
          "경제가 회복세를 보이고 있습니다.",
        ],
        long: [
          "정부는 오늘 새로운 정책을 발표하며 국민들의 삶의 질 향상을 위해 노력하겠다고 밝혔습니다.",
          "기술 발전으로 인해 우리의 일상생활이 빠르게 변화하고 있으며 새로운 기회들이 창출되고 있습니다.",
        ],
      },
      sns: {
        short: ["오늘 하루도 화이팅!", "좋아요와 구독 부탁드려요."],
        long: [
          "여러분의 응원과 관심이 저에게 큰 힘이 됩니다. 앞으로도 좋은 콘텐츠로 보답하겠습니다.",
          "일상의 소소한 행복을 여러분과 함께 나누고 싶어요. 댓글로 여러분의 이야기도 들려주세요.",
        ],
      },
      philosophy: {
        short: ["나는 생각한다, 고로 존재한다.", "삶의 의미를 찾아가는 여정."],
        long: [
          "진정한 지혜는 자신이 무지하다는 것을 아는 데서 시작된다. 겸손함이 배움의 시작이다.",
          "우리는 모두 불완전한 존재이지만 그 불완전함 속에서 완전함을 향해 나아가는 것이 인간의 본질이다.",
        ],
      },
      daily: {
        short: ["오늘 날씨가 참 좋네요.", "맛있는 저녁 식사했어요."],
        long: [
          "아침에 일어나서 창밖을 보니 햇살이 너무 좋아서 기분이 상쾌해졌어요. 오늘 하루도 행복하게 보내세요.",
          "친구들과 오랜만에 만나서 맛있는 음식을 먹으며 즐거운 시간을 보냈어요. 이런 순간들이 정말 소중해요.",
        ],
      },
    },
    en: {
      quote: {
        short: [
          "Happiness is a habit. Cultivate it.",
          "Dream big and dare to fail.",
        ],
        long: [
          "Life is like riding a bicycle. To keep your balance, you must keep moving forward.",
          "Success is not final, failure is not fatal: it is the courage to continue that counts.",
        ],
      },
      book: {
        short: ["Practice makes perfect.", "Books are time machines."],
        long: [
          "The things we love tell us who we are. Our choices define us more than our abilities.",
          "Humans can endure much more than they think they can. Strength comes from struggle.",
        ],
      },
      movie: {
        short: [
          "Life is like a box of chocolates.",
          "Never give up. Miracles happen.",
        ],
        long: [
          "The past can hurt, but you can either run from it or learn from it. The choice is yours.",
          "Fear will always be there, but courage is not the absence of fear. It is acting in spite of it.",
        ],
      },
      music: {
        short: ["Music is the language of the soul.", "Songs heal the heart."],
        long: [
          "The songs we sing together have the power to unite us and give us hope for tomorrow.",
          "Melodies have a magical power to convey emotions deeper than words ever could.",
        ],
      },
      news: {
        short: ["Here is todays news.", "The economy is recovering."],
        long: [
          "The government announced new policies today, pledging to improve the quality of life for citizens.",
          "Technological advancements are rapidly changing our daily lives and creating new opportunities.",
        ],
      },
      sns: {
        short: ["Have a great day everyone!", "Please like and subscribe."],
        long: [
          "Your support and interest mean the world to me. I will continue to create great content for you.",
          "I want to share the small joys of everyday life with you. Please share your stories in the comments.",
        ],
      },
      philosophy: {
        short: ["I think, therefore I am.", "The journey to find meaning."],
        long: [
          "True wisdom begins with knowing that you know nothing. Humility is the start of learning.",
          "We are all imperfect beings, but striving for perfection within our imperfection is human nature.",
        ],
      },
      daily: {
        short: ["The weather is beautiful today.", "I had a delicious dinner."],
        long: [
          "I woke up this morning and looked outside to see beautiful sunshine. It made me feel refreshed. Have a wonderful day.",
          "I met friends after a long time and enjoyed delicious food together. These moments are truly precious.",
        ],
      },
    },
  },
  setLanguage: (lang) => set({ language: lang }),
  setLength: (len) => set({ length: len }),
  setCategory: (cat) => set({ category: cat }),
  setSentence: (text) => set({ currentSentence: text }),
  setRecording: (state) => set({ isRecording: state }),
  addChunk: (chunk) =>
    set((state) => ({ recordedChunks: [...state.recordedChunks, chunk] })),
  setSpeechResult: (text) => set({ speechResult: text }), // 음성 결과 설정
  analysisResult: null,
  setAnalysisResult: (result) => set({ analysisResult: result }),
}));
