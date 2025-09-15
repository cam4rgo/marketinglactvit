import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Building2, User, Upload, Save, Loader2, Lock, Eye, EyeOff } from "lucide-react";
import { useCompanySettings, useUpdateCompanySettings } from "@/hooks/useCompanySettings";
import { useUserProfile, useUpdateUserProfile } from "@/hooks/useUserProfile";
import { useFileUpload } from "@/hooks/useFileUpload";
import { useUserRole } from "@/hooks/useUserRole";
import { useChangePassword } from "@/hooks/useChangePassword";
import React from 'react';
import { ModuleProtection } from '@/components/auth/ModuleProtection';


export default function Settings() {
  // Company Settings
  const { data: companySettings, isLoading: isLoadingCompany } = useCompanySettings();
  const updateCompanyMutation = useUpdateCompanySettings();
  
  // User Profile
  const { data: userProfile, isLoading: isLoadingUser } = useUserProfile();
  const updateUserMutation = useUpdateUserProfile();
  
  // User Role
  const { data: userRole } = useUserRole();
  
  // File Upload
  const { uploadFile, isUploading } = useFileUpload();

  // Check if user should only see profile tab (for viewer and user roles)
  // Admins should see both tabs, so showOnlyProfile should be false for them
  const showOnlyProfile = userRole === 'viewer' || userRole === 'user';
  
  // For better clarity, let's also add a check for admin access
  const isAdmin = userRole === 'admin';
  
  // Company Settings State
  const [companyForm, setCompanyForm] = useState({
    company_name: '',
    description: '',
    logo_url: ''
  });

  // User Profile State
  const [userForm, setUserForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    avatar_url: ''
  });

  // Password Change State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  
  // Password Change Hook
  const changePasswordMutation = useChangePassword();

  // Update forms when data loads
  useEffect(() => {
    if (companySettings) {
      setCompanyForm({
        company_name: companySettings.company_name || '',
        description: companySettings.description || '',
        logo_url: companySettings.logo_url || ''
      });
    }
  }, [companySettings]);

  useEffect(() => {
    if (userProfile) {
      setUserForm({
        full_name: userProfile.full_name || '',
        email: userProfile.email || '',
        phone: userProfile.phone || '',
        avatar_url: userProfile.avatar_url || ''
      });
    }
  }, [userProfile]);

  // Save Company Settings
  const handleSaveCompanySettings = async () => {
    await updateCompanyMutation.mutateAsync(companyForm);
  };

  // Save User Profile
  const handleSaveUserProfile = async () => {
    await updateUserMutation.mutateAsync(userForm);
  };

  // Change Password
  const handleChangePassword = async () => {
    if (!passwordForm.currentPassword.trim()) {
      return;
    }
    
    if (passwordForm.newPassword.length < 6) {
      return;
    }
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return;
    }
    
    await changePasswordMutation.mutateAsync({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword
    });
    
    // Limpar formulário após sucesso
    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  // Handle file upload for company logo
  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const logoUrl = await uploadFile(file, 'profile-images', `company-logo.${file.name.split('.').pop()}`);
      setCompanyForm(prev => ({ ...prev, logo_url: logoUrl }));
    } catch (error) {
      console.error('Error uploading logo:', error);
    }
  };

  // Handle file upload for user avatar
  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const avatarUrl = await uploadFile(file, 'profile-images', `avatar.${file.name.split('.').pop()}`);
      setUserForm(prev => ({ ...prev, avatar_url: avatarUrl }));
    } catch (error) {
      console.error('Error uploading avatar:', error);
    }
  };

  if (isLoadingCompany || isLoadingUser) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  // Para administradores, não controlamos o valor da aba ativa
  // Para outros usuários, forçamos a aba "profile"
  const tabsProps = showOnlyProfile 
    ? { value: "profile", defaultValue: "profile" } 
    : { defaultValue: "company" };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground">
          Gerencie as configurações do sistema e seu perfil
        </p>
      </div>

      <Tabs {...tabsProps} className="space-y-4">
        <TabsList>
          {/* Show Company tab for admins */}
          {!showOnlyProfile && (
            <TabsTrigger value="company" className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Empresa
            </TabsTrigger>
          )}
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Perfil do Usuário
          </TabsTrigger>
        </TabsList>

        {/* Company Settings - Only for admin users */}
        {!showOnlyProfile && (
          <TabsContent value="company">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Configurações da Empresa
                </CardTitle>
                <CardDescription>
                  Configure as informações da sua empresa que aparecerão no sistema
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Logo Upload */}
                <div className="space-y-2">
                  <Label>Logo da Empresa</Label>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 border-2 border-dashed border-muted-foreground/25 rounded-lg flex items-center justify-center overflow-hidden">
                      {companyForm.logo_url ? (
                        <img
                          src={companyForm.logo_url}
                          alt="Logo da empresa"
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <Building2 className="w-8 h-8 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                        id="logo-upload"
                        disabled={isUploading}
                      />
                      <Button
                        variant="outline"
                        onClick={() => document.getElementById('logo-upload')?.click()}
                        disabled={isUploading}
                      >
                        {isUploading ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Upload className="w-4 h-4 mr-2" />
                        )}
                        {isUploading ? 'Enviando...' : 'Alterar Logo'}
                      </Button>
                      <p className="text-xs text-muted-foreground mt-1">
                        Recomendado: 256x256px, formato PNG ou JPG
                      </p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Company Name */}
                <div className="space-y-2">
                  <Label htmlFor="company-name">Nome da Empresa</Label>
                  <Input
                    id="company-name"
                    value={companyForm.company_name}
                    onChange={(e) => setCompanyForm(prev => ({
                      ...prev,
                      company_name: e.target.value
                    }))}
                    placeholder="Digite o nome da empresa"
                  />
                </div>

                {/* Company Description */}
                <div className="space-y-2">
                  <Label htmlFor="company-description">Descrição</Label>
                  <Input
                    id="company-description"
                    value={companyForm.description}
                    onChange={(e) => setCompanyForm(prev => ({
                      ...prev,
                      description: e.target.value
                    }))}
                    placeholder="Digite a descrição da empresa"
                  />
                  <p className="text-xs text-muted-foreground">
                    Esta descrição aparecerá abaixo do nome da empresa na sidebar
                  </p>
                </div>

                <div className="flex justify-end">
                  <Button 
                    onClick={handleSaveCompanySettings}
                    disabled={updateCompanyMutation.isPending}
                  >
                    {updateCompanyMutation.isPending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    {updateCompanyMutation.isPending ? 'Salvando...' : 'Salvar Configurações'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* User Profile */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Perfil do Usuário
              </CardTitle>
              <CardDescription>
                Gerencie suas informações pessoais e preferências
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar Upload */}
              <div className="space-y-2">
                <Label>Foto do Perfil</Label>
                <div className="flex items-center gap-4">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={userForm.avatar_url} />
                    <AvatarFallback>
                      <User className="w-8 h-8" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                      id="avatar-upload"
                      disabled={isUploading}
                    />
                    <Button
                      variant="outline"
                      onClick={() => document.getElementById('avatar-upload')?.click()}
                      disabled={isUploading}
                    >
                      {isUploading ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Upload className="w-4 h-4 mr-2" />
                      )}
                      {isUploading ? 'Enviando...' : 'Alterar Foto'}
                    </Button>
                    <p className="text-xs text-muted-foreground mt-1">
                      Recomendado: 256x256px, formato PNG ou JPG
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* User Information */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="user-name">Nome Completo</Label>
                  <Input
                    id="user-name"
                    value={userForm.full_name}
                    onChange={(e) => setUserForm(prev => ({
                      ...prev,
                      full_name: e.target.value
                    }))}
                    placeholder="Digite seu nome completo"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="user-email">E-mail</Label>
                  <Input
                    id="user-email"
                    type="email"
                    value={userForm.email}
                    onChange={(e) => setUserForm(prev => ({
                      ...prev,
                      email: e.target.value
                    }))}
                    placeholder="Digite seu e-mail"
                    disabled
                  />
                  <p className="text-xs text-muted-foreground">
                    O e-mail não pode ser alterado aqui
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="user-phone">Telefone</Label>
                  <Input
                    id="user-phone"
                    value={userForm.phone}
                    onChange={(e) => setUserForm(prev => ({
                      ...prev,
                      phone: e.target.value
                    }))}
                    placeholder="Digite seu telefone"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button 
                  onClick={handleSaveUserProfile}
                  disabled={updateUserMutation.isPending}
                >
                  {updateUserMutation.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  {updateUserMutation.isPending ? 'Salvando...' : 'Salvar Perfil'}
                </Button>
              </div>

              <Separator />

              {/* Password Change Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  <h3 className="text-lg font-medium">Alterar Senha</h3>
                </div>
                
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {/* Current Password */}
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Senha Atual</Label>
                    <div className="relative">
                      <Input
                        id="current-password"
                        type={showPasswords.current ? "text" : "password"}
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm(prev => ({
                          ...prev,
                          currentPassword: e.target.value
                        }))}
                        placeholder="Digite sua senha atual"
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords(prev => ({
                          ...prev,
                          current: !prev.current
                        }))}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPasswords.current ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* New Password */}
                  <div className="space-y-2">
                    <Label htmlFor="new-password">Nova Senha</Label>
                    <div className="relative">
                      <Input
                        id="new-password"
                        type={showPasswords.new ? "text" : "password"}
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm(prev => ({
                          ...prev,
                          newPassword: e.target.value
                        }))}
                        placeholder="Digite sua nova senha"
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords(prev => ({
                          ...prev,
                          new: !prev.new
                        }))}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPasswords.new ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Mínimo de 6 caracteres
                    </p>
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
                    <div className="relative">
                      <Input
                        id="confirm-password"
                        type={showPasswords.confirm ? "text" : "password"}
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm(prev => ({
                          ...prev,
                          confirmPassword: e.target.value
                        }))}
                        placeholder="Confirme sua nova senha"
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords(prev => ({
                          ...prev,
                          confirm: !prev.confirm
                        }))}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPasswords.confirm ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    {passwordForm.newPassword && passwordForm.confirmPassword && 
                     passwordForm.newPassword !== passwordForm.confirmPassword && (
                      <p className="text-xs text-red-500">
                        As senhas não coincidem
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex justify-start pt-2">
                  <Button 
                    onClick={handleChangePassword}
                    disabled={
                      changePasswordMutation.isPending ||
                      !passwordForm.currentPassword.trim() ||
                      passwordForm.newPassword.length < 6 ||
                      passwordForm.newPassword !== passwordForm.confirmPassword
                    }
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                    size="lg"
                  >
                    {changePasswordMutation.isPending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Lock className="w-4 h-4 mr-2" />
                    )}
                    {changePasswordMutation.isPending ? 'Alterando Senha...' : 'Alterar Senha'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
}
