/**
 * @jest-environment node
 */

import { GET } from '@/app/api/v1/health/route'

describe('/api/v1/health', () => {
  describe('GET /api/v1/health', () => {
    it('should return health status', async () => {
      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toHaveProperty('status', 'healthy')
      expect(data).toHaveProperty('timestamp')
      expect(data).toHaveProperty('service', 'senegal-driver-mvp')
      expect(data).toHaveProperty('version')
      
      // Verify timestamp is recent (within last minute)
      const timestamp = new Date(data.timestamp)
      const now = new Date()
      const diffMs = now.getTime() - timestamp.getTime()
      expect(diffMs).toBeLessThan(60000) // Less than 1 minute
    })

    it('should include environment information', async () => {
      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toHaveProperty('environment')
      expect(['development', 'production', 'test']).toContain(data.environment)
    })

    it('should return consistent response structure', async () => {
      // Call multiple times to ensure consistency
      const responses = await Promise.all([
        GET(),
        GET(),
        GET()
      ])

      const dataResults = await Promise.all(
        responses.map(r => r.json())
      )

      responses.forEach(response => {
        expect(response.status).toBe(200)
      })

      dataResults.forEach(data => {
        expect(data).toHaveProperty('status', 'healthy')
        expect(data).toHaveProperty('service', 'senegal-driver-mvp')
        expect(data).toHaveProperty('timestamp')
        expect(data).toHaveProperty('version')
        expect(data).toHaveProperty('environment')
      })
    })

    it('should have proper content-type header', async () => {
      const response = await GET()
      
      expect(response.headers.get('content-type')).toContain('application/json')
    })
  })

  describe('Performance', () => {
    it('should respond quickly', async () => {
      const startTime = Date.now()
      const response = await GET()
      const endTime = Date.now()
      
      expect(response.status).toBe(200)
      expect(endTime - startTime).toBeLessThan(100) // Should respond within 100ms
    })

    it('should handle concurrent requests', async () => {
      const promises = Array.from({ length: 10 }, () => GET())
      const responses = await Promise.all(promises)
      
      responses.forEach(response => {
        expect(response.status).toBe(200)
      })
    })
  })
})
