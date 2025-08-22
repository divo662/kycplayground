/**
 * Simple MRZ (Machine Readable Zone) Parser
 * Extracts information from passport and ID card MRZ lines
 */

export interface MRZData {
  format: 'TD3' | 'TD1' | 'unknown'
  documentType?: string
  issuingCountry?: string
  lastName?: string
  givenNames?: string
  documentNumber?: string
  nationality?: string
  dateOfBirth?: string
  sex?: string
  expiryDate?: string
  personalNumber?: string
}

/**
 * Parses MRZ text to extract passport/ID information
 */
export function parseMrzFromText(text: string): MRZData | null {
  if (!text) return null
  
  const lines = text
    .split(/\r?\n/)
    .map(l => l.replace(/\s+/g, ' ').trim())
    .filter(Boolean)

  // Find candidate MRZ lines: lots of '<', fixed-ish lengths (30-44)
  const candidates: string[] = []
  for (const l of lines) {
    const cleaned = l.replace(/\s/g, '')
    const numChevrons = (cleaned.match(/</g) || []).length
    if (cleaned.length >= 30 && cleaned.length <= 44 && numChevrons >= 5) {
      candidates.push(cleaned)
    }
  }

  if (candidates.length === 0) return null

  // TD3 (passport): two lines, each 44 chars
  const td3Pairs: [string, string][] = []
  for (let i = 0; i < candidates.length - 1; i++) {
    if (candidates[i].length === 44 && candidates[i + 1].length === 44) {
      td3Pairs.push([candidates[i], candidates[i + 1]])
    }
  }
  
  if (td3Pairs.length > 0) {
    const [l1, l2] = td3Pairs[0]
    return parseTD3(l1, l2)
  }

  // TD1 (ID cards): three lines, 30 chars each
  const td1Triples: [string, string, string][] = []
  for (let i = 0; i < candidates.length - 2; i++) {
    if (candidates[i].length === 30 && candidates[i + 1].length === 30 && candidates[i + 2].length === 30) {
      td1Triples.push([candidates[i], candidates[i + 1], candidates[i + 2]])
    }
  }
  
  if (td1Triples.length > 0) {
    const [a, b, c] = td1Triples[0]
    return parseTD1(a, b, c)
  }

  return null
}

/**
 * Parses TD3 format (passport) - two lines of 44 characters each
 */
function parseTD3(line1: string, line2: string): MRZData {
  // Line 1: P<ISSUERNAME<<GIVENNAMES<<<<<<<<<<<<<<<<<<<<<<< (44)
  // Line 2: PASSPORTNO<CHKNATIONALITYYYMMDD<CHKSEXYYYYMMDD<CHKPERSONALNUM<CHK (44)
  
  const docType = line1.slice(0, 1)
  const issuingCountry = line1.slice(2, 5)
  const namesPart = line1.slice(5)
  const nameSegments = namesPart.split('<<')
  const lastName = nameSegments[0]?.replace(/</g, ' ').trim()
  const givenNamesRaw = (nameSegments[1] || '').replace(/</g, ' ').trim()
  const givenNames = givenNamesRaw.replace(/\s+/g, ' ').trim()

  const passportNumber = line2.slice(0, 9).replace(/</g, '')
  const nationality = line2.slice(10, 13)
  const dob = line2.slice(13, 19) // YYMMDD
  const sex = line2.slice(20, 21)
  const expiry = line2.slice(21, 27) // YYMMDD
  const personalNumber = line2.slice(28, 42).replace(/</g, '')

  return {
    format: 'TD3',
    documentType: docType,
    issuingCountry,
    lastName,
    givenNames,
    documentNumber: passportNumber,
    nationality,
    dateOfBirth: normalizeYYMMDD(dob),
    sex,
    expiryDate: normalizeYYMMDD(expiry),
    personalNumber
  }
}

/**
 * Parses TD1 format (ID cards) - three lines of 30 characters each
 */
function parseTD1(a: string, b: string, c: string): MRZData {
  const documentNumber = a.slice(5, 14).replace(/</g, '')
  const dob = b.slice(0, 6)
  const sex = b.slice(7, 8)
  const expiry = b.slice(8, 14)
  
  return {
    format: 'TD1',
    documentNumber,
    dateOfBirth: normalizeYYMMDD(dob),
    sex,
    expiryDate: normalizeYYMMDD(expiry)
  }
}

/**
 * Converts YYMMDD format to YYYY-MM-DD
 */
function normalizeYYMMDD(s: string): string | undefined {
  if (!/^\d{6}$/.test(s)) return undefined
  
  const yy = parseInt(s.slice(0, 2), 10)
  const mm = s.slice(2, 4)
  const dd = s.slice(4, 6)
  
  // Assume years 00-30 are 2000s, 31-99 are 1900s
  const year = yy >= 0 && yy <= 30 ? 2000 + yy : 1900 + yy
  
  return `${year}-${mm}-${dd}`
}
