interface GeocodingResult {
  lat: string;
  lon: string;
  display_name: string;
}

interface CachedCoordinate {
  latitude: number;
  longitude: number;
  display_name: string;
  cached_at: string;
}

export class GeocodingService {
  private static readonly CACHE_KEY = 'geocoding_cache';
  private static readonly CACHE_EXPIRY_DAYS = 30;
  private static readonly REQUEST_TIMEOUT = 5000; // 5 segundos
  private static memoryCache = new Map<string, { data: CachedCoordinate; timestamp: number }>();
  
  static async getCoordinates(city: string, state: string, signal?: AbortSignal): Promise<CachedCoordinate | null> {
    const cacheKey = `${city.toLowerCase()}_${state.toLowerCase()}`;
    
    // Verificar cache em memória primeiro
    const memoryData = this.memoryCache.get(cacheKey);
    if (memoryData && !this.isMemoryCacheExpired(memoryData.timestamp)) {
      return memoryData.data;
    }
    
    // Verificar cache local
    const cached = this.getCachedCoordinate(cacheKey);
    if (cached && !this.isCacheExpired(cached.cached_at)) {
      // Adicionar ao cache em memória
      this.memoryCache.set(cacheKey, { data: cached, timestamp: Date.now() });
      return cached;
    }
    
    // Queries otimizadas - removendo tentativas desnecessárias
    const queries = [
      `${city}, ${state}, Brasil`,
      `${city}, ${state}`
    ];
    
    for (let i = 0; i < queries.length; i++) {
      const query = queries[i];
      console.log(`🔍 Tentativa ${i + 1}/${queries.length}: "${query}"`);
      
      try {
        // Criar AbortController para timeout
        const timeoutController = new AbortController();
        const timeoutId = setTimeout(() => timeoutController.abort(), this.REQUEST_TIMEOUT);
        
        // Combinar signals se fornecido
        const combinedSignal = signal ? this.combineAbortSignals([signal, timeoutController.signal]) : timeoutController.signal;
        
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=2&countrycodes=br&addressdetails=1`,
          { signal: combinedSignal }
        );
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          continue;
        }
        
        const data: GeocodingResult[] = await response.json();
        console.log(`📊 Encontrados ${data.length} resultados para "${query}"`);
        
        if (data.length > 0) {
          // Preferir resultados que contenham o estado correto
          let bestResult = data[0];
          
          if (state && data.length > 1) {
            const stateMatch = data.find(result => 
              result.display_name.toLowerCase().includes(state.toLowerCase())
            );
            if (stateMatch) {
              bestResult = stateMatch;
              console.log(`🎯 Encontrado resultado específico do estado: ${bestResult.display_name}`);
            }
          }
          
          const coordinate: CachedCoordinate = {
            latitude: parseFloat(bestResult.lat),
            longitude: parseFloat(bestResult.lon),
            display_name: bestResult.display_name,
            cached_at: new Date().toISOString()
          };
          
          // Salvar nos caches
          this.setCachedCoordinate(cacheKey, coordinate);
          this.memoryCache.set(cacheKey, { data: coordinate, timestamp: Date.now() });
          return coordinate;
        }
        
      } catch (error) {
        continue;
      }
      
      // Delay reduzido entre tentativas
      if (i < queries.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }
    
    return null;
  }
  
  private static getCachedCoordinate(key: string): CachedCoordinate | null {
    try {
      const cache = localStorage.getItem(this.CACHE_KEY);
      if (cache) {
        const parsed = JSON.parse(cache);
        return parsed[key] || null;
      }
    } catch (error) {
      console.error('Erro ao ler cache:', error);
    }
    return null;
  }
  
  private static setCachedCoordinate(key: string, coordinate: CachedCoordinate): void {
    try {
      const cache = localStorage.getItem(this.CACHE_KEY);
      const parsed = cache ? JSON.parse(cache) : {};
      parsed[key] = coordinate;
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(parsed));
    } catch (error) {
      console.error('Erro ao salvar cache:', error);
    }
  }
  
  private static isCacheExpired(cachedAt: string): boolean {
    const cacheDate = new Date(cachedAt);
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() - this.CACHE_EXPIRY_DAYS);
    return cacheDate < expiryDate;
  }
  
  private static isMemoryCacheExpired(timestamp: number): boolean {
    const MEMORY_CACHE_TTL = 10 * 60 * 1000; // 10 minutos
    return Date.now() - timestamp > MEMORY_CACHE_TTL;
  }
  
  private static combineAbortSignals(signals: AbortSignal[]): AbortSignal {
    const controller = new AbortController();
    
    signals.forEach(signal => {
      if (signal.aborted) {
        controller.abort();
        return;
      }
      
      signal.addEventListener('abort', () => {
        controller.abort();
      }, { once: true });
    });
    
    return controller.signal;
  }
  
  static clearMemoryCache(): void {
    this.memoryCache.clear();
  }
}

export type { CachedCoordinate, GeocodingResult };