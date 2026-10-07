import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { lazy, Suspense, useMemo, useState } from 'react'
import './landing.css'

const VoiceCoreScene = lazy(() => import('./VoiceCore').then((module) => ({ default: module.VoiceCoreScene })))

const analysisPoints = [
  ['01', 'Audio input', 'A clean signal is the beginning of a trustworthy answer.'],
  ['02', 'Signal processing', 'We normalize and segment the recording without losing nuance.'],
  ['03', 'Feature extraction', 'Acoustic, spectral, MFCC and prosodic signals become measurable.'],
  ['04', 'Neural analysis', 'Multiple representations are evaluated together, not in isolation.'],
  ['05', 'Anti-spoof detection', 'The system looks for traces left by synthesis and manipulation.'],
  ['06', 'Risk assessment', 'Evidence is returned with model context—not a black-box verdict.'],
]

const signals = [
  ['01', 'Acoustic signals', 'Energy, waveform shape and the texture of a recording.'],
  ['02', 'Spectral patterns', 'Frequency-domain behavior hidden beneath the words.'],
  ['03', 'MFCC features', 'Speech characteristics that help describe the voice.'],
  ['04', 'Prosody', 'Pitch, rhythm and the patterns of speaking.'],
  ['05', 'Voice characteristics', 'Speaker-level patterns and representation.'],
  ['06', 'Synthetic artifacts', 'Signals associated with generated or manipulated speech.'],
]

