
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Copy, Check } from 'lucide-react';
import { ComercialRepresentative } from '@/hooks/useComercialRepresentatives';
import { useState } from 'react';
import { toast } from 'sonner';
import { generateWhatsAppLink, formatPhoneNumber } from '@/lib/utils';

interface RepresentativesListProps {
  representatives: ComercialRepresentative[];
  availableStates: string[];
  onEdit: (representative: ComercialRepresentative) => void;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}

export const RepresentativesList: React.FC<RepresentativesListProps> = ({
  representatives,
  onEdit,
  onDelete,
  isDeleting,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  // Using sonner toast

  const copyWhatsAppLink = async (telefone: string, id: string) => {
    try {
      const whatsappLink = generateWhatsAppLink(telefone);
      await navigator.clipboard.writeText(whatsappLink);
      setCopiedId(id);
      toast.success("O link do WhatsApp foi copiado para a área de transferência.");
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      toast.error("Não foi possível copiar o link.");
    }
  };

  if (representatives.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Nenhum representante cadastrado ainda.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {representatives.map((rep) => (
        <div key={rep.id} className="bg-card rounded-lg border p-4 sm:p-6 shadow-sm">
          {/* Header com botões responsivos */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
            <div className="flex-1 min-w-0">
              {/* Badges responsivas */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3">
                <h3 className="text-lg font-semibold truncate">{rep.nome_completo}</h3>
                <div className="flex flex-wrap gap-2">
                  <Badge 
                    variant="outline" 
                    className={
                      rep.tipo === 'representante' 
                        ? "bg-blue-600 text-white hover:bg-blue-700 border-blue-600 text-xs sm:text-sm" 
                        : "bg-purple-600 text-white hover:bg-purple-700 border-purple-600 text-xs sm:text-sm"
                    }
                  >
                    {rep.tipo === 'representante' ? 'Representante' : 'Broker'}
                  </Badge>
                  <Badge 
                    className={
                      rep.status === 'ativo' 
                        ? "bg-green-600 text-white hover:bg-green-700 text-xs sm:text-sm" 
                        : "bg-red-600 text-white hover:bg-red-700 text-xs sm:text-sm"
                    }
                  >
                    {rep.status === 'ativo' ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
              </div>
              
              {/* Grid de informações responsivo */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
                <div>
                  <span className="font-medium text-muted-foreground">Telefone:</span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="truncate">{formatPhoneNumber(rep.telefone)}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyWhatsAppLink(rep.telefone, rep.id)}
                      className="h-6 px-2 flex-shrink-0"
                    >
                      {copiedId === rep.id ? (
                        <Check className="w-3 h-3 text-green-600" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </Button>
                  </div>
                </div>
                
                <div>
                  <span className="font-medium text-muted-foreground">Escritório:</span>
                  <p className="mt-1 truncate">{rep.escritorio}</p>
                </div>
                
                <div>
                  <span className="font-medium text-muted-foreground">Estado:</span>
                  <p className="mt-1">{rep.estado || '-'}</p>
                </div>
                
                <div className="sm:col-span-2">
                  <span className="font-medium text-muted-foreground">Cidades Atendidas:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {rep.cidades_atendidas.map((cidade, index) => (
                      <Badge 
                        key={index} 
                        variant="outline"
                        className="bg-white text-blue-900 border-blue-200 hover:bg-blue-50 text-xs"
                      >
                        {cidade}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Botões de ação responsivos */}
            <div className="flex gap-2 sm:ml-4 sm:flex-col lg:flex-row">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(rep)}
                className="flex-1 sm:flex-none"
              >
                <Edit className="w-4 h-4 sm:mr-0 lg:mr-2" />
                <span className="sm:hidden lg:inline">Editar</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(rep.id)}
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
