interface SenegalFlagProps {
  className?: string
}

export function SenegalFlag({ className = '' }: SenegalFlagProps) {
  return (
    <svg 
      viewBox="0 0 100 100" 
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid slice"
    >
      {/* Cercle de fond pour assurer le remplissage */}
      <circle cx="50" cy="50" r="50" fill="#ffed00" />
      
      {/* Bande verte (gauche) */}
      <path d="M 0,0 L 33.33,0 L 33.33,100 L 0,100 Z" fill="#00a651" />
      
      {/* Bande jaune (centre) - déjà définie par le cercle de fond */}
      <path d="M 33.33,0 L 66.66,0 L 66.66,100 L 33.33,100 Z" fill="#ffed00" />
      
      {/* Bande rouge (droite) */}
      <path d="M 66.66,0 L 100,0 L 100,100 L 66.66,100 Z" fill="#e31e24" />
      
      {/* Étoile verte au centre */}
      <g transform="translate(50, 50)">
        <path 
          d="M0,-12 L3.8,-3.8 L12,-3.8 L5.3,1.5 L8.3,11.3 L0,6 L-8.3,11.3 L-5.3,1.5 L-12,-3.8 L-3.8,-3.8 Z" 
          fill="#00a651"
          stroke="#00a651"
          strokeWidth="0.8"
        />
      </g>
    </svg>
  )
}