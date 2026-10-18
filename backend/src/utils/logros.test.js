import assert from 'node:assert/strict'
import { test } from 'node:test'
import { contarPerfectos, logrosAlcanzados } from './logros.js'

test('perfectos: cuenta solo los ejercicios cuyo PRIMER intento fue correcto', () => {
  const intentos = [
    { id_ejercicio: 1, es_correcto: true, created_at: '2026-10-01T10:00:00Z' }, // perfecto
    { id_ejercicio: 2, es_correcto: false, created_at: '2026-10-01T10:00:00Z' },
    { id_ejercicio: 2, es_correcto: true, created_at: '2026-10-01T10:05:00Z' }, // no
    { id_ejercicio: 3, es_correcto: true, created_at: '2026-10-02T10:00:00Z' }, // perfecto
    { id_ejercicio: 3, es_correcto: true, created_at: '2026-10-03T10:00:00Z' },
    { id_ejercicio: 4, es_correcto: false, created_at: '2026-10-02T10:00:00Z' }, // no resuelto
  ]
  assert.equal(contarPerfectos(intentos), 2)
})

test('perfectos: el orden de llegada de las filas no importa', () => {
  const intentos = [
    { id_ejercicio: 2, es_correcto: true, created_at: '2026-10-01T10:05:00Z' },
    { id_ejercicio: 2, es_correcto: false, created_at: '2026-10-01T10:00:00Z' },
  ]
  assert.equal(contarPerfectos(intentos), 0)
})

const LOGROS = [
  { id_logro: 1, tipo_criterio: 'ejercicios_completados', valor_requerido: 1 },
  { id_logro: 2, tipo_criterio: 'puntos', valor_requerido: 300 },
  { id_logro: 3, tipo_criterio: 'racha_dias', valor_requerido: 7 },
  { id_logro: 4, tipo_criterio: 'top_ranking', valor_requerido: 3 },
  { id_logro: 5, tipo_criterio: 'nivel', valor_requerido: 5 },
  { id_logro: 6, tipo_criterio: 'ejercicios_perfectos', valor_requerido: 5 },
]
const base = {
  puntos: 0, nivel: 1, ejercicios_completados: 0, lecciones_completadas: 0, modulos_completados: 0,
  desafios_completados: 0, racha_dias: 0, posicion_ranking: 1, ejercicios_perfectos: 0, participantes_con_puntos: 20,
}

test('top 3 no se otorga si compiten pocos estudiantes (curso recién empezado)', () => {
  const m = { ...base, puntos: 30, posicion_ranking: 1, participantes_con_puntos: 2 }
  assert.deepEqual(logrosAlcanzados(LOGROS, m).map((l) => l.id_logro), [])
  const conGrupo = { ...m, participantes_con_puntos: 10 }
  assert.deepEqual(logrosAlcanzados(LOGROS, conGrupo).map((l) => l.id_logro), [4])
})

test('un estudiante nuevo no gana nada (ni el top 3 por empatar con 0 puntos)', () => {
  assert.deepEqual(logrosAlcanzados(LOGROS, base), [])
})

test('umbral exacto otorga el logro', () => {
  const ids = logrosAlcanzados(LOGROS, { ...base, puntos: 300, ejercicios_completados: 1, posicion_ranking: 3 }).map((l) => l.id_logro)
  assert.deepEqual(ids, [1, 2, 4])
})

test('top ranking se pierde si bajas del umbral', () => {
  assert.deepEqual(logrosAlcanzados(LOGROS, { ...base, puntos: 50, posicion_ranking: 4 }), [])
})

test('racha, nivel y perfectos', () => {
  const ids = logrosAlcanzados(LOGROS, { ...base, racha_dias: 7, nivel: 5, ejercicios_perfectos: 5 }).map((l) => l.id_logro)
  assert.deepEqual(ids, [3, 5, 6])
})
