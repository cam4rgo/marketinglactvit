import React, { useMemo, useState, memo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Icon, LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { X, MapPin, Phone, Users } from 'lucide-react';
import { useMapData, MapPin as MapPinType } from '@/hooks/useMapData';
import { ComercialRepresentative } from '@/types/comercial';
import { Progress } from '@/components/ui/progress';

interface MapModalProps {
  isOpen: boolean;
  onClose: () => void;
  representatives?: ComercialRepresentative[];
}

// Ícones otimizados com configuração estática
const ICON_CONFIG = {
  iconSize: [25, 41] as [number, number],
  iconAnchor: [12, 41] as [number, number],
  popupAnchor: [1, -34] as [number, number],
  shadowSize: [41, 41] as [number, number],
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png'
};

function RepresentativeCard({ representative }: { representative: ComercialRepresentative }) {
  return (
    <div className="p-3 border-b border-gray-200 last:border-b-0">
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-semibold text-gray-900">{representative.nome_completo}</h4>
        <span className={`px-2 py-1 text-xs rounded-full ${
          representative.tipo === 'broker' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-blue-100 text-blue-800'
        }`}>
          {representative.tipo === 'broker' ? 'Broker' : 'Representante'}
        </span>
      </div>
      
      <div className="space-y-1 text-sm text-gray-600">
        {representative.telefone && (
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4" />
            <span>{representative.telefone}</span>
          </div>
        )}
        

        
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4" />
          <span>{representative.cidades_atendidas.join(', ')}</span>
        </div>
      </div>
    </div>
  );
}

// Memoizar o componente para evitar re-renders desnecessários
export default memo(MapModal, (prevProps, nextProps) => {
  // Comparar se as props realmente mudaram
  if (prevProps.isOpen !== nextProps.isOpen) return false;
  if (prevProps.onClose !== nextProps.onClose) return false;
  
  // Comparação profunda dos representantes
  if (prevProps.representatives.length !== nextProps.representatives.length) return false;
  
  for (let i = 0; i < prevProps.representatives.length; i++) {
    const prev = prevProps.representatives[i];
    const next = nextProps.representatives[i];
    
    if (prev.id !== next.id || 
        prev.nome_completo !== next.nome_completo ||
        prev.status !== next.status ||
        prev.cidades_atendidas.join(',') !== next.cidades_atendidas.join(',')) {
      return false;
    }
  }
  
  return true; // Props são iguais, não re-renderizar
});

function MapPinPopup({ pin }: { pin: MapPinType }) {
  const activeRepresentatives = useMemo(() => 
    pin.representatives.filter(rep => {
      const isActive = rep.status === 'ativo' || rep.status === true || rep.status === 'true' || rep.ativo === true;
      return isActive;
    }), [pin.representatives]
  );
  
  const brokers = useMemo(() => 
    activeRepresentatives.filter(rep => rep.tipo === 'broker'), [activeRepresentatives]
  );
  
  const representatives = useMemo(() => 
    activeRepresentatives.filter(rep => rep.tipo === 'representante'), [activeRepresentatives]
  );
  
  return (
    <div className="min-w-[300px] max-w-[400px]">
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-200">
        <MapPin className="w-5 h-5 text-blue-600" />
        <div>
          <h3 className="font-bold text-gray-900">{pin.city}</h3>
          <p className="text-sm text-gray-600">{pin.state}</p>
        </div>
      </div>
      
      <div className="max-h-[300px] overflow-y-auto">
        {brokers.length > 0 && (
          <div className="mb-3">
            <h4 className="font-semibold text-green-700 mb-2 flex items-center gap-2">
              <span className="w-3 h-3 bg-green-500 rounded-full"></span>
              Brokers ({brokers.length})
            </h4>
            {brokers.map(broker => (
              <RepresentativeCard key={broker.id} representative={broker} />
            ))}
          </div>
        )}
        
        {representatives.length > 0 && (
          <div>
            <h4 className="font-semibold text-blue-700 mb-2 flex items-center gap-2">
              <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
              Representantes ({representatives.length})
            </h4>
            {representatives.map(rep => (
              <RepresentativeCard key={rep.id} representative={rep} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function MapModal({ isOpen, onClose, representatives }: MapModalProps) {
  console.log('🗺️ [MapModal] Componente renderizado, isOpen:', isOpen);
  
  // Estabilizar referência dos representantes para evitar reinicializações do hook
  const stableRepresentatives = useMemo(() => {
    return representatives || [];
  }, [representatives]);
  
  // Sempre executar useMapData, mas só processar quando necessário
  const { mapPins, isLoading, progress } = useMapData(stableRepresentatives);
  const [openPopupId, setOpenPopupId] = useState<string | null>(null);
  
  console.log('🗺️ [MapModal] Dados do mapa:', { mapPins: mapPins.length, isLoading, progress });
  console.log('🗺️ [MapModal] Modal aberto:', isOpen, 'Pins disponíveis:', mapPins.length > 0 ? 'SIM' : 'NÃO');
  
  // Criar ícones otimizados com useMemo
  const mapIcons = useMemo(() => {
    const representativeIcon = new Icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
      ...ICON_CONFIG
    });

    const brokerIcon = new Icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
      ...ICON_CONFIG
    });

    const mixedIcon = new Icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
      ...ICON_CONFIG
    });

    return { representativeIcon, brokerIcon, mixedIcon };
  }, []);
  
  // Filtrar pins ativos com useMemo para otimização
  const activePins = useMemo(() => {
    return mapPins.filter(pin => {
      // Verificar se há representantes ativos (normalizar diferentes formatos de status)
      const hasActiveRepresentatives = pin.representatives.some(rep => {
        const isActive = rep.status === 'ativo' || rep.status === true || rep.status === 'true' || rep.ativo === true;
        return isActive;
      });
      
      const isValidCoordinate = (coord: number) => 
        !isNaN(coord) && isFinite(coord) && coord !== null && coord !== undefined;
      const isValidPosition = isValidCoordinate(pin.latitude) && isValidCoordinate(pin.longitude);
      

      
      return hasActiveRepresentatives && isValidPosition;
    });
  }, [mapPins]);
  
  if (!isOpen) return null;
  
  // Centro do Brasil (aproximadamente)
  const brazilCenter: LatLngExpression = [-14.2350, -51.9253];
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50" 
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl w-[90vw] h-[80vh] max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex flex-col gap-2">
            <h2 className="text-xl font-bold text-gray-900">Mapa de Representantes</h2>
            {/* Legenda de cores */}
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-gray-600">Representantes</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-gray-600">Brokers</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span className="text-gray-600">Misto</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-600 hover:text-white hover:bg-red-500 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Map Container */}
        <div className="relative h-[calc(100%-4rem)]">
          {isLoading && (
            <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center z-10">
              <div className="text-center bg-white p-6 rounded-lg shadow-lg border max-w-sm w-full mx-4">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Carregando Localizações</h3>
                
                {progress.total > 0 && (
                  <div className="space-y-3">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                        style={{ width: `${(progress.current / progress.total) * 100}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Processando cidades...</span>
                      <span>{progress.current}/{progress.total}</span>
                    </div>
                    <p className="text-xs text-gray-500">
                      {Math.round((progress.current / progress.total) * 100)}% concluído
                    </p>
                  </div>
                )}
                
                {progress.total === 0 && (
                  <p className="text-gray-600">Preparando geocodificação...</p>
                )}
              </div>
            </div>
          )}
          
          <MapContainer
            center={brazilCenter}
            zoom={4}
            className="h-full w-full leaflet-container"
            zoomControl={true}
            scrollWheelZoom={true}
            doubleClickZoom={true}
            dragging={true}
            touchZoom={true}
            boxZoom={true}
            keyboard={true}
            attributionControl={true}
            trackResize={true}
            worldCopyJump={false}
            closePopupOnClick={true}
            bounceAtZoomLimits={true}
            maxBoundsViscosity={1.0}
            inertia={true}
            inertiaDeceleration={3000}
            inertiaMaxSpeed={Infinity}
            easeLinearity={0.2}
            zoomSnap={1}
            zoomDelta={1}
            wheelDebounceTime={40}
            wheelPxPerZoomLevel={60}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {activePins.map((pin) => {
                // Filtrar representantes ativos
                const activeReps = pin.representatives.filter(rep => {
                  const isActive = rep.status === 'ativo' || rep.status === true || rep.status === 'true' || rep.ativo === true;
                  return isActive;
                });
                
                // Contar tipos ativos
                const activeBrokers = activeReps.filter(rep => rep.tipo === 'broker');
                const activeRepresentatives = activeReps.filter(rep => rep.tipo === 'representante');
                
                // Determinar ícone baseado na composição
                let icon;
                if (activeBrokers.length > 0 && activeRepresentatives.length > 0) {
                  // Localização mista: tem tanto brokers quanto representantes
                  icon = mapIcons.mixedIcon;
                } else if (activeBrokers.length > 0) {
                  // Apenas brokers
                  icon = mapIcons.brokerIcon;
                } else {
                  // Apenas representantes (ou tipo não especificado)
                  icon = mapIcons.representativeIcon;
                }
                
                return (
                  <Marker
                    key={pin.id}
                    position={[pin.latitude, pin.longitude]}
                    icon={icon}
                    eventHandlers={{
                      click: () => setOpenPopupId(pin.id)
                    }}
                  >
                    <Popup 
                      maxWidth={400} 
                      className="custom-popup"
                      onClose={() => setOpenPopupId(null)}
                    >
                      {openPopupId === pin.id && <MapPinPopup pin={pin} />}
                    </Popup>
                  </Marker>
                );
              })}
          </MapContainer>
        </div>
      </div>
    </div>
  );
}