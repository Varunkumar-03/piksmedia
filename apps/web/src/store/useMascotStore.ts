import { create } from 'zustand';

export interface MascotState {
  expression: number; // 1 to 16 corresponding to cartoons/1.png ... 16.png
  message: string;
  isBubbleVisible: boolean;
  isMinimized: boolean;
  actionType: string;
  triggerMood: (expression: number, message: string, durationMs?: number, actionType?: string) => void;
  setExpression: (expression: number) => void;
  setMessage: (message: string) => void;
  hideBubble: () => void;
  showBubble: () => void;
  toggleMinimize: () => void;
  triggerRandomTip: () => void;
}

const TIPS = [
  { exp: 13, text: "Pro Tip: Adding a mat border makes artwork pop by giving it visual breathing room! 💡" },
  { exp: 7, text: "Fun Fact: Walnut & Black wood frames complement warm-toned photographs best! ❤️" },
  { exp: 3, text: "Need gift inspiration? Check out our Couple & Wedding curation section! 👍" },
  { exp: 6, text: "All our frames are crafted with premium museum-quality wood and anti-glare glass! ✨" },
  { exp: 1, text: "Did you know? You can preview your custom photo directly on our frames! 🖼️" },
  { exp: 8, text: "Check out our Best Sellers for our top gallery-rated designs! 🌟" }
];

let timeoutId: NodeJS.Timeout | null = null;

const useMascotStore = create<MascotState>((set, get) => ({
  expression: 1,
  message: "Hi there! I'm Pandu, your frame companion! 🖼️",
  isBubbleVisible: true,
  isMinimized: false,
  actionType: 'idle',

  triggerMood: (expression: number, message: string, durationMs = 6000, actionType = 'action') => {
    if (timeoutId) clearTimeout(timeoutId);

    set({
      expression,
      message,
      isBubbleVisible: true,
      isMinimized: false,
      actionType,
    });

    if (durationMs > 0) {
      timeoutId = setTimeout(() => {
        set({
          expression: 1,
          isBubbleVisible: false,
          actionType: 'idle',
        });
      }, durationMs);
    }
  },

  setExpression: (expression: number) => set({ expression }),
  setMessage: (message: string) => set({ message, isBubbleVisible: true }),
  hideBubble: () => set({ isBubbleVisible: false }),
  showBubble: () => set({ isBubbleVisible: true }),
  toggleMinimize: () => set((state) => ({ isMinimized: !state.isMinimized })),

  triggerRandomTip: () => {
    const randomTip = TIPS[Math.floor(Math.random() * TIPS.length)];
    get().triggerMood(randomTip.exp, randomTip.text, 8000, 'tip');
  }
}));

export default useMascotStore;
