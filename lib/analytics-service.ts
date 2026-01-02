import { databases } from './appwrite'
import { Query } from 'appwrite'
import { config } from './config'

export interface DashboardStats {
  totalVerifications: number
  monthlyVerifications: number
  webhooksConfigured: number
  successRate: number
  averageResponseTime: number
}

export interface VerificationStats {
  totalVerifications: number
  monthlyVerifications: number
  successRate: number
  averageResponseTime: number
}

export class AnalyticsService {
  // Helper to get user's API keys
  private static async getUserApiKeys(userId: string): Promise<string[]> {
    try {
      const apiKeysResult = await databases.listDocuments(
        config.appwrite.database.id,
        config.appwrite.database.collections.apiKeys,
        [Query.equal('userId', userId)]
      )
      return apiKeysResult.documents.map((doc: any) => doc.key).filter(Boolean)
    } catch (error) {
      console.error('Error fetching user API keys:', error)
      return []
    }
  }

  // Helper to filter verification sessions for a user
  private static filterUserVerifications(docs: any[], userId: string, userApiKeys: string[]): any[] {
    return docs.filter((doc: any) => {
      // Check if userId matches
      if (doc.userId === userId) {
        return true
      }
      
      // Check if apiKeyId matches any of the user's API keys
      if (doc.apiKeyId && userApiKeys.length > 0) {
        const apiKeyIdStr = String(doc.apiKeyId)
        return userApiKeys.some((key: string) => apiKeyIdStr.includes(key))
      }
      
      return false
    })
  }

  // Get real dashboard statistics
  static async getDashboardStats(userId: string): Promise<DashboardStats> {
    try {
      // Get user's API keys first
      const userApiKeys = await this.getUserApiKeys(userId)
      
      // Get all verifications (we'll filter client-side)
      const verificationsResult = await databases.listDocuments(
        config.appwrite.database.id,
        config.appwrite.database.collections.verificationSessions,
        []
      )

      // Filter to only user's verifications
      const userVerifications = this.filterUserVerifications(
        verificationsResult.documents,
        userId,
        userApiKeys
      )

      // Get documents count
      // Documents are not tied yet; skip for now or integrate later

      // Calculate stats from filtered user verifications
      const totalVerifications = userVerifications.length
      
      // Calculate monthly verifications (last 30 days)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      
      const monthlyVerifications = userVerifications.filter(
        (doc: any) => new Date(doc.createdAt) > thirtyDaysAgo
      )
      const monthlyVerificationsCount = monthlyVerifications.length

      // Calculate success rate
      const successfulVerifications = userVerifications.filter(
        (doc: any) => doc.status === 'completed'
      ).length
      const successRate = totalVerifications > 0 ? (successfulVerifications / totalVerifications) * 100 : 0

      // Calculate average response time
      const responseTimes = userVerifications
        .map((doc: any) => {
          if (doc.createdAt && doc.completedAt) {
            const start = new Date(doc.createdAt).getTime()
            const end = new Date(doc.completedAt).getTime()
            const diff = end - start
            return diff > 0 ? diff : 0
          }
          return 0
        })
        .filter(time => time > 0)
      
      const averageResponseTime = responseTimes.length > 0 
        ? responseTimes.reduce((a: number, b: number) => a + b, 0) / responseTimes.length 
        : 0

      // Mock webhooks count for now (will be implemented later)
      // Webhooks count can be fetched separately on dashboard; keep 0 here
      const webhooksConfigured = 0

      return {
        totalVerifications,
        monthlyVerifications: monthlyVerificationsCount,
        webhooksConfigured,
        successRate: Math.round(successRate * 10) / 10, // Round to 1 decimal place
        averageResponseTime: Math.round(averageResponseTime)
      }
    } catch (error) {
      console.error('Error getting dashboard stats:', error)
      // Return default stats on error
      return {
        totalVerifications: 0,
        monthlyVerifications: 0,
        webhooksConfigured: 0,
        successRate: 0,
        averageResponseTime: 0
      }
    }
  }

  // Get verification usage statistics
  static async getVerificationUsageStats(userId: string): Promise<VerificationStats> {
    try {
      // Get user's API keys first
      const userApiKeys = await this.getUserApiKeys(userId)
      
      const verificationsResult = await databases.listDocuments(
        config.appwrite.database.id,
        config.appwrite.database.collections.verificationSessions,
        []
      )

      // Filter to only user's verifications
      const userVerifications = this.filterUserVerifications(
        verificationsResult.documents,
        userId,
        userApiKeys
      )

      const totalVerifications = userVerifications.length
      
      // Calculate monthly verifications
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      
      const monthlyVerifications = userVerifications.filter(
        (doc: any) => new Date(doc.createdAt) > thirtyDaysAgo
      )
      const monthlyVerificationsCount = monthlyVerifications.length

      // Calculate success rate
      const successfulVerifications = userVerifications.filter(
        (doc: any) => doc.status === 'completed'
      ).length
      const successRate = totalVerifications > 0 ? (successfulVerifications / totalVerifications) * 100 : 0

      // Calculate average response time
      const responseTimes = userVerifications
        .map((doc: any) => {
          if (doc.createdAt && doc.completedAt) {
            const start = new Date(doc.createdAt).getTime()
            const end = new Date(doc.completedAt).getTime()
            const diff = end - start
            return diff > 0 ? diff : 0
          }
          return 0
        })
        .filter(time => time > 0)
      
      const averageResponseTime = responseTimes.length > 0 
        ? responseTimes.reduce((a: number, b: number) => a + b, 0) / responseTimes.length 
        : 0

      return {
        totalVerifications,
        monthlyVerifications: monthlyVerificationsCount,
        successRate: Math.round(successRate * 10) / 10,
        averageResponseTime: Math.round(averageResponseTime)
      }
    } catch (error) {
      console.error('Error getting verification usage stats:', error)
      return {
        totalVerifications: 0,
        monthlyVerifications: 0,
        successRate: 0,
        averageResponseTime: 0
      }
    }
  }

  // Get verification analytics
  static async getVerificationAnalytics(userId: string) {
    try {
      // Get user's API keys first
      const userApiKeys = await this.getUserApiKeys(userId)
      
      const verificationsResult = await databases.listDocuments(
        config.appwrite.database.id,
        config.appwrite.database.collections.verificationSessions,
        []
      )

      // Filter to only user's verifications
      const userVerifications = this.filterUserVerifications(
        verificationsResult.documents,
        userId,
        userApiKeys
      )

      const total = userVerifications.length
      const verified = userVerifications.filter((doc: any) => doc.status === 'completed').length
      const failed = userVerifications.filter((doc: any) => doc.status === 'failed').length
      const pending = userVerifications.filter((doc: any) => doc.status === 'pending').length

      const successRate = total > 0 ? (verified / total) * 100 : 0

      return {
        total,
        verified,
        failed,
        pending,
        successRate: Math.round(successRate * 10) / 10
      }
    } catch (error) {
      console.error('Error getting verification analytics:', error)
      return {
        total: 0,
        verified: 0,
        failed: 0,
        pending: 0,
        successRate: 0
      }
    }
  }
} 