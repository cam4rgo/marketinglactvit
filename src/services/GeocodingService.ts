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

// Coordenadas fixas das principais cidades brasileiras como fallback
const FALLBACK_COORDINATES: Record<string, { lat: number; lon: number }> = {
  // Mato Grosso
  'cuiabá_mt': { lat: -15.6014, lon: -56.0979 },
  'várzea grande_mt': { lat: -15.6467, lon: -56.1326 },
  'rondonópolis_mt': { lat: -16.4707, lon: -54.6364 },
  'sinop_mt': { lat: -11.8648, lon: -55.5028 },
  'tangará da serra_mt': { lat: -14.6219, lon: -57.4985 },
  'cáceres_mt': { lat: -16.0735, lon: -57.6815 },
  'barra do garças_mt': { lat: -15.8906, lon: -52.2567 },
  'alta floresta_mt': { lat: -9.8756, lon: -56.0861 },
  'primavera do leste_mt': { lat: -15.5561, lon: -54.2967 },
  'sorriso_mt': { lat: -12.5484, lon: -55.7175 },
  'lucas do rio verde_mt': { lat: -13.0537, lon: -55.9147 },
  'nova mutum_mt': { lat: -13.8311, lon: -56.0764 },
  'campo novo do parecis_mt': { lat: -13.6742, lon: -57.8889 },
  'sapezal_mt': { lat: -13.5464, lon: -58.8069 },
  'itaúba_mt': { lat: -11.0089, lon: -55.2839 },
  'terra nova do norte_mt': { lat: -10.5156, lon: -55.2372 },
  
  // São Paulo
  'são paulo_sp': { lat: -23.5505, lon: -46.6333 },
  'guarulhos_sp': { lat: -23.4538, lon: -46.5333 },
  'campinas_sp': { lat: -22.9099, lon: -47.0626 },
  'são bernardo do campo_sp': { lat: -23.6939, lon: -46.5644 },
  'santo andré_sp': { lat: -23.6633, lon: -46.5307 },
  'osasco_sp': { lat: -23.5329, lon: -46.7918 },
  'ribeirão preto_sp': { lat: -21.1775, lon: -47.8103 },
  'sorocaba_sp': { lat: -23.5015, lon: -47.4526 },
  'santos_sp': { lat: -23.9608, lon: -46.3331 },
  'mauá_sp': { lat: -23.6678, lon: -46.4611 },
  'carapicuíba_sp': { lat: -23.5225, lon: -46.8356 },
  'piracicaba_sp': { lat: -22.7253, lon: -47.6492 },
  'bauru_sp': { lat: -22.3147, lon: -49.0608 },
  'bebedouro_sp': { lat: -20.9492, lon: -48.0981 },
  'itaquaquecetuba_sp': { lat: -23.4864, lon: -46.3481 },
  'franca_sp': { lat: -20.5386, lon: -47.4006 },
  'guarujá_sp': { lat: -23.9939, lon: -46.2564 },
  'taubaté_sp': { lat: -23.0264, lon: -45.5556 },
  'limeira_sp': { lat: -22.5647, lon: -47.4017 },
  'suzano_sp': { lat: -23.5425, lon: -46.3108 },
  'taboão da serra_sp': { lat: -23.6086, lon: -46.7581 },
  'sumaré_sp': { lat: -22.8219, lon: -47.2669 },
  'barueri_sp': { lat: -23.5106, lon: -46.8761 },
  'embu das artes_sp': { lat: -23.6489, lon: -46.8522 },
  'são carlos_sp': { lat: -22.0175, lon: -47.8908 },
  'marília_sp': { lat: -22.2133, lon: -49.9456 },
  'indaiatuba_sp': { lat: -23.0922, lon: -47.2181 },
  'americana_sp': { lat: -22.7394, lon: -47.3314 },
  'araraquara_sp': { lat: -21.7947, lon: -48.1756 },
  'jacareí_sp': { lat: -23.3053, lon: -45.9658 },
  'presidente prudente_sp': { lat: -22.1256, lon: -51.3889 },
  'são vicente_sp': { lat: -23.9633, lon: -46.3922 },
  'hortolândia_sp': { lat: -22.8583, lon: -47.2200 },
  'itapevi_sp': { lat: -23.5489, lon: -46.9342 },
  'itu_sp': { lat: -23.2642, lon: -47.2992 },
  'são caetano do sul_sp': { lat: -23.6236, lon: -46.5547 },
  'cotia_sp': { lat: -23.6039, lon: -46.9189 },
  'itapetininga_sp': { lat: -23.5917, lon: -48.0531 },
  'mogi das cruzes_sp': { lat: -23.5225, lon: -46.1883 },
  'ribeirão pires_sp': { lat: -23.7133, lon: -46.4131 },
  'atibaia_sp': { lat: -23.1169, lon: -46.5500 },
  'francisco morato_sp': { lat: -23.2819, lon: -46.7456 },
  'ferraz de vasconcelos_sp': { lat: -23.5422, lon: -46.3689 },
  'itaquera_sp': { lat: -23.5394, lon: -46.4564 },
  'jandira_sp': { lat: -23.5281, lon: -46.9042 },
  'cajamar_sp': { lat: -23.3553, lon: -46.8764 },
  'franco da rocha_sp': { lat: -23.3281, lon: -46.7281 },
  'itapeva_sp': { lat: -23.9825, lon: -48.8756 },
  'itararé_sp': { lat: -24.1156, lon: -49.3306 },
  'capão bonito_sp': { lat: -24.0058, lon: -48.3497 },
  'taquarivaí_sp': { lat: -24.0331, lon: -48.5131 },
  'buri_sp': { lat: -23.7969, lon: -48.5947 },
  'itaporanga_sp': { lat: -23.7089, lon: -49.4781 },
  'botucatu_sp': { lat: -22.8856, lon: -48.4456 },
  'saltinho_sp': { lat: -22.8478, lon: -47.6781 },
  'são manuel_sp': { lat: -22.7311, lon: -48.5711 },
  
  // Mato Grosso do Sul
  'campo grande_ms': { lat: -20.4697, lon: -54.6201 },
  'dourados_ms': { lat: -22.2211, lon: -54.8056 },
  'três lagoas_ms': { lat: -20.7511, lon: -51.6783 },
  'corumbá_ms': { lat: -19.0078, lon: -57.6547 },
  'ponta porã_ms': { lat: -22.5361, lon: -55.7256 },
  'naviraí_ms': { lat: -23.0647, lon: -54.1906 },
  'nova andradina_ms': { lat: -22.2331, lon: -53.3431 },
  'sidrolândia_ms': { lat: -20.9331, lon: -54.9606 },
  'maracaju_ms': { lat: -21.6131, lon: -55.1681 },
  'aquidauana_ms': { lat: -20.4706, lon: -55.7878 },
  
  // Paraná
  'curitiba_pr': { lat: -25.4284, lon: -49.2733 },
  'londrina_pr': { lat: -23.3045, lon: -51.1696 },
  'maringá_pr': { lat: -23.4205, lon: -51.9331 },
  'ponta grossa_pr': { lat: -25.0950, lon: -50.1619 },
  'cascavel_pr': { lat: -24.9556, lon: -53.4552 },
  'são josé dos pinhais_pr': { lat: -25.5306, lon: -49.2064 },
  'foz do iguaçu_pr': { lat: -25.5478, lon: -54.5881 },
  'colombo_pr': { lat: -25.2919, lon: -49.2244 },
  'guarapuava_pr': { lat: -25.3842, lon: -51.4617 },
  'paranaguá_pr': { lat: -25.5197, lon: -48.5089 },
  
  // Distrito Federal
  'brasília_df': { lat: -15.7942, lon: -47.8822 },
  
  // Rio de Janeiro
  'rio de janeiro_rj': { lat: -22.9068, lon: -43.1729 },
  'são gonçalo_rj': { lat: -22.8267, lon: -43.0531 },
  'duque de caxias_rj': { lat: -22.7856, lon: -43.3117 },
  'nova iguaçu_rj': { lat: -22.7592, lon: -43.4511 },
  'niterói_rj': { lat: -22.8833, lon: -43.1036 },
  'belford roxo_rj': { lat: -22.7642, lon: -43.3997 },
  'são joão de meriti_rj': { lat: -22.8031, lon: -43.3728 },
  'campos dos goytacazes_rj': { lat: -21.7519, lon: -41.3297 },
  'petrópolis_rj': { lat: -22.5053, lon: -43.1781 },
  'volta redonda_rj': { lat: -22.5231, lon: -44.1044 },
  
  // Minas Gerais
  'belo horizonte_mg': { lat: -19.9167, lon: -43.9345 },
  'uberlândia_mg': { lat: -18.9113, lon: -48.2622 },
  'contagem_mg': { lat: -19.9317, lon: -44.0536 },
  'juiz de fora_mg': { lat: -21.7642, lon: -43.3503 },
  'betim_mg': { lat: -19.9678, lon: -44.1983 },
  'montes claros_mg': { lat: -16.7289, lon: -43.8619 },
  'ribeirão das neves_mg': { lat: -19.7667, lon: -44.0867 },
  'uberaba_mg': { lat: -19.7483, lon: -47.9317 },
  'governador valadares_mg': { lat: -18.8511, lon: -41.9494 },
  'ipatinga_mg': { lat: -19.4683, lon: -42.5367 },
  
  // Bahia
  'salvador_ba': { lat: -12.9714, lon: -38.5014 },
  'feira de santana_ba': { lat: -12.2664, lon: -38.9663 },
  'vitória da conquista_ba': { lat: -14.8619, lon: -40.8444 },
  'camaçari_ba': { lat: -12.6997, lon: -38.3244 },
  'juazeiro_ba': { lat: -9.4111, lon: -40.4986 },
  'lauro de freitas_ba': { lat: -12.8944, lon: -38.3225 },
  'itabuna_ba': { lat: -14.7856, lon: -39.2803 },
  'ilhéus_ba': { lat: -14.7889, lon: -39.0397 },
  'jequié_ba': { lat: -13.8578, lon: -40.0831 },
  'teixeira de freitas_ba': { lat: -17.5394, lon: -39.7372 },
  
  // Ceará
  'fortaleza_ce': { lat: -3.7319, lon: -38.5267 },
  'caucaia_ce': { lat: -3.7361, lon: -38.6531 },
  'juazeiro do norte_ce': { lat: -7.2128, lon: -39.3153 },
  'maracanaú_ce': { lat: -3.8769, lon: -38.6256 },
  'sobral_ce': { lat: -3.6861, lon: -40.3497 },
  'crato_ce': { lat: -7.2342, lon: -39.4097 },
  'itapipoca_ce': { lat: -3.4944, lon: -39.5781 },
  'maranguape_ce': { lat: -3.8906, lon: -38.6881 },
  'iguatu_ce': { lat: -6.3597, lon: -39.2986 },
  'canindé_ce': { lat: -4.3578, lon: -39.3119 },
  
  // Pernambuco
  'recife_pe': { lat: -8.0476, lon: -34.8770 },
  'jaboatão dos guararapes_pe': { lat: -8.1128, lon: -35.0147 },
  'olinda_pe': { lat: -8.0089, lon: -34.8553 },
  'caruaru_pe': { lat: -8.2836, lon: -35.9761 },
  'petrolina_pe': { lat: -9.3891, lon: -40.5031 },
  'paulista_pe': { lat: -7.9406, lon: -34.8728 },
  'cabo de santo agostinho_pe': { lat: -8.2114, lon: -35.0347 },
  'camaragibe_pe': { lat: -8.0206, lon: -35.0381 },
  'garanhuns_pe': { lat: -8.8919, lon: -36.4969 },
  'vitória de santo antão_pe': { lat: -8.1181, lon: -35.2919 },
  
  // Goiás
  'goiânia_go': { lat: -16.6869, lon: -49.2648 },
  'aparecida de goiânia_go': { lat: -16.8239, lon: -49.2439 },
  'anápolis_go': { lat: -16.3281, lon: -48.9531 },
  'rio verde_go': { lat: -17.7975, lon: -50.9264 },
  'luziânia_go': { lat: -16.2528, lon: -47.9503 },
  'águas lindas de goiás_go': { lat: -15.7556, lon: -48.2781 },
  'valparaíso de goiás_go': { lat: -16.0631, lon: -47.9831 },
  'trindade_go': { lat: -16.6489, lon: -49.4889 },
  'formosa_go': { lat: -15.5378, lon: -47.3344 },
  'novo gama_go': { lat: -16.0331, lon: -48.0331 },
  
  // Espírito Santo
  'vitória_es': { lat: -20.3155, lon: -40.3128 },
  'vila velha_es': { lat: -20.3297, lon: -40.2925 },
  'serra_es': { lat: -20.1289, lon: -40.3078 },
  'cariacica_es': { lat: -20.2619, lon: -40.4178 },
  'viana_es': { lat: -20.3906, lon: -40.4956 },
  'linhares_es': { lat: -19.3911, lon: -40.0719 },
  'guarapari_es': { lat: -20.6667, lon: -40.4975 },
  'cachoeiro de itapemirim_es': { lat: -20.8489, lon: -41.1128 },
  'são mateus_es': { lat: -18.7167, lon: -39.8597 },
  'colatina_es': { lat: -19.5397, lon: -40.6306 },
  
  // Santa Catarina
  'florianópolis_sc': { lat: -27.5954, lon: -48.5480 },
  'joinville_sc': { lat: -26.3044, lon: -48.8456 },
  'blumenau_sc': { lat: -26.9194, lon: -49.0661 },
  'são josé_sc': { lat: -27.5969, lon: -48.6331 },
  'criciúma_sc': { lat: -28.6778, lon: -49.3697 },
  'chapecó_sc': { lat: -27.1006, lon: -52.6156 },
  'itajaí_sc': { lat: -26.9078, lon: -48.6631 },
  'jaraguá do sul_sc': { lat: -26.4869, lon: -49.0669 },
  'lages_sc': { lat: -27.8167, lon: -50.3264 },
  'palhoça_sc': { lat: -27.6386, lon: -48.6706 },
  
  // Rio Grande do Sul
  'porto alegre_rs': { lat: -30.0346, lon: -51.2177 },
  'caxias do sul_rs': { lat: -29.1678, lon: -51.1794 },
  'pelotas_rs': { lat: -31.7654, lon: -52.3376 },
  'canoas_rs': { lat: -29.9178, lon: -51.1831 },
  'santa maria_rs': { lat: -29.6842, lon: -53.8069 },
  'gravataí_rs': { lat: -29.9428, lon: -50.9928 },
  'viamão_rs': { lat: -30.0811, lon: -51.0233 },
  'novo hamburgo_rs': { lat: -29.6783, lon: -51.1306 },
  'são leopoldo_rs': { lat: -29.7603, lon: -51.1472 },
  'rio grande_rs': { lat: -32.0350, lon: -52.0986 },
  
  // Alagoas
  'maceió_al': { lat: -9.6658, lon: -35.7353 },
  'arapiraca_al': { lat: -9.7519, lon: -36.6611 },
  'rio largo_al': { lat: -9.4775, lon: -35.8539 },
  'palmeira dos índios_al': { lat: -9.4056, lon: -36.6281 },
  'união dos palmares_al': { lat: -9.1656, lon: -36.0256 },
  
  // Sergipe
  'aracaju_se': { lat: -10.9472, lon: -37.0731 },
  'nossa senhora do socorro_se': { lat: -10.8550, lon: -37.1264 },
  'lagarto_se': { lat: -10.9197, lon: -37.6697 },
  'itabaiana_se': { lat: -10.6850, lon: -37.4256 },
  'estância_se': { lat: -11.2656, lon: -37.4381 },
  
  // Paraíba
  'joão pessoa_pb': { lat: -7.1195, lon: -34.8450 },
  'campina grande_pb': { lat: -7.2306, lon: -35.8811 },
  'santa rita_pb': { lat: -7.1139, lon: -34.9781 },
  'patos_pb': { lat: -7.0197, lon: -37.2781 },
  'bayeux_pb': { lat: -7.1256, lon: -34.9331 },
  
  // Rio Grande do Norte
  'natal_rn': { lat: -5.7945, lon: -35.2110 },
  'mossoró_rn': { lat: -5.1875, lon: -37.3439 },
  'parnamirim_rn': { lat: -5.9156, lon: -35.2631 },
  'são gonçalo do amarante_rn': { lat: -5.7906, lon: -35.3281 },
  'macaíba_rn': { lat: -5.8581, lon: -35.3506 },
  
  // Piauí
  'teresina_pi': { lat: -5.0892, lon: -42.8019 },
  'parnaíba_pi': { lat: -2.9056, lon: -41.7769 },
  'picos_pi': { lat: -7.0764, lon: -41.4669 },
  'piripiri_pi': { lat: -4.2719, lon: -41.7781 },
  'floriano_pi': { lat: -6.7656, lon: -43.0231 },
  
  // Maranhão
  'são luís_ma': { lat: -2.5297, lon: -44.3028 },
  'imperatriz_ma': { lat: -5.5264, lon: -47.4919 },
  'são josé de ribamar_ma': { lat: -2.5631, lon: -44.0531 },
  'timon_ma': { lat: -5.0956, lon: -42.8369 },
  'caxias_ma': { lat: -4.8581, lon: -43.3556 },
  
  // Pará
  'belém_pa': { lat: -1.4558, lon: -48.5044 },
  'ananindeua_pa': { lat: -1.3656, lon: -48.3731 },
  'santarém_pa': { lat: -2.4431, lon: -54.7081 },
  'marabá_pa': { lat: -5.3681, lon: -49.1178 },
  'parauapebas_pa': { lat: -6.0675, lon: -49.9022 },
  'castanhal_pa': { lat: -1.2931, lon: -47.9264 },
  'abaetetuba_pa': { lat: -1.7219, lon: -48.8781 },
  'cametá_pa': { lat: -2.2431, lon: -49.4956 },
  'bragança_pa': { lat: -1.0531, lon: -46.7656 },
  'altamira_pa': { lat: -3.2031, lon: -52.2081 },
  
  // Amazonas
  'manaus_am': { lat: -3.1190, lon: -60.0217 },
  'parintins_am': { lat: -2.6281, lon: -56.7356 },
  'itacoatiara_am': { lat: -3.1431, lon: -58.4431 },
  'manacapuru_am': { lat: -3.2981, lon: -60.6206 },
  'coari_am': { lat: -4.0856, lon: -63.1406 },
  
  // Roraima
  'boa vista_rr': { lat: 2.8235, lon: -60.6758 },
  'rorainópolis_rr': { lat: 0.9431, lon: -60.4381 },
  'caracaraí_rr': { lat: 1.8181, lon: -61.1256 },
  
  // Acre
  'rio branco_ac': { lat: -9.9747, lon: -67.8243 },
  'cruzeiro do sul_ac': { lat: -7.6281, lon: -72.6781 },
  'sena madureira_ac': { lat: -9.0656, lon: -68.6581 },
  
  // Rondônia
  'porto velho_ro': { lat: -8.7612, lon: -63.9004 },
  'ji-paraná_ro': { lat: -10.8781, lon: -61.9506 },
  'ariquemes_ro': { lat: -9.9131, lon: -63.0406 },
  'vilhena_ro': { lat: -12.7406, lon: -60.1456 },
  'cacoal_ro': { lat: -11.4381, lon: -61.4431 },
  
  // Amapá
  'macapá_ap': { lat: 0.0389, lon: -51.0664 },
  'santana_ap': { lat: -0.0581, lon: -51.1831 },
  'laranjal do jari_ap': { lat: -0.4656, lon: -52.4831 },
  
  // Tocantins
  'palmas_to': { lat: -10.1689, lon: -48.3317 },
  'araguaína_to': { lat: -7.1906, lon: -48.2072 },
  'gurupi_to': { lat: -11.7281, lon: -49.0681 },
  'porto nacional_to': { lat: -10.7081, lon: -48.4181 },
  'paraíso do tocantins_to': { lat: -10.1756, lon: -48.8831 }
};

