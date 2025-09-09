import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import type { TripQuote } from '@/types'

const resend = new Resend(process.env.RESEND_API_KEY)

interface EmailQuoteRequest {
  quote: TripQuote
  tripData: {
    departure: string
    destination: string
    date: string
    time: string
    customerName: string
    customerPhone: string
    customerEmail?: string
  }
}

export async function POST(request: NextRequest) {
  try {
    const { quote, tripData }: EmailQuoteRequest = await request.json()

    if (!tripData.customerEmail) {
      return NextResponse.json(
        { error: 'Adresse email requise' },
        { status: 400 }
      )
    }

    const emailHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Devis de Transport - Sénégal</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #0f172a; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f8f9fa; }
          .section { background: white; margin: 15px 0; padding: 15px; border-radius: 8px; }
          .price-highlight { font-size: 24px; font-weight: bold; color: #0f172a; text-align: center; }
          .route-step { border-left: 3px solid #0f172a; padding-left: 15px; margin: 10px 0; }
          .footer { background: #0f172a; color: white; padding: 15px; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚗 Votre Devis de Transport</h1>
            <p>Service de transport premium au Sénégal</p>
          </div>
          
          <div class="content">
            <div class="section">
              <h2>📋 Détails du voyage</h2>
              <p><strong>Client:</strong> ${tripData.customerName}</p>
              <p><strong>Téléphone:</strong> ${tripData.customerPhone}</p>
              <p><strong>De:</strong> ${tripData.departure}</p>
              <p><strong>Vers:</strong> ${tripData.destination}</p>
              <p><strong>Date:</strong> ${new Date(tripData.date).toLocaleDateString('fr-FR')}</p>
              <p><strong>Heure:</strong> ${tripData.time}</p>
            </div>

            <div class="section">
              <h2>💰 Tarification</h2>
              <div class="price-highlight">
                ${quote.totalPrice.toLocaleString()} FCFA
              </div>
              <p><strong>Distance:</strong> ${quote.distance} km</p>
              <p><strong>Durée estimée:</strong> ${quote.duration}</p>
              <p><strong>Prix de base:</strong> ${quote.basePrice.toLocaleString()} FCFA</p>
            </div>

            <div class="section">
              <h2>🚙 Véhicule</h2>
              <p><strong>Modèle:</strong> ${quote.vehicleInfo.name}</p>
              <p><strong>Capacité:</strong> ${quote.vehicleInfo.capacity} passagers</p>
              <p><strong>Équipements:</strong> ${quote.vehicleInfo.features.join(', ')}</p>
            </div>

            <div class="section">
              <h2>🗺️ Itinéraire détaillé</h2>
              ${quote.route.map((step, index) => `
                <div class="route-step">
                  <strong>Étape ${index + 1}:</strong> ${step.instruction}<br>
                  <small>Distance: ${step.distance} • Durée: ${step.duration}</small>
                </div>
              `).join('')}
            </div>
          </div>

          <div class="footer">
            <p>Pour confirmer votre réservation, contactez-nous:</p>
            <p>📱 WhatsApp: ${process.env.WHATSAPP_PHONE_NUMBER || '+33 6 26 38 87 94'}</p>
            <p>🕒 Disponible 24h/24, 7j/7</p>
          </div>
        </div>
      </body>
    </html>
    `

    const { data, error } = await resend.emails.send({
      from: 'Transport Sénégal <noreply@votre-domaine.com>',
      to: [tripData.customerEmail],
      subject: `Devis de transport: ${tripData.departure} → ${tripData.destination}`,
      html: emailHtml,
    })

    if (error) {
      console.error('Erreur envoi email:', error)
      return NextResponse.json(
        { error: 'Erreur lors de l\'envoi de l\'email' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, emailId: data?.id })

  } catch (error) {
    console.error('Erreur API email:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}