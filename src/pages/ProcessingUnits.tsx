import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Building2, Users, Search, Factory } from 'lucide-react';
import { useProcessingUnits } from '@/hooks/useProcessingUnits';
import { useSectorResponsibles } from '@/hooks/useSectorResponsibles';
import { ProcessingUnitForm } from '@/components/processing-units/ProcessingUnitForm';
import { ProcessingUnitsList } from '@/components/processing-units/ProcessingUnitsList';
import { SectorResponsibleForm } from '@/components/processing-units/SectorResponsibleForm';
import { SectorResponsiblesList } from '@/components/processing-units/SectorResponsiblesList';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useConfirm } from '@/hooks/use-confirm';
import type { ProcessingUnit, SectorResponsible } from '@/types/processing-units';

export default function ProcessingUnits() {
  const [activeTab, setActiveTab] = React.useState('units');
  const [isUnitFormOpen, setIsUnitFormOpen] = React.useState(false);
  const [isResponsibleFormOpen, setIsResponsibleFormOpen] = React.useState(false);
  const [editingUnit, setEditingUnit] = React.useState<ProcessingUnit | undefined>();
  const [editingResponsible, setEditingResponsible] = React.useState<SectorResponsible | undefined>();
  const [unitsSearchTerm, setUnitsSearchTerm] = React.useState('');
  const [responsiblesSearchTerm, setResponsiblesSearchTerm] = React.useState('');
  const [debouncedUnitsSearchTerm, setDebouncedUnitsSearchTerm] = React.useState('');
  const [debouncedResponsiblesSearchTerm, setDebouncedResponsiblesSearchTerm] = React.useState('');
  const { confirm: confirmAction, confirmState } = useConfirm();

  // Debounce search terms
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedUnitsSearchTerm(unitsSearchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [unitsSearchTerm]);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedResponsiblesSearchTerm(responsiblesSearchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [responsiblesSearchTerm]);

  const {
    processingUnits: units,
    isLoading: isLoadingUnits,
    createProcessingUnit: createUnit,
    updateProcessingUnit: updateUnit,
    deleteProcessingUnit: deleteUnit,
    isCreating: isCreatingUnit,
    isUpdating: isUpdatingUnit,
    isDeleting: isDeletingUnit,
    error: unitsError,
  } = useProcessingUnits();

  const {
    sectorResponsibles: responsibles,
    isLoading: isLoadingResponsibles,
    createSectorResponsible: createResponsible,
    updateSectorResponsible: updateResponsible,
    deleteSectorResponsible: deleteResponsible,
    isCreating: isCreatingResponsible,
    isUpdating: isUpdatingResponsible,
    isDeleting: isDeletingResponsible,
    error: responsiblesError,
  } = useSectorResponsibles();

  // Filter units based on search term
  const filteredUnits = React.useMemo(() => {
    if (!units) return [];
    if (!debouncedUnitsSearchTerm) return units;
    
    const searchLower = debouncedUnitsSearchTerm.toLowerCase();
    return units.filter(unit => 
      unit.razao_social.toLowerCase().includes(searchLower) ||
      unit.cnpj.toLowerCase().includes(searchLower) ||
      unit.email_financeiro.toLowerCase().includes(searchLower) ||
      unit.email_rh.toLowerCase().includes(searchLower) ||
      unit.endereco.toLowerCase().includes(searchLower)
    );
  }, [units, debouncedUnitsSearchTerm]);

  // Filter responsibles based on search term
  const filteredResponsibles = React.useMemo(() => {
    if (!responsibles) return [];
    if (!debouncedResponsiblesSearchTerm) return responsibles;
    
    const searchLower = debouncedResponsiblesSearchTerm.toLowerCase();
    return responsibles.filter(responsible => 
      responsible.nome.toLowerCase().includes(searchLower) ||
      responsible.setor_departamento.toLowerCase().includes(searchLower) ||
      responsible.whatsapp.toLowerCase().includes(searchLower) ||
      (responsible.processingUnit?.razao_social || '').toLowerCase().includes(searchLower)
    );
  }, [responsibles, debouncedResponsiblesSearchTerm]);

  // Unit handlers
  const handleCreateNewUnit = () => {
    setEditingUnit(undefined);
    setIsUnitFormOpen(true);
  };

  const handleEditUnit = (unit: ProcessingUnit) => {
    setEditingUnit(unit);
    setIsUnitFormOpen(true);
  };

  const handleUnitFormSubmit = (data: any) => {
    // Log para debug - verificar dados recebidos do formulário
    console.log('🔍 ProcessingUnits - Dados recebidos do formulário:', data);
    console.log('🔍 ProcessingUnits - Editando unidade:', editingUnit);
    
    if (editingUnit) {
      console.log('🔍 ProcessingUnits - Chamando updateUnit com:', { id: editingUnit.id, data });
      updateUnit({ id: editingUnit.id, data });
    } else {
      console.log('🔍 ProcessingUnits - Chamando createUnit com:', data);
      createUnit(data);
    }
    setIsUnitFormOpen(false);
  };

  const handleUnitFormClose = () => {
    setIsUnitFormOpen(false);
    setEditingUnit(undefined);
  };

  const handleDeleteUnit = async (id: string) => {
    const confirmed = await confirmAction({
      title: 'Excluir Unidade',
      description: 'Tem certeza que deseja excluir esta unidade? Esta ação não pode ser desfeita.',
      confirmText: 'Excluir',
      cancelText: 'Cancelar',
      variant: 'destructive'
    });
    
    if (confirmed) {
      deleteUnit(id);
    }
  };

  // Responsible handlers
  const handleCreateNewResponsible = () => {
    setEditingResponsible(undefined);
    setIsResponsibleFormOpen(true);
  };

  const handleEditResponsible = (responsible: SectorResponsible) => {
    setEditingResponsible(responsible);
    setIsResponsibleFormOpen(true);
  };

  const handleResponsibleFormSubmit = (data: any) => {
    if (editingResponsible) {
      updateResponsible({ id: editingResponsible.id, data });
    } else {
      createResponsible(data);
    }
    setIsResponsibleFormOpen(false);
  };

  const handleResponsibleFormClose = () => {
    setIsResponsibleFormOpen(false);
    setEditingResponsible(undefined);
  };

  const handleDeleteResponsible = async (id: string) => {
    const confirmed = await confirmAction({
      title: 'Excluir Responsável',
      description: 'Tem certeza que deseja excluir este responsável? Esta ação não pode ser desfeita.',
      confirmText: 'Excluir',
      cancelText: 'Cancelar',
      variant: 'destructive'
    });
    
    if (confirmed) {
      deleteResponsible(id);
    }
  };

  // Statistics
  const totalUnits = units?.length || 0;
  const totalResponsibles = responsibles?.length || 0;
  const totalSectors = new Set(responsibles?.map(r => r.setor_departamento) || []).size;
  const unitsWithResponsibles = new Set(responsibles?.map(r => r.processing_unit_id) || []).size;

  const isLoading = isLoadingUnits || isLoadingResponsibles;
  const error = unitsError || responsiblesError;

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
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-red-600 mb-4">Erro ao carregar dados</p>
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
          <h1 className="text-2xl sm:text-3xl font-bold">Unidades</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Gerencie unidades e responsáveis dos setores
          </p>
        </div>
      </div>

      {/* Statistics */}
      <div className="flex flex-wrap gap-4">
        <Card className="flex-1 min-w-[200px] sm:min-w-[250px]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">
              Unidades
            </CardTitle>
            <Factory className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{totalUnits}</div>
            <p className="text-xs text-muted-foreground">
              Unidades cadastradas
            </p>
          </CardContent>
        </Card>

        <Card className="flex-1 min-w-[200px] sm:min-w-[250px]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">
              Responsáveis
            </CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{totalResponsibles}</div>
            <p className="text-xs text-muted-foreground">
              Responsáveis cadastrados
            </p>
          </CardContent>
        </Card>

        <Card className="flex-1 min-w-[200px] sm:min-w-[250px]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">
              Setores
            </CardTitle>
            <Building2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{totalSectors}</div>
            <p className="text-xs text-muted-foreground">
              Setores diferentes
            </p>
          </CardContent>
        </Card>

        <Card className="flex-1 min-w-[200px] sm:min-w-[250px]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">
              Cobertura
            </CardTitle>
            <Building2 className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{unitsWithResponsibles}</div>
            <p className="text-xs text-muted-foreground">
              {totalUnits > 0 
                ? `${Math.round((unitsWithResponsibles / totalUnits) * 100)}% das unidades`
                : '0% das unidades'
              }
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="units">Unidades</TabsTrigger>
          <TabsTrigger value="responsibles">
            <span className="hidden sm:inline">Responsáveis dos Setores</span>
            <span className="sm:hidden">Responsáveis</span>
          </TabsTrigger>
        </TabsList>

        {/* Units Tab */}
        <TabsContent value="units" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-1">
                  <CardTitle>Unidades</CardTitle>
                  <CardDescription>
                    Visualize e gerencie todas as unidades cadastradas
                  </CardDescription>
                </div>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                  <div className="relative w-full lg:w-72">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Buscar por razão social, CNPJ ou email..."
                      value={unitsSearchTerm}
                      onChange={(e) => setUnitsSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Button onClick={handleCreateNewUnit} className="w-full lg:w-auto">
                    <Plus className="mr-2 h-4 w-4" />
                    Nova Unidade
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ProcessingUnitsList
                units={filteredUnits}
                onEdit={handleEditUnit}
                onDelete={handleDeleteUnit}
                isDeleting={isDeletingUnit}
              />
              {filteredUnits.length === 0 && units.length > 0 && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    Nenhuma unidade encontrada para "{unitsSearchTerm}".
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Responsibles Tab */}
        <TabsContent value="responsibles" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-1">
                  <CardTitle>Responsáveis dos Setores</CardTitle>
                  <CardDescription>
                    Visualize e gerencie todos os responsáveis dos setores cadastrados
                  </CardDescription>
                </div>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                  <div className="relative w-full lg:w-72">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Buscar por nome, setor ou unidade..."
                      value={responsiblesSearchTerm}
                      onChange={(e) => setResponsiblesSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Button onClick={handleCreateNewResponsible} className="w-full lg:w-auto">
                    <Plus className="mr-2 h-4 w-4" />
                    Novo Responsável
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <SectorResponsiblesList
                responsibles={filteredResponsibles}
                onEdit={handleEditResponsible}
                onDelete={handleDeleteResponsible}
                isDeleting={isDeletingResponsible}
              />
              {filteredResponsibles.length === 0 && responsibles.length > 0 && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    Nenhum responsável encontrado para "{responsiblesSearchTerm}".
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Forms */}
      <ProcessingUnitForm
        isOpen={isUnitFormOpen}
        onClose={handleUnitFormClose}
        onSubmit={handleUnitFormSubmit}
        processingUnit={editingUnit}
        isLoading={isCreatingUnit || isUpdatingUnit}
      />

      <SectorResponsibleForm
        isOpen={isResponsibleFormOpen}
        onClose={handleResponsibleFormClose}
        onSubmit={handleResponsibleFormSubmit}
        responsible={editingResponsible}
        processingUnits={units}
        isLoading={isCreatingResponsible || isUpdatingResponsible}
      />

      <ConfirmDialog
        open={confirmState.open}
        onOpenChange={confirmState.onOpenChange}
        title={confirmState.title}
        description={confirmState.description}
        confirmText={confirmState.confirmText}
        cancelText={confirmState.cancelText}
        variant={confirmState.variant}
        onConfirm={confirmState.onConfirm}
        onCancel={confirmState.onCancel}
      />
    </div>
  );
}