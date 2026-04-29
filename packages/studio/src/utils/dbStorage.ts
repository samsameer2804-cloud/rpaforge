import type { ProcessVariable } from '../stores/variableStore';
import { idb } from './db';

const STORAGE_KEY = 'rpaforge-variables';

function isIndexedDBAvailable(): boolean {
  return typeof indexedDB !== 'undefined';
}

export const indexedDBStorage = {
  getItem: async (name: string): Promise<string | null> => {
    if (name !== STORAGE_KEY || !isIndexedDBAvailable()) {
      return localStorage.getItem(name);
    }

    try {
      const result = await idb.variables.get(STORAGE_KEY);
      if (result) {
        return JSON.stringify(result.variables);
      }
    } catch (e) {
      console.warn('Failed to get from IndexedDB, falling back to localStorage', e);
    }

    return localStorage.getItem(name);
  },

  setItem: async (name: string, value: string): Promise<void> => {
    if (name !== STORAGE_KEY || !isIndexedDBAvailable()) {
      localStorage.setItem(name, value);
      return;
    }

    try {
      const variables = JSON.parse(value) as ProcessVariable[];
      for (const v of variables) {
        await idb.variables.save(v);
      }
    } catch (e) {
      console.warn('Failed to save to IndexedDB, using localStorage', e);
    }

    localStorage.setItem(name, value);
  },

  removeItem: async (name: string): Promise<void> => {
    if (name !== STORAGE_KEY || !isIndexedDBAvailable()) {
      localStorage.removeItem(name);
      return;
    }

    try {
      await idb.variables.clear();
    } catch (e) {
      console.warn('Failed to clear from IndexedDB', e);
    }

    localStorage.removeItem(name);
  },
};

export async function syncVariablesToIndexedDB(variables: ProcessVariable[]): Promise<void> {
  if (!isIndexedDBAvailable()) return;

  try {
    for (const v of variables) {
      await idb.variables.save(v);
    }
  } catch (e) {
    console.warn('Failed to sync variables to IndexedDB', e);
  }
}

export async function loadVariablesFromIndexedDB(projectId: string): Promise<ProcessVariable[]> {
  if (!isIndexedDBAvailable()) return [];

  try {
    return await idb.variables.getByProject(projectId);
  } catch (e) {
    console.warn('Failed to load variables from IndexedDB', e);
    return [];
  }
}

export async function clearVariablesFromIndexedDB(projectId: string): Promise<void> {
  if (!isIndexedDBAvailable()) return;

  try {
    await idb.variables.deleteByProject(projectId);
  } catch (e) {
    console.warn('Failed to clear variables from IndexedDB', e);
  }
}

export async function deleteVariableFromIndexedDB(id: string): Promise<void> {
  if (!isIndexedDBAvailable()) return;

  try {
    await idb.variables.delete(id);
  } catch (e) {
    console.warn('Failed to delete variable from IndexedDB', e);
  }
}
