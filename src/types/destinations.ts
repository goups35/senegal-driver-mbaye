/* eslint-disable @typescript-eslint/no-explicit-any */
// Types pour le système d'IA expert Sénégal
export interface SenegalDestination {
  id: string
  name: string
  region: SenegalRegion
  type: DestinationType
  coordinates: {
    latitude: number
    longitude: number
  }
  description: string
  authenticExperiences: AuthenticExperience[]
  bestTimeToVisit: Season[]
  culturalSignificance: string
  practicalInfo: PracticalInfo
  transportOptions: TransportOption[]
  estimatedDuration: DurationRecommendation
  difficulty: DifficultyLevel
  cost: CostRange
  tags: string[]
  images: string[]
  mbayeRecommendation: string
  created_at: string
  updated_at: string
}

export interface AuthenticExperience {
  id: string
  name: string
  category: ExperienceCategory
  description: string
  duration: string
  cost: CostRange
  groupSizeRecommendation: {
    min: number
    max: number
    optimal: number
  }
  seasonalAvailability: Season[]
  culturalContext: string
  whatToExpect: string
  whatToBring: string[]
  languageSupport: Language[]
  accessibility: AccessibilityInfo
  mbayeNotes: string
}

export interface TravelItinerary {
  id: string
  name: string
  status: ItineraryStatus
  client: ClientInfo
  destinations: SenegalDestination[]
  experiences: AuthenticExperience[]
  totalDuration: number // en jours
  totalCost: CostRange
  transportPlan: TransportPlan
  accommodationSuggestions: AccommodationSuggestion[]
  culturalGuidance: CulturalGuidance
  personalizedNotes: string
  mbayeValidation: MbayeValidation
  created_at: string
  updated_at: string
}

export interface MbayeValidation {
  status: 'pending' | 'approved' | 'modified' | 'rejected'
  notes: string
  modifications: ItineraryModification[]
  approvedAt?: string
  approvedBy: string
}

export interface ItineraryModification {
  type: 'destination' | 'experience' | 'transport' | 'timing' | 'cost'
  original: any
  modified: any
  reason: string
  timestamp: string
}

// Enums et types spécialisés Sénégal
export type SenegalRegion = 
  | 'Dakar' 
  | 'Thiès' 
  | 'Saint-Louis' 
  | 'Kaolack' 
  | 'Tambacounda' 
  | 'Kolda' 
  | 'Ziguinchor' 
  | 'Matam' 
  | 'Kaffrine' 
  | 'Kédougou' 
  | 'Louga' 
  | 'Fatick' 
  | 'Diourbel' 
  | 'Sédhiou'

export type DestinationType = 
  | 'cultural-site' 
  | 'natural-park' 
  | 'beach' 
  | 'historic-monument' 
  | 'traditional-village' 
  | 'market' 
  | 'artisan-workshop' 
  | 'religious-site' 
  | 'unesco-heritage' 
  | 'nature-reserve'

export type ExperienceCategory = 
  | 'cultural-immersion' 
  | 'traditional-craft' 
  | 'local-cuisine' 
  | 'music-dance' 
  | 'nature-wildlife' 
  | 'historical-tour' 
  | 'spiritual-journey' 
  | 'artisan-workshop' 
  | 'community-visit' 
  | 'teranga-experience'

export type Season = 'dry-season' | 'rainy-season' | 'year-round'

export type Language = 'français' | 'wolof' | 'pulaar' | 'serer' | 'mandinka' | 'english'

export type DifficultyLevel = 'easy' | 'moderate' | 'challenging' | 'expert'

export type ItineraryStatus = 
  | 'draft' 
  | 'ai-generated' 
  | 'pending-validation' 
  | 'mbaye-approved' 
  | 'client-confirmed' 
  | 'in-progress' 
  | 'completed' 
  | 'cancelled'

export interface CostRange {
  min: number
  max: number
  currency: 'XOF' | 'EUR' | 'USD'
  includes: string[]
  excludes: string[]
}

