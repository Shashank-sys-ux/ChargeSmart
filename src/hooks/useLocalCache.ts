import { useState, useEffect, useCallback } from 'react';
import { cacheManager } from '@/utils/cacheManager';

// Hook for caching any data with automatic state management
export function useLocalCache<T>(
  key: string, 
  initialValue: T | null = null, 
  ttl?: number
) {
  const [data, setData] = useState<T | null>(() => {
    // Try to load from cache on initialization
    const cached = cacheManager.get<T>(key);
    return cached !== null ? cached : initialValue;
  });

  const [isLoading, setIsLoading] = useState(false);

  // Update cache and state
  const updateData = useCallback((newData: T) => {
    setData(newData);
    cacheManager.set(key, newData, ttl);
  }, [key, ttl]);

  // Clear cache and reset state
  const clearData = useCallback(() => {
    setData(initialValue);
    cacheManager.remove(key);
  }, [key, initialValue]);

  // Refresh data from cache
  const refreshFromCache = useCallback(() => {
    const cached = cacheManager.get<T>(key);
    if (cached !== null) {
      setData(cached);
      return true;
    }
    return false;
  }, [key]);

  // Cache API call with loading state
  const cacheApiCall = useCallback(async (
    apiCall: () => Promise<T>
  ): Promise<T> => {
    setIsLoading(true);
    try {
      const result = await cacheManager.cacheApiCall(key, apiCall, ttl);
      setData(result);
      return result;
    } finally {
      setIsLoading(false);
    }
  }, [key, ttl]);

  return {
    data,
    isLoading,
    updateData,
    clearData,
    refreshFromCache,
    cacheApiCall,
    hasCache: data !== null
  };
}

// Hook specifically for API data caching
export function useApiCache<T>(
  key: string,
  apiCall: () => Promise<T>,
  dependencies: any[] = [],
  ttl?: number
) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async (forceRefresh = false) => {
    if (!forceRefresh) {
      // Check cache first
      const cached = cacheManager.get<T>(key);
      if (cached !== null) {
        setData(cached);
        return cached;
      }
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const result = await apiCall();
      cacheManager.set(key, result, ttl);
      setData(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [key, apiCall, ttl]);

  // Auto-fetch on mount or dependency change
  useEffect(() => {
    fetchData();
  }, dependencies);

  // Manual refresh
  const refresh = useCallback(() => fetchData(true), [fetchData]);

  return {
    data,
    isLoading,
    error,
    refresh,
    fetchData
  };
}

// Hook for persistent user preferences
export function usePreferences<T extends Record<string, any>>(
  defaultPreferences: T
) {
  const [preferences, setPreferences] = useState<T>(() => {
    const cached = cacheManager.get<T>('user_preferences');
    return cached ? { ...defaultPreferences, ...cached } : defaultPreferences;
  });

  const updatePreference = useCallback(<K extends keyof T>(
    key: K,
    value: T[K]
  ) => {
    const newPreferences = { ...preferences, [key]: value };
    setPreferences(newPreferences);
    cacheManager.set('user_preferences', newPreferences, 30 * 24 * 60 * 60 * 1000); // 30 days
  }, [preferences]);

  const updatePreferences = useCallback((newPreferences: Partial<T>) => {
    const updated = { ...preferences, ...newPreferences };
    setPreferences(updated);
    cacheManager.set('user_preferences', updated, 30 * 24 * 60 * 60 * 1000); // 30 days
  }, [preferences]);

  const resetPreferences = useCallback(() => {
    setPreferences(defaultPreferences);
    cacheManager.remove('user_preferences');
  }, [defaultPreferences]);

  return {
    preferences,
    updatePreference,
    updatePreferences,
    resetPreferences
  };
}