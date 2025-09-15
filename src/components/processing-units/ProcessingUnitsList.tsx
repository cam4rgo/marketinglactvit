import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import { ProcessingUnit } from '@/types/processing-units';
import { formatCNPJ } from '@/lib/utils';

interface ProcessingUnitsListProps {
  units: ProcessingUnit[];
  onEdit: (unit: ProcessingUnit) => void;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}

export const ProcessingUnitsList: React.FC<ProcessingUnitsListProps> = ({
  units,
  onEdit,
  onDelete,
  isDeleting,
}) => {
  if (units.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Nenhuma unidade cadastrada ainda.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {units.map((unit) => (
        <div key={unit.id} className="bg-card rounded-lg border p-4 sm:p-6 shadow-sm">
          {/* Header com botões responsivos */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
            <div className="flex-1 min-w-0">
              {/* Badges responsivas */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3">
                <h3 className="text-lg font-semibold truncate">{unit.razao_social}</h3>
                <div className="flex flex-wrap gap-2">
                  <Badge 
                    variant="outline" 
                    className={`text-white text-xs sm:text-sm ${
                      unit.tipo === 'Unidade Comercial' 
                        ? 'bg-green-600 hover:bg-green-700 border-green-600'
                        : 'bg-blue-600 hover:bg-blue-700 border-blue-600'
                    }`}
                  >
                    {unit.tipo}
                  </Badge>
                </div>
              </div>
              
              {/* Layout de informações responsivo */}
              <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:gap-4 text-sm">
                <div className="flex-1 min-w-[200px]">
                  <span className="font-medium text-muted-foreground">CNPJ:</span>
                  <p className="mt-1 truncate">{formatCNPJ(unit.cnpj)}</p>
                </div>
                
                <div className="flex-1 min-w-[200px]">
                  <span className="font-medium text-muted-foreground">Email Financeiro:</span>
                  <p className="mt-1 truncate">{unit.email_financeiro}</p>
                </div>
                
                <div className="flex-1 min-w-[200px]">
                  <span className="font-medium text-muted-foreground">Email RH:</span>
                  <p className="mt-1 truncate">{unit.email_rh}</p>
                </div>
                
                <div className="w-full">
                  <span className="font-medium text-muted-foreground">Endereço:</span>
                  <p className="mt-1">{unit.endereco}</p>
                </div>
              </div>
            </div>
            
            {/* Botões de ação responsivos */}
            <div className="flex gap-2 sm:ml-4 sm:flex-col lg:flex-row">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(unit)}
                className="flex-1 sm:flex-none"
              >
                <Edit className="w-4 h-4 sm:mr-0 lg:mr-2" />
                <span className="sm:hidden lg:inline">Editar</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(unit.id)}
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