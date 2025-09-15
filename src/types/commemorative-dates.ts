// Tipos para o módulo de calendário de datas comemorativas

export type PostType = 'feed' | 'story';

export interface CommemorativeDate {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  date: string; // ISO date string (YYYY-MM-DD)
  is_mandatory: boolean;
  post_type: PostType;
  created_at: string;
  updated_at: string;
}

export interface CreateCommemorateDateData {
  title: string;
  description?: string;
  date: string; // ISO date string (YYYY-MM-DD)
  is_mandatory: boolean;
  post_type: PostType;
}

export interface UpdateCommemorateDateData extends Partial<CreateCommemorateDateData> {}

// Tipos para filtros e busca
export interface CommemorateDateFilters {
  search?: string;
  year?: number;
  month?: number;
  is_mandatory?: boolean;
  post_type?: PostType;
}

// Tipos para visualização do calendário
export interface CalendarMonth {
  year: number;
  month: number; // 0-11 (JavaScript month format)
  name: string;
  dates: CommemorativeDate[];
}

export interface CalendarYear {
  year: number;
  months: CalendarMonth[];
  totalDates: number;
  mandatoryDates: number;
  optionalDates: number;
  feedPosts: number;
  storyPosts: number;
}

// Tipos para estatísticas
export interface CommemorateDateStats {
  total: number;
  mandatory: number;
  optional: number;
  feedPosts: number;
  storyPosts: number;
  byMonth: {
    month: number;
    count: number;
    mandatory: number;
    optional: number;
  }[];
}

// Tipos para agrupamento por mês
export interface MonthGroup {
  month: number;
  monthName: string;
  year: number;
  dates: CommemorativeDate[];
  count: number;
}

// Tipos para formulários
export interface CommemorateDateFormData {
  title: string;
  description: string;
  date: Date | undefined;
  is_mandatory: boolean;
  post_type: PostType;
}

// Tipos para validação
export interface CommemorateDateValidation {
  title?: string;
  date?: string;
  post_type?: string;
}