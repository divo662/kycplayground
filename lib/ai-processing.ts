import { config } from './config'

// AI Processing Results Interface
export interface AIProcessingResult {
  faceDetection: {
    detected: boolean
    confidence: number
    boundingBox?: { x: number; y: number; width: number; height: number }
    landmarks?: Array<{ x: number; y: number }>
  }
  faceRecognition: {
    similarity: number
    matchFound: boolean
    personId?: string
  }
  documentValidation: {
    isValid: boolean
    confidence: number
    documentType: string
    authenticityScore: number
    tamperingDetected: boolean
    tamperingScore: number
  }
  ocrResults: {
    text: string
    confidence: number
    extractedData: {
      firstName?: string
      lastName?: string
      dateOfBirth?: string
      documentNumber?: string
      nationality?: string
      expiryDate?: string
      issueDate?: string
      issuingAuthority?: string
    }
  }
  fraudDetection: {
    riskScore: number
    riskLevel: 'low' | 'medium' | 'high'
    fraudIndicators: string[]
    suspiciousPatterns: string[]
  }
  livenessDetection: {
    isLive: boolean
    confidence: number
    livenessScore: number
    spoofingDetected: boolean
    spoofingScore: number
  }
  overallConfidence: number
  processingTime: number
}

// Mock AI Processing Engine
export class MockAIProcessor {
  private static instance: MockAIProcessor

  static getInstance(): MockAIProcessor {
    if (!MockAIProcessor.instance) {
      MockAIProcessor.instance = new MockAIProcessor()
    }
    return MockAIProcessor.instance
  }

  // Main processing method
  async processDocument(
    imageData: string | File,
    documentType: string,
    options: {
      enableFaceDetection?: boolean
      enableFaceRecognition?: boolean
      enableDocumentValidation?: boolean
      enableOCR?: boolean
      enableFraudDetection?: boolean
      enableLivenessDetection?: boolean
    } = {}
  ): Promise<AIProcessingResult> {
    const startTime = Date.now()

    // Simulate processing delay
    const processingDelay = config.mock.enableRandomDelays
      ? config.mock.processingTime + Math.random() * 3000
      : config.mock.processingTime

    await new Promise(resolve => setTimeout(resolve, processingDelay))

    // Generate mock results
    const result: AIProcessingResult = {
      faceDetection: await this.mockFaceDetection(options.enableFaceDetection),
      faceRecognition: await this.mockFaceRecognition(options.enableFaceRecognition),
      documentValidation: await this.mockDocumentValidation(documentType, options.enableDocumentValidation),
      ocrResults: await this.mockOCRProcessing(documentType, options.enableOCR),
      fraudDetection: await this.mockFraudDetection(options.enableFraudDetection),
      livenessDetection: await this.mockLivenessDetection(options.enableLivenessDetection),
      overallConfidence: 0,
      processingTime: Date.now() - startTime
    }

    // Calculate overall confidence
    result.overallConfidence = this.calculateOverallConfidence(result)

    return result
  }

  // Mock Face Detection
  private async mockFaceDetection(enabled: boolean = true): Promise<AIProcessingResult['faceDetection']> {
    if (!enabled) {
      return {
        detected: false,
        confidence: 0
      }
    }

    const detected = Math.random() > 0.1 // 90% chance of detection
    const confidence = detected ? 0.7 + Math.random() * 0.3 : 0

    return {
      detected,
      confidence,
      boundingBox: detected ? {
        x: Math.random() * 100,
        y: Math.random() * 100,
        width: 50 + Math.random() * 100,
        height: 60 + Math.random() * 120
      } : undefined,
      landmarks: detected ? Array.from({ length: 68 }, () => ({
        x: Math.random() * 200,
        y: Math.random() * 200
      })) : undefined
    }
  }

