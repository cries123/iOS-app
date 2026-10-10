import { useSyncExternalStore } from "react";
import { useAppStore } from "./store";

const subscribe = (onChange: () => void) => useAppStore.persist.onFinishHydration(onChange);
const getSnapshot = () => useAppStore.persist.hasHydrated();

/** True once the persisted store has loaded from disk, so we don't flash onboarding at returning users. */
export function useHydrated() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
