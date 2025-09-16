import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Copy, Check } from 'lucide-react';
import { SectorResponsible } from '@/types/processing-units';
import { toast } from 'sonner';
import { generateWhatsAppLink, formatPhoneNumber } from '@/lib/utils';

interface SectorResponsiblesListProps {
  responsibles: SectorResponsible[];
  onEdit: (responsible: SectorResponsible) => void;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}

export const SectorResponsiblesList: React.FC<SectorResponsiblesListProps> = ({
  responsibles,
  onEdit,
  onDelete,
  isDeleting,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  // Using sonner toast

  const copyWhatsAppLink = async (whatsapp: string, id: string) => {
    try {
      const whatsappLink = generateWhatsAppLink(whatsapp);
      await navigator.clipboard.writeText(whatsappLink);
      setCopiedId(id);
      toast.success('O link do WhatsApp foi copiado para a área de transferência.');
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      toast.error('Não foi possível copiar o link.');
    }
  };

  if (responsibles.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Nenhum responsável cadastrado ainda.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {responsibles.map((responsible) => (
        <div key={responsible.id} className="bg-card rounded-lg border p-4 sm:p-6 shadow-sm">
          {/* Header com botões responsivos */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
            <div className="flex-1 min-w-0">
              {/* Badges responsivas */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3">
                <h3 className="text-lg font-semibold truncate">{responsible.nome}</h3>
                <div className="flex flex-wrap gap-2">
                  <Badge 
                    variant="outline" 
                    className="bg-purple-600 text-white hover:bg-purple-700 border-purple-600 text-xs sm:text-sm"
                  >
                    {responsible.setor_departamento}
                  </Badge>
                </div>
              </div>
              
              {/* Layout de informações responsivo */}
              <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:gap-4 text-sm">
                <div className="flex-1 min-w-[200px]">
                  <span className="font-medium text-muted-foreground">WhatsApp:</span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="truncate">{formatPhoneNumber(responsible.whatsapp)}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyWhatsAppLink(responsible.whatsapp, responsible.id)}
                      className="h-6 px-2 flex-shrink-0"
                    >
                      {copiedId === responsible.id ? (
                        <Check className="w-3 h-3 text-green-600" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </Button>
                  </div>
                </div>
                
                <div className="flex-1 min-w-[200px]">
                  <span className="font-medium text-muted-foreground">Unidade:</span>
                  <p className="mt-1 truncate">
                    {responsible.processing_unit_id === null 
                      ? 'Todas' 
                      : responsible.processingUnit?.razao_social || 'Unidade não encontrada'
                    }
                  </p>
                </div>
                
                <div className="w-full">
                  <span className="font-medium text-muted-foreground">Setor/Departamento:</span>
                  <p className="mt-1">{responsible.setor_departamento}</p>
                </div>
              </div>
            </div>
            
            {/* Botões de ação responsivos */}
            <div className="flex gap-2 sm:ml-4 sm:flex-col lg:flex-row">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(responsible)}
                className="flex-1 sm:flex-none"
              >
                <Edit className="w-4 h-4 sm:mr-0 lg:mr-2" />
                <span className="sm:hidden lg:inline">Editar</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(responsible.id)}
                disabled={isDeleting}
                className="flex-1 sm:flex-none text-white border-none hover:opacity-90"
                style={{ backgroundColor: '#EF4343' }}
              >
                <Trash2 className="w-4 h-4 sm:mr-0 lg:mr-2" />
                <span className="sm:hidden lg:inline">Excluir</span>
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};