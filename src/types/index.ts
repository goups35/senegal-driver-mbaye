export interface TripRequest {
  id?: string
  departure: string
  destination: string
  date: string
  time: string
  passengers: number
  vehicleType: 'standard' | 'premium' | 'suv'
  customerName: string
  customerPhone: string
  customerEmail?: string
  specialRequests?: string
  created_at?: string
}

export interface TripQuote {
  id?: string
  trip_request_id: string
  distance: number
  duration: string
  basePrice: number
  totalPrice: number
  route: RouteStep[]
  vehicleInfo: VehicleInfo
  created_at?: string
}

export interface RouteStep {
  instruction: string
  distance: string
  duration: string
}

export interface VehicleInfo {
  type: 'standard' | 'premium' | 'suv'
  name: string
  capacity: number
  features: string[]
  pricePerKm: number
}

export interface WhatsAppMessage {
  customerName: string
  customerPhone: string
  tripSummary: string
  quote: string
  bookingUrl?: string
}