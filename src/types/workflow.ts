// Types pour le système de workflow complet

export interface WorkflowSession {
  id: string
  status: WorkflowStatus
  client: ClientSession
  itinerary?: TravelItinerary
  aiMessages: AIConversationMessage[]
  mbayeReview?: MbayeReview
  notifications: WorkflowNotification[]
  metadata: SessionMetadata
  created_at: string
  updated_at: string
}

export type WorkflowStatus = 
  | 'client-inquiry' // Client pose sa première question
  | 'ai-conversation' // Discussion en cours avec l'IA
  | 'ai-proposal' // IA a généré une proposition
  | 'client-review' // Client examine la proposition
  | 'client-modifications' // Client demande des modifications
  | 'pending-mbaye-review' // En attente de validation Mbaye
  | 'mbaye-reviewing' // Mbaye examine la proposition
  | 'mbaye-approved' // Mbaye approuve
  | 'mbaye-modified' // Mbaye modifie la proposition
  | 'pending-client-confirmation' // En attente confirmation client
  | 'client-confirmed' // Client confirme
  | 'whatsapp-initiated' // Contact WhatsApp établi
  | 'booking-in-progress' // Réservation en cours
  | 'booked' // Confirmé et payé
  | 'in-progress' // Voyage en cours
  | 'completed' // Voyage terminé
  | 'cancelled' // Annulé
  | 'expired' // Session expirée

export interface ClientSession {
  sessionId: string
  name?: string
  email?: string
  phone?: string
  preferences: Partial<ClientPreferences>
  budget?: CostRange
  travelDates?: {
    arrival?: string
    departure?: string
    flexibility?: 'fixed' | 'flexible' | 'very-flexible'
  }
  groupSize?: number
  previousSenegalVisit: boolean
  ipAddress: string
  userAgent: string
  referrer?: string
  language: 'fr' | 'en'
}

export interface AIConversationMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: string
  metadata: {
    confidence?: number
    detectedIntent?: AIIntent
    extractedInfo?: ExtractedClientInfo
    suggestedDestinations?: string[]
    suggestedExperiences?: string[]
    responseTime?: number
    model?: string
  }
}

export type AIIntent = 
  | 'initial-inquiry'
  | 'provide-preferences'
  | 'ask-destination-info'
  | 'request-modification'
  | 'confirm-proposal'
  | 'ask-practical-info'
  | 'express-concern'
  | 'request-alternatives'
  | 'finalize-booking'

export interface ExtractedClientInfo {
  budget?: {
    amount?: number
    currency?: string
    confidence: number
  }
  dates?: {
    arrival?: string
    departure?: string
    duration?: number
    confidence: number
  }
  preferences?: {
    interests: string[]
    activityLevel?: string
    accommodationType?: string
    confidence: number
  }
  groupInfo?: {
    size?: number
    ages?: number[]
    specialNeeds?: string[]
    confidence: number
  }
  location?: {
    departure?: string
    preferences?: string[]
    confidence: number
  }
}

export interface MbayeReview {
  id: string
  status: MbayeReviewStatus
  itineraryId: string
  reviewer: 'mbaye' | 'assistant-mbaye'
  review: {
    overall: 'approve' | 'modify' | 'reject'
    comments: string
    modifications: ItineraryModification[]
    pricing: PricingReview
    logistics: LogisticsReview
    cultural: CulturalReview
  }
  timeSpent: number // en minutes
  priority: 'low' | 'normal' | 'high' | 'urgent'
  reviewedAt: string
}

export type MbayeReviewStatus = 
  | 'pending'
  | 'in-review'
  | 'completed'
  | 'escalated'

export interface PricingReview {
  status: 'approved' | 'adjusted' | 'needs-revision'
  originalTotal: number
  adjustedTotal?: number
  adjustments: PriceAdjustment[]
  reasoning: string
}

export interface PriceAdjustment {
  item: string
  originalPrice: number
  adjustedPrice: number
  reason: string
}

