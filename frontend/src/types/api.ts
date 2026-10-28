export interface Nivel {
  numero: number
  nombre: string
  puntos_minimos: number
}

export interface ProgresoSemanal {
  meta: number
  ejercicios: number
  porcentaje: number
}

export interface ResumenNivel {
  puntos_acumulados: number
  nivel: Nivel
  nivel_siguiente: Nivel | null
  puntos_para_siguiente: number
  porcentaje_nivel: number
}

export interface Perfil extends ResumenNivel {
  id_usuario: string
  nombre: string
  correo: string
  grado: string | null
  created_at: string
  progreso_semanal: ProgresoSemanal
}

// Lo que AppLayout comparte con las pantallas hijas (ver hooks/usePerfil.ts).
export interface PerfilOutletContext {
  perfil: Perfil | null
  error: string | null
  recargarPerfil: () => Promise<void>
}

export type Dificultad = 'basico' | 'intermedio' | 'avanzado'
export type DificultadEjercicio = 'facil' | 'media' | 'dificil'
export type TipoEjercicio = 'seleccion' | 'respuesta_corta' | 'salida' | 'codigo'

export interface ModuloResumen {
  id_modulo: number
  titulo: string
  descripcion: string
  orden: number
  dificultad: Dificultad
  total_ejercicios: number
  ejercicios_resueltos: number
  total_lecciones: number
  lecciones_completadas: number
  progreso: number
  completado: boolean
  bloqueado: boolean
}

export interface ModuloListado extends ModuloResumen {
  puntos_totales: number
  lecciones: { id_contenido: number; titulo: string; completada: boolean }[]
}

export type EstadoEjercicio = 'resuelto' | 'intentado' | 'pendiente'

// GET /modules/:id
export interface ModuloDetalle extends ModuloResumen {
  puntos_totales: number
  lecciones: { id_contenido: number; titulo: string; orden: number; minutos_estimados: number; puntos: number; completada: boolean }[]
  ejercicios: {
    id_ejercicio: number
    titulo: string
    tipo: TipoEjercicio
    dificultad: DificultadEjercicio
    puntos: number
    orden: number
    estado: EstadoEjercicio
  }[]
}

export interface Leccion {
  id_contenido: number
  id_modulo: number
  titulo: string
  explicacion: string
  codigo_ejemplo: string | null
  salida_ejemplo: string | null
  tip: string | null
  minutos_estimados: number
  puntos: number
  orden: number
  completada: boolean
  modulo: { id_modulo: number; titulo: string; orden: number }
  posicion: number
  total_lecciones: number
  pasos: { id_contenido: number; titulo: string; completada: boolean }[]
  anterior: number | null
  siguiente: number | null
  primer_ejercicio: number | null
}

export interface LogroNuevo {
  id_logro: number
  codigo: string
  nombre: string
  descripcion: string
  icono: string | null
}

export interface ResultadoPuntos {
  puntos_otorgados: number
  nuevo: boolean
  puntos_totales: number
  nivel: number
  logros_nuevos: LogroNuevo[]
}

export type PeriodoReto = 'diario' | 'semanal' | 'mini'
export type EstadoReto = 'nuevo' | 'intentado' | 'completado'

export interface RetoResumen {
  id_desafio: number
  titulo: string
  enunciado: string
  tipo: TipoEjercicio
  dificultad: DificultadEjercicio
  puntos: number
  periodo: PeriodoReto
  minutos_estimados: number
  termina_en: string | null
  participantes: number
  pistas: string[]
  estado: EstadoReto
  intentos: number
}

export interface RetosData {
  racha: number
  retos: RetoResumen[]
  completados: { id_desafio: number; titulo: string; puntos: number; fecha: string }[]
}

export interface RetoDetalle {
  id_desafio: number
  titulo: string
  enunciado: string
  tipo: TipoEjercicio
  dificultad: DificultadEjercicio
  puntos: number
  periodo: PeriodoReto
  minutos_estimados: number
  opciones: string[] | null
  pistas: string[]
  codigo_inicial: string | null
  requiere: string[]
  ejemplos: { entrada: string; salida: string }[]
  total_casos: number
  termina_en: string | null
  vigente: boolean
  estado: EstadoReto
  intentos: number
  solucion: string | null
}

export interface FilaRanking {
  posicion: number
  nombre: string
  iniciales: string
  puntos: number
  nivel: number
  racha: number
  es_yo: boolean
}

export interface RankingData {
  periodo: 'global' | 'semana'
  id_modulo: number | null
  total_estudiantes: number
  participantes: number
  filas: FilaRanking[]
  yo: (FilaRanking & { puntos_para_subir: number | null }) | null
  modulos: { id_modulo: number; titulo: string; orden: number }[]
}

