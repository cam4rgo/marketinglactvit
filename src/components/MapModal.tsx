import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Icon, LatLngExpression } from 'leaflet';
import { X, MapPin, Phone, Users } from 'lucide-react';
import { useMapData, MapPin as MapPinType } from '@/hooks/useMapData';
import { ComercialRepresentative } from '@/hooks/useComercialRepresentatives';

interface MapModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Função para criar ícones com logs de debug
function createMapIcons() {
  console.log('🗺️ Criando ícones do mapa...');
  
  const representativeIcon = new Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  const brokerIcon = new Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  console.log('🗺️ Ícones criados com sucesso:', { representativeIcon, brokerIcon });
  
  // Testar se as imagens carregam
  const testImg1 = new Image();
  testImg1.onload = () => console.log('✅ Ícone azul carregado com sucesso');
  testImg1.onerror = () => console.error('❌ Erro ao carregar ícone azul');
  testImg1.src = 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png';
  
  const testImg2 = new Image();
  testImg2.onload = () => console.log('✅ Ícone verde carregado com sucesso');
  testImg2.onerror = () => console.error('❌ Erro ao carregar ícone verde');
  testImg2.src = 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png';
  
  return { representativeIcon, brokerIcon };
}

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

function MapPinPopup({ pin }: { pin: MapPinType }) {
  const brokers = pin.representatives.filter(rep => rep.tipo === 'broker');
  const representatives = pin.representatives.filter(rep => rep.tipo === 'representante');
  
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

export function MapModal({ isOpen, onClose }: MapModalProps) {
  const { mapPins, isLoading, loadingProgress } = useMapData();
  
  // Criar ícones quando o componente renderizar
  const { representativeIcon, brokerIcon } = createMapIcons();
  
  // Debug logs detalhados
  console.log('🗺️ MapModal - isOpen:', isOpen);
  console.log('🗺️ MapModal - isLoading:', isLoading);
  console.log('🗺️ MapModal - mapPins:', mapPins);
  console.log('🗺️ MapModal - mapPins.length:', mapPins.length);
  
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
          <h2 className="text-xl font-bold text-gray-900">Mapa de Representantes</h2>
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
                
                {loadingProgress.total > 0 && (
                  <div className="space-y-3">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                        style={{ width: `${(loadingProgress.current / loadingProgress.total) * 100}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Processando cidades...</span>
                      <span>{loadingProgress.current}/{loadingProgress.total}</span>
                    </div>
                    <p className="text-xs text-gray-500">
                      {Math.round((loadingProgress.current / loadingProgress.total) * 100)}% concluído
                    </p>
                  </div>
                )}
                
                {loadingProgress.total === 0 && (
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
            
            {mapPins.map((pin, index) => {
              const hasBrokers = pin.representatives.some(rep => rep.tipo === 'broker');
              const icon = hasBrokers ? brokerIcon : representativeIcon;
              
              // Validar coordenadas
              const isValidCoordinate = (coord: number) => 
                !isNaN(coord) && isFinite(coord) && coord !== null && coord !== undefined;
              
              const isValidPosition = isValidCoordinate(pin.latitude) && isValidCoordinate(pin.longitude);
              
              // Debug log detalhado para cada pin
              console.log(`🗺️ [PIN ${index + 1}] Renderizando pin:`, {
                id: pin.id,
                city: pin.city,
                state: pin.state,
                latitude: pin.latitude,
                longitude: pin.longitude,
                representatives: pin.representatives.length,
                hasBrokers,
                isValidPosition,
                icon: icon ? 'OK' : 'ERRO',
                iconUrl: icon?.options?.iconUrl,
                position: [pin.latitude, pin.longitude]
              });
              
              // Não renderizar se coordenadas inválidas
              if (!isValidPosition) {
                console.error(`❌ [PIN ${index + 1}] Coordenadas inválidas:`, {
                  latitude: pin.latitude,
                  longitude: pin.longitude
                });
                return null;
              }
              
              return (
                <Marker
                  key={pin.id}
                  position={[pin.latitude, pin.longitude]}
                  icon={icon}
                  eventHandlers={{
                    add: () => console.log(`✅ [PIN ${index + 1}] Marker adicionado ao mapa:`, pin.city),
                    remove: () => console.log(`❌ [PIN ${index + 1}] Marker removido do mapa:`, pin.city)
                  }}
                >
                  <Popup maxWidth={400} className="custom-popup">
                    <MapPinPopup pin={pin} />
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