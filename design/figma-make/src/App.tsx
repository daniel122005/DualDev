import { useState } from 'react'
import LoginScreen from './screens/LoginScreen'
import Dashboard from './screens/Dashboard'
import ModulesScreen from './screens/ModulesScreen'
import LessonScreen from './screens/LessonScreen'
import PracticeScreen from './screens/PracticeScreen'
import FeedbackScreen from './screens/FeedbackScreen'
import ChallengesScreen from './screens/ChallengesScreen'
import ProfileScreen from './screens/ProfileScreen'
import RankingScreen from './screens/RankingScreen'
import AppShell from './components/AppShell'

export type Screen =
  | 'login'
  | 'register'
  | 'dashboard'
  | 'modules'
  | 'lesson'
  | 'practice'
  | 'feedback'
  | 'challenges'
  | 'profile'
  | 'ranking'

export default function App() {
  const [screen, setScreen] = useState<Screen>('login')
  const [feedbackCorrect, setFeedbackCorrect] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  const navigate = (s: Screen, opts?: { correct?: boolean }) => {
    if (opts?.correct !== undefined) setFeedbackCorrect(opts.correct)
    setScreen(s)
    window.scrollTo(0, 0)
  }

  const login = () => { setIsLoggedIn(true); navigate('dashboard') }
  const logout = () => { setIsLoggedIn(false); navigate('login') }

  if (!isLoggedIn) {
    return <LoginScreen onLogin={login} mode={screen === 'register' ? 'register' : 'login'} onSwitch={(m) => navigate(m)} />
  }

  const withShell = (content: React.ReactNode) => (
    <AppShell current={screen} navigate={navigate} onLogout={logout}>
      <div key={screen} className="page-enter">{content}</div>
    </AppShell>
  )

  switch (screen) {
    case 'dashboard':   return withShell(<Dashboard navigate={navigate} />)
    case 'modules':     return withShell(<ModulesScreen navigate={navigate} />)
    case 'lesson':      return withShell(<LessonScreen navigate={navigate} />)
    case 'practice':    return withShell(<PracticeScreen navigate={navigate} />)
    case 'feedback':    return withShell(<FeedbackScreen correct={feedbackCorrect} navigate={navigate} />)
    case 'challenges':  return withShell(<ChallengesScreen navigate={navigate} />)
    case 'profile':     return withShell(<ProfileScreen navigate={navigate} />)
    case 'ranking':     return withShell(<RankingScreen navigate={navigate} />)
    default:            return withShell(<Dashboard navigate={navigate} />)
  }
}