export interface LogisticsReview {
  status: 'feasible' | 'needs-adjustment' | 'not-feasible'
  transportPlan: TransportPlanReview
  timing: TimingReview
  accommodation: AccommodationReview
  concerns: string[]
  suggestions: string[]
}

export interface TransportPlanReview {
  approved: boolean
  vehicleRecommendation: string
  routeAdjustments: RouteAdjustment[]
  drivingTime: number
  restStops: RestStopRecommendation[]
}

export interface RouteAdjustment {
  segment: string
  issue: string
  solution: string
  timeImpact: number
}

export interface RestStopRecommendation {
  location: string
  reason: string
  duration: number
  optional: boolean
}

export interface TimingReview {
  approved: boolean
  seasonalConsiderations: string[]
  dailyScheduleAdjustments: ScheduleAdjustment[]
  bufferTimeRecommendations: string[]
}

export interface ScheduleAdjustment {
  day: number
  activity: string
  originalTime: string
  suggestedTime: string
  reason: string
}

export interface AccommodationReview {
  approved: boolean
  alternatives: AccommodationAlternative[]
  partnershipAvailable: boolean
  specialArrangements: string[]
}

export interface AccommodationAlternative {
  name: string
  type: string
  reason: string
  priceComparison: number
  mbayePartnership: boolean
}

export interface CulturalReview {
  culturalSensitivity: 'excellent' | 'good' | 'needs-improvement'
  authenticityScore: number // 1-10
  communityBenefit: 'high' | 'medium' | 'low'
  recommendations: CulturalRecommendation[]
  concerns: string[]
}

export interface CulturalRecommendation {
  aspect: 'etiquette' | 'dress-code' | 'language' | 'gifts' | 'photography' | 'religious'
  suggestion: string
  importance: 'critical' | 'important' | 'nice-to-have'
}

export interface WorkflowNotification {
  id: string
  type: NotificationType
  recipient: NotificationRecipient
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed'
  content: NotificationContent
  scheduledFor?: string
  sentAt?: string
  deliveredAt?: string
  readAt?: string
  retryCount: number
  maxRetries: number
}

export type NotificationType = 
  | 'client-welcome'
  | 'ai-proposal-ready'
  | 'mbaye-review-request'
  | 'mbaye-review-complete'
  | 'client-confirmation-request'
  | 'whatsapp-contact-ready'
  | 'booking-reminder'
  | 'trip-reminder'
  | 'feedback-request'
  | 'system-alert'

export type NotificationRecipient = 
  | 'client'
  | 'mbaye'
  | 'admin'
  | 'system'

export interface NotificationContent {
  subject: string
  message: string
  actionUrl?: string
  actionText?: string
  priority: 'low' | 'normal' | 'high' | 'urgent'
  channels: NotificationChannel[]
}

export type NotificationChannel = 'email' | 'whatsapp' | 'sms' | 'dashboard' | 'push'

export interface SessionMetadata {
  source: 'website' | 'referral' | 'social-media' | 'direct'
  device: 'mobile' | 'tablet' | 'desktop'
  location?: {
    country: string
    city?: string
    timezone: string
  }
  sessionDuration: number
  pageViews: number
  interactions: SessionInteraction[]
  aiModelUsed: string[]
  totalTokensUsed: number
  estimatedCost: number
}

export interface SessionInteraction {
  type: 'page-view' | 'button-click' | 'form-submit' | 'ai-message' | 'scroll' | 'download'
  target: string
  timestamp: string
  data?: any
}

