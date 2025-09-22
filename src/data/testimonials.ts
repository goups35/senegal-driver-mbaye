export interface Testimonial {
  id: number
  name: string
  location: string
  date: string
  rating: number
  text: string
  trip: string
}

export const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "baba974",
    location: "Forum Routard",
    date: "Juillet 2025",
    rating: 5,
    text: "Nous avons voyagé en famille de 4 avec Mbaye. Il est venu nous chercher à l'aéroport. Il est ponctuel, professionnel et plein d'humour. Nous le recommandons sans hésitation.",
    trip: "Voyage en famille de 4"
  },
  {
    id: 2,
    name: "maximeS",
    location: "Forum Routard",
    date: "Juin 2025",
    rating: 5,
    text: "Nous avons voyagé une semaine avec Mbaye à trois. Plus qu'un chauffeur, il a traduit, évité les problèmes, orienté. Il connaît bien le pays, reste professionnel et s'adapte. Il a de l'humour et est attentionné. Je le recommande vivement.",
    trip: "Circuit 7 jours à trois"
  },
  {
    id: 3,
    name: "helene33000",
    location: "Forum Routard",
    date: "Mai 2025",
    rating: 5,
    text: "Nous avons fait une semaine au Sénégal avec Mbaye. Il est professionnel, ponctuel et bon conducteur. Il nous aide dans nos choix et nos achats. Il adapte les circuits selon nos envies. Prix raisonnable.",
    trip: "Séjour 7 jours"
  },
  {
    id: 4,
    name: "fabhou",
    location: "Forum Routard",
    date: "Mai 2025",
    rating: 4,
    text: "Petit voyage au Sénégal avec Mbaye. Il est très sympa et de bon conseil. Personne de confiance et très ponctuel.",
    trip: "Court séjour"
  },
  {
    id: 5,
    name: "arnoldpol",
    location: "Forum Routard",
    date: "Mars 2025",
    rating: 4,
    text: "Nous quittons le Sénégal après une première virée de 15 jours, de la Casamance jusqu'à Dakar. Nous avons été guidés par le chauffeur Mbaye Diop. Il est parfait pour la conduite, les visites et les conseils.",
    trip: "Circuit 15 jours Casamance-Dakar"
  },
  {
    id: 6,
    name: "skyluke",
    location: "Forum Routard",
    date: "Janvier 2025",
    rating: 5,
    text: "J'ai voyagé pendant 10 jours avec Mbaye Diop (dit Babacar) de Dakar aux frontières de la Gambie. Ce n'était pas mon premier circuit avec un chauffeur privé et je suis heureux d'affirmer que Babacar a su se montrer professionnel, aimable et accueillant.",
    trip: "Circuit 10 jours Dakar-Gambie"
  },
  {
    id: 7,
    name: "sophialhr",
    location: "Forum Routard",
    date: "Décembre 2024",
    rating: 4,
    text: "Nous avons fait un magnifique voyage de 15 jours avec ma tante et ma cousine, grâce à Babacar notre chauffeur, guide et garde du corps, qui nous a fait voir le plus beau que le Sénégal a à offrir.",
    trip: "Circuit 15 jours Dakar-Saint-Louis-Saly"
  },
  {
    id: 8,
    name: "moon34980",
    location: "Forum Routard",
    date: "Octobre 2024",
    rating: 5,
    text: "Babacar a été notre guide, chauffeur et garde du corps. Nous avons passé effectivement 15 jours fantastiques en sa compagnie. Il était super efficace, super serviable et discret. Il était à l'écoute de toutes nos demandes et nous a accompagné et conseillé tout au long de notre séjour.",
    trip: "Séjour 15 jours"
  },
  {
    id: 9,
    name: "leilabb",
    location: "Forum Routard",
    date: "Octobre 2024",
    rating: 4,
    text: "Babacar (Mbaye Diop) a été notre guide, chauffeur durant 10 jours au Sénégal. Il est très sympathique, toujours ponctuel (même en avance) et sérieux. Il nous a emmené dans plein de beaux endroits.",
    trip: "Circuit 10 jours"
  }
]

export interface TestimonialStats {
  averageRating: number
  totalReviews: number
  formattedRating: string
  formattedReviews: string
}

export function calculateTestimonialStats(): TestimonialStats {
  const totalRating = testimonials.reduce((sum, testimonial) => sum + testimonial.rating, 0)
  const averageRating = totalRating / testimonials.length
  const totalReviews = testimonials.length

  return {
    averageRating,
    totalReviews,
    formattedRating: `${averageRating.toFixed(1)}/5`,
    formattedReviews: `${totalReviews} avis`
  }
}