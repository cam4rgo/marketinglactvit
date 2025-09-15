
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { TransactionForm } from './TransactionForm';
import { TransactionFilters as FilterComponent } from './TransactionFilters';
import { useFinancialTransactions, useDeleteTransaction, type Transaction } from '@/hooks/useFinancialTransactions';
import { useFinancialCategories } from '@/hooks/useFinancialCategories';
import { statusOptions } from './TransactionFilters';
import {
  FileText,
  Edit,
  Pencil,
  Trash2,
  AlertCircle,
  Tag,
  Calendar,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import type { TransactionFilters } from '@/hooks/useFinancialTransactions';

interface TransactionsListProps {
  filters?: TransactionFilters;
  onFiltersChange?: (filters: TransactionFilters) => void;
}

export const TransactionsList = ({ filters, onFiltersChange }: TransactionsListProps) => {
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  
  const { data: transactions = [], isLoading, error } = useFinancialTransactions(filters);
  const { data: categories = [] } = useFinancialCategories();
  const deleteTransactionMutation = useDeleteTransaction();

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta transação?')) {
      try {
        await deleteTransactionMutation.mutateAsync(id);
      } catch (error) {
        console.error('Erro ao excluir transação:', error);
      }
    }
  };

  const getCategoryLabel = (categoryId: string) => {
    if (!categories) return categoryId;
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : categoryId;
  };

  const getCategoryBadge = (categoryId: string) => {
    if (!categories) return categoryId;
    const category = categories.find(cat => cat.id === categoryId);
    
    if (!category) {
      return (
        <Badge variant="outline" className="gap-1">
          {categoryId}
        </Badge>
      );
    }

    return (
      <Badge 
        variant="outline" 
        className={`gap-1 border-transparent text-white ${category.color}`}
      >
        {category.name}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const getStatusIcon = (status: string) => {
      switch (status) {
        case 'pending':
          return <Clock className="w-3 h-3" />;
        case 'confirmed':
          return <CheckCircle className="w-3 h-3" />;
        case 'cancelled':
          return <XCircle className="w-3 h-3" />;
        default:
          return <Clock className="w-3 h-3" />;
      }
    };

    const getStatusColor = (status: string) => {
      switch (status) {
        case 'pending':
          return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        case 'confirmed':
          return 'bg-green-100 text-green-800 border-green-200';
        case 'cancelled':
          return 'bg-red-100 text-red-800 border-red-200';
        default:
          return 'bg-gray-100 text-gray-800 border-gray-200';
      }
    };

    const getStatusLabel = (status: string) => {
      switch (status) {
        case 'pending':
          return 'Pendente';
        case 'confirmed':
          return 'Confirmado';
        case 'cancelled':
          return 'Cancelado';
        default:
          return status;
      }
    };

    return (
      <Badge className={`${getStatusColor(status)} inline-flex items-center justify-center gap-1 px-2 py-1 text-xs font-medium min-w-[90px] h-6`}>
        {getStatusIcon(status)}
        {getStatusLabel(status)}
      </Badge>
    );
  };

  const handleSearchChange = (value: string) => {
// Remove setSearchTerm since it's not defined and not needed
// The search term is handled through filters
    if (onFiltersChange) {
      const newFilters = { ...filters };
      if (value.trim()) {
        newFilters.search = value;
      } else {
        delete newFilters.search;
      }
      onFiltersChange(newFilters);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Carregando transações...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertCircle className="w-5 h-5" />
            Erro ao carregar transações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Ocorreu um erro ao carregar as transações. Tente recarregar a página.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="space-y-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Lista de Transações ({transactions.length})
          </CardTitle>
        </div>

        {/* Componente de Filtros */}
        {onFiltersChange && (
          <FilterComponent 
            filters={filters || {}} 
            onFiltersChange={onFiltersChange} 
          />
        )}
      </CardHeader>

      <CardContent>
        {transactions.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">
              Nenhuma transação encontrada
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {Object.keys(filters || {}).length > 0 
                ? "Tente ajustar os filtros para encontrar transações."
                : "Comece adicionando sua primeira transação."
              }
            </p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-medium">
                      {transaction.description}
                    </TableCell>
                    <TableCell>
                      {getCategoryBadge(transaction.category)}
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">
                        R$ {transaction.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(transaction.status)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        {format(new Date(transaction.transaction_date), 'dd/MM/yyyy')}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(transaction)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(transaction.id)}
                          className="h-8 w-8 p-0 text-white hover:opacity-90"
                          style={{ backgroundColor: '#EF4343' }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      {/* Dialog de Edição */}
      <Dialog open={!!editingTransaction} onOpenChange={() => setEditingTransaction(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Transação</DialogTitle>
          </DialogHeader>
          {editingTransaction && (
            <TransactionForm
              transaction={editingTransaction}
              onClose={() => setEditingTransaction(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
};
