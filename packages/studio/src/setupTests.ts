if (typeof window !== 'undefined') {
  (window as unknown as { clearStorage: () => void }).clearStorage = () => {
    localStorage.clear();
    sessionStorage.clear();
  };
  if (!window.requestIdleCallback) {
    const originalSetTimeout = window.setTimeout;
    window.requestIdleCallback = ((cb: IdleRequestCallback) => {
      return originalSetTimeout(() => cb({ didTimeout: false, timeRemaining: () => 50 }), 0) as unknown as number;
    }) as typeof window.requestIdleCallback;
    window.cancelIdleCallback = ((handle: number) => {
      clearTimeout(handle as unknown as ReturnType<typeof setTimeout>);
    }) as typeof window.cancelIdleCallback;
  }
  if (typeof window.indexedDB === 'undefined') {
    const mockStore = () => ({
      put: () => ({ onsuccess: null, onerror: null }),
      get: () => ({ onsuccess: null, onerror: null, result: undefined }),
      delete: () => ({ onsuccess: null, onerror: null }),
      clear: () => ({ onsuccess: null, onerror: null }),
      getAll: () => ({ onsuccess: null, onerror: null, result: [] }),
      index: () => ({
        getAll: () => ({ onsuccess: null, onerror: null, result: [] }),
        openCursor: () => ({ onsuccess: null, onerror: null }),
      }),
      createIndex: () => {},
    });
    const mockDB = {
      objectStoreNames: { contains: () => false },
      createObjectStore: () => mockStore(),
      transaction: () => ({
        objectStore: mockStore,
        oncomplete: null,
        onerror: null,
        onabort: null,
      }),
      oncomplete: null,
      onerror: null,
    };
    window.indexedDB = {
      open: (name: string, version: number) => {
        const req = {
          onsuccess: null as (() => void) | null,
          onerror: null as (() => void) | null,
          result: mockDB,
        };
        setTimeout(() => {
          if (req.onsuccess) {
            req.onsuccess();
          }
        }, 0);
        return req;
      },
      deleteDatabase: () => ({
        onsuccess: null as (() => void) | null,
        onerror: null as (() => void) | null,
      }),
    } as unknown as IDBFactory;
  }
}

