
import React from "react";
import { useState } from "react";
import { ModuleProtection } from '@/components/auth/ModuleProtection';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TransactionsList } from "@/components/financial/TransactionsList";
import { TransactionForm } from "@/components/financial/TransactionForm";
import { FinancialDashboard } from "@/components/financial/FinancialDashboard";
import { CategoryManager } from "@/components/financial/CategoryManager";
import {
  Plus,
  Receipt,
  Tags,
  BarChart3
} from "lucide-react";
import type { TransactionFilters as HookTransactionFilters } from "@/hooks/useFinancialTransactions";
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface FinancialFilters {
  category?: 'all' | 'meta_ads' | 'google_ads' | 'instagram_ads' | 'content_creation' | 'influencer' | 'design' | 'tools_software' | 'consulting' | 'events' | 'other';
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  status?: 'all' | 'pending' | 'confirmed' | 'cancelled';
}

export default function Financial() {
  const [activeTab, setActiveTab] = useState("dashboard"); // Alterado de "transactions" para "dashboard"
  const [showForm, setShowForm] = useState(false);
  const [filters, setFilters] = useState<FinancialFilters>({
    // Inicializar completamente vazio para evitar filtros ativos desnecessários
  });

  const convertToHookFilters = (filters: FinancialFilters): HookTransactionFilters => {
    return {
      category: filters.category && filters.category !== 'all' ? filters.category : undefined,
      status: filters.status && filters.status !== 'all' ? filters.status : undefined,
      dateFrom: filters.dateFrom || undefined,
      dateTo: filters.dateTo || undefined,
      search: filters.search || undefined
    };
  };

  const handleFiltersChange = (newFilters: FinancialFilters) => {
    setFilters(newFilters);
  };

  return (
    <ModuleProtection moduleId="financial" moduleName="Financeiro">
      <div className="container mx-auto p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
        {/* Header responsivo melhorado */}
        <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:justify-between sm:items-center">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Financeiro</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Gerencie suas transações financeiras e acompanhe o desempenho
            </p>
          </div>
          
          {/* Botão responsivo - removido o botão de exportar PNG */}
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Dialog open={showForm} onOpenChange={setShowForm}>
              <DialogTrigger asChild>
                <Button 
                  size="sm"
                  className="w-full sm:w-auto justify-center sm:justify-start"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Transação
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[95vw] max-w-2xl mx-auto">
                <DialogHeader>
                  <DialogTitle>Nova Transação</DialogTitle>
                </DialogHeader>
                <TransactionForm onClose={() => setShowForm(false)} />
              </DialogContent>
            </Dialog>
          </div>
        </div>
    
        {/* Tabs responsivas melhoradas */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
          <TabsList className="grid w-full grid-cols-3 h-auto">
            <TabsTrigger 
              value="dashboard" 
              className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 sm:py-3 text-xs sm:text-sm"
            >
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger 
              value="transactions" 
              className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 sm:py-3 text-xs sm:text-sm"
            >
              <Receipt className="w-4 h-4" />
              <span className="hidden sm:inline">Transações</span>
            </TabsTrigger>
            <TabsTrigger 
              value="categories" 
              className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 sm:py-3 text-xs sm:text-sm"
            >
              <Tags className="w-4 h-4" />
              <span className="hidden sm:inline">Categorias</span>
            </TabsTrigger>
          </TabsList>
    
          <TabsContent value="dashboard" className="space-y-4 sm:space-y-6">
            <div id="financial-dashboard">
              <FinancialDashboard filters={convertToHookFilters(filters)} />
            </div>
          </TabsContent>
    
          <TabsContent value="transactions" className="space-y-4 sm:space-y-6">
            <TransactionsList 
              filters={convertToHookFilters(filters)}
              onFiltersChange={handleFiltersChange}
            />
          </TabsContent>
    
          <TabsContent value="categories" className="space-y-4 sm:space-y-6">
            <CategoryManager />
          </TabsContent>
        </Tabs>
      </div>
    </ModuleProtection>
  );
}
