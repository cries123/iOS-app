import { useAppStore } from "./store";

export interface Plan {
  id: "weekly" | "yearly";
  name: string;
  price: string;
  period: string;
  detail: string;
  badge?: string;
}

export const PLANS: Plan[] = [
  { id: "yearly", name: "Yearly", price: "$29.99", period: "yr", detail: "3 days free · just $0.58/week", badge: "SAVE 88%" },
  { id: "weekly", name: "Weekly", price: "$4.99", period: "wk", detail: "Cancel anytime" },
];

/**
 * TEST MODE: unlocks Pro locally so the app can be tried in Expo Go, which can't make real
 * App Store purchases. Before release, replace these two functions with RevenueCat
 * (react-native-purchases) and a development build. See README.
 */
export async function purchase(_plan: Plan): Promise<boolean> {
  useAppStore.getState().setPro(true);
  return true;
}

export async function restorePurchases(): Promise<boolean> {
  return useAppStore.getState().isPro;
}
