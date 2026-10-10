import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { config } from "./config";
import type { SavedDecode } from "./types";

export interface Screenshot {
  uri: string;
  width: number;
  height: number;
}

interface State {
  hasOnboarded: boolean;
  history: SavedDecode[];
  isPro: boolean;
  usage: { day: string; count: number };
  /** Screenshots picked on the home screen, waiting for setup. Not persisted. */
  pending: Screenshot[];

  completeOnboarding: () => void;
  setPending: (screenshots: Screenshot[]) => void;
  addDecode: (decode: SavedDecode) => void;
  deleteDecode: (id: string) => void;
  recordFreeDecode: () => void;
  setPro: (isPro: boolean) => void;
}

export const today = () => new Date().toISOString().slice(0, 10);

export const useAppStore = create<State>()(
  persist(
    (set) => ({
      hasOnboarded: false,
      history: [],
      isPro: false,
      usage: { day: today(), count: 0 },
      pending: [],

      completeOnboarding: () => set({ hasOnboarded: true }),
      setPending: (pending) => set({ pending }),
      addDecode: (decode) => set((s) => ({ history: [decode, ...s.history].slice(0, 100) })),
      deleteDecode: (id) => set((s) => ({ history: s.history.filter((d) => d.id !== id) })),
      recordFreeDecode: () =>
        set((s) => {
          const day = today();
          return { usage: { day, count: (s.usage.day === day ? s.usage.count : 0) + 1 } };
        }),
      setPro: (isPro) => set({ isPro }),
    }),
    {
      name: "decode-store",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ pending: _pending, ...rest }) => rest,
    },
  ),
);

export function useFreeDecodesLeft() {
  return useAppStore((s) => {
    const used = s.usage.day === today() ? s.usage.count : 0;
    return Math.max(0, config.freeDecodesPerDay - used);
  });
}
