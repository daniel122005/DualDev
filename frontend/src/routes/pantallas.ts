import { createElement, lazy, type ComponentType } from 'react'
import { api } from '@/services/api'

// Las pantallas internas se descargan aparte: el paquete inicial queda con lo del login
// (React, router y supabase-js). Tras entrar, `precargarPantallas` las baja en segundo plano.
//
// No basta con React.lazy: aunque el código ya esté descargado, un lazy "suspende" la primera vez que
// se pinta y React 19 retrasa ~300 ms esa pantalla (medido). Por eso, si el módulo ya llegó, se pinta
// el componente directamente y el lazy solo se usa si todavía no ha llegado.
function diferida(cargar: () => Promise<{ default: ComponentType }>) {
  let cargado: ComponentType | null = null
  const precargar = () =>
    cargar().then((m) => {
      cargado = m.default
      return m
    })
  const Perezosa = lazy(precargar)
  function Pantalla() {
    return createElement(cargado ?? Perezosa)
  }
  return { Pantalla, precargar }
}

const pantallas = {
  Dashboard: diferida(() => import('@/pages/Dashboard')),
  ModulesScreen: diferida(() => import('@/pages/ModulesScreen')),
  ModuleSummaryScreen: diferida(() => import('@/pages/ModuleSummaryScreen')),
  LessonScreen: diferida(() => import('@/pages/LessonScreen')),
  PracticaInicio: diferida(() => import('@/pages/PracticaInicio')),
  PracticeScreen: diferida(() => import('@/pages/PracticeScreen')),
  RankingScreen: diferida(() => import('@/pages/RankingScreen')),
  ProfileScreen: diferida(() => import('@/pages/ProfileScreen')),
  ChallengesScreen: diferida(() => import('@/pages/ChallengesScreen')),
  ChallengeSolveScreen: diferida(() => import('@/pages/ChallengeSolveScreen')),
}

export const Dashboard = pantallas.Dashboard.Pantalla
export const ModulesScreen = pantallas.ModulesScreen.Pantalla
export const ModuleSummaryScreen = pantallas.ModuleSummaryScreen.Pantalla
export const LessonScreen = pantallas.LessonScreen.Pantalla
export const PracticaInicio = pantallas.PracticaInicio.Pantalla
export const PracticeScreen = pantallas.PracticeScreen.Pantalla
export const RankingScreen = pantallas.RankingScreen.Pantalla
export const ProfileScreen = pantallas.ProfileScreen.Pantalla
export const ChallengesScreen = pantallas.ChallengesScreen.Pantalla
export const ChallengeSolveScreen = pantallas.ChallengeSolveScreen.Pantalla

// Datos de las secciones del menú: se piden una vez al entrar para que la primera visita a cada una
// salga de la caché (al abrirla, la pantalla igual vuelve a pedir la versión fresca).
const DATOS_DEL_MENU = ['/modules', '/challenges', '/ranking', '/profile']

let precargado = false

function cuandoEsteLibre(fn: () => void) {
  if ('requestIdleCallback' in window) window.requestIdleCallback(fn, { timeout: 3000 })
  else setTimeout(fn, 1500)
}

// Una vez por carga de la app: baja el código de todas las pantallas y, escalonados, los datos del menú.
export function precargarPantallas() {
  if (precargado) return
  precargado = true
  cuandoEsteLibre(() => {
    Object.values(pantallas).forEach((p) => void p.precargar().catch(() => {}))
    DATOS_DEL_MENU.forEach((ruta, i) => setTimeout(() => void api(ruta).catch(() => {}), 400 * (i + 1)))
  })
}
