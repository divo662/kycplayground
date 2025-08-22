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
  // Get real dashboard statistics
  static async getDashboardStats(userId: string): Promise<DashboardStats> {
    try {
      // Get total verifications
      const verificationsResult = await databases.listDocuments(
        config.appwrite.database.id,
        config.appwrite.database.collections.verificationSessions,
        []
      )

      // Get documents count
      // Documents are not tied yet; skip for now or integrate later

      // Calculate stats
      const totalVerifications = verificationsResult.total
      
      // Calculate monthly verifications (last 30 days)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      
      const monthlyVerifications = verificationsResult.documents.filter(
        (doc: any) => new Date(doc.createdAt) > thirtyDaysAgo
      )
      const monthlyVerificationsCount = monthlyVerifications.length

      // Calculate success rate
      const successfulVerifications = verificationsResult.documents.filter(
        (doc: any) => doc.status === 'completed'
      ).length
      const successRate = totalVerifications > 0 ? (successfulVerifications / totalVerifications) * 100 : 0

      // Calculate average response time
      const responseTimes = verificationsResult.documents
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
      const verificationsResult = await databases.listDocuments(
        config.appwrite.database.id,
        config.appwrite.database.collections.verificationSessions,
        []
      )

      const totalVerifications = verificationsResult.total
      
      // Calculate monthly verifications
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      
      const monthlyVerifications = verificationsResult.documents.filter(
        (doc: any) => new Date(doc.createdAt) > thirtyDaysAgo
      )
      const monthlyVerificationsCount = monthlyVerifications.length

      // Calculate success rate
      const successfulVerifications = verificationsResult.documents.filter(
        (doc: any) => doc.status === 'completed'
      ).length
      const successRate = totalVerifications > 0 ? (successfulVerifications / totalVerifications) * 100 : 0

      // Calculate average response time
      const responseTimes = verificationsResult.documents
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
      const verificationsResult = await databases.listDocuments(
        config.appwrite.database.id,
        config.appwrite.database.collections.verificationSessions,
        []
      )

      const total = verificationsResult.total
      const verified = verificationsResult.documents.filter((doc: any) => doc.status === 'completed').length
      const failed = verificationsResult.documents.filter((doc: any) => doc.status === 'failed').length
      const pending = verificationsResult.documents.filter((doc: any) => doc.status === 'pending').length

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