export function Landing() {
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll()
  const coreY = useTransform(scrollYProgress, [0, .25], [0, -80])
  const coreScale = useTransform(scrollYProgress, [0, .25], [1, .78])
  const scanning = false
  const [demoPlaying, setDemoPlaying] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  
  return <div className="landing">
    <header className="landing-nav">
      <a className="landing-logo" href="/" aria-label="VoxGuard AI home"><span className="shield-wave">⌁</span><span>VOXGUARD <b>AI</b></span></a>
      <button className="mobile-menu" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle navigation">☰</button>
      <nav className={menuOpen ? 'landing-links open' : 'landing-links'}>{['Technology', 'How it works', 'Detection', 'Research'].map((item) => <a key={item} href={`#${item.toLowerCase().replaceAll(' ', '-')}`} onClick={() => setMenuOpen(false)}>{item}</a>)}</nav>
      <div className="nav-actions"><a href="/history" className="nav-signin">History</a><a href="/analyze" className="nav-cta">Analyze voice <span>↗</span></a></div>
    </header>
    <main>
      <section className="hero-section">
        <motion.div className="hero-copy" initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .7 }}>
          <p className="landing-eyebrow"><i /> AI AUDIO INTELLIGENCE</p>
          <h1>Can You Hear<br /><em>What Isn't Real?</em></h1>
          <p className="hero-subtitle">VoxGuard AI analyzes speech at the acoustic, spectral and neural level to identify signals associated with synthetic and manipulated audio.</p>
          <div className="hero-actions"><motion.a whileHover={{ scale: 1.02 }} whileTap={{ scale: .98 }} href="/analyze" className="hero-primary">Analyze a voice <span>↗</span></motion.a><motion.a whileHover={{ scale: 1.02 }} href="#how-it-works" className="hero-secondary">See how it works <span>↓</span></motion.a></div>
          <p className="trust-line">◉ &nbsp;Upload WAV, MP3, M4A, FLAC or OGG</p>
        </motion.div>
        <motion.div className="hero-visual" style={{ y: reduced ? 0 : coreY, scale: reduced ? 1 : coreScale }}>
          <div className="visual-grid" /><div className="visual-caption top">SIGNAL / 001 <span>● LIVE CORE</span></div><div className="core-canvas"><Suspense fallback={<div className="core-fallback"><span>⌁</span></div>}><VoiceCoreScene active={scanning} /></Suspense></div>
          <div className="data-tag tag-a">SPECTRAL<br /><b>ANALYSIS</b></div><div className="data-tag tag-b">MFCC<br /><b>ENGINE</b></div><div className="data-tag tag-c">ANTI-SPOOF<br /><b>ACTIVE</b></div>
          <div className="scan-label">{scanning ? 'SCANNING AUDIO...' : 'VOICE CORE / READY'}</div>
        </motion.div>
      </section>
      <section className="signal-intro" id="technology"><div className="section-kicker">THE SIGNAL IS THE STORY</div><h2>One voice.<br /><span>Thousands of signals.</span></h2><p>Speech contains far more information than words. VoxGuard analyzes the acoustic and spectral characteristics hidden beneath the surface.</p><Waveform active={demoPlaying} /></section>
      <section className="pipeline-section" id="how-it-works"><div className="section-heading"><div><div className="section-kicker">THE PIPELINE</div><h2>From waveform<br /><span>to intelligence.</span></h2></div><p>Every result starts with evidence. Our analysis flow makes the path from audio to insight visible.</p></div><div className="pipeline">{analysisPoints.map(([num, title, text], index) => <motion.div className="pipeline-step" key={num} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .4 }} transition={{ delay: index * .06 }}><span>{num}</span><div className="step-line" /><h3>{title}</h3><p>{text}</p></motion.div>)}</div></section>
      <section className="signals-section" id="detection"><div className="section-heading"><div><div className="section-kicker">WHAT WE ANALYZE</div><h2>Read between<br /><span>the words.</span></h2></div><p>A layered view of a voice gives investigators more context than a single score ever could.</p></div><div className="signal-grid">{signals.map(([num, title, text], index) => <motion.article key={num} whileHover={{ y: -5, borderColor: '#526fae' }} className="signal-card"><span className="card-number">{num}</span><div className={`signal-glyph glyph-${index}`} /><h3>{title}</h3><p>{text}</p><span className="card-arrow">↗</span></motion.article>)}</div></section>
      <section className="demo-section"><div className="demo-copy"><div className="section-kicker">LIVE INTERFACE PREVIEW</div><h2>See the analysis<br /><span>happen.</span></h2><p>Explore the visual language of a VoxGuard analysis. This preview uses illustrative data and is not a live prediction.</p><button className="demo-button" onClick={() => setDemoPlaying(!demoPlaying)}>{demoPlaying ? 'Pause visualization' : 'Play visualization'} <span>{demoPlaying ? 'Ⅱ' : '▶'}</span></button></div><div className="demo-panel"><div className="demo-panel-top"><span>ILLUSTRATIVE VISUALIZATION</span><i>00:04 / 00:12</i></div><Waveform active={demoPlaying} detailed /><div className="demo-metrics"><span><b>ACOUSTIC</b><i style={{ width: '76%' }} /></span><span><b>SPECTRAL</b><i style={{ width: '62%' }} /></span><span><b>PROSODY</b><i style={{ width: '84%' }} /></span></div></div></section>
      <section className="security-section" id="research"><div className="security-art"><div className="shield-large">⌁</div><span className="orbit orbit-1" /><span className="orbit orbit-2" /></div><div><div className="section-kicker">BUILT FOR VOICES THAT MATTER</div><h2>Trust is a<br /><span>technical problem.</span></h2><p>VoxGuard is designed around privacy, transparency and evidence. No inflated claims. No opaque verdicts. Just a clear path from signal to decision.</p><div className="security-list">{['Privacy-first processing', 'Secure uploads', 'Model transparency', 'Configurable retention', 'Audit-ready analysis'].map((item) => <span key={item}>✓ {item}</span>)}</div></div></section>
      <section className="research-section"><div className="section-kicker">MODEL NOTES / 001</div><h2>Designed for<br /><span>deeper analysis.</span></h2><div className="research-flow">{['Audio', 'Preprocessing', 'MFCC', 'Spectrogram', 'Deep model', 'Anti-spoof', 'Ensemble'].map((item, i) => <div key={item} className="research-node"><b>{String(i + 1).padStart(2, '0')}</b><span>{item}</span></div>)}</div><div className="research-meta"><span>Sampling rate <b>16 kHz</b></span><span>Feature extraction <b>MFCC + spectral</b></span><span>Inference <b>Neural audio model</b></span><span>Decision <b>Probabilistic</b></span></div></section>
      <section className="final-cta"><div className="cta-wave"><Waveform active /></div><div className="section-kicker">LISTEN CLOSER</div><h2>Hear what<br /><span>isn't obvious.</span></h2><p>Upload a voice and explore the signals hidden inside it.</p><a href="/analyze" className="hero-primary">Analyze a voice <span>↗</span></a></section>
    </main>
    <footer className="landing-footer"><a className="landing-logo" href="/"><span className="shield-wave">⌁</span><span>VOXGUARD <b>AI</b></span></a><p>AI-powered speech intelligence.</p><div><a href="#technology">Technology</a><a href="#detection">Detection</a><a href="#research">Research</a><a href="https://github.com" target="_blank" rel="noreferrer">GitHub ↗</a></div></footer>
  </div>
}

function Waveform({ active, detailed = false }: { active?: boolean; detailed?: boolean }) {
  const bars = useMemo(() => Array.from({ length: detailed ? 80 : 64 }, (_, i) => 20 + Math.abs(Math.sin(i * .82)) * 30 + Math.abs(Math.cos(i * .27)) * 22), [detailed])
  return <div className={active ? 'waveform active' : 'waveform'} aria-label="Illustrative audio waveform">{bars.map((height, i) => <i key={i} style={{ height: `${height}%`, animationDelay: `${i * -0.03}s` }} />)}</div>
}
