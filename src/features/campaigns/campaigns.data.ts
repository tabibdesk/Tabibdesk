import {
  Campaign,
  Lead,
  LeadMessage,
  LeadCallTranscription,
  LeadCallSummary,
  MessageTemplate,
  MarketingMetrics,
  FunnelStep,
  CampaignDetailMetrics,
} from './campaigns.types';
import { mockUsers } from '@/data/mock/users-clinics';

export const MOCK_CAMPAIGNS: Campaign[] = [
  {
    id: 'c1',
    name: 'Botox Awareness – Cairo',
    source: 'facebook',
    status: 'active',
    startDate: '2025-02-01',
    spend: 15000,
    leads: 342,
    bookings: 45,
    revenue: 135000,
    costPerLead: 43.86,
    conversionRate: 13.1,
    roi: 800,
  },
  {
    id: 'c2',
    name: 'Hair PRP Leads – Nasr City',
    source: 'instagram',
    status: 'active',
    startDate: '2025-02-15',
    spend: 8500,
    leads: 156,
    bookings: 28,
    revenue: 56000,
    costPerLead: 54.49,
    conversionRate: 17.9,
    roi: 558,
  },
  {
    id: 'c3',
    name: 'Dental Implants Consultation – New Cairo',
    source: 'google',
    status: 'active',
    startDate: '2025-01-10',
    spend: 25000,
    leads: 89,
    bookings: 12,
    revenue: 180000,
    costPerLead: 280.90,
    conversionRate: 13.5,
    roi: 620,
  },
  {
    id: 'c4',
    name: 'Weight Loss Program – Heliopolis',
    source: 'instagram',
    status: 'paused',
    startDate: '2025-01-01',
    endDate: '2025-02-28',
    spend: 12000,
    leads: 210,
    bookings: 35,
    revenue: 70000,
    costPerLead: 57.14,
    conversionRate: 16.7,
    roi: 483,
  },
  {
    id: 'c5',
    name: 'Laser Hair Removal – October',
    source: 'tiktok',
    status: 'active',
    startDate: '2025-03-01',
    spend: 5000,
    leads: 120,
    bookings: 15,
    revenue: 22500,
    costPerLead: 41.67,
    conversionRate: 12.5,
    roi: 350,
  },
];

export const MOCK_LEADS: Lead[] = [
  {
    id: 'l1',
    name: 'Mona Ahmed',
    phone: '+20 100 123 4567',
    serviceInterest: 'Botox',
    location: 'Nasr City',
    campaignId: 'c1',
    status: 'new',
    createdAt: '2025-03-12T10:30:00',
  },
  {
    id: 'l2',
    name: 'Karim Hassan',
    nextAction: 'Call back on Sunday',
    nextActionDate: '2025-03-16',
    phone: '+20 122 987 6543',
    serviceInterest: 'Dental Implants',
    location: 'New Cairo',
    campaignId: 'c3',
    status: 'interested',
    assignedTo: 'Fatima Ali',
    createdAt: '2025-03-12T09:15:00',
    firstContactAt: '2025-03-12T09:22:00',
    lastContact: '2025-03-12T11:00:00',
    notes: 'Interested but traveling next week. Call back on Sunday.',
  },
  {
    id: 'l3',
    name: 'Nour El-Din',
    phone: '+20 111 555 6666',
    serviceInterest: 'PRP Hair',
    location: 'Nasr City',
    campaignId: 'c2',
    status: 'interested',
    assignedTo: 'Mariam Mohamed',
    createdAt: '2025-03-11T14:20:00',
    firstContactAt: '2025-03-11T14:25:00',
    lastContact: '2025-03-11T16:00:00',
    notes: 'Booked for consultation on Thursday.',
  },
  {
    id: 'l4',
    name: 'Heba Youssef',
    phone: '+20 106 444 3333',
    serviceInterest: 'Weight Loss',
    location: 'Heliopolis',
    campaignId: 'c4',
    status: 'converted',
    convertedPatientId: 'p123',
    createdAt: '2025-03-10T11:00:00',
    firstContactAt: '2025-03-10T11:05:00',
    lastContact: '2025-03-10T12:30:00',
  },
  {
    id: 'l5',
    name: 'Omar Khaled',
    phone: '+20 155 222 1111',
    serviceInterest: 'Laser',
    location: 'October',
    campaignId: 'c5',
    status: 'not_responding',
    createdAt: '2025-03-09T15:45:00',
    lastContact: '2025-03-10T10:00:00',
    notes: 'Called twice, no answer.',
  },
  {
    id: 'l6',
    name: 'Dina Magdy',
    tags: ['Botox inquiry', 'Price sensitive'],
    phone: '+20 109 888 7777',
    serviceInterest: 'Botox',
    location: 'New Cairo',
    campaignId: 'c1',
    status: 'interested',
    createdAt: '2025-03-08T13:00:00',
    firstContactAt: '2025-03-08T13:08:00',
    lastContact: '2025-03-09T11:30:00',
    notes: 'Asking about prices. Sent price list.',
  },
  {
    id: 'l7',
    name: 'Tarek Mahmoud',
    phone: '+20 120 000 9999',
    serviceInterest: 'Dental Implants',
    location: 'Heliopolis',
    campaignId: 'c3',
    status: 'lost',
    createdAt: '2025-03-05T09:00:00',
    firstContactAt: '2025-03-05T09:15:00',
    lastContact: '2025-03-06T14:00:00',
    notes: 'Too expensive for him.',
  },
];

