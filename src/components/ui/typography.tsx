import React from 'react'
import { typographyClasses } from '@/styles/typography'
import { cn } from '@/lib/utils'

interface TypographyProps {
  children: React.ReactNode
  className?: string
  as?: React.ElementType
}

// Composants de base
export function TypographyH1({ children, className, as: Component = 'h1', ...props }: TypographyProps & React.HTMLAttributes<HTMLElement>) {
  return (
    <Component className={cn(typographyClasses.h1, className)} {...props}>
      {children}
    </Component>
  )
}

export function TypographyH2({ children, className, as: Component = 'h2', ...props }: TypographyProps & React.HTMLAttributes<HTMLElement>) {
  return (
    <Component className={cn(typographyClasses.h2, className)} {...props}>
      {children}
    </Component>
  )
}

export function TypographyH3({ children, className, as: Component = 'h3', ...props }: TypographyProps & React.HTMLAttributes<HTMLElement>) {
  return (
    <Component className={cn(typographyClasses.h3, className)} {...props}>
      {children}
    </Component>
  )
}

export function TypographyH4({ children, className, as: Component = 'h4', ...props }: TypographyProps & React.HTMLAttributes<HTMLElement>) {
  return (
    <Component className={cn(typographyClasses.h4, className)} {...props}>
      {children}
    </Component>
  )
}

export function TypographyBody({ children, className, as: Component = 'p', ...props }: TypographyProps & React.HTMLAttributes<HTMLElement>) {
  return (
    <Component className={cn(typographyClasses.body, className)} {...props}>
      {children}
    </Component>
  )
}

export function TypographyBodyLarge({ children, className, as: Component = 'p', ...props }: TypographyProps & React.HTMLAttributes<HTMLElement>) {
  return (
    <Component className={cn(typographyClasses.bodyLarge, className)} {...props}>
      {children}
    </Component>
  )
}

export function TypographyBodySmall({ children, className, as: Component = 'p', ...props }: TypographyProps & React.HTMLAttributes<HTMLElement>) {
  return (
    <Component className={cn(typographyClasses.bodySmall, className)} {...props}>
      {children}
    </Component>
  )
}

export function TypographyCaption({ children, className, as: Component = 'span', ...props }: TypographyProps & React.HTMLAttributes<HTMLElement>) {
  return (
    <Component className={cn(typographyClasses.caption, className)} {...props}>
      {children}
    </Component>
  )
}

export function TypographyLabel({ children, className, as: Component = 'label', ...props }: TypographyProps & React.HTMLAttributes<HTMLElement>) {
  return (
    <Component className={cn(typographyClasses.label, className)} {...props}>
      {children}
    </Component>
  )
}

export function TypographyHero({ children, className, as: Component = 'h1', ...props }: TypographyProps & React.HTMLAttributes<HTMLElement>) {
  return (
    <Component className={cn(typographyClasses.hero, className)} {...props}>
      {children}
    </Component>
  )
}

export function TypographySubtitle({ children, className, as: Component = 'p', ...props }: TypographyProps & React.HTMLAttributes<HTMLElement>) {
  return (
    <Component className={cn(typographyClasses.subtitle, className)} {...props}>
      {children}
    </Component>
  )
}

export function TypographyBrand({ children, className, as: Component = 'span', ...props }: TypographyProps & React.HTMLAttributes<HTMLElement>) {
  return (
    <Component className={cn(typographyClasses.brand, className)} {...props}>
      {children}
    </Component>
  )
}

export function TypographyAccent({ children, className, as: Component = 'span', ...props }: TypographyProps & React.HTMLAttributes<HTMLElement>) {
  return (
    <Component className={cn(typographyClasses.accent, className)} {...props}>
      {children}
    </Component>
  )
}

// Composant générique avec variant
interface TypographyGenericProps extends TypographyProps {
  variant: keyof typeof typographyClasses
}

export function Typography({ 
  children, 
  className, 
  variant, 
  as: Component = 'p', 
  ...props 
}: TypographyGenericProps & React.HTMLAttributes<HTMLElement>) {
  return (
    <Component className={cn(typographyClasses[variant], className)} {...props}>
      {children}
    </Component>
  )
}