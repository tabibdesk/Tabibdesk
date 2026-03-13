/**
 * Mock data for Lead Auto-Assignment
 * Campaigns, sources, treatment interests, locations.
 * Users come from useUserClinic / getUsersForClinics.
 */

import { getUsersForClinics } from "@/data/mock/users-clinics"

export interface LeadRoutingUser {
  id: string
  fullName: string
}

export function getLeadRoutingUsers(clinicIds: string[]): LeadRoutingUser[] {
  const users = getUsersForClinics(clinicIds)
  return users.map((u) => ({ id: u.id, fullName: u.full_name }))
}

export interface LeadRoutingCampaign {
  id: string
  name: string
}

export interface LeadRoutingSource {
  id: string
  name: string
}

export interface LeadRoutingTreatmentInterest {
  id: string
  name: string
}

export interface LeadRoutingLocation {
  id: string
  name: string
}

export const LEAD_ROUTING_CAMPAIGNS: LeadRoutingCampaign[] = [
  { id: "c1", name: "Botox Awareness – Cairo" },
  { id: "c2", name: "Hair PRP Leads – Nasr City" },
  { id: "c3", name: "Dental Implants Consultation – New Cairo" },
  { id: "c4", name: "Weight Loss Program – Heliopolis" },
  { id: "c5", name: "Laser Hair Removal – October" },
]

export const LEAD_ROUTING_SOURCES: LeadRoutingSource[] = [
  { id: "fb-lead", name: "Facebook Lead Ad" },
  { id: "ig-form", name: "Instagram Lead Form" },
  { id: "ig-dm", name: "Instagram DM" },
  { id: "whatsapp", name: "WhatsApp" },
  { id: "website", name: "Website Form" },
]

export const LEAD_ROUTING_TREATMENT_INTERESTS: LeadRoutingTreatmentInterest[] = [
  { id: "botox", name: "Botox" },
  { id: "hair-prp", name: "Hair PRP" },
  { id: "dental-implants", name: "Dental Implants" },
  { id: "weight-loss", name: "Weight Loss" },
  { id: "laser-hair", name: "Laser Hair Removal" },
  { id: "general", name: "General Consultation" },
]

export const LEAD_ROUTING_LOCATIONS: LeadRoutingLocation[] = [
  { id: "maadi", name: "Maadi" },
  { id: "new-cairo", name: "New Cairo" },
  { id: "sheikh-zayed", name: "Sheikh Zayed" },
  { id: "nasr-city", name: "Nasr City" },
  { id: "heliopolis", name: "Heliopolis" },
  { id: "october", name: "October" },
]