  // Mock Face Recognition
  private async mockFaceRecognition(enabled: boolean = true): Promise<AIProcessingResult['faceRecognition']> {
    if (!enabled) {
      return {
        similarity: 0,
        matchFound: false
      }
    }

    const similarity = Math.random() * 100
    const matchFound = similarity > 80 // 80% threshold for match

    return {
      similarity,
      matchFound,
      personId: matchFound ? `person_${Math.random().toString(36).substring(2, 15)}` : undefined
    }
  }

  // Mock Document Validation
  private async mockDocumentValidation(
    documentType: string,
    enabled: boolean = true
  ): Promise<AIProcessingResult['documentValidation']> {
    if (!enabled) {
      return {
        isValid: false,
        confidence: 0,
        documentType: documentType,
        authenticityScore: 0,
        tamperingDetected: false,
        tamperingScore: 0
      }
    }

    const isValid = Math.random() > (1 - config.mock.successRate)
    const authenticityScore = isValid ? 0.8 + Math.random() * 0.2 : Math.random() * 0.3
    const tamperingDetected = !isValid && Math.random() > 0.5
    const tamperingScore = tamperingDetected ? 0.6 + Math.random() * 0.4 : Math.random() * 0.2

    return {
      isValid,
      confidence: isValid ? 0.85 + Math.random() * 0.15 : 0.3 + Math.random() * 0.4,
      documentType,
      authenticityScore,
      tamperingDetected,
      tamperingScore
    }
  }

  // Mock OCR Processing
  private async mockOCRProcessing(
    documentType: string,
    enabled: boolean = true
  ): Promise<AIProcessingResult['ocrResults']> {
    if (!enabled) {
      return {
        text: '',
        confidence: 0,
        extractedData: {}
      }
    }

    const mockData = this.getMockDocumentData(documentType)
    const confidence = 0.7 + Math.random() * 0.3

    return {
      text: mockData.fullText,
      confidence,
      extractedData: mockData.extractedData
    }
  }

  // Mock Fraud Detection
  private async mockFraudDetection(enabled: boolean = true): Promise<AIProcessingResult['fraudDetection']> {
    if (!enabled) {
      return {
        riskScore: 0,
        riskLevel: 'low',
        fraudIndicators: [],
        suspiciousPatterns: []
      }
    }

    const riskScore = Math.random() * 100
    const riskLevel = riskScore < 30 ? 'low' : riskScore < 70 ? 'medium' : 'high'

    const fraudIndicators = []
    const suspiciousPatterns = []

    if (riskScore > 50) {
      fraudIndicators.push('Document manipulation detected')
    }
    if (riskScore > 70) {
      fraudIndicators.push('Multiple identity matches found')
      suspiciousPatterns.push('Unusual document patterns')
    }
    if (riskScore > 90) {
      fraudIndicators.push('Known fraudulent document template')
      suspiciousPatterns.push('Suspicious metadata')
    }

    return {
      riskScore,
      riskLevel,
      fraudIndicators,
      suspiciousPatterns
    }
  }

  // Mock Liveness Detection
  private async mockLivenessDetection(enabled: boolean = true): Promise<AIProcessingResult['livenessDetection']> {
    if (!enabled) {
      return {
        isLive: false,
        confidence: 0,
        livenessScore: 0,
        spoofingDetected: false,
        spoofingScore: 0
      }
    }

    const livenessScore = Math.random() * 100
    const isLive = livenessScore > 60
    const spoofingDetected = !isLive && Math.random() > 0.3
    const spoofingScore = spoofingDetected ? 0.7 + Math.random() * 0.3 : Math.random() * 0.3

    return {
      isLive,
      confidence: isLive ? 0.8 + Math.random() * 0.2 : 0.4 + Math.random() * 0.4,
      livenessScore,
      spoofingDetected,
      spoofingScore
    }
  }

