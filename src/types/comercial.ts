export interface ComercialRepresentative {
  id: string;
  nome_completo: string;
  telefone: string;
  link_whatsapp: string;
  estado: string | null;
  escritorio: string;
  cidades_atendidas: string[];
  status: 'ativo' | 'inativo';
  tipo: 'representante' | 'broker';
  created_at: string;
  updated_at: string;
  user_id: string;
}