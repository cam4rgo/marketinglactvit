
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useFinancialCategories, useCreateCategory, useDeleteCategory, type Category } from '@/hooks/useFinancialCategories';
import { useConfirm } from '@/hooks/use-confirm';
import { toast } from 'sonner';
import { Plus, Trash2, FileText } from 'lucide-react';

const AVAILABLE_COLORS = [
  'bg-blue-500', 'bg-green-500', 'bg-red-500', 'bg-yellow-500', 
  'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500', 
  'bg-orange-500', 'bg-gray-500'
];

export const CategoryManager: React.FC = () => {
  const { data: categories, isLoading } = useFinancialCategories();
  const createCategory = useCreateCategory();
  const deleteCategory = useDeleteCategory();
  const { confirm } = useConfirm();

  const [showForm, setShowForm] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: '',
    color: 'bg-blue-500',
    type: 'expense' as 'expense'
  });

  const handleCreateCategory = () => {
    if (!newCategory.name.trim()) {
      return;
    }
    
    createCategory.mutate(newCategory, {
      onSuccess: () => {
        setNewCategory({ name: '', color: 'bg-blue-500', type: 'expense' });
        setShowForm(false);
      }
    });
  };

  const handleDeleteCategory = async (categoryId: string, categoryName: string) => {
    if (categories && categories.length <= 1) {
      toast.error('Você deve manter pelo menos uma categoria');
      return;
    }
    
    const confirmed = await confirm({
      title: "Excluir categoria",
      description: `Tem certeza que deseja excluir a categoria "${categoryName}"? Esta ação não pode ser desfeita.`,
      variant: "destructive"
    });
    
    if (confirmed) {
      deleteCategory.mutate(categoryId);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-1/3"></div>
            <div className="h-10 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            <div>
              <CardTitle>Gerenciar Categorias</CardTitle>
              <CardDescription>
                Gerencie suas categorias de despesas
              </CardDescription>
            </div>
          </div>
          
          <Dialog open={showForm} onOpenChange={setShowForm}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Nova Categoria
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Nova Categoria</DialogTitle>
                <DialogDescription>
                  Adicione uma nova categoria para organizar suas transações
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="category-name">Nome da Categoria</Label>
                  <Input
                    id="category-name"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Digite o nome da categoria"
                  />
                </div>
                <div>
                  <Label>Cor</Label>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {AVAILABLE_COLORS.map(color => (
                      <button
                        key={color}
                        type="button"
                        className={`w-8 h-8 rounded ${color} ${newCategory.color === color ? 'ring-2 ring-offset-2 ring-primary' : ''}`}
                        onClick={() => setNewCategory(prev => ({ ...prev, color }))}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={handleCreateCategory} 
                    className="flex-1"
                    disabled={createCategory.isPending}
                  >
                    {createCategory.isPending ? 'Criando...' : 'Criar Categoria'}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowForm(false)}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-2">
          {categories?.map(category => (
            <div key={category.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded ${category.color}`} />
                <span className="font-medium">{category.name}</span>
                <Badge variant="secondary">
                  Despesa
                </Badge>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                disabled={categories && categories.length <= 1}
                className="text-white hover:opacity-90"
                style={{ backgroundColor: '#EF4343' }}
                onClick={() => handleDeleteCategory(category.id, category.name)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
