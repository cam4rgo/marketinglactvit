import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { ComercialRepresentative } from '@/types/comercial';
import { useComercialRepresentatives } from '@/hooks/useComercialRepresentatives';
import { GeocodingService, type CachedCoordinate } from '@/services/GeocodingService';
import { PreloadingService } from '@/services/PreloadingService';

export interface MapPin {
  id: string;
  latitude: number;
  longitude: number;
  city: string;
  state: string;
  representatives: ComercialRepresentative[];
}

export function useMapData(externalRepresentatives?: ComercialRepresentative[]) {
  // Usar useRef para evitar logs excessivos e reinicializações
  const initLoggedRef = useRef(false);
  
  if (!initLoggedRef.current) {
    console.log('🗺️ [useMapData] Hook iniciado - timestamp:', new Date().toISOString());
    console.log('🗺️ [useMapData] Representantes externos recebidos:', {
      hasExternal: !!externalRepresentatives,
      externalLength: externalRepresentatives?.length || 0,
      externalData: externalRepresentatives?.slice(0, 2) // Primeiros 2 para debug
    });
    initLoggedRef.current = true;
  }
  
  const { representatives: internalRepresentatives, isLoading: isLoadingReps, error: repsError } = useComercialRepresentatives();
  
  // Estabilizar a referência dos representantes usando useMemo
  const representatives = useMemo(() => {
    const result = externalRepresentatives || internalRepresentatives;
    console.log('🗺️ [useMapData] Representantes selecionados:', {
      source: externalRepresentatives ? 'EXTERNAL' : 'INTERNAL',
      length: result?.length || 0,
      isLoadingReps,
      hasError: !!repsError
    });
    return result;
  }, [externalRepresentatives, internalRepresentatives, isLoadingReps, repsError]);
  const [mapPins, setMapPins] = useState<MapPin[]>(() => {
    try {
      const cached = localStorage.getItem('mapPins');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  
  // Refs para evitar reinicializações desnecessárias
  const isProcessingRef = useRef(false);
  const lastProcessedCountRef = useRef(0);
  
  console.log('🗺️ [useMapData] Dados finais selecionados:', {
    source: externalRepresentatives ? 'EXTERNAL' : 'INTERNAL',
    representatives: representatives?.slice(0, 2), // Primeiros 2 para debug
    isLoadingReps,
    repsError,
    representativesType: typeof representatives,
    representativesLength: representatives?.length
  });
  
  // Garantir que representatives seja sempre um array
  const safeRepresentatives = representatives || [];
  const isLoadingData = externalRepresentatives ? false : isLoadingReps;
  
  // Log para debug do timing
  console.log('🗺️ [useMapData] Estado atual:', {
    isLoadingData,
    representatives: representatives ? 'ARRAY' : 'UNDEFINED',
    safeRepresentatives: safeRepresentatives.length,
    externalProvided: !!externalRepresentatives
  });
  
  console.log('🗺️ [useMapData] Debug detalhado:', {
    isLoadingData,
    representatives: representatives?.length || 0,
    safeRepresentativesLength: safeRepresentatives.length,
    representativesData: representatives,
    safeRepresentativesData: safeRepresentatives,
    representativesType: typeof representatives,
    representativesIsArray: Array.isArray(representatives),
    representativesIsUndefined: representatives === undefined,
    representativesIsNull: representatives === null
  });
  
  // Log temporário para debug
  console.log('🗺️ [useMapData] Representatives loaded:', safeRepresentatives.length);
  console.log('🗺️ [useMapData] Raw representatives data:', representatives);
  console.log('🗺️ [useMapData] Is loading data:', isLoadingData);
  console.log('🗺️ [useMapData] Current map pins:', mapPins.length);
  console.log('🗺️ [useMapData] Is loading geocoding:', isLoading);
  console.log('🗺️ [useMapData] Progress:', progress);
  
  if (safeRepresentatives.length > 0) {
    console.log('🗺️ [useMapData] Primeiro representante:', safeRepresentatives[0]);
    console.log('🗺️ [useMapData] Representantes ativos:', safeRepresentatives.filter(rep => rep.status === 'ativo').length);
    console.log('🗺️ [useMapData] Representantes com cidades:', safeRepresentatives.filter(rep => rep.cidades_atendidas?.length > 0).length);
  }
  const abortControllerRef = useRef<AbortController | null>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const preloadingStartedRef = useRef<boolean>(false);
  
  // Cache de grupos de cidades para evitar reprocessamento
  const cityGroupsCacheRef = useRef<Map<string, {
    city: string;
    state: string;
    representatives: ComercialRepresentative[];
  }> | null>(null);
  
  const processRepresentatives = useCallback(async (representatives: ComercialRepresentative[]) => {
    // Filtrar apenas representantes ativos
    const activeRepresentatives = representatives.filter(rep => {
      const isActive = rep.status === 'ativo' || rep.status === true || rep.status === 'true';
      const hasState = rep.estado && rep.estado.trim() !== '';
      const hasCities = rep.cidades_atendidas && rep.cidades_atendidas.length > 0;
      
      return isActive && hasState && hasCities;
    });

    // Agrupar por cidade e estado
    const cityGroups = new Map<string, ComercialRepresentative[]>();
    
    activeRepresentatives.forEach(rep => {
      rep.cidades_atendidas.forEach(cidade => {
        // Limpar e padronizar cidade e estado
        const cleanCity = cidade.trim().toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, ''); // Remove acentos
        const cleanState = rep.estado.trim().toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, ''); // Remove acentos
        
        const key = `${cleanCity}_${cleanState}`;
        
        if (!cityGroups.has(key)) {
          cityGroups.set(key, []);
        }
        cityGroups.get(key)!.push(rep);
      });
    });

    // Cache dos grupos para evitar reprocessamento
    cityGroupsCacheRef.current = cityGroups;

    // Processar em lotes maiores para melhor performance
    const BATCH_SIZE = 10; // Aumentado para processar mais cidades por vez
    const cityEntries = Array.from(cityGroups.entries());

    setProgress(0);

    // Processar todos os lotes em paralelo para máxima velocidade
    const allBatches = [];
    for (let i = 0; i < cityEntries.length; i += BATCH_SIZE) {
      const batch = cityEntries.slice(i, i + BATCH_SIZE);
      allBatches.push(batch);
    }

    // Processar todos os lotes simultaneamente
    const batchPromises = allBatches.map(async (batch, batchIndex) => {
      const batchResults = await Promise.all(
        batch.map(async ([key, reps]) => {
          const [cityName, stateName] = key.split('_');
          const originalCity = reps[0].cidades_atendidas.find(c => 
            c.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') === cityName
          ) || cityName;
          const originalState = reps[0].estado;

          try {
            const coordinates = await GeocodingService.getCoordinates(originalCity, originalState);
            
            if (coordinates) {
              return {
                id: key,
                city: originalCity,
                state: originalState,
                latitude: coordinates.latitude,
                longitude: coordinates.longitude,
                representatives: reps
              };
            } else {
              return null;
            }
          } catch (error) {
            return null;
          }
        })
      );

      // Atualizar progresso
      const progressPercent = Math.min(((batchIndex + 1) / allBatches.length) * 100, 100);
      setProgress(progressPercent);

      return batchResults.filter((pin): pin is MapPin => pin !== null);
    });

    // Aguardar todos os lotes e coletar resultados
    const allResults = await Promise.all(batchPromises);
    const finalPins = allResults.flat();
    
    // Atualizar todos os pins de uma vez
    setMapPins(finalPins);
    setProgress(100);
  }, []);

  const loadMapData = useCallback(async () => {
    // Evitar processamento duplicado
    if (isProcessingRef.current) {
      console.log('🗺️ [useMapData] Processamento já em andamento, ignorando...');
      return;
    }
    
    // Verificar se já processamos estes dados
    if (lastProcessedCountRef.current === safeRepresentatives.length && safeRepresentatives.length > 0) {
      console.log('🗺️ [useMapData] Dados já processados, ignorando...');
      return;
    }
    
    console.log('🗺️ [useMapData] loadMapData executado - isLoadingData:', isLoadingData, 'representatives:', representatives?.length, 'safeRepresentatives:', safeRepresentatives.length);
    
    // Aguardar o carregamento dos representantes
    if (isLoadingData) {
      console.log('🗺️ [useMapData] Ainda carregando representantes, aguardando...');
      return;
    }
    
    // Verificar se temos dados válidos
    if (!representatives || representatives.length === 0) {
      console.log('🗺️ [useMapData] Dados de representantes não disponíveis ainda, aguardando...');
      return;
    }
    
    if (safeRepresentatives.length === 0) {
      console.log('🗺️ [useMapData] Nenhum representante encontrado após carregamento completo, saindo...');
      return;
    }
    
    // Marcar como processando
    isProcessingRef.current = true;
    lastProcessedCountRef.current = safeRepresentatives.length;
    
    // Cancelar requisições anteriores
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
      
    console.log('🗺️ [useMapData] Iniciando carregamento dos dados do mapa...');
    setIsLoading(true);
    
    try {
      await processRepresentatives(safeRepresentatives);
    } catch (error) {
      console.error('🗺️ [useMapData] Erro no processamento:', error);
    } finally {
      setIsLoading(false);
      setProgress(0);
      isProcessingRef.current = false;
    }
  }, [safeRepresentatives, representatives, isLoadingData, processRepresentatives]);
  
  useEffect(() => {
    console.log('🗺️ [useMapData] useEffect executado:', {
      isLoadingData,
      representatives: representatives ? 'ARRAY' : 'UNDEFINED', 
      safeRepresentatives: safeRepresentatives.length,
      externalProvided: !!externalRepresentatives
    });

    // Só prosseguir se não estiver carregando E tiver representantes
    if (!isLoadingData && Array.isArray(representatives) && safeRepresentatives.length > 0) {
      console.log('🗺️ [useMapData] Condições atendidas! Iniciando carregamento do mapa com', safeRepresentatives.length, 'representantes');
      loadMapData();
    } else {
      console.log('🗺️ [useMapData] Condições não atendidas ainda, aguardando...', {
        isLoadingData,
        hasRepresentatives: Array.isArray(representatives),
        count: safeRepresentatives.length
      });
    }
  }, [isLoadingData, safeRepresentatives.length, externalRepresentatives]);
  
  return { mapPins, isLoading, progress };
}