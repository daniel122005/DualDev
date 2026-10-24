// Prueba de punta a punta de DUALDEV contra el backend en marcha y la base de datos real (Supabase).
// Uso: con el backend corriendo (npm run dev) ->  npm run test:e2e
// Crea estudiantes temporales (correos dualdev.e2e.*) y los BORRA al terminar, aunque algo falle.
// No modifica el catálogo (módulos, ejercicios, desafíos) ni datos de otros estudiantes.
import { createClient } from '@supabase/supabase-js'
import { getSupabaseAdmin } from '../src/config/supabase.js'

const API = process.env.API_URL ?? `http://localhost:${process.env.PORT ?? 4000}/api`
const { SUPABASE_URL: URL_SB, SUPABASE_ANON_KEY: ANON } = process.env
const admin = getSupabaseAdmin()
const creados = []
const resultados = []
const tiempos = []
const espera = (ms) => new Promise((r) => setTimeout(r, ms))

function comprobar(req, descripcion, ok, detalle = '') {
  resultados.push({ req, descripcion, ok })
  console.log(`${ok ? 'OK   ' : 'FALLO'} [${req}] ${descripcion}${detalle ? ` · ${detalle}` : ''}`)
}

function cliente() {
  return createClient(URL_SB, ANON, { auth: { persistSession: false, autoRefreshToken: false } })
}

async function estudiante(nombre, { conSesion = true } = {}) {
  const correo = `dualdev.e2e.${Date.now()}${Math.random().toString(36).slice(2, 7)}@gmail.com`
  const { data, error } = await admin.auth.admin.createUser({ email: correo, password: 'Prueba12345', email_confirm: true, user_metadata: { nombre } })
  if (error) throw error
  creados.push(data.user.id)
  const sb = cliente()
  let token = null
  if (conSesion) token = (await sb.auth.signInWithPassword({ email: correo, password: 'Prueba12345' })).data.session.access_token
  return { id: data.user.id, correo, sb, token, ...http(() => token) }
}

function http(obtenerToken) {
  const llamar = async (metodo, ruta, cuerpo, { medir = true } = {}) => {
    const inicio = Date.now()
    const r = await fetch(API + ruta, {
      method: metodo,
      headers: { 'Content-Type': 'application/json', ...(obtenerToken() ? { Authorization: `Bearer ${obtenerToken()}` } : {}) },
      body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo),
    })
    const ms = Date.now() - inicio
    if (medir) tiempos.push({ ruta: `${metodo} ${ruta.replace(/\/\d+/g, '/:id').replace(/\?.*/, '')}`, ms })
    return { status: r.status, body: await r.json().catch(() => null), ms }
  }
  return { get: (r, o) => llamar('GET', r, undefined, o), post: (r, b, o) => llamar('POST', r, b ?? {}, o), patch: (r, b) => llamar('PATCH', r, b) }
}

