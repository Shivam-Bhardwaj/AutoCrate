/**
 * Intelligent caching system for AutoCrate
 * Implements multi-tier caching with memory and localStorage
 */

import { CrateConfiguration } from '@/types/crate';
import crypto from 'crypto';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  hash: string;
  hits: number;
  size: number;
}

interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  maxSize?: number; // Max cache size in bytes
  maxEntries?: number; // Max number of entries
}

export class CacheManager {
  private static instance: CacheManager;
  private memoryCache: Map<string, CacheEntry<any>> = new Map();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes
  private readonly MAX_MEMORY_SIZE = 10 * 1024 * 1024; // 10MB
  private readonly MAX_STORAGE_SIZE = 50 * 1024 * 1024; // 50MB
  private readonly MAX_ENTRIES = 100;
  private currentMemorySize = 0;

  private constructor() {
    this.initializeCache();
    this.startCleanupInterval();
  }

  public static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  private initializeCache() {
    // Load frequently accessed items from localStorage to memory
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const cacheKeys = this.getLocalStorageKeys();
        const recentKeys = cacheKeys
          .map(key => ({
            key,
            data: this.getFromLocalStorage(key)
          }))
          .filter(item => item.data !== null)
          .sort((a, b) => (b.data?.hits || 0) - (a.data?.hits || 0))
          .slice(0, 10); // Load top 10 most accessed items

        for (const item of recentKeys) {
          if (item.data && this.isValidEntry(item.data)) {
            this.memoryCache.set(item.key, item.data);
            this.currentMemorySize += item.data.size;
          }
        }
      } catch (error) {
        console.warn('Failed to initialize cache from localStorage:', error);
      }
    }
  }

  private startCleanupInterval() {
    // Run cleanup every minute
    setInterval(() => {
      this.cleanup();
    }, 60 * 1000);
  }

  private cleanup() {
    const now = Date.now();
    
    // Clean memory cache
    for (const [key, entry] of this.memoryCache.entries()) {
      if (now - entry.timestamp > this.DEFAULT_TTL) {
        this.memoryCache.delete(key);
        this.currentMemorySize -= entry.size;
      }
    }

    // Clean localStorage
    if (typeof window !== 'undefined' && window.localStorage) {
      const keys = this.getLocalStorageKeys();
      for (const key of keys) {
        const entry = this.getFromLocalStorage(key);
        if (entry && !this.isValidEntry(entry)) {
          localStorage.removeItem(key);
        }
      }
    }
  }

  private generateHash(data: any): string {
    const str = JSON.stringify(data);
    // Simple hash function for browser environment
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString(36);
  }

  private calculateSize(data: any): number {
    const str = JSON.stringify(data);
    return new Blob([str]).size;
  }

  private isValidEntry(entry: CacheEntry<any>, ttl: number = this.DEFAULT_TTL): boolean {
    return Date.now() - entry.timestamp < ttl;
  }

  private evictLRU() {
    // Evict least recently used items from memory
    const entries = Array.from(this.memoryCache.entries());
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
    
    while (this.currentMemorySize > this.MAX_MEMORY_SIZE * 0.9 && entries.length > 0) {
      const [key, entry] = entries.shift()!;
      this.memoryCache.delete(key);
      this.currentMemorySize -= entry.size;
    }
  }

  private getLocalStorageKeys(): string[] {
    if (typeof window === 'undefined' || !window.localStorage) return [];
    
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('autocrate-cache-')) {
        keys.push(key);
      }
    }
    return keys;
  }

  private getFromLocalStorage(key: string): CacheEntry<any> | null {
    if (typeof window === 'undefined' || !window.localStorage) return null;
    
    try {
      const item = localStorage.getItem(key);
      if (item) {
        return JSON.parse(item);
      }
    } catch (error) {
      console.warn(`Failed to parse cache entry ${key}:`, error);
      localStorage.removeItem(key);
    }
    return null;
  }

  private saveToLocalStorage(key: string, entry: CacheEntry<any>): boolean {
    if (typeof window === 'undefined' || !window.localStorage) return false;
    
    try {
      const serialized = JSON.stringify(entry);
      
      // Check if we have space
      if (serialized.length > this.MAX_STORAGE_SIZE) {
        return false;
      }
      
      localStorage.setItem(key, serialized);
      return true;
    } catch (error) {
      // Handle quota exceeded error
      if (error instanceof DOMException && error.code === 22) {
        // Clear old entries and try again
        this.clearOldLocalStorageEntries();
        try {
          localStorage.setItem(key, JSON.stringify(entry));
          return true;
        } catch {
          return false;
        }
      }
      return false;
    }
  }

  private clearOldLocalStorageEntries() {
    const keys = this.getLocalStorageKeys();
    const entries = keys
      .map(key => ({
        key,
        data: this.getFromLocalStorage(key)
      }))
      .filter(item => item.data !== null)
      .sort((a, b) => (a.data?.timestamp || 0) - (b.data?.timestamp || 0));

    // Remove oldest 25% of entries
    const toRemove = Math.floor(entries.length * 0.25);
    for (let i = 0; i < toRemove; i++) {
      localStorage.removeItem(entries[i].key);
    }
  }

  public set<T>(
    key: string,
    data: T,
    options: CacheOptions = {}
  ): void {
    const hash = this.generateHash(data);
    const size = this.calculateSize(data);
    
    // Check size limits
    if (size > this.MAX_MEMORY_SIZE) {
      console.warn('Data too large to cache:', key);
      return;
    }

    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      hash,
      hits: 0,
      size
    };

    // Add to memory cache
    if (this.currentMemorySize + size > this.MAX_MEMORY_SIZE) {
      this.evictLRU();
    }
    
    this.memoryCache.set(key, entry);
    this.currentMemorySize += size;

    // Also save to localStorage for persistence
    const storageKey = `autocrate-cache-${key}`;
    this.saveToLocalStorage(storageKey, entry);
  }

  public get<T>(key: string): T | null {
    // Check memory cache first
    let entry = this.memoryCache.get(key);
    
    if (entry && this.isValidEntry(entry)) {
      entry.hits++;
      entry.timestamp = Date.now(); // Update access time
      return entry.data as T;
    }

    // Check localStorage
    const storageKey = `autocrate-cache-${key}`;
    entry = this.getFromLocalStorage(storageKey);
    
    if (entry && this.isValidEntry(entry)) {
      entry.hits++;
      entry.timestamp = Date.now();
      
      // Promote to memory cache if frequently accessed
      if (entry.hits > 5) {
        if (this.currentMemorySize + entry.size > this.MAX_MEMORY_SIZE) {
          this.evictLRU();
        }
        this.memoryCache.set(key, entry);
        this.currentMemorySize += entry.size;
      }
      
      // Update in localStorage
      this.saveToLocalStorage(storageKey, entry);
      return entry.data as T;
    }

    return null;
  }

  public has(key: string): boolean {
    if (this.memoryCache.has(key)) {
      const entry = this.memoryCache.get(key);
      if (entry && this.isValidEntry(entry)) {
        return true;
      }
    }

    const storageKey = `autocrate-cache-${key}`;
    const entry = this.getFromLocalStorage(storageKey);
    return entry !== null && this.isValidEntry(entry);
  }

  public delete(key: string): void {
    const entry = this.memoryCache.get(key);
    if (entry) {
      this.currentMemorySize -= entry.size;
      this.memoryCache.delete(key);
    }
    
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(`autocrate-cache-${key}`);
    }
  }

  public clear(): void {
    this.memoryCache.clear();
    this.currentMemorySize = 0;
    
    if (typeof window !== 'undefined' && window.localStorage) {
      const keys = this.getLocalStorageKeys();
      for (const key of keys) {
        localStorage.removeItem(key);
      }
    }
  }

  public invalidate(pattern?: RegExp): void {
    if (!pattern) {
      this.clear();
      return;
    }

    // Invalidate memory cache
    for (const key of this.memoryCache.keys()) {
      if (pattern.test(key)) {
        const entry = this.memoryCache.get(key);
        if (entry) {
          this.currentMemorySize -= entry.size;
        }
        this.memoryCache.delete(key);
      }
    }

    // Invalidate localStorage
    if (typeof window !== 'undefined' && window.localStorage) {
      const keys = this.getLocalStorageKeys();
      for (const key of keys) {
        const cacheKey = key.replace('autocrate-cache-', '');
        if (pattern.test(cacheKey)) {
          localStorage.removeItem(key);
        }
      }
    }
  }

  public getStats() {
    const memoryEntries = this.memoryCache.size;
    const storageEntries = this.getLocalStorageKeys().length;
    
    return {
      memoryEntries,
      storageEntries,
      totalEntries: memoryEntries + storageEntries,
      memorySize: this.currentMemorySize,
      memorySizeKB: (this.currentMemorySize / 1024).toFixed(2),
      memorySizeMB: (this.currentMemorySize / 1024 / 1024).toFixed(2),
      maxMemorySize: this.MAX_MEMORY_SIZE,
      utilization: ((this.currentMemorySize / this.MAX_MEMORY_SIZE) * 100).toFixed(1)
    };
  }

  // Helper method to generate cache key for crate configurations
  public static generateConfigKey(config: CrateConfiguration): string {
    const keyData = {
      dimensions: config.dimensions,
      base: config.base,
      weight: config.weight,
      fasteners: config.fasteners,
      cap: config.cap,
      vinyl: config.vinyl
    };
    
    return `config-${JSON.stringify(keyData).replace(/[^a-zA-Z0-9]/g, '').substr(0, 50)}`;
  }
}