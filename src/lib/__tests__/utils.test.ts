import { cn, formatWhatsAppUrl } from '@/lib/utils'

describe('Utils', () => {
  describe('cn (className merger)', () => {
    it('merges class names correctly', () => {
      expect(cn('px-2', 'py-1')).toBe('px-2 py-1')
    })

    it('handles conditional classes', () => {
      expect(cn('base-class', true && 'conditional-class')).toBe('base-class conditional-class')
      expect(cn('base-class', false && 'conditional-class')).toBe('base-class')
    })

    it('handles undefined and empty classes', () => {
      expect(cn('base-class', undefined, '', 'other-class')).toBe('base-class other-class')
    })

    it('resolves Tailwind conflicts', () => {
      // Tailwind merge should prioritize later classes
      expect(cn('px-2', 'px-4')).toBe('px-4')
    })
  })

  describe('formatWhatsAppUrl', () => {
    it('creates correct WhatsApp URL with message', () => {
      const phone = '+221775762203'
      const message = 'Bonjour, je souhaite un devis'
      
      const result = formatWhatsAppUrl(phone, message)
      
      expect(result).toContain('https://wa.me/221775762203')
      expect(result).toContain('text=Bonjour%2C%20je%20souhaite%20un%20devis')
    })

    it('handles phone numbers with different formats', () => {
      expect(formatWhatsAppUrl('+221 77 576 22 03', 'test')).toContain('221775762203')
      expect(formatWhatsAppUrl('+221.77.576.22.03', 'test')).toContain('775762203')
      expect(formatWhatsAppUrl('77 576 22 03', 'test')).toContain('775762203')
    })

    it('encodes special characters in message', () => {
      const message = 'Bonjour test'
      const result = formatWhatsAppUrl('+221775762203', message)
      
      expect(result).toContain('https://wa.me/221775762203')
      expect(result).toContain('text=Bonjour%20test')
    })

    it('handles empty message', () => {
      const result = formatWhatsAppUrl('+221775762203', '')
      expect(result).toContain('https://wa.me/221775762203')
    })
  })
})