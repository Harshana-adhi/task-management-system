import { BrowserRouter, Routes, Route } from 'react-router-dom'
import AppLayout from './components/layouts/AppLayout'
import ProtectedRoute from './routes/ProtectedRoute'
import Login from './pages/Login/Login'
import ChangePassword from './pages/ChangePassword/ChangePassword'
import Profile from './pages/Profile/Profile'
import Dashboard from './pages/Dashboard/Dashboard'
import NotFound from './pages/NotFound/NotFound'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route element={<ProtectedRoute />}>
          {/* Standalone, full-screen — rendered outside the app shell,
              same treatment as Login, since the sidebar/navbar imply a
              "normal" session the person isn't fully in yet. */}
          <Route path="/change-password" element={<ChangePassword />} />

          <Route element={<AppLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            {/* /projects, /tasks, /admin/users are added in their own phases */}
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App