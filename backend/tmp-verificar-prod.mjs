// Comprueba contra PRODUCCIÓN que el backend desplegado usa la entrada que escribe el estudiante.
import fs from 'node:fs'
import { createClient } from '@supabase/supabase-js'

const env = Object.fromEntries(
  fs.readFileSync('.env', 'utf8').split(/\r?\n/).filter((l) => l.includes('=') && !l.startsWith('#'))
    .map((l) => [l.slice(0, l.indexOf('=')), l.slice(l.indexOf('=') + 1).trim()]),
)
const API = 'https://dualdev-api.onrender.com/api'
const admin = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } })

const salud = await fetch(`${API}/health`).then((r) => r.json())
console.log('salud:', JSON.stringify(salud))

const correo = `dualdev.e2e.entrada${Date.now()}@gmail.com`
const { data: creado, error } = await admin.auth.admin.createUser({
  email: correo, password: 'Prueba12345', email_confirm: true, user_metadata: { nombre: 'Prueba Entrada' },
})
if (error) throw error
try {
  const sb = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, { auth: { persistSession: false } })
  const { data: sesion } = await sb.auth.signInWithPassword({ email: correo, password: 'Prueba12345' })
  const token = sesion.session.access_token

  const codigo = `import java.util.Scanner;

public class Ejercicio {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        System.out.println("Tienes " + n + " años");
    }
}`
  // id_ejercicio 77 = "Saludo con tu edad" (módulo 1, abierto para cualquier estudiante nuevo).
  const llamar = (cuerpo) =>
    fetch(`${API}/code/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(cuerpo),
    }).then((r) => r.json())

  const conEntrada = await llamar({ codigo, id_ejercicio: 77, entrada: '42' })
  console.log('con entrada "42"  ->', JSON.stringify({ entrada: conEntrada.entrada, salida: conEntrada.salida?.trim() }))

  const sinEntrada = await llamar({ codigo, id_ejercicio: 77 })
  console.log('sin entrada       ->', JSON.stringify({ entrada: sinEntrada.entrada, salida: sinEntrada.salida?.trim() }))

  const larga = await fetch(`${API}/code/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ codigo, id_ejercicio: 77, entrada: '7\n'.repeat(2000) }),
  })
  console.log('entrada gigante   -> HTTP', larga.status, JSON.stringify((await larga.json()).error?.message ?? ''))

  const ok = conEntrada.salida?.includes('Tienes 42') && sinEntrada.entrada === '16' && larga.status === 400
  console.log(ok ? '\nRESULTADO: el backend desplegado usa la entrada escrita y rechaza una entrada gigante.' : '\nRESULTADO: revisar, algo no coincide.')
} finally {
  await admin.auth.admin.deleteUser(creado.user.id)
  console.log('estudiante temporal borrado')
}