/** Per-campaign detail metrics for the campaign detail page */
export const MOCK_CAMPAIGN_DETAILS: Record<string, CampaignDetailMetrics> = {
  c1: {
    campaignId: 'c1',
    funnel: { leads: 95, contacted: 70, booked: 34, visited: 28, treated: 21 },
    responseMetrics: {
      avgResponseTimeMinutes: 22,
      pctContactedWithin10Min: 48,
      neverContactedCount: 14,
    },
    avgTreatmentValue: 6428,
    revenuePerLead: 1414,
    revenuePerPatient: 6428,
    costPerPatient: 714,
    treatmentInterestBreakdown: { Botox: 45, 'PRP Hair': 30, Fillers: 12, 'General consultation': 8 },
    locationBreakdown: { 'Nasr City': 50, 'New Cairo': 30, Heliopolis: 15 },
    leadsByDay: [
      { date: '2025-03-10', count: 20 },
      { date: '2025-03-11', count: 15 },
      { date: '2025-03-12', count: 35 },
    ],
  },
  c2: {
    campaignId: 'c2',
    funnel: { leads: 72, contacted: 58, booked: 22, visited: 18, treated: 14 },
    responseMetrics: {
      avgResponseTimeMinutes: 18,
      pctContactedWithin10Min: 56,
      neverContactedCount: 8,
    },
    avgTreatmentValue: 4000,
    revenuePerLead: 359,
    revenuePerPatient: 4000,
    costPerPatient: 607,
    treatmentInterestBreakdown: { 'PRP Hair': 45, Botox: 18, 'Hair transplant': 9 },
    locationBreakdown: { 'Nasr City': 40, 'New Cairo': 20, Heliopolis: 12 },
    leadsByDay: [
      { date: '2025-03-09', count: 25 },
      { date: '2025-03-10', count: 30 },
      { date: '2025-03-11', count: 17 },
    ],
  },
  c3: {
    campaignId: 'c3',
    funnel: { leads: 45, contacted: 35, booked: 12, visited: 10, treated: 8 },
    responseMetrics: {
      avgResponseTimeMinutes: 35,
      pctContactedWithin10Min: 38,
      neverContactedCount: 10,
    },
    avgTreatmentValue: 22500,
    revenuePerLead: 2022,
    revenuePerPatient: 22500,
    costPerPatient: 3125,
    treatmentInterestBreakdown: { 'Dental Implants': 35, 'General consultation': 10 },
    locationBreakdown: { 'New Cairo': 25, 'Nasr City': 15, Heliopolis: 5 },
    leadsByDay: [
      { date: '2025-03-08', count: 12 },
      { date: '2025-03-09', count: 18 },
      { date: '2025-03-10', count: 15 },
    ],
  },
  c4: {
    campaignId: 'c4',
    funnel: { leads: 88, contacted: 65, booked: 28, visited: 22, treated: 18 },
    responseMetrics: {
      avgResponseTimeMinutes: 25,
      pctContactedWithin10Min: 42,
      neverContactedCount: 15,
    },
    avgTreatmentValue: 3889,
    revenuePerLead: 795,
    revenuePerPatient: 3889,
    costPerPatient: 667,
    treatmentInterestBreakdown: { 'Weight Loss': 60, 'General consultation': 18, Botox: 10 },
    locationBreakdown: { Heliopolis: 45, 'Nasr City': 25, 'New Cairo': 18 },
    leadsByDay: [
      { date: '2025-03-07', count: 30 },
      { date: '2025-03-08', count: 25 },
      { date: '2025-03-09', count: 33 },
    ],
  },
  c5: {
    campaignId: 'c5',
    funnel: { leads: 52, contacted: 40, booked: 15, visited: 12, treated: 9 },
    responseMetrics: {
      avgResponseTimeMinutes: 20,
      pctContactedWithin10Min: 52,
      neverContactedCount: 6,
    },
    avgTreatmentValue: 2500,
    revenuePerLead: 433,
    revenuePerPatient: 2500,
    costPerPatient: 556,
    treatmentInterestBreakdown: { Laser: 35, 'General consultation': 12, Botox: 5 },
    locationBreakdown: { October: 28, 'Nasr City': 15, 'New Cairo': 9 },
    leadsByDay: [
      { date: '2025-03-10', count: 18 },
      { date: '2025-03-11', count: 22 },
      { date: '2025-03-12', count: 12 },
    ],
  },
};

