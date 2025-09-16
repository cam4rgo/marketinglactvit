import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "sonner";

export const useChangePassword = () => {
  // Using sonner toast

  return useMutation({
    mutationFn: async ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) => {
      // Primeiro, verificar se a senha atual está correta
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) {
        throw new Error('Usuário não autenticado');
      }

      // Tentar fazer login com a senha atual para validá-la
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });

      if (signInError) {
        throw new Error('Senha atual incorreta');
      }

      // Se a senha atual estiver correta, atualizar para a nova senha
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) {
        throw updateError;
      }

      return { success: true };
    },
    onSuccess: () => {
      toast.success("Sua senha foi alterada com sucesso.");
    },
    onError: (error: Error) => {
      console.error('Change password error:', error);
      toast.error(error.message || "Não foi possível alterar a senha.");
    },
  });
};