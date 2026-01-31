// Leads mock data

interface Lead {
  id: string
  name: string
  phone: string
  email: string | null
  status: "new" | "contacted" | "qualified" | "converted" | "lost"
  source: string
  quality: "hot" | "warm" | "cold"
  next_action_due: string | null
  created_at: string
  converted_at: string | null
}

export const mockLeads: Lead[] = [
  {
    id: "lead-001",
    name: "Ahmed Mohamed",
    phone: "+20 100 123 4567",
    email: "ahmed@example.com",
    status: "new",
    source: "Website",
    quality: "hot",
    next_action_due: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    converted_at: null,
  },
  {
    id: "lead-002",
    name: "Fatima Ali",
    phone: "+20 100 234 5678",
    email: "fatima@example.com",
    status: "contacted",
    source: "Referral",
    quality: "hot",
    next_action_due: new Date().toISOString(),
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    converted_at: null,
  },
  {
    id: "lead-003",
    name: "Omar Hassan",
    phone: "+20 100 345 6789",
    email: null,
    status: "qualified",
    source: "Social Media",
    quality: "warm",
    next_action_due: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    converted_at: null,
  },
  {
    id: "lead-004",
    name: "Layla Ibrahim",
    phone: "+20 100 456 7890",
    email: "layla@example.com",
    status: "converted",
    source: "Website",
    quality: "hot",
    next_action_due: null,
    created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    converted_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "lead-005",
    name: "Nour Khalil",
    phone: "+20 100 567 8901",
    email: "nour@example.com",
    status: "new",
    source: "Referral",
    quality: "hot",
    next_action_due: new Date().toISOString(),
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    converted_at: null,
  },
  {
    id: "lead-006",
    name: "Mohamed Amin",
    phone: "+20 100 678 9012",
    email: "mohamed@example.com",
    status: "contacted",
    source: "Website",
    quality: "warm",
    next_action_due: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    converted_at: null,
  },
]

