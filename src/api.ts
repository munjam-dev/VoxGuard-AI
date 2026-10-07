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
    if (!response.ok) throw new Error(`Analysis service returned ${response.status}.`)
    const payload = (await response.json()) as AnalysisResult
    return { result: payload, serviceAvailable: true }
  } catch (error) {
    if (import.meta.env.DEV && import.meta.env.VITE_ENABLE_FIXTURE === 'true') {
      return { result: createFixtureResult(file), serviceAvailable: false }
    }
    if (error instanceof TypeError) {
      throw new Error('Baseline API is unavailable. Start the FastAPI service or enable the clearly labeled development fixture.')
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