export interface PracticalInfo {
  accessByRoad: string
  parkingAvailability: boolean
  entryFees: CostRange | null
  openingHours: string
  bestTimeOfDay: string
  weatherConsiderations: string
  safetyNotes: string
  requiredPermits: string[]
}

export interface TransportOption {
  type: 'mbaye-direct' | 'public-transport' | 'combination'
  description: string
  duration: string
  cost: CostRange
  comfort: 'basic' | 'standard' | 'premium'
  recommendations: string
}

export interface DurationRecommendation {
  minimum: number // en heures
  recommended: number
  maximum: number
  notes: string
}

export interface AccessibilityInfo {
  wheelchairAccessible: boolean
  walkingDifficulty: DifficultyLevel
  ageRecommendations: {
    minAge: number
    maxAge: number | null
    notes: string
  }
  healthConsiderations: string[]
}

export interface ClientInfo {
  name: string
  email: string
  phone: string
  preferences: ClientPreferences
  groupSize: number
  budget: CostRange
  travelDates: {
    arrival: string
    departure: string
  }
  previousSenegalVisit: boolean
  specialRequests: string
}

export interface ClientPreferences {
  interests: ExperienceCategory[]
  culturalImmersionLevel: 'light' | 'moderate' | 'deep'
  activityLevel: DifficultyLevel
  accommodationPreference: 'budget' | 'mid-range' | 'luxury' | 'authentic-local'
  dietaryRestrictions: string[]
  languagePreference: Language[]
  transportComfort: 'basic' | 'standard' | 'premium'
}

export interface TransportPlan {
  routes: RouteSegment[]
  totalDistance: number
  totalDuration: string
  vehicleRecommendation: VehicleRecommendation
  driverNotes: string
}

export interface RouteSegment {
  from: string
  to: string
  distance: number
  duration: string
  roadConditions: 'excellent' | 'good' | 'fair' | 'challenging'
  scenicValue: number // 1-5
  stopRecommendations: StopRecommendation[]
}

export interface StopRecommendation {
  location: string
  reason: string
  duration: string
  optional: boolean
}

export interface VehicleRecommendation {
  type: 'standard' | 'premium' | 'suv' | 'minibus'
  reason: string
  features: string[]
}

export interface AccommodationSuggestion {
  name: string
  type: 'hotel' | 'guesthouse' | 'traditional-lodge' | 'family-homestay'
  location: string
  priceRange: CostRange
  authenticityScore: number // 1-5
  mbayePartnership: boolean
  description: string
}

export interface CulturalGuidance {
  etiquette: EtiquetteGuidance[]
  languageTips: LanguageTip[]
  culturalSensitivities: string[]
  giftGivingAdvice: string
  dressCodes: DressCodeAdvice[]
  photographyEtiquette: string
}

export interface EtiquetteGuidance {
  situation: string
  guidance: string
  importance: 'essential' | 'important' | 'nice-to-know'
}

export interface LanguageTip {
  phrase: string
  pronunciation: string
  meaning: string
  context: string
}

export interface DressCodeAdvice {
  location: string
  recommendations: string
  restrictions: string[]
}

// Types pour l'IA et le workflow
export interface AIRecommendationRequest {
  clientPreferences: ClientPreferences
  travelDates: {
    arrival: string
    departure: string
  }
  groupSize: number
  budget: CostRange
  specialRequests?: string
  conversationHistory: AIMessage[]
}

export interface AIMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: string
  metadata?: {
    destinations?: string[]
    experiences?: string[]
    confidence?: number
  }
}

export interface AIRecommendationResponse {
  itinerary: TravelItinerary
  reasoning: string
  alternatives: AlternativeOption[]
  confidenceScore: number
  questionsForUser: string[]
}

export interface AlternativeOption {
  title: string
  description: string
  costDifference: number
  durationDifference: number
  whyRecommended: string
}