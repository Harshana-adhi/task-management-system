import { BrowserRouter, Routes, Route } from 'react-router-dom'
import AppLayout from './components/layouts/AppLayout'
import ProtectedRoute from './routes/ProtectedRoute'
import Login from './pages/Login/Login'
import ChangePassword from './pages/ChangePassword/ChangePassword'
import Profile from './pages/Profile/Profile'
import Dashboard from './pages/Dashboard/Dashboard'
import Projects from './pages/Projects/Projects'
import ProjectDetail from './pages/Projects/ProjectDetail'
import Users from './pages/Admin/Users/Users'
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
            <Route path="/projects" element={<Projects />} />
            <Route path="/projects/:projectId" element={<ProjectDetail />} />

            <Route element={<ProtectedRoute allowedRoles={['Admin']} />}>
              <Route path="/admin/users" element={<Users />} />
            </Route>
            {/* /tasks is added in its own phase */}
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