export class GeocodingService {
  private static readonly CACHE_KEY = 'geocoding_cache';
  private static readonly CACHE_EXPIRY_DAYS = 30;
  private static readonly REQUEST_TIMEOUT = 6000; // 6 segundos de timeout
  private static readonly MIN_REQUEST_INTERVAL = 400; // 400ms entre requisições para performance máxima
  private static readonly MAX_RETRIES = 1; // Apenas 1 tentativa para velocidade
  private static readonly BASE_DELAY = 400; // 400ms base para backoff
  private static memoryCache = new Map<string, { data: CachedCoordinate; timestamp: number }>();
  private static lastRequestTime = 0;
  private static requestQueue: Array<() => Promise<void>> = [];
  private static isProcessingQueue = false;
  
  static async getCoordinates(city: string, state: string, signal?: AbortSignal): Promise<CachedCoordinate | null> {
    const cacheKey = `${city.toLowerCase().trim()}_${state.toLowerCase().trim()}`;
    
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

    // PRIORIDADE 1: Tentar fallback primeiro para cidades brasileiras conhecidas
    const fallbackResult = this.getFallbackCoordinates(city, state);
    if (fallbackResult) {
      // Salvar nos caches
      this.setCachedCoordinate(cacheKey, fallbackResult);
      this.memoryCache.set(cacheKey, { data: fallbackResult, timestamp: Date.now() });
      return fallbackResult;
    }

    // PRIORIDADE 2: Se não há fallback, tentar busca direta sem fila para melhor performance
    try {
      const result = await this.fetchCoordinatesWithRetry(city, state, signal);
      if (result) {
        return result;
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        throw error;
      }
      // Silenciar erros de API para não poluir o console
    }

    return null;
  }

