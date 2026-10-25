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

test('RUNNER=contenedor solo funciona en Linux, sin root y con usuario sandbox', () => {
  const r = validar({ NODE_ENV: 'production', RUNNER: 'contenedor' })
  if (process.platform !== 'linux') {
    assert.equal(r.ok, false)
    assert.match(r.error, /solo funciona dentro de la imagen Docker/)
    return
  }
  if (process.getuid() === 0) {
    assert.equal(r.ok, false)
    assert.match(r.error, /no puede correr como root/)
    return
  }
  // Sin RUNNER_SANDBOX_UID/GID: el código del estudiante correría con el mismo usuario del backend.
  assert.equal(r.ok, false)
  assert.match(r.error, /RUNNER_SANDBOX_UID y RUNNER_SANDBOX_GID/)
})

const linuxSinRoot = process.platform === 'linux' && process.getuid?.() !== 0

test('RUNNER=contenedor arranca con un usuario sandbox distinto del backend', { skip: !linuxSinRoot }, () => {
  const r = validar({ NODE_ENV: 'production', RUNNER: 'contenedor', RUNNER_SANDBOX_UID: '65534', RUNNER_SANDBOX_GID: '65534' })
  assert.equal(r.ok, true, r.error)
})

test('RUNNER_SANDBOX_UID no puede ser el mismo usuario que el backend', { skip: !linuxSinRoot }, () => {
  const r = validar({ NODE_ENV: 'production', RUNNER: 'contenedor', RUNNER_SANDBOX_UID: String(process.getuid()), RUNNER_SANDBOX_GID: '1000' })
  assert.equal(r.ok, false)
  assert.match(r.error, /no puede ser el mismo usuario/)
})

test('un RUNNER desconocido o un límite fuera de rango se rechazan al arrancar', () => {
  assert.equal(validar({ RUNNER: 'docker' }).ok, false)
  assert.equal(validar({ RUNNER_EJECUCION_MS: '100' }).ok, false)
})