export interface PerfilCompleto extends ResumenNivel {
  id_usuario: string
  nombre: string
  correo: string
  grado: string | null
  created_at: string
  racha: number
  ranking: { posicion: number; total: number }
  progreso_general: number
  modulos: (ModuloResumen & { puntos_ganados: number })[]
  modulos_completados: number
  modulos_pendientes: number
  logros: LogroResumen[]
  estadisticas: {
    ejercicios_resueltos: number
    desafios_completados: number
    lecciones_vistas: number
    precision: number | null
    tiempo_practica_seg: number
    dias_activo: number
    ejercicios_perfectos: number
  }
}

export interface EjercicioResumen {
  id_ejercicio: number
  id_modulo: number
  titulo: string
  tipo: TipoEjercicio
  dificultad: DificultadEjercicio
  puntos: number
  orden: number
  resuelto: boolean
}

export interface Ejercicio {
  id_ejercicio: number
  id_modulo: number
  titulo: string
  enunciado: string
  tipo: TipoEjercicio
  dificultad: DificultadEjercicio
  puntos: number
  opciones: string[] | null
  pistas: string[]
  codigo_inicial: string | null
  requiere: string[]
  orden: number
  ejemplos: { entrada: string; salida: string }[]
  total_casos: number
  modulo: { id_modulo: number; titulo: string; orden: number }
  primera_leccion: number | null
  ejercicios_del_modulo: EjercicioResumen[]
  resuelto: boolean
  intentos: number
  intentos_fallidos: number
  solucion: string | null
  explicacion: string | null
  // Última respuesta correcta del propio estudiante (null si no lo ha resuelto).
  mi_respuesta?: string | null
}

export interface ErrorCompilacion {
  linea: number | null
  columna: number | null
  tipo: string
  mensaje: string
  explicacion: string
  codigo?: string
}

// Explicación "tono profe" de por qué falló (qué pasó y por qué), opcionalmente ligada a una línea.
export interface Recuerda {
  linea: number | null
  texto: string
}

export interface ErrorEjecucion {
  tipo: 'excepcion' | 'tiempo_agotado' | 'salida_excesiva' | 'terminacion'
  excepcion?: string
  mensaje?: string | null
  linea?: number | null
  explicacion: string
  detalle?: string | null
  recuerda?: Recuerda[]
}

export interface ResultadoEjecucion {
  compilo: boolean
  errores_compilacion: ErrorCompilacion[]
  entrada: string
  salida: string
  error: ErrorEjecucion | null
  ms: number
}

export type Diagnostico =
  | { tipo: 'compilacion'; errores: ErrorCompilacion[]; recuerda?: Recuerda[] }
  | {
      tipo: 'excepcion' | 'tiempo_agotado' | 'salida_excesiva' | 'terminacion'
      caso: number
      visible: boolean
      error: ErrorEjecucion
      recuerda?: Recuerda[]
    }
  | {
      tipo: 'salida_distinta'
      caso?: number
      visible?: boolean
      linea?: number
      entrada?: string
      salida_esperada?: string
      salida_obtenida?: string
      primera_diferencia?: { linea: number; esperada?: string | null; obtenida?: string | null }
      explicacion?: string
      recuerda?: Recuerda[]
    }
  | { tipo: 'estructura'; faltan: string[]; explicacion: string; recuerda?: undefined }
  | { tipo: 'respuesta'; recuerda: Recuerda[] }

export interface ResultadoEnvio {
  correcto: boolean
  feedback: string
  diagnostico: Diagnostico | null
  casos: { visible: boolean; correcto: boolean }[]
  salida: string | null
  puntos_otorgados: number
  primer_acierto: boolean
  ya_resuelto: boolean
  puntos_totales: number
  nivel: number
  intentos: number
  intentos_fallidos: number
  pista: string | null
  explicacion: string | null
  solucion: string | null
  logros_nuevos: LogroNuevo[]
}

export interface LogroResumen {
  id_logro: number
  codigo: string
  nombre: string
  descripcion: string
  icono: string | null
  obtenido: boolean
  fecha_obtencion: string | null
}

export interface Actividad {
  tipo: 'ejercicio' | 'desafio' | 'logro'
  texto: string
  puntos: number
  fecha: string
}

export interface DashboardData extends ResumenNivel {
  racha: number
  ranking: { posicion: number; total: number }
  modulos: ModuloResumen[]
  logros: LogroResumen[]
  actividad_reciente: Actividad[]
}
