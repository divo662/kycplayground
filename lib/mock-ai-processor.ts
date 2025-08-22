/**
 * Mock AI Processor for development/testing
 * Provides fake AI analysis results when real AI is not available
 */

export class MockAIProcessor {
  async processVerification(assets: any[]): Promise<any> {
    console.log('🤖 Mock AI processing verification with assets:', assets.length)
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const documentAsset = assets.find(a => a.category === 'id_document')
    const faceAsset = assets.find(a => a.category === 'face_photo' || a.category === 'face_video')
    
    // Generate mock document analysis
    const documentAnalysis = this.generateMockDocumentAnalysis(documentAsset)
    const faceAnalysis = this.generateMockFaceAnalysis(faceAsset)
    
    return {
      document: documentAnalysis,
      face: faceAnalysis
    }
  }
  
  private generateMockDocumentAnalysis(asset: any): any {
    if (!asset) {
      return {
        faceDetection: { detected: false, confidence: 0 },
        documentValidation: { isValid: false, confidence: 0 },
        ocrResults: { text: '', confidence: 0 },
        fraudDetection: { riskScore: 100, riskLevel: 'high' },
        overallConfidence: 0
      }
    }
    
    // Check if it's an invoice based on filename
    const isInvoice = asset.name.toLowerCase().includes('invoice')
    
    if (isInvoice) {
      return {
        faceDetection: { detected: false, confidence: 0 },
        documentValidation: { 
          isValid: false, 
          confidence: 0.1, 
          documentType: 'invoice',
          authenticityScore: 0.1,
          tamperingDetected: false,
          tamperingScore: 0.9
        },
        ocrResults: { 
          text: 'INVOICE\nAmount: $100\nDate: 2025-08-21', 
          confidence: 0.8,
          extractedData: {
            documentType: 'invoice',
            amount: '$100',
            date: '2025-08-21'
          }
        },
        fraudDetection: { 
          riskScore: 95, 
          riskLevel: 'high',
          fraudIndicators: ['Non-government document'],
          suspiciousPatterns: ['Invoice format detected']
        },
        livenessDetection: { isLive: false, confidence: 0 },
        overallConfidence: 10
      }
    }
    
    // Mock passport analysis
    return {
      faceDetection: { 
        detected: true, 
        confidence: 0.85,
        boundingBox: { x: 50, y: 30, width: 100, height: 120 },
        landmarks: Array.from({ length: 68 }, (_, i) => ({ x: 50 + i, y: 30 + i }))
      },
      documentValidation: { 
        isValid: true, 
        confidence: 0.9, 
        documentType: 'passport',
        authenticityScore: 0.95,
        tamperingDetected: false,
        tamperingScore: 0.05
      },
      ocrResults: { 
        text: 'PASSPORT\nSURNAME: DOE\nGIVEN NAMES: JOHN MICHAEL\nNATIONALITY: UNITED STATES', 
        confidence: 0.85,
        extractedData: {
          firstName: 'JOHN MICHAEL',
          lastName: 'DOE',
          nationality: 'UNITED STATES',
          documentType: 'passport'
        }
      },
      fraudDetection: { 
        riskScore: 25, 
        riskLevel: 'low',
        fraudIndicators: [],
        suspiciousPatterns: []
      },
      livenessDetection: { isLive: false, confidence: 0 },
      overallConfidence: 85
    }
  }
  
  private generateMockFaceAnalysis(asset: any): any {
    if (!asset) {
      return {
        faceDetection: { detected: false, confidence: 0 },
        faceRecognition: { similarity: 0, matchFound: false },
        overallConfidence: 0
      }
    }
    
    return {
      faceDetection: { 
        detected: true, 
        confidence: 0.9,
        boundingBox: { x: 80, y: 60, width: 140, height: 140 },
        landmarks: Array.from({ length: 68 }, (_, i) => ({ x: 80 + i, y: 60 + i }))
      },
      faceRecognition: { 
        similarity: 75.5, 
        matchFound: false 
      },
      overallConfidence: 90
    }
  }
}
