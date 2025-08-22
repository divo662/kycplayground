export interface CountryDocRule {
  documentType: 'passport' | 'national_id' | 'drivers_license'
  fieldsRequired: Array<'documentNumber' | 'dateOfBirth' | 'expiryDate' | 'nationality' | 'issueDate'>
  mrzRequired?: boolean
  expiryMustBeFuture?: boolean
}

export const COUNTRY_RULES: Record<string, CountryDocRule[]> = {
  USA: [
    {
      documentType: 'passport',
      fieldsRequired: ['documentNumber', 'dateOfBirth', 'expiryDate', 'nationality'],
      mrzRequired: true,
      expiryMustBeFuture: true
    },
    {
      documentType: 'drivers_license',
      fieldsRequired: ['documentNumber', 'dateOfBirth', 'expiryDate']
    }
  ],
  CAN: [
    {
      documentType: 'passport',
      fieldsRequired: ['documentNumber', 'dateOfBirth', 'expiryDate', 'nationality'],
      mrzRequired: true,
      expiryMustBeFuture: true
    }
  ]
}

export interface RuleValidationResult {
  country: string
  documentType: string
  passed: boolean
  missingFields: string[]
  messages: string[]
}

export function validateAgainstCountryRules(
  country: string,
  documentType: string,
  fields: Partial<Record<'documentNumber' | 'dateOfBirth' | 'expiryDate' | 'nationality' | 'issueDate', string>>,
  mrzPresent: boolean
): RuleValidationResult | null {
  const rules = COUNTRY_RULES[country]
  if (!rules) return null
  const rule = rules.find(r => r.documentType === (documentType as any))
  if (!rule) return null

  const missing: string[] = []
  for (const f of rule.fieldsRequired) {
    if (!fields[f]) missing.push(f)
  }

  const msgs: string[] = []
  if (rule.mrzRequired && !mrzPresent) msgs.push('MRZ required but not found')
  if (rule.expiryMustBeFuture && fields.expiryDate) {
    const now = new Date()
    const exp = new Date(fields.expiryDate)
    if (isFinite(exp.getTime()) && exp < now) msgs.push('Document expired')
  }

  return {
    country,
    documentType,
    passed: missing.length === 0 && msgs.length === 0,
    missingFields: missing,
    messages: msgs
  }
}