  // Calculate overall confidence
  private calculateOverallConfidence(result: AIProcessingResult): number {
    const weights = {
      faceDetection: 0.15,
      faceRecognition: 0.20,
      documentValidation: 0.25,
      ocrResults: 0.15,
      fraudDetection: 0.15,
      livenessDetection: 0.10
    }

    const scores = [
      result.faceDetection.confidence * weights.faceDetection,
      result.faceRecognition.similarity / 100 * weights.faceRecognition,
      result.documentValidation.confidence * weights.documentValidation,
      result.ocrResults.confidence * weights.ocrResults,
      (100 - result.fraudDetection.riskScore) / 100 * weights.fraudDetection,
      result.livenessDetection.confidence * weights.livenessDetection
    ]

    return Math.round(scores.reduce((sum, score) => sum + score, 0) * 100)
  }

  // Get mock document data based on type
  private getMockDocumentData(documentType: string): {
    fullText: string
    extractedData: AIProcessingResult['ocrResults']['extractedData']
  } {
    const mockData = {
      passport: {
        fullText: `PASSPORT
        SURNAME: DOE
        GIVEN NAMES: JOHN MICHAEL
        NATIONALITY: UNITED STATES
        DATE OF BIRTH: 15 JAN 1990
        PLACE OF BIRTH: NEW YORK
        DATE OF ISSUE: 10 MAR 2020
        DATE OF EXPIRY: 09 MAR 2030
        AUTHORITY: US DEPARTMENT OF STATE
        PASSPORT NUMBER: 123456789`,
        extractedData: {
          firstName: 'JOHN MICHAEL',
          lastName: 'DOE',
          dateOfBirth: '1990-01-15',
          documentNumber: '123456789',
          nationality: 'UNITED STATES',
          expiryDate: '2030-03-09',
          issueDate: '2020-03-10',
          issuingAuthority: 'US DEPARTMENT OF STATE'
        }
      },
      drivers_license: {
        fullText: `DRIVER LICENSE
        NAME: DOE, JOHN MICHAEL
        ADDRESS: 123 MAIN ST, NEW YORK, NY 10001
        DATE OF BIRTH: 01/15/1990
        LICENSE NUMBER: NY123456789
        EXPIRES: 01/15/2025
        CLASS: D
        RESTRICTIONS: NONE`,
        extractedData: {
          firstName: 'JOHN MICHAEL',
          lastName: 'DOE',
          dateOfBirth: '1990-01-15',
          documentNumber: 'NY123456789',
          expiryDate: '2025-01-15'
        }
      },
      national_id: {
        fullText: `NATIONAL IDENTITY CARD
        SURNAME: DOE
        GIVEN NAMES: JOHN MICHAEL
        NATIONALITY: AMERICAN
        DATE OF BIRTH: 15 JAN 1990
        ID NUMBER: USA123456789
        ISSUE DATE: 01 JAN 2020
        EXPIRY DATE: 01 JAN 2030`,
        extractedData: {
          firstName: 'JOHN MICHAEL',
          lastName: 'DOE',
          dateOfBirth: '1990-01-15',
          documentNumber: 'USA123456789',
          nationality: 'AMERICAN',
          expiryDate: '2030-01-01',
          issueDate: '2020-01-01'
        }
      }
    }

    return mockData[documentType as keyof typeof mockData] || mockData.passport
  }

  // Batch processing for multiple documents
  async processBatch(
    documents: Array<{ imageData: string | File; documentType: string; options?: any }>
  ): Promise<AIProcessingResult[]> {
    const results = []
    
    for (const doc of documents) {
      const result = await this.processDocument(doc.imageData, doc.documentType, doc.options)
      results.push(result)
    }
    
    return results
  }

  // Get processing statistics
  getProcessingStats(): {
    averageProcessingTime: number
    successRate: number
    totalProcessed: number
  } {
    return {
      averageProcessingTime: config.mock.processingTime,
      successRate: config.mock.successRate * 100,
      totalProcessed: Math.floor(Math.random() * 10000)
    }
  }
}

// Export singleton instance
export const aiProcessor = MockAIProcessor.getInstance() 