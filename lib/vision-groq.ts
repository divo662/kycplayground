/**
 * Groq Vision integration for document analysis
 * Uses OpenAI-compatible chat.completions endpoint to perform image QA analysis.
 * Configure via GROQ_API_KEY and GROQ_VISION_MODEL.
 */

export interface GroqAnalysisResult {
  blurLikely: boolean
  glareLikely: boolean
  cropLikely: boolean
  brightness?: number
  contrast?: number
  docTypeGuess: string
  notes?: string
}

/**
 * Analyzes image quality using Groq AI Vision
 * Handles Appwrite storage URLs by converting to base64
 */
export async function analyzeImageQualityWithGroq(imageUrl: string): Promise<GroqAnalysisResult | null> {
  try {
    console.log('🔍 Analyzing document with Groq AI:', imageUrl)
    
    // Convert Appwrite URL to base64 if needed
    let base64Image: string | null = null
    if (imageUrl.includes('appwrite.io') || imageUrl.includes('localhost')) {
      console.log('🔄 Converting Appwrite URL to base64...')
      base64Image = await convertUrlToBase64(imageUrl)
      if (!base64Image) {
        console.error('❌ Failed to convert URL to base64')
        return null
      }
    } else {
      // For external URLs, try to fetch and convert
      base64Image = await convertUrlToBase64(imageUrl)
      if (!base64Image) {
        console.error('❌ Failed to convert external URL to base64')
        return null
      }
    }

    console.log('✅ Image converted to base64, sending to Groq AI...')
    
    // Use environment variables for configuration
    const apiKey = process.env.GROQ_API_KEY
    const model = process.env.GROQ_VISION_MODEL || 'meta-llama/llama-4-maverick-17b-128e-instruct'
    const endpoint = process.env.GROQ_API_BASE || 'https://api.groq.com/openai/v1/chat/completions'

    if (!apiKey) {
      console.error('❌ GROQ_API_KEY environment variable not set')
      return null
    }

    const systemPrompt = `You are a document image quality assistant. Analyze this image and determine if it's a valid government-issued ID document.

IMPORTANT: Only accept these document types as valid:
- passport
- national_id
- drivers_license
- government_id

REJECT these document types:
- invoice
- receipt
- utility_bill
- bank_statement
- birth_certificate
- any other non-government ID

Analyze the image for:
- blurLikely (true/false) - is the image blurry?
- glareLikely (true/false) - is there glare/reflection?
- cropLikely (true/false) - are borders/corners missing?
- brightness [0-1] - how bright is the image?
- contrast [0-1] - how much contrast?
- docTypeGuess - what type of document is this? (passport, national_id, drivers_license, government_id, or REJECT if not a valid ID)
- notes - any additional observations

Return strict JSON with keys: blurLikely, glareLikely, cropLikely, brightness, contrast, docTypeGuess, notes.`

    const payload = {
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Analyze this document image and return only JSON. If this is NOT a government-issued ID document, set docTypeGuess to "REJECT".' },
            { 
              type: 'image_url', 
              image_url: { 
                url: `data:image/jpeg;base64,${base64Image}`,
                detail: 'high'
              } 
            }
          ]
        }
      ],
      temperature: 0.1,
      max_tokens: 500,
      response_format: { type: 'json_object' }
    }

    console.log('🔍 Sending request to Groq AI:', { endpoint, model, imageSize: `${Math.round(base64Image.length / 1024)}KB` })

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'User-Agent': 'KYCPlayground/1.0.0'
      },
      body: JSON.stringify(payload)
    })

    if (!res.ok) {
      console.error('❌ Groq AI request failed:', res.status, res.statusText)
      const errorText = await res.text()
      console.error('Error details:', errorText)
      return null
    }

    const json = await res.json()
    console.log('✅ Groq AI response received:', { 
      model: json?.model, 
      usage: json?.usage,
      hasContent: !!json?.choices?.[0]?.message?.content 
    })

    const content = json?.choices?.[0]?.message?.content || '{}'
    
    // Parse the JSON response
    let parsed = null
    try { 
      parsed = JSON.parse(content) 
    } catch (parseError) {
      console.error('❌ Failed to parse Groq AI response:', parseError)
      console.error('Raw content:', content)
      return null
    }
    
    if (!parsed || typeof parsed !== 'object') {
      console.error('❌ Invalid Groq AI response format:', parsed)
      return null
    }

    // Check if document was rejected
    if (parsed.docTypeGuess === 'REJECT') {
      console.log('🚫 Groq AI rejected document as invalid ID type')
      return {
        blurLikely: false,
        glareLikely: false,
        cropLikely: false,
        docTypeGuess: 'REJECT',
        notes: parsed.notes || 'Document rejected - not a valid government ID'
      }
    }

    const result = {
      blurLikely: !!parsed.blurLikely,
      glareLikely: !!parsed.glareLikely,
      cropLikely: !!parsed.cropLikely,
      brightness: typeof parsed.brightness === 'number' ? parsed.brightness : undefined,
      contrast: typeof parsed.contrast === 'number' ? parsed.contrast : undefined,
      docTypeGuess: typeof parsed.docTypeGuess === 'string' ? parsed.docTypeGuess : undefined,
      notes: typeof parsed.notes === 'string' ? parsed.notes : undefined
    }

    console.log('✅ Groq AI analysis completed:', result)
    return result

  } catch (error) {
    console.error('❌ Groq AI analysis failed:', error)
    return null
  }
}

