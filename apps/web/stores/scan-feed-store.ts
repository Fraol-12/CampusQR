'use client';

import { create } from 'zustand';

export type LiveScanEvent = {
  scanType: string;
  status: string;
  display?: string;
  message?: string;
  student?: {
    studentId?: string;
    fullName?: string;
    department?: string;
    photoUrl?: string | null;
  } | null;
  timestamp: string;
};

type ScanFeedState = {
  events: LiveScanEvent[];
  pushEvent: (event: LiveScanEvent) => void;
  clear: () => void;
};

export const useScanFeedStore = create<ScanFeedState>((set) => ({
  events: [],
  pushEvent: (event) =>
    set((state) => ({
      events: [event, ...state.events].slice(0, 50),
    })),
  clear: () => set({ events: [] }),
}));
