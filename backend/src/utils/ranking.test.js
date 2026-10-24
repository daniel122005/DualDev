import assert from 'node:assert/strict'
import { test } from 'node:test'
import { nombrePublico, ordenarRanking, posicionEnLista, puntosParaSubir } from './ranking.js'

test('ordena por puntos y los empates comparten puesto', () => {
  const r = ordenarRanking([
    { id_usuario: 'c', puntos: 100 },
    { id_usuario: 'a', puntos: 300 },
    { id_usuario: 'b', puntos: 100 },
    { id_usuario: 'd', puntos: 50 },
  ])
  assert.deepEqual(r.map((f) => [f.id_usuario, f.posicion]), [['a', 1], ['b', 2], ['c', 2], ['d', 4]])
})

test('nombre público: nombre + inicial del primer apellido', () => {
  assert.equal(nombrePublico('Valentina Torres Gómez'), 'Valentina T.')
  assert.equal(nombrePublico('  juan   garcía '), 'juan G.')
  assert.equal(nombrePublico('Ana'), 'Ana')
  assert.equal(nombrePublico(''), 'Estudiante')
})

test('puntos para subir: hasta superar al de arriba', () => {
  const r = ordenarRanking([
    { id_usuario: 'a', puntos: 1950 },
    { id_usuario: 'b', puntos: 1240 },
    { id_usuario: 'c', puntos: 1240 },
  ])
  assert.equal(puntosParaSubir(r, 'b'), 711)
  assert.equal(puntosParaSubir(r, 'a'), null)
  assert.equal(puntosParaSubir(r, 'zzz'), null)
})

test('posicionEnLista: empates comparten puesto y cuenta quién tiene puntos', () => {
  const filas = [{ puntos_acumulados: 300 }, { puntos_acumulados: 120 }, { puntos_acumulados: 120 }, { puntos_acumulados: 0 }]
  assert.deepEqual(posicionEnLista(filas, 120), { posicion: 2, total: 4, con_puntos: 3 })
  assert.deepEqual(posicionEnLista(filas, 0), { posicion: 4, total: 4, con_puntos: 3 })
  assert.deepEqual(posicionEnLista(filas, 300), { posicion: 1, total: 4, con_puntos: 3 })
})
