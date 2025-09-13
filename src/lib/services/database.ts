import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { database } from '@/lib/config'
import { BaseService } from './base'
import { DatabaseError, NotFoundError } from '@/lib/errors'
import type { TripRequestInput, TripQuoteDb } from '@/schemas/validation'

/**
 * Database service for Supabase operations
 */
export class DatabaseService extends BaseService {
  private client: SupabaseClient
  private serviceRoleClient?: SupabaseClient

  constructor() {
    super('DatabaseService')
    
    // Regular client with RLS enabled
    this.client = createClient(
      database.url,
      database.anonKey,
      {
        auth: {
          persistSession: false,
        },
        realtime: {
          params: {
            eventsPerSecond: 10
          }
        }
      }
    )

    // Service role client for admin operations (bypasses RLS)
    if (database.serviceRoleKey) {
      this.serviceRoleClient = createClient(
        database.url,
        database.serviceRoleKey,
        {
          auth: {
            persistSession: false,
          }
        }
      )
    }
  }

  /**
   * Get the appropriate client based on admin needs
   */
  private getClient(admin = false): SupabaseClient {
    if (admin && this.serviceRoleClient) {
      return this.serviceRoleClient
    }
    return this.client
  }

  /**
   * Save a trip request to the database
   */
  async saveTripRequest(data: TripRequestInput): Promise<{ id: string }> {
    return this.executeWithLogging(async () => {
      const { data: savedTrip, error } = await this.client
        .from('trip_requests')
        .insert([{
          departure: data.departure,
          destination: data.destination,
          date: data.date,
          time: data.time,
          passengers: data.passengers,
          vehicle_type: data.vehicleType,
          customer_name: data.customerName,
          customer_phone: data.customerPhone,
          customer_email: data.customerEmail || null,
          special_requests: data.specialRequests || null,
        }])
        .select('id')
        .single()

      if (error) {
        throw new DatabaseError('Failed to save trip request', error)
      }

      if (!savedTrip?.id) {
        throw new DatabaseError('No ID returned from trip request save')
      }

      return { id: savedTrip.id }
    }, 'saveTripRequest', { data })
  }

  /**
   * Save a trip quote to the database
   */
  async saveTripQuote(quote: Omit<TripQuoteDb, 'created_at'>): Promise<{ id: string }> {
    return this.executeWithLogging(async () => {
      const { data: savedQuote, error } = await this.client
        .from('trip_quotes')
        .insert([quote])
        .select('id')
        .single()

      if (error) {
        throw new DatabaseError('Failed to save trip quote', error)
      }

      if (!savedQuote?.id) {
        throw new DatabaseError('No ID returned from trip quote save')
      }

      return { id: savedQuote.id }
    }, 'saveTripQuote', { quote })
  }

  /**
   * Get a trip request by ID
   */
  async getTripRequest(id: string): Promise<TripRequestInput & { id: string; created_at: string }> {
    return this.executeWithLogging(async () => {
      const { data, error } = await this.client
        .from('trip_requests')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          throw new NotFoundError('Trip request')
        }
        throw new DatabaseError('Failed to fetch trip request', error)
      }

      return {
        id: data.id,
        departure: data.departure,
        destination: data.destination,
        date: data.date,
        time: data.time,
        passengers: data.passengers,
        vehicleType: data.vehicle_type,
        customerName: data.customer_name,
        customerPhone: data.customer_phone,
        customerEmail: data.customer_email,
        specialRequests: data.special_requests,
        created_at: data.created_at,
      }
    }, 'getTripRequest', { id })
  }

  /**
   * Get trip quote by trip request ID
   */
  async getTripQuote(tripRequestId: string): Promise<TripQuoteDb & { id: string; created_at: string }> {
    return this.executeWithLogging(async () => {
      const { data, error } = await this.client
        .from('trip_quotes')
        .select('*')
        .eq('trip_request_id', tripRequestId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          throw new NotFoundError('Trip quote')
        }
        throw new DatabaseError('Failed to fetch trip quote', error)
      }

      return {
        id: data.id,
        trip_request_id: data.trip_request_id,
        distance: data.distance,
        duration: data.duration,
        base_price: data.base_price,
        total_price: data.total_price,
        route: data.route,
        vehicle_info: data.vehicle_info,
        created_at: data.created_at,
      }
    }, 'getTripQuote', { tripRequestId })
  }

  /**
   * Save AI conversation to database
   */
  async saveConversation(data: {
    session_id: string
    user_message: string
    ai_response: string
    context: string
    metadata?: Record<string, unknown>
  }): Promise<{ id: string }> {
    return this.executeWithLogging(async () => {
      const { data: savedConversation, error } = await this.client
        .from('ai_conversations')
        .insert([data])
        .select('id')
        .single()

      if (error) {
        throw new DatabaseError('Failed to save conversation', error)
      }

      if (!savedConversation?.id) {
        throw new DatabaseError('No ID returned from conversation save')
      }

      return { id: savedConversation.id }
    }, 'saveConversation', { data })
  }

  /**
   * Get conversation history for a session
   */
  async getConversationHistory(sessionId: string, limit = 50): Promise<Array<{
    id: string
    user_message: string
    ai_response: string
    context: string
    metadata?: Record<string, unknown>
    created_at: string
  }>> {
    return this.executeWithLogging(async () => {
      const { data, error } = await this.client
        .from('ai_conversations')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true })
        .limit(limit)

      if (error) {
        throw new DatabaseError('Failed to fetch conversation history', error)
      }

      return data || []
    }, 'getConversationHistory', { sessionId, limit })
  }

  /**
   * Health check for database connectivity
   */
  async healthCheck(): Promise<{ status: 'up' | 'down'; responseTime: number; error?: string }> {
    const startTime = Date.now()
    
    try {
      const { data, error } = await this.client
        .from('trip_requests')
        .select('id')
        .limit(1)
        .maybeSingle()

      const responseTime = Date.now() - startTime

      if (error) {
        return {
          status: 'down',
          responseTime,
          error: error.message,
        }
      }

      return {
        status: 'up',
        responseTime,
      }
    } catch (error) {
      return {
        status: 'down',
        responseTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  /**
   * Enable Row Level Security for a table (admin operation)
   */
  async enableRLS(tableName: string): Promise<void> {
    const client = this.getClient(true)
    
    return this.executeWithLogging(async () => {
      const { error } = await client.rpc('enable_rls', { table_name: tableName })
      
      if (error) {
        throw new DatabaseError(`Failed to enable RLS for ${tableName}`, error)
      }
    }, 'enableRLS', { tableName })
  }

  /**
   * Create RLS policy (admin operation)
   */
  async createRLSPolicy(
    tableName: string,
    policyName: string,
    command: string,
    expression: string
  ): Promise<void> {
    const client = this.getClient(true)
    
    return this.executeWithLogging(async () => {
      const { error } = await client.rpc('create_policy', {
        table_name: tableName,
        policy_name: policyName,
        command_type: command,
        expression,
      })
      
      if (error) {
        throw new DatabaseError(`Failed to create RLS policy ${policyName}`, error)
      }
    }, 'createRLSPolicy', { tableName, policyName, command, expression })
  }
}

// Export singleton instance
export const databaseService = new DatabaseService()