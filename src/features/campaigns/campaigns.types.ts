export type CampaignStatus = 'active' | 'paused' | 'completed';
export type LeadStatus = 'new' | 'interested' | 'not_responding' | 'auto_closed' | 'converted' | 'lost';

export type DisqualificationReason =
  | 'not_interested'
  | 'wrong_number'
  | 'outside_area'
  | 'already_treated_elsewhere'
  | 'budget_issue';

export interface Campaign {
  id: string;
  name: string;
  source: 'facebook' | 'instagram' | 'google' | 'tiktok' | 'referral' | 'other';
  status: CampaignStatus;
  startDate: string;
  endDate?: string;
  spend: number;
  leads: number;
  bookings: number;
  revenue: number;
  costPerLead: number;
  conversionRate: number;
  roi: number;
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email?: string;
  serviceInterest?: string;
  location?: string;
  campaignId: string;
  status: LeadStatus;
  assignedTo?: string;
  createdAt: string;
  lastContact?: string;
  firstContactAt?: string; // For response time calculation
  notes?: string;
  convertedPatientId?: string;
  nextAction?: string;
  nextActionDate?: string;
  tags?: string[];
  disqualificationReason?: DisqualificationReason;
}

/** Per-campaign conversion funnel: Lead → Contacted → Booked → Visited → Treated */
export interface CampaignFunnel {
  leads: number;
  contacted: number;
  booked: number;
  visited: number;
  treated: number;
}

export interface CampaignResponseMetrics {
  avgResponseTimeMinutes: number;
  pctContactedWithin10Min: number;
  neverContactedCount: number;
}

export interface CampaignDetailMetrics {
  campaignId: string;
  funnel: CampaignFunnel;
  responseMetrics: CampaignResponseMetrics;
  avgTreatmentValue: number;
  revenuePerLead: number;
  revenuePerPatient: number;
  costPerPatient: number;
  treatmentInterestBreakdown: Record<string, number>;
  locationBreakdown: Record<string, number>;
  leadsByDay: { date: string; count: number }[];
}

export interface MarketingMetrics {
  totalAdSpend: number;
  totalLeads: number;
  totalBookings: number;
  conversionRate: number;
  totalRevenue: number;
  costPerLead: number;
  costPerPatient?: number;
}

export interface FunnelStep {
  label: string;
  count: number;
  percentage: number; // Percentage of previous step or total
  color?: string;
}

export type LeadMessageSource = 'whatsapp' | 'instagram' | 'facebook' | 'other';

export interface LeadMessage {
  id: string;
  leadId: string;
  text: string;
  direction: 'inbound' | 'outbound';
  source: LeadMessageSource;
  createdAt: string;
}

export interface LeadCallTranscription {
  id: string;
  leadId: string;
  transcriptionText: string;
  durationSeconds: number;
  createdAt: string;
  status: 'processing' | 'completed' | 'failed';
}

export interface LeadCallSummary {
  leadId: string;
  conclusion: string;
}

export interface MessageTemplate {
  id: string;
  label: string;
  text: string;
}
