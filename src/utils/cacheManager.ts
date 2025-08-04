interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiry?: number; // TTL in milliseconds
}

interface CacheConfig {
  defaultTTL: number; // Default time to live in milliseconds
  maxMemoryItems: number; // Maximum items in memory cache
}

class CacheManager {
  private memoryCache = new Map<string, CacheItem<any>>();
  private config: CacheConfig = {
    defaultTTL: 5 * 60 * 1000, // 5 minutes default
    maxMemoryItems: 100
  };

  // Check if we're running in localhost/development
  private isLocalhost(): boolean {
    return typeof window !== 'undefined' && 
           (window.location.hostname === 'localhost' || 
            window.location.hostname === '127.0.0.1' ||
            window.location.hostname === '');
  }

  // Set data in cache with optional TTL
  set<T>(key: string, data: T, ttl?: number): void {
    const expiry = ttl || this.config.defaultTTL;
    const cacheItem: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      expiry
    };

    // Store in memory cache
    this.setMemoryCache(key, cacheItem);

    // Store in localStorage if we're in localhost
    if (this.isLocalhost()) {
      try {
        localStorage.setItem(`cache_${key}`, JSON.stringify(cacheItem));
      } catch (error) {
        console.warn('Failed to store in localStorage:', error);
      }
    }
  }

  // Get data from cache
  get<T>(key: string): T | null {
    // First check memory cache
    const memoryItem = this.memoryCache.get(key);
    if (memoryItem && this.isValidCacheItem(memoryItem)) {
      return memoryItem.data;
    }

    // Then check localStorage if we're in localhost
    if (this.isLocalhost()) {
      try {
        const stored = localStorage.getItem(`cache_${key}`);
        if (stored) {
          const cacheItem: CacheItem<T> = JSON.parse(stored);
          if (this.isValidCacheItem(cacheItem)) {
            // Restore to memory cache
            this.setMemoryCache(key, cacheItem);
            return cacheItem.data;
          } else {
            // Remove expired item
            localStorage.removeItem(`cache_${key}`);
          }
        }
      } catch (error) {
        console.warn('Failed to retrieve from localStorage:', error);
      }
    }

    return null;
  }

  // Check if data exists and is valid
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  // Remove specific item from cache
  remove(key: string): void {
    this.memoryCache.delete(key);
    if (this.isLocalhost()) {
      try {
        localStorage.removeItem(`cache_${key}`);
      } catch (error) {
        console.warn('Failed to remove from localStorage:', error);
      }
    }
  }

  // Clear all cache
  clear(): void {
    this.memoryCache.clear();
    if (this.isLocalhost()) {
      try {
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
          if (key.startsWith('cache_')) {
            localStorage.removeItem(key);
          }
        });
      } catch (error) {
        console.warn('Failed to clear localStorage:', error);
      }
    }
  }

  // Set data with automatic JSON serialization for complex objects
  setJSON<T>(key: string, data: T, ttl?: number): void {
    this.set(key, data, ttl);
  }

  // Get data with automatic JSON deserialization
  getJSON<T>(key: string): T | null {
    return this.get<T>(key);
  }

  // Cache API responses with built-in invalidation
  async cacheApiCall<T>(
    key: string, 
    apiCall: () => Promise<T>, 
    ttl?: number
  ): Promise<T> {
    // Check if we have valid cached data
    const cached = this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // Make API call and cache result
    try {
      const result = await apiCall();
      this.set(key, result, ttl);
      return result;
    } catch (error) {
      console.error('API call failed:', error);
      throw error;
    }
  }

  // Helper methods
  private setMemoryCache(key: string, cacheItem: CacheItem<any>): void {
    // Remove oldest items if we exceed maxMemoryItems
    if (this.memoryCache.size >= this.config.maxMemoryItems) {
      const firstKey = this.memoryCache.keys().next().value;
      this.memoryCache.delete(firstKey);
    }
    this.memoryCache.set(key, cacheItem);
  }

  private isValidCacheItem(item: CacheItem<any>): boolean {
    if (!item.expiry) return true; // No expiry set
    return Date.now() - item.timestamp < item.expiry;
  }

  // Get cache statistics
  getStats() {
    return {
      memoryItems: this.memoryCache.size,
      isLocalhost: this.isLocalhost(),
      localStorageItems: this.isLocalhost() ? this.getLocalStorageItemCount() : 0
    };
  }

  private getLocalStorageItemCount(): number {
    if (!this.isLocalhost()) return 0;
    try {
      return Object.keys(localStorage).filter(key => key.startsWith('cache_')).length;
    } catch {
      return 0;
    }
  }
}

// Export singleton instance
export const cacheManager = new CacheManager();

// Export specific cache instances for different data types
export const authCache = {
  setUser: (user: any) => cacheManager.set('auth_user', user, 24 * 60 * 60 * 1000), // 24 hours
  getUser: (): any | null => cacheManager.get('auth_user'),
  clearUser: () => cacheManager.remove('auth_user')
};

export const vehicleCache = {
  setVehicle: (vehicle: any) => cacheManager.set('selected_vehicle', vehicle, 7 * 24 * 60 * 60 * 1000), // 7 days
  getVehicle: () => cacheManager.get('selected_vehicle'),
  clearVehicle: () => cacheManager.remove('selected_vehicle')
};

export const routeCache = {
  setRoute: (route: any, key: string) => cacheManager.set(`route_${key}`, route, 30 * 60 * 1000), // 30 minutes
  getRoute: (key: string) => cacheManager.get(`route_${key}`),
  clearRoute: (key: string) => cacheManager.remove(`route_${key}`)
};

export const stationCache = {
  setStations: (stations: any[]) => cacheManager.set('stations_data', stations, 60 * 60 * 1000), // 1 hour
  getStations: () => cacheManager.get<any[]>('stations_data'),
  clearStations: () => cacheManager.remove('stations_data')
};

export const predictionCache = {
  setPrediction: (stationId: number, prediction: any) => 
    cacheManager.set(`prediction_${stationId}`, prediction, 5 * 60 * 1000), // 5 minutes
  getPrediction: (stationId: number) => cacheManager.get(`prediction_${stationId}`),
  clearPrediction: (stationId: number) => cacheManager.remove(`prediction_${stationId}`)
};