/**
 * Converts a URL to base64 string
 * Handles both Appwrite storage URLs and external URLs
 */
async function convertUrlToBase64(url: string): Promise<string | null> {
  try {
    console.log('🔄 Converting URL to base64:', url.substring(0, 100) + '...')
    
    // For Appwrite URLs, we need to handle authentication
    if (url.includes('appwrite.io')) {
      return await convertAppwriteUrlToBase64(url)
    }
    
    // For external URLs, fetch directly
    const response = await fetch(url)
    if (!response.ok) {
      console.error('❌ Failed to fetch URL:', response.status, response.statusText)
      return null
    }
    
    const arrayBuffer = await response.arrayBuffer()
    const uint8Array = new Uint8Array(arrayBuffer)
    const base64 = btoa(String.fromCharCode.apply(null, Array.from(uint8Array)))
    
    console.log('✅ URL converted to base64, size:', `${Math.round(base64.length / 1024)}KB`)
    return base64
    
  } catch (error) {
    console.error('❌ Error converting URL to base64:', error)
    return null
  }
}

/**
 * Converts Appwrite storage URL to base64
 * Handles authentication and file access
 */
async function convertAppwriteUrlToBase64(url: string): Promise<string | null> {
  try {
    // Extract file ID from Appwrite URL
    const urlParts = url.split('/')
    const fileId = urlParts[urlParts.length - 1]
    
    if (!fileId) {
      console.error('❌ Could not extract file ID from Appwrite URL')
      return null
    }
    
    console.log('🔍 Extracted file ID:', fileId)
    
    // For now, return null to indicate we need a different approach
    // In production, you would use Appwrite SDK to get the file content
    console.log('⚠️ Appwrite file conversion not implemented yet - using fallback')
    return null
    
  } catch (error) {
    console.error('❌ Error converting Appwrite URL to base64:', error)
    return null
  }
}

/**
 * Fallback function for when base64 conversion fails
 * Returns a mock analysis result
 */
export function getFallbackAnalysis(fileName: string): GroqAnalysisResult {
  console.log('🔄 Using fallback analysis for:', fileName)
  
  // Simple heuristics based on filename
  const fileNameLower = fileName.toLowerCase()
  
  if (fileNameLower.includes('invoice') || 
      fileNameLower.includes('receipt') || 
      fileNameLower.includes('bill') ||
      fileNameLower.includes('certificate')) {
    return {
      blurLikely: false,
      glareLikely: false,
      cropLikely: false,
      docTypeGuess: 'REJECT',
      notes: `Document rejected based on filename: ${fileName} - appears to be a non-government ID document`
    }
  }
  
  if (fileNameLower.includes('passport') || 
      fileNameLower.includes('license') || 
      fileNameLower.includes('id') ||
      fileNameLower.includes('national')) {
    return {
      blurLikely: false,
      glareLikely: false,
      cropLikely: false,
      docTypeGuess: 'government_id',
      notes: `Document accepted based on filename: ${fileName} - appears to be a government ID`
    }
  }
  
  // Default to rejection for unknown types
  return {
    blurLikely: false,
    glareLikely: false,
    cropLikely: false,
    docTypeGuess: 'REJECT',
    notes: `Document rejected: ${fileName} - unable to determine document type`
  }
}


