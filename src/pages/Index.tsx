
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { CreditCard, BarChart3, CheckSquare } from 'lucide-react';

export default function Index() {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Bem-vindo ao Sistema</CardTitle>
            <CardDescription>
              Faça login para acessar o sistema de marketing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/auth')} className="w-full">
              Fazer Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const quickActions = [
    {
      title: 'Financeiro',
      description: 'Gerencie suas transações financeiras',
      icon: CreditCard,
      path: '/financial',
      color: 'text-green-600'
    },
    {
      title: 'Campanhas',
      description: 'Acompanhe suas campanhas de marketing',
      icon: BarChart3,
      path: '/campaigns',
      color: 'text-blue-600'
    },

    {
      title: 'Aprovações',
      description: 'Gerencie aprovações de posts',
      icon: CheckSquare,
      path: '/approvals',
      color: 'text-orange-600'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Bem-vindo de volta! Aqui está o resumo do seu sistema.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {quickActions.map((action) => (
          <Card key={action.path} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate(action.path)}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {action.title}
              </CardTitle>
              <action.icon className={`h-4 w-4 ${action.color}`} />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                {action.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Acesso Rápido</CardTitle>
          <CardDescription>
            Navegue rapidamente para as principais funcionalidades
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-2 md:grid-cols-2">
          <Button variant="outline" onClick={() => navigate('/financial')} className="justify-start">
            <CreditCard className="mr-2 h-4 w-4" />
            Nova Transação
          </Button>
          <Button variant="outline" onClick={() => navigate('/approvals')} className="justify-start">
            <CheckSquare className="mr-2 h-4 w-4" />
            Criar Post
          </Button>
          <Button variant="outline" onClick={() => navigate('/campaigns')} className="justify-start">
            <BarChart3 className="mr-2 h-4 w-4" />
            Nova Campanha
          </Button>
          <Button variant="outline" onClick={() => navigate('/settings')} className="justify-start">
            <CheckSquare className="mr-2 h-4 w-4" />
            Configurações
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
