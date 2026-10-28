import { Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import AppLayout from '@/layouts/AppLayout'
import AuthScreen from '@/pages/AuthScreen'
import {
  ChallengeSolveScreen,
  ChallengesScreen,
  Dashboard,
  LessonScreen,
  ModulesScreen,
  ModuleSummaryScreen,
  PracticaInicio,
  PracticeScreen,
  ProfileScreen,
  RankingScreen,
} from '@/routes/pantallas'
import { ProtectedRoute, PublicOnlyRoute } from '@/routes/ProtectedRoute'

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
                <Route path="/modulos/:id/resumen" element={<ModuleSummaryScreen />} />
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
