
// Temporary types for financial transactions until Supabase types are regenerated
export interface FinancialTransaction {
  id: string;
  user_id: string;
  description: string;
  amount: number;
  type: 'expense';
  category: 'meta_ads' | 'google_ads' | 'instagram_ads' | 'content_creation' | 'influencer' | 'design' | 'tools_software' | 'consulting' | 'events' | 'other';
  status: 'pending' | 'confirmed' | 'cancelled';
  transaction_date: string;
  notes?: string;
  metadata?: any;
  created_at: string;
  updated_at: string;
}

export interface FinancialSummary {
  user_id?: string;
  type?: string;
  category?: string;
  status?: string;
  total_amount?: number;
  transaction_count?: number;
  month?: string;
}

export interface TransactionFilters {
  type?: 'expense';
  category?: 'meta_ads' | 'google_ads' | 'instagram_ads' | 'content_creation' | 'influencer' | 'design' | 'tools_software' | 'consulting' | 'events' | 'other';
  status?: 'pending' | 'confirmed' | 'cancelled';
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}
