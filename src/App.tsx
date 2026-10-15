import { useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import CategoryPage from './pages/CategoryPage'
import WorkPage from './pages/WorkPage'
import Admin from './pages/Admin'
import NotFound from './pages/NotFound'
import { signOut, useAdminSession, useSignOutOnLeave } from './lib/auth'

function ScrollReset() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (!hash) window.scrollTo(0, 0)
  }, [pathname, hash])
  return null
}

/**
 * While the admin is signed in, leaving the /admin route locks the panel again
 * (the next visit shows the login screen).
 */
function AdminRouteGuard() {
  const { pathname } = useLocation()
  const { isAdmin } = useAdminSession()
  const onAdmin = pathname === '/admin' || pathname.startsWith('/admin/')

  // Sign out when the signed-in admin navigates away from /admin.
  useSignOutOnLeave(isAdmin && onAdmin)

  // Safety net for a full page load elsewhere (e.g. opening a new URL) while
  // the admin session is still active.
  useEffect(() => {
    if (isAdmin && !onAdmin) void signOut()
  }, [isAdmin, onAdmin])

  return null
}

export default function App() {
  return (
    <>
      <AdminRouteGuard />
      <ScrollReset />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/projects/:category" element={<CategoryPage />} />
        <Route path="/projects/:category/:slug" element={<WorkPage />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  )
}
