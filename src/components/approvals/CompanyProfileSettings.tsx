
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Upload, User, Instagram } from 'lucide-react';
import { useCompanyProfile, useCreateCompanyProfile, useUpdateCompanyProfile } from '@/hooks/useCompanyProfile';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const CompanyProfileSettings = () => {
  const { profile, isLoading, refetch } = useCompanyProfile();
  const createMutation = useCreateCompanyProfile();
  const updateMutation = useUpdateCompanyProfile();
  // Using sonner toast

  const [formData, setFormData] = useState({
    company_name: '',
    instagram_username: '',
  });

  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);

  // Update form data when profile loads
  useEffect(() => {
    if (profile) {
      console.log('Updating form data with profile:', profile);
      setFormData({
        company_name: profile.company_name || '',
        instagram_username: profile.instagram_username || '',
      });
      
      // Set profile image preview with correct URL
      if (profile.profile_image_url) {
        const imageUrl = profile.profile_image_url.startsWith('http') 
          ? profile.profile_image_url 
          : `https://tqwcibshgrwnleqkkjpd.supabase.co/storage/v1/object/public/profile-images/${profile.profile_image_url}`;
        setProfileImagePreview(imageUrl);
      }
    }
  }, [profile]);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('A imagem deve ter no máximo 5MB.');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione uma imagem válida.');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setProfileImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
    setProfileImageFile(file);
  };

  const uploadImage = async (file: File): Promise<string> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    const fileExt = file.name.split('.').pop();
    const fileName = `profile-${Date.now()}.${fileExt}`;
    const filePath = `${user.id}/${fileName}`;

    console.log('Uploading image to:', filePath);

    const { error: uploadError } = await supabase.storage
      .from('profile-images')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw uploadError;
    }

    console.log('Image uploaded successfully');
    return filePath;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!formData.company_name.trim()) {
      toast.error('Nome da empresa é obrigatório.');
      return;
    }

    if (!formData.instagram_username.trim()) {
      toast.error('Nome de usuário do Instagram é obrigatório.');
      return;
    }

    try {
      let profileImageUrl = profile?.profile_image_url;

      // Upload new image if selected
      if (profileImageFile) {
        profileImageUrl = await uploadImage(profileImageFile);
      }

      const profileData = {
        company_name: formData.company_name.trim(),
        instagram_username: formData.instagram_username.trim(),
        profile_image_url: profileImageUrl,
        // Set default values for other fields to maintain database compatibility
        bio: null,
        website: null,
        followers_count: 0,
        following_count: 0,
        posts_count: 0,
        verified: false,
      };

      console.log('Submitting profile data:', profileData);

      if (profile?.id) {
        await updateMutation.mutateAsync({ id: profile.id, ...profileData });
      } else {
        await createMutation.mutateAsync(profileData);
      }

      // Refresh the profile data
      setTimeout(() => {
        refetch();
      }, 1000);
      
      // Clear the file input
      setProfileImageFile(null);
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error(error instanceof Error ? error.message : 'Não foi possível salvar o perfil. Tente novamente.');
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Carregando...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Instagram className="w-5 h-5 text-pink-500" />
          Perfil da Empresa no Instagram
        </CardTitle>
        <CardDescription>
          Configure as informações essenciais que aparecerão na visualização das aprovações
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Image */}
          <div className="space-y-4">
            <Label>Foto do Perfil</Label>
            <div className="flex items-center gap-4">
              <Avatar className="w-20 h-20">
                <AvatarImage src={profileImagePreview || undefined} />
                <AvatarFallback>
                  <User className="w-8 h-8" />
                </AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <Label htmlFor="profile-image" className="cursor-pointer">
                  <div className="flex items-center gap-2 px-4 py-2 border border-input rounded-md hover:bg-accent hover:text-accent-foreground">
                    <Upload className="w-4 h-4" />
                    Alterar Foto
                  </div>
                </Label>
                <Input
                  id="profile-image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <p className="text-xs text-muted-foreground">
                  Recomendado: 400x400px, formato JPG ou PNG, máximo 5MB
                </p>
              </div>
            </div>
          </div>

          {/* Company Name */}
          <div className="space-y-2">
            <Label htmlFor="company-name">Nome da Empresa *</Label>
            <Input
              id="company-name"
              value={formData.company_name}
              onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
              placeholder="Ex: Minha Empresa"
              required
            />
          </div>

          {/* Instagram Username */}
          <div className="space-y-2">
            <Label htmlFor="instagram-username">Nome de usuário do Instagram *</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                @
              </span>
              <Input
                id="instagram-username"
                value={formData.instagram_username}
                onChange={(e) => setFormData({ ...formData, instagram_username: e.target.value })}
                placeholder="minha_empresa"
                className="pl-8"
                required
              />
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={createMutation.isPending || updateMutation.isPending}
            className="w-full"
          >
            {(createMutation.isPending || updateMutation.isPending) ? 'Salvando...' : (profile ? 'Atualizar Perfil' : 'Criar Perfil')}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
