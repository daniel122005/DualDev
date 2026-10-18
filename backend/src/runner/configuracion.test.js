// La configuración se lee al importar config/env.js, así que cada caso arranca un Node aparte.
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { test } from 'node:test'

function validar(variables) {
  const codigo = `import('./src/runner/index.js').then((m) => { m.validarConfiguracionEjecutor(); console.log('OK') })`
  const r = spawnSync(process.execPath, ['--input-type=module', '-e', codigo], {
    env: { PATH: process.env.PATH, SystemRoot: process.env.SystemRoot, ...variables },
    encoding: 'utf8',
  })
  return { ok: r.status === 0 && r.stdout.includes('OK'), error: r.stderr }
}

test('RUNNER=local se niega a arrancar en producción', () => {
  const r = validar({ NODE_ENV: 'production', RUNNER: 'local' })
  assert.equal(r.ok, false)
  assert.match(r.error, /RUNNER=local no está permitido en producción/)
})

test('RUNNER=local sigue permitido en desarrollo', () => {
  assert.equal(validar({ NODE_ENV: 'development', RUNNER: 'local' }).ok, true)
})

test('RUNNER=contenedor solo funciona en Linux y sin root', () => {
  const r = validar({ NODE_ENV: 'production', RUNNER: 'contenedor' })
  if (process.platform !== 'linux') {
    assert.equal(r.ok, false)
    assert.match(r.error, /solo funciona dentro de la imagen Docker/)
  } else {
    assert.equal(r.ok, process.getuid() !== 0)
  }
})

test('un RUNNER desconocido o un límite fuera de rango se rechazan al arrancar', () => {
  assert.equal(validar({ RUNNER: 'docker' }).ok, false)
  assert.equal(validar({ RUNNER_EJECUCION_MS: '100' }).ok, false)
})
