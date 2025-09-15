
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useCompanySettings } from '@/hooks/useCompanySettings';
import { toast } from 'sonner';
import { Loader2, Mail, Lock, Eye, EyeOff, Building2 } from 'lucide-react';
import logoAmarela from '@/assets/logoamarela.webp';

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const { signIn, user } = useAuth();
  const { data: companySettings } = useCompanySettings();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  // Debug: Log da logo amarela importada
  useEffect(() => {
    console.log('Logo amarela importada:', logoAmarela);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error('Por favor, digite seu email');
      return;
    }

    if (!password.trim()) {
      toast.error('Por favor, digite sua senha');
      return;
    }

    if (password.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setIsLoading(true);

    try {
      console.log('Tentando fazer login com:', { email });
      const { data, error } = await signIn(email, password);
      
      if (error) {
        console.error('Erro no login:', error);
        if (error.message?.includes('Invalid login credentials')) {
          toast.error('Email ou senha incorretos');
        } else if (error.message?.includes('Email not confirmed')) {
          toast.error('Por favor, confirme seu email antes de fazer login');
        } else {
          toast.error('Erro ao fazer login. Tente novamente.');
        }
        return;
      }

      if (data?.user) {
        console.log('Login realizado com sucesso:', data.user.email);
        toast.success('Login realizado com sucesso!');
        navigate('/');
      }
    } catch (error) {
      console.error('Erro inesperado no login:', error);
      toast.error('Erro inesperado. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogoError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    console.error('Erro ao carregar logo:', e.currentTarget.src);
    setLogoError(true);
    e.currentTarget.src = logoAmarela;
  };

  const handleLogoLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    console.log('Logo carregada com sucesso:', e.currentTarget.src);
  };

  // Determina qual logo usar - SEMPRE usar logoamarela.webp
  const getLogoSrc = () => {
    return logoAmarela; // Sempre retorna a logo amarela
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo/Header */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <img 
              src={getLogoSrc()}
              alt="Logo da Empresa" 
              className="h-16 w-auto object-contain"
              onError={handleLogoError}
              onLoad={handleLogoLoad}
              style={{
                maxWidth: '200px',
                height: 'auto'
              }}
            />
          </div>
          {/* Título removido conforme solicitado */}
          <p className="mt-2 text-muted-foreground">
            {companySettings?.description || 'Entre com suas credenciais'}
          </p>
        </div>

        {/* Login Form */}
        <Card className="shadow-lg border-border">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center text-card-foreground">Login</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    disabled={isLoading}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  'Entrar'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground">
          <div className="flex items-center justify-center gap-1">
            <Building2 className="w-4 h-4" />
            <span>Marketing Lactvit - Todos os Direitos Reservados</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
