import { supabase } from '@/lib/supabase';

// ============================================================================
// CEO FINANCIAL DASHBOARD FUNCTIONS
// ============================================================================

// Fetch company-wide financial metrics
export async function fetchCeoDashboard() {
  const { data, error } = await supabase.from('ceo_financial_dashboard').select('*').single();
  if (error) {
    console.warn('Warning: CEO financial dashboard view not found, returning default data');
    return {
      total_active_students: 0,
      term_total_revenue: 0,
      monthly_operating_costs: 0,
      total_paid: 0,
      total_outstanding: 0,
      total_schools: 0,
      active_schools: 0,
      total_areas: 0,
      calculated_at: new Date().toISOString()
    };
  }
  return data || null;
}

// Fetch school-by-school financial performance
export async function fetchSchoolFinancialPerformance() {
  const { data, error } = await supabase.from('school_financial_performance').select('*');
  if (error) {
    console.warn('Warning: School financial performance view not found, returning empty data');
    return [];
  }
  return data || [];
}

// Fetch area-level financial performance
export async function fetchAreaFinancialPerformance() {
  const { data, error } = await supabase.from('area_financial_performance').select('*');
  if (error) {
    console.warn('Warning: Area financial performance view not found, returning empty data');
    return [];
  }
  return data || [];
}

// Fetch goals and targets progress
export async function fetchGoalsProgress() {
  const { data, error } = await supabase.from('goals_progress').select('*');
  if (error) {
    console.warn('Warning: Goals progress view not found, returning empty data');
    return [];
  }
  return data || [];
}

// Fetch payment collection analysis
export async function fetchPaymentCollectionAnalysis() {
  const { data, error } = await supabase.from('payment_collection_analysis').select('*');
  if (error) {
    console.warn('Warning: Payment collection analysis view not found, returning empty data');
    return [];
  }
  return data || [];
}

// Fetch enrollment trends (student decline/growth)
export async function fetchEnrollmentTrends() {
  const { data, error } = await supabase.from('enrollment_trends').select('*');
  if (error) {
    console.warn('Warning: Enrollment trends view not found, returning empty data');
    return [];
  }
  return data || [];
}

// ============================================================================
// LEGACY TEAM PERFORMANCE FUNCTIONS (COMPATIBILITY)
// ============================================================================

export async function fetchTeamPerformance() {
  const { data, error } = await supabase.from('team_performance').select('*').order('target_achievement_pct', { ascending: false });
  if (error) {
    console.warn('Warning: team_performance table not found, returning empty data');
    return [];
  }
  return data || [];
}

export async function fetchRetention30d() {
  const { data, error } = await supabase.from('retention_30d').select('*');
  if (error) {
    console.warn('Warning: retention_30d table not found, returning empty data');
    return [];
  }
  return data || [];
}

export async function fetchParentNps() {
  const { data, error } = await supabase.from('parent_nps').select('*');
  if (error) {
    console.warn('Warning: parent_nps table not found, returning empty data');
    return [];
  }
  return data || [];
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