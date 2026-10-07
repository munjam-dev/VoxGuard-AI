import { useMemo, useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import './App.css'
import { analyzeAudio, validateAudioFile } from './api'
import type { AnalysisResult } from './api'

type View = 'overview' | 'history' | 'speakers' | 'settings'
type HistoryItem = AnalysisResult & { id: string; createdAt: string }

const formatDuration = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
  const secs = Math.round(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export function Dashboard({ initialView = 'overview' }: { initialView?: View }) {
  const [view, setView] = useState<View>(initialView)
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    const saved = localStorage.getItem('voxguard-history')
    return saved ? JSON.parse(saved) as HistoryItem[] : []
  })
  const [serviceAvailable, setServiceAvailable] = useState<boolean | null>(null)
  const [isDark, setIsDark] = useState(true)
  const inputRef = useRef<HTMLInputElement>(null)
  const recordingTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const selectFile = (nextFile: File) => {
    const validation = validateAudioFile(nextFile)
    setError(validation ?? '')
    if (!validation) {
      setFile(nextFile)
      setResult(null)
      setServiceAvailable(null)
    } else {
      setFile(null)
    }
  }

  const onFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextFile = event.target.files?.[0]
    if (nextFile) selectFile(nextFile)
  }

  const startRecording = () => {
    setError('')
    setIsRecording(true)
    recordingTimer.current = setTimeout(() => {
      setIsRecording(false)
      setError('Recording capture is not connected yet. Upload a WAV or FLAC file for analysis.')
    }, 1500)
  }

  const runAnalysis = async () => {
    if (!file) return
    setIsAnalyzing(true)
    setProgress(8)
    setError('')
    const progressTimer = window.setInterval(() => {
      setProgress((current) => Math.min(current + 13, 88))
    }, 260)
    try {
      const response = await analyzeAudio(file)
      setResult(response.result)
      setServiceAvailable(response.serviceAvailable)
      if (response.result) {
        const item = { ...response.result, id: crypto.randomUUID(), createdAt: new Date().toISOString() }
        setHistory((current) => {
          const next = [item, ...current].slice(0, 8)
          localStorage.setItem('voxguard-history', JSON.stringify(next))
          return next
        })
      }
    } catch (analysisError) {
      setError(analysisError instanceof Error ? analysisError.message : 'Analysis could not be completed.')
      setServiceAvailable(false)
    } finally {
      window.clearInterval(progressTimer)
      setProgress(100)
      window.setTimeout(() => setIsAnalyzing(false), 450)
    }
  }

  const uploadLabel = useMemo(() => {
    if (isRecording) return 'Listening for input…'
    if (file) return file.name
    return 'Drop a voice sample here'
  }, [file, isRecording])

  return (
    <div className={isDark ? 'app-shell' : 'app-shell light'}>
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark"><span>V</span></div>
          <div><strong>voxguard</strong><small>voice intelligence</small></div>
        </div>
        <div className="workspace-switcher"><span className="workspace-dot" /> Personal workspace <span className="chevron">⌄</span></div>
        <nav aria-label="Primary navigation">
          {[
            ['overview', '◈', 'Overview'],
            ['history', '◷', 'Analysis history'],
            ['speakers', '◎', 'Speaker profiles'],
            ['settings', '⚙', 'Settings'],
          ].map(([key, icon, label]) => (
            <button className={view === key ? 'nav-item active' : 'nav-item'} key={key} onClick={() => setView(key as View)}>
              <span className="nav-icon">{icon}</span>{label}
              {key === 'history' && history.length > 0 && <span className="nav-count">{history.length}</span>}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="service-card"><span className="status-dot" /><div><strong>Baseline API</strong><small>{serviceAvailable === false ? 'Unavailable' : 'Connection pending'}</small></div><span className="signal">⌁</span></div>
          <div className="user-row"><div className="avatar">JD</div><div><strong>Jordan Davis</strong><small>Administrator</small></div><span className="more">•••</span></div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="breadcrumbs"><span>Workspace</span><b>/</b><strong>{view === 'overview' ? 'Overview' : view === 'history' ? 'Analysis history' : view === 'speakers' ? 'Speaker profiles' : 'Settings'}</strong></div>
          <div className="top-actions"><span className="live-pill"><i /> Secure session</span><button className="icon-button" onClick={() => setIsDark(!isDark)} aria-label="Toggle theme">{isDark ? '☼' : '☾'}</button><button className="help-button">? <span>Help center</span></button></div>
        </header>

        {view === 'overview' && (
          <>
            <section className="page-heading">
              <div><p className="eyebrow">VOICE AUTHENTICITY / TODAY</p><h1>Good morning, Jordan <span>✦</span></h1><p className="subheading">Analyze a recording for voice authenticity and synthetic speech signals.</p></div>
              <div className="date-chip">⌁ <span>October 7, 2026</span></div>
            </section>
            <section className="stat-grid">
              <StatCard label="Analyses this month" value={history.length.toString().padStart(2, '0')} detail="Local workspace" icon="▥" />
              <StatCard label="Service status" value={serviceAvailable === false ? 'Offline' : 'Ready'} detail={serviceAvailable === false ? 'Start the API to analyze' : 'Awaiting a recording'} icon="⌁" warning={serviceAvailable === false} />
              <StatCard label="Speaker profiles" value="00" detail="Enroll a trusted voice" icon="◎" />
            </section>
            <section className="analysis-layout">
              <div className="card upload-card">
                <div className="card-heading"><div><p className="eyebrow">NEW ANALYSIS</p><h2>Inspect a recording</h2></div><span className="mode-tag">BASELINE MODE <span>ⓘ</span></span></div>
                <p className="card-copy">Use a clear voice sample between 3 seconds and 5 minutes. Your audio stays local unless an analysis service is configured.</p>
                <div className="drop-zone" onClick={() => inputRef.current?.click()} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); const dropped = event.dataTransfer.files[0]; if (dropped) selectFile(dropped) }}>
                  <input ref={inputRef} type="file" accept=".wav,.flac,audio/wav,audio/flac" onChange={onFileChange} />
                  <div className={isRecording ? 'upload-icon recording' : 'upload-icon'}>{isRecording ? '◉' : '↥'}</div>
                  <strong>{uploadLabel}</strong>
                  <span>{file ? `${(file.size / 1024 / 1024).toFixed(2)} MB · Ready to analyze` : 'WAV or FLAC · max 50 MB'}</span>
                  {!file && <button className="text-button" type="button">Browse files <b>→</b></button>}
                </div>
                <div className="upload-actions"><button className={isRecording ? 'secondary-button recording-button' : 'secondary-button'} onClick={startRecording}>{isRecording ? 'Stop recording' : '◉ Record live sample'}</button><button className="primary-button" disabled={!file || isAnalyzing} onClick={runAnalysis}>{isAnalyzing ? 'Analyzing…' : 'Run analysis'} <b>→</b></button></div>
                {error && <div className="inline-alert">! <span>{error}</span></div>}
                {isAnalyzing && <div className="progress-wrap"><div className="progress-label"><span>Extracting acoustic features</span><b>{progress}%</b></div><div className="progress-track"><i style={{ width: `${progress}%` }} /></div></div>}
              </div>
              <ResultCard result={result} serviceAvailable={serviceAvailable} />
            </section>
            <RecentAnalyses history={history} onSelect={(item) => setResult(item)} />
          </>
        )}
        {view === 'history' && <HistoryView history={history} onSelect={(item) => { setResult(item); setView('overview') }} />}
        {view === 'speakers' && <SpeakersView />}
        {view === 'settings' && <SettingsView isDark={isDark} setIsDark={setIsDark} />}
      </main>
    </div>
  )
}

