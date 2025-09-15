// Tipos para o módulo de unidades de processamento

export interface ProcessingUnit {
  id: string;
  user_id: string;
  razao_social: string;
  cnpj: string;
  email_financeiro: string;
  email_rh: string;
  endereco: string;
  tipo: 'Unidade de Processamento' | 'Unidade Comercial';
  created_at: string;
  updated_at: string;
}

export interface CreateProcessingUnitData {
  razao_social: string;
  cnpj: string;
  email_financeiro: string;
  email_rh: string;
  endereco: string;
  tipo: 'Unidade de Processamento' | 'Unidade Comercial';
}

export interface UpdateProcessingUnitData extends Partial<CreateProcessingUnitData> {}

export interface SectorResponsible {
  id: string;
  user_id: string;
  nome: string;
  unidade: string;
  processing_unit_id?: string;
  setor_departamento: string;
  whatsapp: string;
  link_whatsapp?: string;
  created_at: string;
  updated_at: string;
  processingUnit?: {
    id: string;
    razao_social: string;
  };
}

export interface CreateSectorResponsibleData {
  nome: string;
  unidade: string;
  processing_unit_id?: string;
  setor_departamento: string;
  whatsapp: string;
  link_whatsapp?: string;
}

export interface UpdateSectorResponsibleData extends Partial<CreateSectorResponsibleData> {}

// Tipos para filtros e busca
export interface ProcessingUnitFilters {
  search?: string;
  cnpj?: string;
}

export interface SectorResponsibleFilters {
  search?: string;
  unidade?: string;
  setor_departamento?: string;
}