export const MOCK_METRICS: MarketingMetrics = {
  totalAdSpend: 65500,
  totalLeads: 917,
  totalBookings: 135,
  conversionRate: 14.7,
  totalRevenue: 463500,
  costPerLead: 71.43,
  costPerPatient: 485.18,
};

export function getCampaignName(campaignId: string): string {
  const c = MOCK_CAMPAIGNS.find((x) => x.id === campaignId);
  return c?.name ?? `Campaign ${campaignId}`;
}

/** User names from mock users, for assignee dropdown */
export function getAssignableUserNames(): string[] {
  return mockUsers.map((u) => u.full_name).sort();
}

export const MOCK_FUNNEL: FunnelStep[] = [
  { label: 'Leads', count: 917, percentage: 100 },
  { label: 'Contacted', count: 750, percentage: 81.8 },
  { label: 'Interested', count: 420, percentage: 45.8 },
  { label: 'Booked', count: 135, percentage: 14.7 },
  { label: 'Visited', count: 110, percentage: 12.0 },
  { label: 'Converted', count: 95, percentage: 10.4 },
];

export const MOCK_LEAD_MESSAGES: LeadMessage[] = [
  { id: 'm1', leadId: 'l1', text: 'Hi, I saw your Botox ad. Is there availability this week?', direction: 'inbound', source: 'instagram', createdAt: '2025-03-12T10:31:00' },
  { id: 'm2', leadId: 'l1', text: 'Yes! We have slots on Thursday. Would you like a consultation?', direction: 'outbound', source: 'whatsapp', createdAt: '2025-03-12T10:35:00' },
  { id: 'm3', leadId: 'l1', text: 'Perfect, please send me the price list first.', direction: 'inbound', source: 'whatsapp', createdAt: '2025-03-12T10:40:00' },
  { id: 'm4', leadId: 'l2', text: 'Inquiry about dental implants. Can I get a consultation?', direction: 'inbound', source: 'facebook', createdAt: '2025-03-12T09:16:00' },
  { id: 'm5', leadId: 'l2', text: 'Of course. We have availability Sunday. I\'ll call you to confirm.', direction: 'outbound', source: 'whatsapp', createdAt: '2025-03-12T09:22:00' },
  { id: 'm6', leadId: 'l3', text: 'PRP hair treatment pricing please.', direction: 'inbound', source: 'instagram', createdAt: '2025-03-11T14:21:00' },
  { id: 'm7', leadId: 'l3', text: 'Sent you the brochure. Booked for Thursday 2pm.', direction: 'outbound', source: 'whatsapp', createdAt: '2025-03-11T16:00:00' },
];

