import { QueryClient } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24, // 24 hours in disk cache
      staleTime: 1000 * 60 * 5, // 5 minutes freshness
      networkMode: 'offlineFirst', // Consult local cache immediately when network is unavailable
      retry: 2,
    },
    mutations: {
      networkMode: 'offlineFirst', // Outbox pattern: hold and replay mutations upon reconnect
      retry: 3,
    },
  },
});

export const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: 'SUMAYNI_OFFLINE_CACHE',
});
