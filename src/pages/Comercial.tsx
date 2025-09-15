
import React from 'react';
import { ModuleProtection } from '@/components/auth/ModuleProtection';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Users, Building2, UserCheck, Search, Map } from 'lucide-react';
import { useComercialRepresentatives } from '@/hooks/useComercialRepresentatives';
import { RepresentativeForm } from '@/components/comercial/RepresentativeForm';
import { RepresentativesList } from '@/components/comercial/RepresentativesList';
import { MapModal } from '@/components/MapModal';
import type { ComercialRepresentative } from '@/hooks/useComercialRepresentatives';

export default function Comercial() {
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [isMapOpen, setIsMapOpen] = React.useState(false);
  const [editingRepresentative, setEditingRepresentative] = React.useState<ComercialRepresentative | undefined>();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = React.useState('');

  // Debounce search term
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const {
    representatives,
    availableStates,
    isLoading,
    createRepresentative,
    updateRepresentative,
    deleteRepresentative,
    isCreating,
    isUpdating,
    isDeleting,
    error,
  } = useComercialRepresentatives();

  // Debug: Log current state
  React.useEffect(() => {
    console.log('Estado atual do módulo comercial:', {
      representatives,
      isLoading,
      error,
      availableStates
    });
  }, [representatives, isLoading, error, availableStates]);

  // Filter representatives based on search term
  const filteredRepresentatives = React.useMemo(() => {
    if (!debouncedSearchTerm) return representatives;
    
    const searchLower = debouncedSearchTerm.toLowerCase();
    return representatives.filter(rep => 
      rep.nome_completo.toLowerCase().includes(searchLower) ||
      rep.telefone.toLowerCase().includes(searchLower) ||
      rep.escritorio.toLowerCase().includes(searchLower) ||
      rep.cidades_atendidas.some(cidade => 
        cidade.toLowerCase().includes(searchLower)
      ) ||
      (rep.estado && rep.estado.toLowerCase().includes(searchLower))
    );
  }, [representatives, debouncedSearchTerm]);

  const handleCreateNew = () => {
    console.log('Abrindo formulário para novo representante');
    setEditingRepresentative(undefined);
    setIsFormOpen(true);
  };

  const handleEdit = (representative: ComercialRepresentative) => {
    console.log('Editando representante:', representative);
    setEditingRepresentative(representative);
    setIsFormOpen(true);
  };

  const handleFormSubmit = (data: any) => {
    console.log('Submetendo formulário:', { editingRepresentative, data });
    
    if (editingRepresentative) {
      updateRepresentative({ id: editingRepresentative.id, data });
    } else {
      createRepresentative(data);
    }
    setIsFormOpen(false);
  };

  const handleFormClose = () => {
    console.log('Fechando formulário');
    setIsFormOpen(false);
    setEditingRepresentative(undefined);
  };

  const handleDelete = (id: string) => {
    console.log('Deletando representante:', id);
    if (confirm('Tem certeza que deseja excluir este representante?')) {
      deleteRepresentative(id);
    }
  };

  // Estatísticas
  const activeRepresentatives = representatives.filter(rep => rep.status === 'ativo').length;
  const totalEscritorios = new Set(representatives.map(rep => rep.escritorio)).size;
  const totalRepresentantes = representatives.filter(rep => rep.tipo === 'representante').length;
  const totalBrokers = representatives.filter(rep => rep.tipo === 'broker').length;

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando dados...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    console.error('Erro no módulo comercial:', error);
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-red-600 mb-4">Erro ao carregar representantes</p>
            <p className="text-muted-foreground text-sm">{error.message}</p>
            <Button 
              onClick={() => window.location.reload()} 
              className="mt-4"
              variant="outline"
            >
              Tentar Novamente
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold">Módulo Comercial</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Gerencie representantes e brokers da empresa
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
          <Button 
            onClick={() => setIsMapOpen(true)} 
            variant="outline" 
            className="w-full sm:w-auto"
          >
            <Map className="mr-2 h-4 w-4" />
            Mapa
          </Button>
          <Button onClick={handleCreateNew} className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Novo Cadastro
          </Button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">
              Total Geral
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{representatives.length}</div>
            <p className="text-xs text-muted-foreground">
              Representantes e Brokers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">
              Brokers
            </CardTitle>
            <UserCheck className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{totalBrokers}</div>
            <p className="text-xs text-muted-foreground">
              {totalRepresentantes > 0 && `${totalRepresentantes} Representantes`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">
              Ativos
            </CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{activeRepresentatives}</div>
            <p className="text-xs text-muted-foreground">
              {representatives.length > 0 
                ? `${Math.round((activeRepresentatives / representatives.length) * 100)}% do total`
                : '0% do total'
              }
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">
              Escritórios
            </CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{totalEscritorios}</div>
            <p className="text-xs text-muted-foreground">
              {availableStates.length} estado{availableStates.length !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Representantes */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-1">
              <CardTitle>Representantes e Brokers Cadastrados</CardTitle>
              <CardDescription>
                Visualize e gerencie todos os representantes e brokers cadastrados
              </CardDescription>
            </div>
            <div className="relative w-full lg:w-72">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar por nome, telefone, escritório ou cidade..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <RepresentativesList
            representatives={filteredRepresentatives}
            availableStates={availableStates}
            onEdit={handleEdit}
            onDelete={handleDelete}
            isDeleting={isDeleting}
          />
          {filteredRepresentatives.length === 0 && representatives.length > 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                Nenhum representante encontrado para "{searchTerm}".
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Formulário */}
      <RepresentativeForm
        isOpen={isFormOpen}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        representative={editingRepresentative}
        isLoading={isCreating || isUpdating}
      />
      
      {/* Modal do Mapa */}
      <MapModal
        isOpen={isMapOpen}
        onClose={() => setIsMapOpen(false)}
      />
    </div>
  );
}