function StatCard({ label, value, detail, icon, warning = false }: { label: string; value: string; detail: string; icon: string; warning?: boolean }) {
  return <div className="stat-card"><span className={warning ? 'stat-icon warning' : 'stat-icon'}>{icon}</span><div><p>{label}</p><strong>{value}</strong><small>{detail}</small></div></div>
}

function ResultCard({ result, serviceAvailable }: { result: AnalysisResult | null; serviceAvailable: boolean | null }) {
  return <div className="card result-card"><div className="card-heading"><div><p className="eyebrow">AUTHENTICITY SIGNAL</p><h2>Analysis result</h2></div><span className={result?.status === 'complete' ? 'result-status complete' : 'result-status'}>{result?.status === 'complete' ? '● Complete' : '○ No result'}</span></div>
    {!result && <div className="empty-result"><div className="empty-orb">⌁</div><strong>Your result will appear here</strong><p>Upload a recording to see measurable audio features and service output.</p><span className="development-note">{serviceAvailable === false ? 'API unavailable · no confidence score generated' : 'Baseline mode · confidence is never estimated locally'}</span></div>}
    {result && <div className="result-content"><div className="result-banner"><div><span className="result-label">SERVICE RESPONSE</span><strong>{result.label}</strong></div><span className="result-score">{result.scoreLabel}</span></div><div className="metric-list">{result.metrics.map((metric) => <div className="metric-row" key={metric.label}><span>{metric.label}</span><strong>{metric.value}</strong></div>)}</div><p className="result-footnote">{result.note}</p></div>}
  </div>
}