export const MOCK_LEAD_TRANSCRIPTIONS: LeadCallTranscription[] = [
  { id: 't1', leadId: 'l2', transcriptionText: 'اتكلمنا عن زراعة الأسنان. العميل مهتم بس مسافر الأسبوع اللي جاي. اتفقنا نتكلم تاني يوم الأحد.', durationSeconds: 180, createdAt: '2025-03-12T11:00:00', status: 'completed' },
  { id: 't2', leadId: 'l5', transcriptionText: 'جرّبت أتصل تاني بخصوص جلسة الليزر. مفيش رد. سابّت رسالة صوتية.', durationSeconds: 45, createdAt: '2025-03-10T10:00:00', status: 'completed' },
  { id: 't3', leadId: 'l6', transcriptionText: 'اتكلمنا في الأسعار. العميل بيقارن بين الخيارات. انبعتلّه لستة الأسعار. نتابع معاه بعد يومين.', durationSeconds: 320, createdAt: '2025-03-09T11:30:00', status: 'completed' },
];

export const MOCK_LEAD_CALL_SUMMARIES: Record<string, LeadCallSummary> = {
  l2: { leadId: 'l2', conclusion: 'العميل مهتم بزراعة الأسنان. مسافر الأسبوع الجاي. اتصل الأحد عشان نؤكد الاستشارة.' },
  l5: { leadId: 'l5', conclusion: 'اتصلنا كتير ومش بيرد. نفكّر نعلّمه ضائع لو اتصلنا تلات مرات زيادة ومفيش رد.' },
  l6: { leadId: 'l6', conclusion: 'مهتم بالأسعار. انبعتلّه اللستة. محتاجين متابعة عشان يكمل.' },
};

export const MOCK_LEAD_AI_SUMMARIES: Record<string, string> = {
  l1: 'عميل جديد مهتم بالبوتوكس من نصر المدينة. أول تواصل. مناسب للمتابعة السريعة.',
  l2: 'مهتم بزراعة الأسنان، مسافر الأسبوع الجاي. حددنا الأحد لمكالمة تأكيد. ملاحظات: يرجع من السفر ونكلمه.',
  l3: 'مهتم بجلسات PRP للشعر. محجوز استشارة الخميس ٢ العصر. جاهز للتحويل.',
  l4: 'تم التحويل لمريض. حالة إيجابية.',
  l5: 'مش بيرد على المكالمات. آخر تواصل من يومين. محتاج محاولات إضافية أو تعليم ضائع.',
  l6: 'مهتم بالأسعار وبيقارن. انبعتلّه اللستة. متابعة بعد يومين.',
  l7: 'علّمته ضائع — الأسعار ماجناش معاه.',
};

export function getLeadAiSummary(leadId: string): string | null {
  return MOCK_LEAD_AI_SUMMARIES[leadId] ?? null;
}

export const MESSAGE_TEMPLATES: MessageTemplate[] = [
  { id: 't1', label: 'Availability', text: 'Hi, we have availability this week. Would you like to book a consultation?' },
  { id: 't2', label: 'Price list sent', text: "I've sent you our price list. Let me know if you have any questions." },
  { id: 't3', label: 'Follow-up call', text: "We're following up on your inquiry. When would be a good time to call?" },
  { id: 't4', label: 'Confirm appointment', text: 'Your appointment is confirmed. See you soon!' },
];

export function getLeadMessages(leadId: string): LeadMessage[] {
  return MOCK_LEAD_MESSAGES.filter((m) => m.leadId === leadId).sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
}

export function getLeadTranscriptions(leadId: string): LeadCallTranscription[] {
  return MOCK_LEAD_TRANSCRIPTIONS.filter((t) => t.leadId === leadId).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function getLeadCallSummary(leadId: string): LeadCallSummary | null {
  return MOCK_LEAD_CALL_SUMMARIES[leadId] ?? null;
}

/** Leads linked to a patient (converted or matched by phone) */
export function getLeadsByPatientId(patientId: string, patientPhone?: string): Lead[] {
  const byConverted = MOCK_LEADS.filter((l) => l.convertedPatientId === patientId);
  const normalizedPatientPhone = patientPhone?.replace(/\D/g, '') ?? '';
  const byPhone =
    normalizedPatientPhone.length > 0
      ? MOCK_LEADS.filter((l) => l.phone.replace(/\D/g, '') === normalizedPatientPhone)
      : [];
  const seen = new Set<string>()
  const result: Lead[] = []
  for (const l of [...byConverted, ...byPhone]) {
    if (!seen.has(l.id)) {
      seen.add(l.id)
      result.push(l)
    }
  }
  return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}
