import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import AppLayout from '@/layouts/AppLayout'
import AuthScreen from '@/pages/AuthScreen'
import { ProtectedRoute, PublicOnlyRoute } from '@/routes/ProtectedRoute'

// Las pantallas internas se descargan al entrar en ellas: el paquete inicial queda con lo del login
// (React, router y supabase-js).
const Dashboard = lazy(() => import('@/pages/Dashboard'))
const ModulesScreen = lazy(() => import('@/pages/ModulesScreen'))
const LessonScreen = lazy(() => import('@/pages/LessonScreen'))
const PracticaInicio = lazy(() => import('@/pages/PracticaInicio'))
const PracticeScreen = lazy(() => import('@/pages/PracticeScreen'))
const RankingScreen = lazy(() => import('@/pages/RankingScreen'))
const ProfileScreen = lazy(() => import('@/pages/ProfileScreen'))
const ChallengesScreen = lazy(() => import('@/pages/ChallengesScreen'))
const ChallengeSolveScreen = lazy(() => import('@/pages/ChallengeSolveScreen'))

function Cargando() {
  return (
    <div className="mx-auto max-w-5xl p-6" style={{ color: 'var(--color-muted)' }}>
      Cargando…
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={<Cargando />}>
          <Routes>
            <Route element={<PublicOnlyRoute />}>
              <Route path="/login" element={<AuthScreen modo="login" />} />
              <Route path="/register" element={<AuthScreen modo="register" />} />
            </Route>
            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/modulos" element={<ModulesScreen />} />
                <Route path="/lecciones/:id" element={<LessonScreen />} />
                <Route path="/practica" element={<PracticaInicio />} />
                <Route path="/practica/:id" element={<PracticeScreen />} />
                <Route path="/retos" element={<ChallengesScreen />} />
                <Route path="/retos/:id" element={<ChallengeSolveScreen />} />
                <Route path="/ranking" element={<RankingScreen />} />
                <Route path="/perfil" element={<ProfileScreen />} />
              </Route>
            </Route>
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  )
}
