export type AnalysisMetric = { label: string; value: string }

export type AnalysisResult = {
  fileName: string
  status: 'complete'
  label: string
  scoreLabel: string
  duration?: number
  metrics: AnalysisMetric[]
  note: string
}

type AnalysisResponse = {
  result: AnalysisResult | null
  serviceAvailable: boolean
}

class AnalysisApiError extends Error {
  readonly serviceAvailable: boolean

  constructor(message: string, serviceAvailable: boolean) {
    super(message)
    this.name = 'AnalysisApiError'
    this.serviceAvailable = serviceAvailable
  }
}

const API_URL = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') || '/api'
const MAX_BYTES = 50 * 1024 * 1024
const ALLOWED_TYPES = ['audio/wav', 'audio/x-wav', 'audio/flac', 'audio/x-flac']

export function validateAudioFile(file: File): string | null {
  const extension = file.name.toLowerCase().slice(file.name.lastIndexOf('.'))
  if (!ALLOWED_TYPES.includes(file.type) && !['.wav', '.flac'].includes(extension)) return 'Unsupported format. Choose a WAV or FLAC recording.'
  if (file.size === 0) return 'This file is empty. Choose a recording with audio content.'
  if (file.size > MAX_BYTES) return 'That recording is larger than 50 MB. Choose a shorter sample.'
  return null
}

export async function analyzeAudio(file: File): Promise<AnalysisResponse> {
  const body = new FormData()
  body.append('file', file)
  try {
    const response = await fetch(`${API_URL}/analyze`, { method: 'POST', body })
    if (!response.ok) {
      if (response.status === 413) throw new AnalysisApiError('This recording is larger than 50 MB. Choose a shorter sample.', true)
      if (response.status === 415) throw new AnalysisApiError('Unsupported format. Choose a WAV or FLAC recording.', true)
      if (response.status === 400) throw new AnalysisApiError('The uploaded audio file is empty.', true)
      if (response.status >= 500) throw new AnalysisApiError('The analysis API returned a server error. Try again or check the backend logs.', false)
      throw new AnalysisApiError(`The analysis API rejected this request (HTTP ${response.status}).`, true)
    }
    const payload = (await response.json()) as AnalysisResult
    return { result: payload, serviceAvailable: true }
  } catch (error) {
    if (import.meta.env.DEV && import.meta.env.VITE_ENABLE_FIXTURE === 'true') {
      return { result: createFixtureResult(file), serviceAvailable: false }
    }
    if (error instanceof AnalysisApiError) throw error
    if (error instanceof TypeError) {
      throw new AnalysisApiError('Baseline API is unavailable. Start the FastAPI service or check the Vercel /api rewrite.', false)
    }
    throw error
  }
}

function createFixtureResult(file: File): AnalysisResult {
  const kilobytes = Math.round(file.size / 1024)
  return {
    fileName: file.name,
    status: 'complete',
    label: 'Development fixture',
    scoreLabel: 'No confidence score',
    metrics: [
      { label: 'Payload size', value: `${kilobytes.toLocaleString()} KB` },
      { label: 'Format', value: file.name.toLowerCase().endsWith('.flac') ? 'FLAC' : 'WAV' },
      { label: 'Model output', value: 'Unavailable' },
    ],
    note: 'Fixture mode only verifies the API boundary and file metadata. It does not estimate authenticity or generate a confidence value.',
  }
}