async function main() {
  try {
    const salud = await fetch(API + '/health').catch(() => null)
    if (!salud?.ok) throw new Error(`El backend no responde en ${API}. Arráncalo con "npm run dev" y vuelve a intentarlo.`)

    // ---------------------------------------------------------------- RF-01 / RF-02 / RF-03
    const correoRegistro = `dualdev.e2e.${Date.now()}reg@gmail.com`
    const sbReg = cliente()
    const reg = await sbReg.auth.signUp({ email: correoRegistro, password: 'Prueba12345', options: { data: { nombre: 'Ana Registro' } } })
    if (reg.data.user) creados.push(reg.data.user.id)
    comprobar('RF-01', 'registro crea la cuenta con sesión', !reg.error && Boolean(reg.data.session), reg.error?.message)
    const perfilReg = (await admin.from('usuario').select('nombre').eq('id_usuario', reg.data.user?.id).maybeSingle()).data
    const progReg = (await admin.from('progreso').select('puntos_acumulados').eq('id_usuario', reg.data.user?.id).maybeSingle()).data
    comprobar('RF-01', 'el registro crea perfil y progreso en PostgreSQL', perfilReg?.nombre === 'Ana Registro' && progReg?.puntos_acumulados === 0)
    const dup = await cliente().auth.signUp({ email: correoRegistro, password: 'OtraClave123' })
    comprobar('RF-01', 'correo duplicado rechazado', Boolean(dup.error) || dup.data.user?.identities?.length === 0, dup.error?.message)

    const malo = await cliente().auth.signInWithPassword({ email: correoRegistro, password: 'incorrecta1' })
    comprobar('RF-02', 'credenciales incorrectas rechazadas', malo.error?.status === 400)
    const login = await sbReg.auth.signInWithPassword({ email: correoRegistro, password: 'Prueba12345' })
    const tokenLogin = login.data.session?.access_token
    const apiReg = http(() => tokenLogin)
    const me = await apiReg.get('/me')
    comprobar('RF-02', 'login válido y el backend acepta la sesión', me.status === 200 && me.body?.nombre === 'Ana Registro')
    await sbReg.auth.signOut()
    const tras = await apiReg.get('/me', { medir: false })
    comprobar('RF-03', 'tras cerrar sesión el backend rechaza el token', tras.status === 401, `status ${tras.status}`)

    // ---------------------------------------------------------------- RF-04 / RF-05 (módulos y lecciones)
    const e = await estudiante('Beto Gómez')
    const mods = await e.get('/modules')
    const ordenados = mods.body.every((m, i, a) => i === 0 || a[i - 1].orden < m.orden)
    comprobar('RF-04', 'módulos ordenados con progreso y disponibilidad', mods.status === 200 && ordenados && mods.body[0].bloqueado === false && mods.body[1].bloqueado === true)
    comprobar('RF-04', 'módulo bloqueado responde 403', (await e.get(`/modules/${mods.body[1].id_modulo}`)).status === 403)
    const det1 = await e.get(`/modules/${mods.body[0].id_modulo}`)
    const lec = await e.get(`/lessons/${det1.body.lecciones[0].id_contenido}`)
    comprobar('RF-05', 'lección con explicación y código de ejemplo', lec.status === 200 && Boolean(lec.body.explicacion) && Boolean(lec.body.codigo_ejemplo))
    const c1 = await e.post(`/lessons/${lec.body.id_contenido}/complete`)
    const c2 = await e.post(`/lessons/${lec.body.id_contenido}/complete`)
    comprobar('RF-08', 'completar una lección da puntos una sola vez', c1.body.puntos_otorgados > 0 && c2.body.puntos_otorgados === 0)

    // ---------------------------------------------------------------- RF-06 / RF-07 / RF-10 / RF-11 (ejercicios)
    const ejSel = det1.body.ejercicios.find((x) => x.tipo === 'seleccion')
    const ejDet = await e.get(`/exercises/${ejSel.id_ejercicio}`)
    comprobar('RF-06', 'el ejercicio no expone la solución', ejDet.status === 200 && ejDet.body.solucion === null && !('casos_prueba' in ejDet.body))
    const correcta = (await admin.from('ejercicio').select('solucion_esperada').eq('id_ejercicio', ejSel.id_ejercicio).single()).data.solucion_esperada
    const incorrecta = ejDet.body.opciones.find((o) => o !== correcta)
    const f1 = await e.post(`/exercises/${ejSel.id_ejercicio}/submit`, { respuesta: incorrecta })
    comprobar('RF-07', 'respuesta incorrecta con retroalimentación y pista', f1.body.correcto === false && Boolean(f1.body.pista))
    comprobar('RF-07', 'la opción incorrecta explica por qué (tono profe)', f1.body.diagnostico?.tipo === 'respuesta' && f1.body.diagnostico.recuerda?.[0]?.texto?.length > 20)
    await espera(1100)
    const a1 = await e.post(`/exercises/${ejSel.id_ejercicio}/submit`, { respuesta: correcta })
    comprobar('RF-10', 'acierto suma los puntos del ejercicio', a1.body.correcto === true && a1.body.puntos_otorgados > 0)
    comprobar('RF-11', 'primer acierto desbloquea el logro "Primer ciclo"', a1.body.logros_nuevos.some((l) => l.codigo === 'primer_paso'))
    await espera(1100)
    const a2 = await e.post(`/exercises/${ejSel.id_ejercicio}/submit`, { respuesta: correcta })
    comprobar('RF-10', 'repetir un ejercicio resuelto no da puntos', a2.body.correcto === true && a2.body.puntos_otorgados === 0 && a2.body.ya_resuelto)

    // Abrir el módulo 2 (50 % del módulo 1) para el ejercicio de código
    for (const x of det1.body.ejercicios) {
      await admin.rpc('registrar_intento_ejercicio', { p_usuario: e.id, p_ejercicio: x.id_ejercicio, p_respuesta: 'e2e', p_correcto: true, p_feedback: null, p_detalle: null, p_duracion: 1 })
    }
    const ejCod = (await admin.from('ejercicio').select('id_ejercicio, solucion_esperada').eq('titulo', 'Suma de números').single()).data
    await espera(1100)
    const sinPc = await e.post(`/exercises/${ejCod.id_ejercicio}/submit`, { respuesta: ejCod.solucion_esperada.replace('suma);', 'suma)') })
    const err = sinPc.body?.diagnostico?.errores?.[0]
    comprobar('RF-07', 'error de compilación con línea y explicación en español', sinPc.body?.correcto === false && err?.linea === 7 && /punto y coma/.test(err.explicacion), `${sinPc.ms} ms`)
    await espera(1100)
    const trampa = await e.post(`/exercises/${ejCod.id_ejercicio}/submit`, { respuesta: 'public class Ejercicio { public static void main(String[] a) { System.out.println("Suma = 55"); } }' })
    comprobar('RF-07', 'imprimir el resultado sin ciclo se detecta', trampa.body?.correcto === false && trampa.body?.diagnostico?.tipo === 'estructura')
    await espera(1100)
    const okCod = await e.post(`/exercises/${ejCod.id_ejercicio}/submit`, { respuesta: ejCod.solucion_esperada })
    comprobar('RF-06', 'código Java correcto se acepta', okCod.body?.correcto === true, `${okCod.ms} ms`)

    // ---------------------------------------------------------------- RF-08 / RF-09 (progreso)
    const intentos = (await admin.from('intento_ejercicio').select('id_intento', { count: 'exact', head: true }).eq('id_usuario', e.id)).count
    comprobar('RF-08', 'los intentos quedan registrados', intentos >= 6, `${intentos} intentos`)
    const perfil = await e.get('/profile')
    comprobar('RF-09', 'el perfil muestra progreso, módulos, logros y estadísticas',
      perfil.status === 200 && perfil.body.progreso_general > 0 && perfil.body.logros.some((l) => l.obtenido) && perfil.body.estadisticas.ejercicios_resueltos >= 1)
    const dash = await e.get('/dashboard')
    comprobar('RF-09', 'el dashboard muestra nivel, puntos, racha y ranking', dash.status === 200 && dash.body.nivel && dash.body.racha >= 1 && dash.body.ranking.posicion >= 1)
    const rk = await e.get('/ranking')
    comprobar('RF-09', 'ranking sin ids ni correos de otros estudiantes', rk.status === 200 && !JSON.stringify(rk.body).includes('@') && rk.body.filas.every((f) => !('id_usuario' in f)))

    // ---------------------------------------------------------------- RF-12 (desafíos)
    const retos = await e.get('/challenges')
    const periodos = retos.body.retos.map((r) => r.periodo)
    comprobar('RF-12', 'hay un reto diario, uno semanal y mini-retos vigentes', periodos.filter((p) => p === 'diario').length === 1 && periodos.filter((p) => p === 'semanal').length === 1 && periodos.includes('mini'))
    const vigentes = new Set(retos.body.retos.map((r) => r.id_desafio))
    const noVigente = (await admin.from('desafio').select('id_desafio').eq('periodo', 'diario')).data.find((d) => !vigentes.has(d.id_desafio))
    comprobar('RF-12', 'un reto que no está vigente no se puede enviar', (await e.post(`/challenges/${noVigente.id_desafio}/submit`, { respuesta: 'x' })).status === 403)
    const mini = retos.body.retos.find((r) => r.titulo === 'Suma del 1 al 100')
    await espera(1100)
    const r1 = await e.post(`/challenges/${mini.id_desafio}/submit`, { respuesta: '5050' })
    await espera(1100)
    const r2 = await e.post(`/challenges/${mini.id_desafio}/submit`, { respuesta: '5050' })
    comprobar('RF-12', 'reto resuelto da puntos y repetirlo no da más', r1.body.puntos_otorgados > 0 && r2.body.puntos_otorgados === 0)

    // ---------------------------------------------------------------- RNF-03 (sin puntos duplicados con concurrencia)
    const conc = await estudiante('Carla Concurrente', { conSesion: false })
    const diario = retos.body.retos.find((r) => r.periodo === 'diario')
    const ejDif = (await admin.from('ejercicio').select('id_ejercicio, puntos').eq('titulo', 'Triángulo de asteriscos').single()).data
    const [rr, ee] = await Promise.all([
      Promise.all(Array.from({ length: 5 }, () => admin.rpc('registrar_resultado_desafio', { p_usuario: conc.id, p_desafio: diario.id_desafio, p_respuesta: 'x', p_correcto: true, p_detalle: null, p_duracion: 1 }))),
      Promise.all(Array.from({ length: 5 }, () => admin.rpc('registrar_intento_ejercicio', { p_usuario: conc.id, p_ejercicio: ejDif.id_ejercicio, p_respuesta: 'x', p_correcto: true, p_feedback: null, p_detalle: null, p_duracion: 1 }))),
    ])
    const pagados = (lista) => lista.filter((r) => r.data?.[0]?.puntos_otorgados > 0).length
    const total = (await admin.from('progreso').select('puntos_acumulados').eq('id_usuario', conc.id).single()).data.puntos_acumulados
    comprobar('RNF-03', '5 aciertos simultáneos a un reto y a un ejercicio pagan una sola vez cada uno', pagados(rr) === 1 && pagados(ee) === 1 && total === diario.puntos + ejDif.puntos, `total ${total}`)

    // ---------------------------------------------------------------- Seguridad
    const anon = cliente()
    comprobar('SEG', 'anónimo no lee ejercicios ni soluciones', Boolean((await anon.from('ejercicio').select('solucion_esperada').limit(1)).error))
    comprobar('SEG', 'estudiante no lee casos de prueba por Supabase', Boolean((await e.sb.from('ejercicio').select('casos_prueba').limit(1)).error))
    comprobar('SEG', 'estudiante no puede llamar la función de puntos', Boolean((await e.sb.rpc('sumar_puntos', { p_usuario: e.id, p_puntos: 9999 })).error))
    const otroCambio = await e.sb.from('usuario').update({ nombre: 'Hackeado' }).eq('id_usuario', conc.id).select('nombre')
    comprobar('SEG', 'estudiante no puede cambiar el nombre de otro', Boolean(otroCambio.error) || otroCambio.data.length === 0)
    const propio = await e.sb.from('usuario').update({ nombre: '' }).eq('id_usuario', e.id).select('nombre')
    comprobar('SEG', 'estudiante no puede poner un nombre inválido saltándose el backend (migración 0005)', Boolean(propio.error), propio.error ? '' : 'APLICA supabase/migrations/20261018000005_endurecer_perfil.sql')
    if (!propio.error) await admin.from('usuario').update({ nombre: 'Beto Gómez' }).eq('id_usuario', e.id)
    comprobar('SEG', 'PATCH /profile rechaza campos no permitidos', (await e.patch('/profile', { correo: 'x@x.com' })).status === 400)
    const bomba = 'public class Main { public static void main(String[] a) { while (true) { Thread t = new Thread(() -> { try { Thread.sleep(60000); } catch (Exception x) {} }); t.setDaemon(true); t.start(); } } }'
    await espera(1100)
    // Las llamadas de ataque no cuentan en el resumen de tiempos (RNF-02 mide el uso normal).
    const rb = await e.post('/code/run', { codigo: bomba }, { medir: false })
    comprobar('SEG', 'el ejecutor corta una bomba de hilos', /demasiados hilos/.test(rb.body?.error?.explicacion ?? ''), `${rb.ms} ms`)
    await espera(1100)
    const env = await e.post('/code/run', { codigo: 'public class Main { public static void main(String[] a) { System.out.println(System.getenv("SUPABASE_SERVICE_ROLE_KEY")); } }' }, { medir: false })
    comprobar('SEG', 'el ejecutor no deja leer variables de entorno', env.body?.error?.tipo === 'excepcion' && !/sb_secret/.test(env.body?.salida ?? ''))
    const malformado = await fetch(API + '/health', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{x' })
    comprobar('SEG', 'JSON malformado responde 400 (no 500)', malformado.status === 400)
    const rafaga = await Promise.all(Array.from({ length: 3 }, () => e.post('/code/run', { codigo: bomba }, { medir: false })))
    comprobar('SEG', 'límite de uso: ráfaga de ejecuciones recibe 429', rafaga.some((r) => r.status === 429))
  } catch (err) {
    comprobar('E2E', 'la prueba terminó sin errores inesperados', false, err.message)
  } finally {
    for (const id of creados) await admin.auth.admin.deleteUser(id).catch(() => {})
    console.log(`\nLimpieza: ${creados.length} estudiantes temporales borrados.`)
  }

  // ---------------------------------------------------------------- RNF-02 (tiempos)
  const porRuta = new Map()
  for (const t of tiempos) porRuta.set(t.ruta, [...(porRuta.get(t.ruta) ?? []), t.ms])
  console.log('\nTiempos de respuesta (RNF-02: cargas < 3 s, retroalimentación idealmente < 2 s):')
  for (const [ruta, ms] of [...porRuta].sort()) {
    const max = Math.max(...ms)
    const limite = /submit|run/.test(ruta) ? 2000 : 3000
    console.log(`  ${max <= limite ? '   ' : '!! '}${ruta.padEnd(36)} máx ${String(max).padStart(5)} ms · ${ms.length} llamadas`)
  }

  const fallos = resultados.filter((r) => !r.ok)
  console.log(`\n${resultados.length - fallos.length}/${resultados.length} comprobaciones correctas.`)
  process.exitCode = fallos.length ? 1 : 0
}

await main()
