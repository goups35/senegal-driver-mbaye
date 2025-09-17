'use client'

import { Navbar } from '@/components/navigation/navbar'
import { TravelPlannerWrapper } from '@/components/features/travel-planner/travel-planner-wrapper'
export function ChatClient() {


  const handleTravelPlanReady = (plan: string) => {
    console.log('Plan ready:', plan)
    // TODO: Implement travel plan handling logic
  }

  return (
    <div className="min-h-screen bg-white mobile-container mobile-safe-area">
      <Navbar />

      <div className="bg-white mobile-chat-container">
        <div className="container mx-auto px-4 py-8 mobile-padding-md">
          <div className="space-y-6 mobile-chat-content">

            <TravelPlannerWrapper onTravelPlanReady={handleTravelPlanReady} />
          </div>
        </div>
      </div>

    </div>
  )
}