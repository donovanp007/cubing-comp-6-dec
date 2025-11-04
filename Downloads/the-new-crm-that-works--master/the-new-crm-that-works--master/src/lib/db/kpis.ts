import { supabase } from '@/lib/supabase';

// CEO dashboard aggregates
export async function fetchCeoDashboard() {
  const { data, error } = await supabase.from('ceo_dashboard').select('*').single();
  if (error) throw error;
  return data;
}

export async function fetchTeamPerformance() {
  const { data, error } = await supabase.from('team_performance').select('*').order('target_achievement_pct', { ascending: false });
  if (error) throw error;
  return data;
}

export async function fetchRetention30d() {
  const { data, error } = await supabase.from('retention_30d').select('*');
  if (error) throw error;
  return data;
}

export async function fetchParentNps() {
  const { data, error } = await supabase.from('parent_nps').select('*');
  if (error) throw error;
  return data;
}

export async function upsertFinancialRecord(payload: {
  month_year: string;
  team_id: string | null;
  school_id: string | null;
  revenue_type: 'school_program' | 'corporate' | 'premium' | 'holiday';
  revenue_amount: number;
  cost_salaries?: number;
  cost_operations?: number;
  cost_marketing?: number;
  student_count?: number;
  notes?: string;
}) {
  const { data, error } = await supabase.rpc('upsert_financial_record', {
    p_month_year: payload.month_year,
    p_team_id: payload.team_id,
    p_school_id: payload.school_id,
    p_revenue_type: payload.revenue_type,
    p_revenue_amount: payload.revenue_amount,
    p_cost_salaries: payload.cost_salaries ?? 0,
    p_cost_operations: payload.cost_operations ?? 0,
    p_cost_marketing: payload.cost_marketing ?? 0,
    p_student_count: payload.student_count ?? null,
    p_notes: payload.notes ?? null,
  });
  if (error) throw error;
  return data;
}

export async function recomputeTargetsForThisMonth() {
  const { data, error } = await supabase.rpc('recompute_targets_for_month', {
    p_month_year: new Date().toISOString().slice(0,7) // YYYY-MM
  });
  if (error) throw error;
  return data;
}