function RecentAnalyses({ history, onSelect }: { history: HistoryItem[]; onSelect: (item: HistoryItem) => void }) {
  return <section className="recent-section"><div className="section-heading"><div><p className="eyebrow">ACTIVITY</p><h2>Recent analyses</h2></div><button className="text-button">View all <b>→</b></button></div>{history.length === 0 ? <div className="empty-row">No analyses yet. Your completed local sessions will appear here.</div> : <div className="table-card"><div className="table-header"><span>Recording</span><span>Mode</span><span>Result</span><span>Added</span><span /></div>{history.slice(0, 4).map((item) => <button className="table-row" key={item.id} onClick={() => onSelect(item)}><span className="recording-name"><i className="file-icon">♫</i><b>{item.fileName}</b></span><span><em className="mode-tag small">BASELINE</em></span><span className="muted-result">{item.label}</span><span>{new Date(item.createdAt).toLocaleDateString()}</span><span>→</span></button>)}</div>}</section>
}

function HistoryView({ history, onSelect }: { history: HistoryItem[]; onSelect: (item: HistoryItem) => void }) {
  return <div className="inner-page"><p className="eyebrow">AUDIT TRAIL</p><h1>Analysis history</h1><p className="subheading">A local record of completed analysis requests.</p><div className="history-list">{history.length === 0 ? <div className="empty-row">No analysis history yet.</div> : history.map((item) => <button className="history-item" key={item.id} onClick={() => onSelect(item)}><i className="file-icon">♫</i><div><strong>{item.fileName}</strong><small>{new Date(item.createdAt).toLocaleString()} · {item.duration ? formatDuration(item.duration) : 'duration unavailable'}</small></div><span className="history-result">{item.label}</span><b>→</b></button>)}</div></div>
}

function SpeakersView() {
  return <div className="inner-page"><p className="eyebrow">TRUSTED VOICES</p><h1>Speaker profiles</h1><p className="subheading">Enroll reference samples to compare voices when the analysis service supports speaker matching.</p><div className="speaker-empty"><div className="empty-orb">◎</div><h2>No speaker profiles yet</h2><p>Speaker enrollment is available in the API contract, but capture and matching are not connected in this local build.</p><button className="secondary-button" onClick={() => alert('Speaker enrollment requires the FastAPI service.')}>+ Enroll a speaker</button><span className="development-note">Development state · no voiceprint is stored</span></div></div>
}

function SettingsView({ isDark, setIsDark }: { isDark: boolean; setIsDark: (value: boolean) => void }) {
  return <div className="inner-page"><p className="eyebrow">WORKSPACE CONTROLS</p><h1>Settings</h1><p className="subheading">Configure this local instance without hiding unavailable capabilities.</p><div className="settings-list"><div><div><strong>Appearance</strong><small>Choose how VoxGuard looks on this device.</small></div><button className="toggle" aria-label="Toggle dark mode" onClick={() => setIsDark(!isDark)}><i className={isDark ? 'on' : ''} /></button></div><div><div><strong>Analysis mode</strong><small>Baseline mode sends audio to the configured API adapter.</small></div><em className="mode-tag">BASELINE MODE</em></div><div><div><strong>Data retention</strong><small>History is stored in this browser only.</small></div><span className="settings-value">Local only</span></div></div></div>
}
