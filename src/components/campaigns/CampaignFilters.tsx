
import React, { useState } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Search, Filter, X, Calendar, Target, BarChart3, CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { MetaAdsFilters, useMetaCampaigns } from '@/hooks/useMetaAdsData';

interface CampaignFiltersProps {
  filters: MetaAdsFilters;
  onFiltersChange: (filters: MetaAdsFilters) => void;
  selectedCampaignIds?: string[];
  onCampaignSelectionChange?: (campaignIds: string[]) => void;
}

export const CampaignFiltersComponent: React.FC<CampaignFiltersProps> = ({
  filters,
  onFiltersChange,
  selectedCampaignIds = [],
  onCampaignSelectionChange,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFromOpen, setDateFromOpen] = useState(false);
  const [dateToOpen, setDateToOpen] = useState(false);
  const { data: campaigns, isLoading } = useMetaCampaigns();

  const updateFilter = (key: keyof MetaAdsFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange({});
    onCampaignSelectionChange?.([]);
    setSearchTerm('');
  };

  const handleDateChange = (type: 'since' | 'until', date: Date | undefined) => {
    if (!date) return;
    
    const dateString = format(date, 'yyyy-MM-dd');
    updateFilter('time_range', {
      ...filters.time_range,
      [type]: dateString
    });
  };

  const handleCampaignToggle = (campaignId: string, checked: boolean) => {
    if (!onCampaignSelectionChange) return;
    
    if (checked) {
      onCampaignSelectionChange([...selectedCampaignIds, campaignId]);
    } else {
      onCampaignSelectionChange(selectedCampaignIds.filter(id => id !== campaignId));
    }
  };

  const toggleAllCampaigns = () => {
    if (!campaigns || !onCampaignSelectionChange) return;
    
    const filteredCampaigns = campaigns.filter(campaign => 
      campaign.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    if (selectedCampaignIds.length === filteredCampaigns.length) {
      onCampaignSelectionChange([]);
    } else {
      onCampaignSelectionChange(filteredCampaigns.map(c => c.id));
    }
  };

  const hasActiveFilters = Object.keys(filters).some(key => {
    const value = filters[key as keyof MetaAdsFilters];
    return value !== undefined && value !== null;
  }) || selectedCampaignIds.length > 0;

  const filteredCampaigns = campaigns?.filter(campaign => 
    campaign.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'Ativa';
      case 'PAUSED':
        return 'Pausada';
      case 'DELETED':
        return 'Excluída';
      default:
        return status;
    }
  };

  return (
    <div className="rounded-lg border text-card-foreground bg-card border-border shadow-sm">
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="filters" className="border-b-0">
          <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-muted/50">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-primary" />
                <span className="font-semibold">Filtros Meta Ads</span>
                {hasActiveFilters && (
                  <Badge variant="secondary" className="ml-2 bg-primary/10 text-primary border-primary/20">
                    Ativos
                  </Badge>
                )}
              </div>
              {hasActiveFilters && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={(e) => {
                    e.stopPropagation();
                    clearFilters();
                  }}
                  className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 ml-2"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </AccordionTrigger>
          <AccordionContent className="p-6 pt-0">
            <div className="space-y-6">
              {/* Filtros de Data */}
              <div className="space-y-4 mt-6">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  <Label className="font-medium">Período</Label>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Data inicial */}
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground font-medium">Data inicial</Label>
                    <Popover open={dateFromOpen} onOpenChange={setDateFromOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal bg-background border-border text-foreground hover:bg-muted hover:border-primary hover:text-foreground transition-colors",
                            !filters.time_range?.since && "text-muted-foreground hover:text-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                          {filters.time_range?.since ? (
                            format(new Date(filters.time_range.since), "dd/MM/yyyy", { locale: ptBR })
                          ) : (
                            "Selecionar data"
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-popover border-border shadow-lg" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={filters.time_range?.since ? new Date(filters.time_range.since) : undefined}
                          onSelect={(date) => {
                            handleDateChange('since', date);
                            setDateFromOpen(false);
                          }}
                          initialFocus
                          className="bg-popover"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Data final */}
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground font-medium">Data final</Label>
                    <Popover open={dateToOpen} onOpenChange={setDateToOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal bg-background border-border text-foreground hover:bg-muted hover:border-primary hover:text-foreground transition-colors",
                            !filters.time_range?.until && "text-muted-foreground hover:text-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                          {filters.time_range?.until ? (
                            format(new Date(filters.time_range.until), "dd/MM/yyyy", { locale: ptBR })
                          ) : (
                            "Selecionar data"
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-popover border-border shadow-lg" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={filters.time_range?.until ? new Date(filters.time_range.until) : undefined}
                          onSelect={(date) => {
                            handleDateChange('until', date);
                            setDateToOpen(false);
                          }}
                          initialFocus
                          className="bg-popover"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>

              {/* Seleção de Campanhas */}
              {onCampaignSelectionChange && (
                <div className="space-y-4 pt-4">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-primary" />
                    <Label className="font-medium">Campanhas Específicas</Label>
                    {selectedCampaignIds.length > 0 && (
                      <Badge variant="secondary" className="ml-2 bg-primary/10 text-primary border-primary/20">
                        {selectedCampaignIds.length} selecionada{selectedCampaignIds.length !== 1 ? 's' : ''}
                      </Badge>
                    )}
                  </div>
                  
                  {/* Busca de campanhas e botão na mesma linha */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div className="relative md:col-span-2">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        placeholder="Buscar campanhas..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-background border-border focus:border-primary focus:ring-primary"
                      />
                    </div>
                    
                    {filteredCampaigns.length > 0 && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={toggleAllCampaigns}
                        className="text-xs border-border bg-background text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors w-full md:w-auto"
                      >
                        {selectedCampaignIds.length === filteredCampaigns.length ? 'Desmarcar' : 'Selecionar'} Todas
                      </Button>
                    )}
                  </div>

                  {/* Lista de campanhas */}
                  <div className="max-h-48 overflow-y-auto space-y-2 border border-border rounded-md p-3 bg-muted/50">
                    {isLoading ? (
                      <div className="text-sm text-muted-foreground text-center py-4">
                        Carregando campanhas...
                      </div>
                    ) : filteredCampaigns.length === 0 ? (
                      <div className="text-sm text-muted-foreground text-center py-4">
                        {searchTerm ? 'Nenhuma campanha encontrada' : 'Nenhuma campanha disponível'}
                      </div>
                    ) : (
                      filteredCampaigns.map((campaign) => (
                        <div key={campaign.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={campaign.id}
                            checked={selectedCampaignIds.includes(campaign.id)}
                            onCheckedChange={(checked) => 
                              handleCampaignToggle(campaign.id, checked as boolean)
                            }
                          />
                          <Label 
                            htmlFor={campaign.id} 
                            className="text-sm flex-1 cursor-pointer flex items-center justify-between text-card-foreground"
                          >
                            <span>{campaign.name}</span>
                            <Badge 
                              variant={campaign.status === 'ACTIVE' ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {getStatusLabel(campaign.status)}
                            </Badge>
                          </Label>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};