  private static async processQueue(): Promise<void> {
    if (this.isProcessingQueue || this.requestQueue.length === 0) {
      return;
    }

    this.isProcessingQueue = true;

    while (this.requestQueue.length > 0) {
      const request = this.requestQueue.shift();
      if (request) {
        await this.enforceRateLimit();
        await request();
      }
    }

    this.isProcessingQueue = false;
  }

  private static async enforceRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.MIN_REQUEST_INTERVAL) {
      const delay = this.MIN_REQUEST_INTERVAL - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    this.lastRequestTime = Date.now();
  }

  private static async fetchCoordinatesWithRetry(city: string, state: string, signal?: AbortSignal): Promise<CachedCoordinate | null> {
    const cacheKey = `${city.toLowerCase()}_${state.toLowerCase()}`;
    
    for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {
      try {
        const result = await this.fetchCoordinates(city, state, signal);
        
        if (result) {
          // Salvar nos caches
          this.setCachedCoordinate(cacheKey, result);
          this.memoryCache.set(cacheKey, { data: result, timestamp: Date.now() });
          return result;
        }
        
        // Se não encontrou resultado, tentar fallback
        break;
        
      } catch (error: any) {
        // Se foi abortado, não tentar novamente
        if (error.name === 'AbortError' || signal?.aborted) {
          throw error;
        }
        
        // Para qualquer outro erro, tentar fallback
        console.warn(`Erro na geocodificação para ${city}, ${state}:`, error.message);
        break;
      }
    }
    
    // Tentar usar coordenadas de fallback
    const fallbackResult = this.getFallbackCoordinates(city, state);
    if (fallbackResult) {
      // Salvar nos caches
      this.setCachedCoordinate(cacheKey, fallbackResult);
      this.memoryCache.set(cacheKey, { data: fallbackResult, timestamp: Date.now() });
      console.log(`Usando coordenadas de fallback para ${city}, ${state}`);
      return fallbackResult;
    }
    
    console.warn(`Não foi possível obter coordenadas para ${city}, ${state}`);
    return null;
  }

  private static async fetchCoordinates(city: string, state: string, signal?: AbortSignal): Promise<CachedCoordinate | null> {
    
    // Query única otimizada para máxima velocidade
    const queries = [
      `${city}, ${state}, Brasil`
    ];

    for (const query of queries) {
      
      const controller = new AbortController();
      const combinedSignal = this.combineAbortSignals([signal, controller.signal].filter(Boolean) as AbortSignal[]);
      
      // Timeout da requisição
      const timeoutId = setTimeout(() => controller.abort(), this.REQUEST_TIMEOUT);
      
      try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&countrycodes=br`;
        
        const response = await fetch(url, {
          signal: combinedSignal,
          headers: {
            'User-Agent': 'Marketing LAC App/1.0'
          }
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (data && data.length > 0) {
          const result: CachedCoordinate = {
             latitude: parseFloat(data[0].lat),
             longitude: parseFloat(data[0].lon),
             display_name: data[0].display_name || `${city}, ${state}`,
             cached_at: new Date().toISOString()
           };
          
          return result;
        }
        
      } catch (error: any) {
        clearTimeout(timeoutId);
        
        // Se a requisição foi abortada, parar imediatamente
        if (error.name === 'AbortError' || signal?.aborted) {
          throw error;
        }
        
        // Para outros erros, continuar com a próxima query
        continue;
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
    const MEMORY_CACHE_TTL = 60 * 60 * 1000; // 60 minutos para cache agressivo
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
  
  private static getFallbackCoordinates(city: string, state: string): CachedCoordinate | null {
    const normalizedCity = city.toLowerCase().trim();
    const normalizedState = state.toLowerCase().trim();
    const key = `${normalizedCity}_${normalizedState}`;
    
    const coords = FALLBACK_COORDINATES[key];
    if (coords) {
      return {
        latitude: coords.lat,
        longitude: coords.lon,
        display_name: `${city}, ${state.toUpperCase()}, Brasil`,
        cached_at: new Date().toISOString()
      };
    }
    
    return null;
  }
  
  static clearMemoryCache(): void {
    this.memoryCache.clear();
  }
  
  /**
   * Método público para verificar se uma cidade já está em cache
   * Usado pelo PreloadingService para otimizar o pré-carregamento
   */
  static getCachedCoordinates(city: string, state: string = 'Brasil'): CachedCoordinate | null {
    const cacheKey = `${city.toLowerCase()}_${state.toLowerCase()}`;
    
    // Verificar cache em memória primeiro
    const memoryCache = this.memoryCache.get(cacheKey);
    if (memoryCache && !this.isMemoryCacheExpired(memoryCache.timestamp)) {
      return memoryCache.data;
    }
    
    // Verificar cache local
    const cached = this.getCachedCoordinate(cacheKey);
    if (cached && !this.isCacheExpired(cached.cached_at)) {
      // Adicionar ao cache em memória
      this.memoryCache.set(cacheKey, { data: cached, timestamp: Date.now() });
      return cached;
    }
    
    return null;
  }
}

export type { CachedCoordinate, GeocodingResult };