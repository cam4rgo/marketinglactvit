
import React from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { LogOut, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useUserProfile } from '@/hooks/useUserProfile';

export function AppHeader() {
  const { user, signOut } = useAuth();
  const { data: userProfile } = useUserProfile();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Logout realizado com sucesso!');
      navigate('/auth');
    } catch (error) {
      // Mesmo com erro, redireciona para login
      console.warn('Erro no logout, mas redirecionando:', error);
      toast.warning('Logout realizado localmente');
      navigate('/auth');
    }
  };

  // Get user display name prioritizing the userProfile data
  const getUserDisplayName = () => {
    // First check userProfile from database
    if (userProfile?.full_name) {
      return userProfile.full_name;
    }
    
    // Then check user metadata
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name;
    }
    
    // Fallback to email
    return user?.email?.split('@')[0] || 'Usuário';
  };

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />
      
      <div className="flex flex-1 items-center justify-end gap-2">
        {user && (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 text-sm">
              <User className="w-4 h-4" />
              <span className="hidden sm:inline truncate max-w-32">
                {getUserDisplayName()}
              </span>
            </div>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Sair</span>
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