// États et transitions du workflow
export const workflowTransitions: Record<WorkflowStatus, WorkflowStatus[]> = {
  'client-inquiry': ['ai-conversation'],
  'ai-conversation': ['ai-proposal', 'client-inquiry'],
  'ai-proposal': ['client-review', 'client-modifications'],
  'client-review': ['client-confirmed', 'client-modifications', 'expired'],
  'client-modifications': ['ai-conversation', 'ai-proposal'],
  'pending-mbaye-review': ['mbaye-reviewing'],
  'mbaye-reviewing': ['mbaye-approved', 'mbaye-modified'],
  'mbaye-approved': ['pending-client-confirmation'],
  'mbaye-modified': ['client-review'],
  'pending-client-confirmation': ['client-confirmed', 'client-modifications', 'expired'],
  'client-confirmed': ['whatsapp-initiated'],
  'whatsapp-initiated': ['booking-in-progress'],
  'booking-in-progress': ['booked', 'cancelled'],
  'booked': ['in-progress'],
  'in-progress': ['completed'],
  'completed': [],
  'cancelled': [],
  'expired': []
}

// Fonctions utilitaires pour le workflow
export function canTransitionTo(currentStatus: WorkflowStatus, targetStatus: WorkflowStatus): boolean {
  return workflowTransitions[currentStatus]?.includes(targetStatus) || false
}

export function getNextPossibleStates(currentStatus: WorkflowStatus): WorkflowStatus[] {
  return workflowTransitions[currentStatus] || []
}

export function isTerminalState(status: WorkflowStatus): boolean {
  return ['completed', 'cancelled', 'expired'].includes(status)
}

export function getWorkflowProgress(status: WorkflowStatus): number {
  const progressMap: Record<WorkflowStatus, number> = {
    'client-inquiry': 5,
    'ai-conversation': 15,
    'ai-proposal': 25,
    'client-review': 35,
    'client-modifications': 30,
    'pending-mbaye-review': 45,
    'mbaye-reviewing': 50,
    'mbaye-approved': 60,
    'mbaye-modified': 55,
    'pending-client-confirmation': 70,
    'client-confirmed': 80,
    'whatsapp-initiated': 85,
    'booking-in-progress': 90,
    'booked': 95,
    'in-progress': 98,
    'completed': 100,
    'cancelled': 0,
    'expired': 0
  }
  return progressMap[status] || 0
}

export function getWorkflowStageLabel(status: WorkflowStatus, language: 'fr' | 'en' = 'fr'): string {
  const labels: Record<WorkflowStatus, { fr: string, en: string }> = {
    'client-inquiry': { fr: 'Demande initiale', en: 'Initial inquiry' },
    'ai-conversation': { fr: 'Discussion en cours', en: 'AI conversation' },
    'ai-proposal': { fr: 'Proposition générée', en: 'AI proposal ready' },
    'client-review': { fr: 'Examen client', en: 'Client review' },
    'client-modifications': { fr: 'Modifications demandées', en: 'Client modifications' },
    'pending-mbaye-review': { fr: 'En attente validation', en: 'Pending Mbaye review' },
    'mbaye-reviewing': { fr: 'Examen par Mbaye', en: 'Mbaye reviewing' },
    'mbaye-approved': { fr: 'Approuvé par Mbaye', en: 'Mbaye approved' },
    'mbaye-modified': { fr: 'Modifié par Mbaye', en: 'Modified by Mbaye' },
    'pending-client-confirmation': { fr: 'Confirmation client', en: 'Pending client confirmation' },
    'client-confirmed': { fr: 'Confirmé par client', en: 'Client confirmed' },
    'whatsapp-initiated': { fr: 'Contact WhatsApp', en: 'WhatsApp contact' },
    'booking-in-progress': { fr: 'Réservation en cours', en: 'Booking in progress' },
    'booked': { fr: 'Réservé', en: 'Booked' },
    'in-progress': { fr: 'Voyage en cours', en: 'Trip in progress' },
    'completed': { fr: 'Terminé', en: 'Completed' },
    'cancelled': { fr: 'Annulé', en: 'Cancelled' },
    'expired': { fr: 'Expiré', en: 'Expired' }
  }
  return labels[status][language]
}

// Import des types des autres fichiers
import type { TravelItinerary, ItineraryModification, CostRange, ClientPreferences } from './destinations'