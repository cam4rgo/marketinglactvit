import { useState, useEffect, useCallback, useRef } from 'react';
import { useComercialRepresentatives, ComercialRepresentative } from './useComercialRepresentatives';
import { GeocodingService, type CachedCoordinate } from '@/services/GeocodingService';

export interface MapPin {
  id: string;
  latitude: number;
  longitude: number;
  city: string;
  state: string;
  representatives: ComercialRepresentative[];
}

export function useMapData() {
  const { representatives } = useComercialRepresentatives();
  const [mapPins, setMapPins] = useState<MapPin[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState({ current: 0, total: 0 });
  const abortControllerRef = useRef<AbortController | null>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const loadMapData = useCallback(async () => {
    // Cancelar requisições anteriores
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    
    // Debounce para evitar múltiplas execuções
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    debounceTimeoutRef.current = setTimeout(async () => {
      if (representatives.length === 0) {
        return;
      }
      
      setIsLoading(true);
      
      // Agrupar representantes por cidade/estado
      const cityGroups = new Map<string, {
        city: string;
        state: string;
        representatives: ComercialRepresentative[];
      }>();
      
      representatives.forEach(rep => {
        if (rep.status === 'ativo' && rep.cidades_atendidas.length > 0) {
          rep.cidades_atendidas.forEach(city => {
            const key = `${city}_${rep.estado || ''}`;
            if (!cityGroups.has(key)) {
              cityGroups.set(key, {
                city,
                state: rep.estado || '',
                representatives: []
              });
            }
            cityGroups.get(key)!.representatives.push(rep);
          });
        }
      });
      
      const cityGroupsArray = Array.from(cityGroups.entries());
      const totalCities = cityGroupsArray.length;
      setLoadingProgress({ current: 0, total: totalCities });
      
      // Processamento em lotes paralelos
      const BATCH_SIZE = 5;
      const pins: MapPin[] = [];
      let successCount = 0;
      let failCount = 0;
      let processedCount = 0;
      
      for (let i = 0; i < cityGroupsArray.length; i += BATCH_SIZE) {
        if (abortControllerRef.current?.signal.aborted) {
          return;
        }
        
        const batch = cityGroupsArray.slice(i, i + BATCH_SIZE);
        
        // Processar lote em paralelo
        const batchPromises = batch.map(async ([key, group]) => {
          if (!group.state) {
            return { success: false, key, group, coordinates: null };
          }
          
          try {
            const coordinates = await GeocodingService.getCoordinates(group.city, group.state, abortControllerRef.current?.signal);
            return { success: !!coordinates, key, group, coordinates };
          } catch (error) {
            if (error instanceof Error && error.name === 'AbortError') {
              throw error;
            }
            return { success: false, key, group, coordinates: null };
          }
        });
        
        try {
          const batchResults = await Promise.all(batchPromises);
          
          batchResults.forEach(result => {
            processedCount++;
            setLoadingProgress({ current: processedCount, total: totalCities });
            
            if (result.success && result.coordinates) {
              pins.push({
                id: result.key,
                latitude: result.coordinates.latitude,
                longitude: result.coordinates.longitude,
                city: result.group.city,
                state: result.group.state,
                representatives: result.group.representatives
              });
              successCount++;
            } else {
              failCount++;
            }
          });
          
          // Delay reduzido entre lotes
          if (i + BATCH_SIZE < cityGroupsArray.length) {
            await new Promise(resolve => setTimeout(resolve, 50));
          }
          
        } catch (error) {
          if (error instanceof Error && error.name === 'AbortError') {
            return;
          }
          throw error;
        }
      }
      
      setMapPins(pins);
      setIsLoading(false);
      setLoadingProgress({ current: 0, total: 0 });
    }, 300); // Debounce de 300ms
  }, [representatives]);
  
  useEffect(() => {
    loadMapData();
    
    // Cleanup
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [loadMapData]);
  
  return { mapPins, isLoading, loadingProgress };
}