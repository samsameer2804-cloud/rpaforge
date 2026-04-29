import { create } from 'zustand';

export type ExecutionMode = 'standalone' | 'orchestrator';

export interface ProcessMetadata {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  orchestratorId?: string;
}

interface ProcessMetadataState {
  mode: ExecutionMode;
  orchestratorUrl: string | null;
  isConnected: boolean;
  metadata: ProcessMetadata | null;
  validationMessage: string | null;

  setMode: (mode: ExecutionMode) => void;
  setOrchestratorUrl: (url: string | null) => void;
  setConnected: (connected: boolean) => void;
  setMetadata: (metadata: ProcessMetadata | null) => void;
  setValidationMessage: (message: string | null) => void;
  clearValidationMessage: () => void;
  clearProcess: () => void;
}

export const useProcessMetadataStore = create<ProcessMetadataState>()((set) => ({
  mode: 'standalone',
  orchestratorUrl: null,
  isConnected: false,
  metadata: null,
  validationMessage: null,

  setMode: (mode) => set({ mode }),

  setOrchestratorUrl: (url) => set({ orchestratorUrl: url }),

  setConnected: (connected) => set({ isConnected: connected }),

  setMetadata: (metadata) => set({ metadata }),

  setValidationMessage: (message) => set({ validationMessage: message }),

  clearValidationMessage: () => set({ validationMessage: null }),

  clearProcess: () =>
    set({
      metadata: null,
      validationMessage: null,
    }),
}));
