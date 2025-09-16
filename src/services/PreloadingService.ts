import { GeocodingService } from './GeocodingService';
import { ComercialRepresentative } from '@/hooks/useComercialRepresentatives';

interface PreloadingConfig {
  maxConcurrentRequests: number;
  delayBetweenBatches: number;
  enableBackgroundPreloading: boolean;
}

class PreloadingService {
  private static instance: PreloadingService;
  private isPreloading = false;
  private preloadQueue: string[] = [];
  private config: PreloadingConfig = {
    maxConcurrentRequests: 2,
    delayBetweenBatches: 300,
    enableBackgroundPreloading: true
  };

  private constructor() {}

  static getInstance(): PreloadingService {
    if (!PreloadingService.instance) {
      PreloadingService.instance = new PreloadingService();
    }
    return PreloadingService.instance;
  }

  /**
   * Inicia o pré-carregamento de coordenadas em background
   */
  async startBackgroundPreloading(representatives: ComercialRepresentative[]): Promise<void> {
    if (!this.config.enableBackgroundPreloading || this.isPreloading) {
      return;
    }

    this.isPreloading = true;
    
    try {
      // Extrair cidades únicas dos representantes ativos
      const uniqueCities = this.extractUniqueCities(representatives);
      
      // Filtrar cidades que ainda não estão em cache
      const citiesToPreload = await this.filterUncachedCities(uniqueCities);
      
      if (citiesToPreload.length === 0) {
        this.isPreloading = false;
        return;
      }

      // Processar em lotes pequenos para não sobrecarregar
      await this.processPreloadingBatches(citiesToPreload);
      
    } catch (error) {
      console.warn('Erro durante pré-carregamento:', error);
    } finally {
      this.isPreloading = false;
    }
  }

  /**
   * Extrai cidades únicas dos representantes ativos
   */
  private extractUniqueCities(representatives: ComercialRepresentative[]): string[] {
    const citySet = new Set<string>();
    const cities: Array<{ city: string; state: string }> = [];
    
    representatives
      .filter(rep => rep.status === 'ativo')
      .forEach(rep => {
        // cidades_atendidas é um array de strings
        rep.cidades_atendidas.forEach(cidade => {
          const key = `${cidade.toLowerCase()}_${(rep.estado || 'brasil').toLowerCase()}`;
          if (!citySet.has(key)) {
            citySet.add(key);
            cities.push({ city: cidade, state: rep.estado || 'Brasil' });
          }
        });
      });
    
    return cities.map(c => `${c.city}, ${c.state}`);
  }

  /**
   * Filtra cidades que ainda não estão em cache
   */
  private async filterUncachedCities(cities: string[]): Promise<string[]> {
    const uncachedCities: string[] = [];
    
    for (const city of cities) {
      const cached = GeocodingService.getCachedCoordinates(city);
      if (!cached) {
        uncachedCities.push(city);
      }
    }
    
    return uncachedCities;
  }

  /**
   * Processa o pré-carregamento em lotes controlados
   */
  private async processPreloadingBatches(cities: string[]): Promise<void> {
    const batchSize = this.config.maxConcurrentRequests;
    
    for (let i = 0; i < cities.length; i += batchSize) {
      const batch = cities.slice(i, i + batchSize);
      
      // Processar lote atual
      await Promise.allSettled(
        batch.map(city => this.preloadCityCoordinates(city))
      );
      
      // Delay entre lotes para não sobrecarregar a API
      if (i + batchSize < cities.length) {
        await this.delay(this.config.delayBetweenBatches);
      }
    }
  }

  /**
   * Pré-carrega coordenadas de uma cidade específica
   */
  private async preloadCityCoordinates(city: string): Promise<void> {
    try {
      // Extrair cidade e estado do formato "cidade, estado"
      const [cityName, stateName] = city.split(',').map(s => s.trim());
      await GeocodingService.getCoordinates(cityName, stateName || 'Brasil');
    } catch (error) {
      // Silenciosamente ignora erros durante pré-carregamento
      // para não afetar a experiência do usuário
    }
  }

  /**
   * Utilitário para delay
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Para o pré-carregamento em andamento
   */
  stopPreloading(): void {
    this.isPreloading = false;
    this.preloadQueue = [];
  }

  /**
   * Verifica se está pré-carregando
   */
  isCurrentlyPreloading(): boolean {
    return this.isPreloading;
  }

  /**
   * Atualiza configurações do pré-carregamento
   */
  updateConfig(newConfig: Partial<PreloadingConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Obtém estatísticas do pré-carregamento
   */
  getStats(): { isPreloading: boolean; queueSize: number; config: PreloadingConfig } {
    return {
      isPreloading: this.isPreloading,
      queueSize: this.preloadQueue.length,
      config: { ...this.config }
    };
  }

  /**
   * Método estático para facilitar o uso
   */
  static async startPreloading(representatives: ComercialRepresentative[]): Promise<void> {
    const instance = PreloadingService.getInstance();
    return instance.startBackgroundPreloading(representatives);
  }
}

export default PreloadingService;
export { PreloadingService };
export type { PreloadingConfig };