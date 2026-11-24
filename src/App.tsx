import { Suspense, lazy, useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'

const Home = lazy(() => import('./pages/Home'))
const CategoryPage = lazy(() => import('./pages/CategoryPage'))
const WorkPage = lazy(() => import('./pages/WorkPage'))
const Admin = lazy(() => import('./pages/Admin'))
const NotFound = lazy(() => import('./pages/NotFound'))

function ScrollReset() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (!hash) window.scrollTo(0, 0)
  }, [pathname, hash])
  return null
}

export default function App() {
  return (
    <>
      <ScrollReset />
      <Suspense fallback={<div className="min-h-screen bg-ink" aria-label="Loading page" />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/projects/:category" element={<CategoryPage />} />
          <Route path="/projects/:category/:slug" element={<WorkPage />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </>
  )
}
