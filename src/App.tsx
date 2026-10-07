import { lazy, Suspense } from 'react'

const Landing = lazy(() => import('./Landing').then((module) => ({ default: module.Landing })))
const Dashboard = lazy(() => import('./Dashboard').then((module) => ({ default: module.Dashboard })))

export default function App() {
  return <Suspense fallback={<div style={{ minHeight: '100vh', background: '#050507' }} />}>
    {window.location.pathname.startsWith('/analyze') || window.location.pathname.startsWith('/results/') ? <Dashboard /> :
      window.location.pathname === '/history' ? <Dashboard initialView="history" /> :
        <Landing />}
  </Suspense>
}
