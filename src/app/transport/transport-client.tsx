'use client'

import { Navbar } from '@/components/navigation/navbar'
import { Footer } from '@/components/footer/footer'
import { TransportQuoteWrapper } from '@/components/features/transport-quote/transport-quote-wrapper'
import { useTripContext } from '@/context/trip-context'
import { useRouter } from 'next/navigation'
import type { TripQuote } from '@/types'
import { TripRequestInput } from '@/schemas/trip'

export function TransportClient() {
  const router = useRouter()
  const { currentQuote, tripData, updateQuoteAndData, resetTrip } = useTripContext()

  const handleQuoteGenerated = (quote: TripQuote, data: TripRequestInput) => {
    updateQuoteAndData(quote, data)
  }

  const handleReset = () => {
    resetTrip()
  }

  const handleBackToHome = () => {
    resetTrip()
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-8">
          <div className="space-y-6">
            <TransportQuoteWrapper
              currentQuote={currentQuote}
              tripData={tripData}
              onQuoteGenerated={handleQuoteGenerated}
              onReset={handleReset}
            />
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}