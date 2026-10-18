import { Link } from 'react-router-dom'
import type { EjercicioResumen } from '@/types/api'
import { DIFICULTAD_EJERCICIO } from '@/utils/disenio'

const TIPO = { codigo: 'Código', seleccion: 'Selección', respuesta_corta: 'Respuesta', salida: 'Salida' } as const

export default function ExerciseList({ ejercicios, actual }: { ejercicios: EjercicioResumen[]; actual: number }) {
  return (
    <nav aria-label="Ejercicios del módulo">
      <p className="font-display mb-3 text-xs font-bold" style={{ color: 'var(--color-muted)' }}>
        EJERCICIOS
      </p>
      <ul className="flex flex-col gap-2">
        {ejercicios.map((ex) => {
          const activo = ex.id_ejercicio === actual
          const dif = DIFICULTAD_EJERCICIO[ex.dificultad]
          return (
            <li key={ex.id_ejercicio}>
              <Link
                to={`/practica/${ex.id_ejercicio}`}
                aria-current={activo ? 'page' : undefined}
                className="card-border block w-full p-3 text-left"
                style={{
                  borderColor: activo ? 'rgba(30,212,138,0.5)' : 'var(--color-border)',
                  background: activo ? 'rgba(30,212,138,0.1)' : 'var(--color-card)',
                }}
              >
                <div className="mb-1 flex items-center gap-2">
                  <span style={{ fontSize: 14 }} aria-hidden="true">
                    {ex.resuelto ? '✅' : activo ? '▶' : '○'}
                  </span>
                  <span
                    className="font-display text-sm font-semibold"
                    style={{ color: ex.resuelto ? 'var(--color-muted)' : 'var(--color-text)' }}
                  >
                    {ex.titulo}
                  </span>
                  {ex.resuelto && <span className="sr-only">(resuelto)</span>}
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-1">
                    <span className="rounded-full px-2 py-0.5 text-xs font-bold" style={{ background: `${dif.color}20`, color: dif.color }}>
                      {dif.etiqueta}
                    </span>
                    <span className="text-xs" style={{ color: 'var(--color-muted)' }}>
                      {TIPO[ex.tipo]}
                    </span>
                  </span>
                  <span className="font-mono text-xs" style={{ color: '#7af0b4' }}>
                    +{ex.puntos} XP
                  </span>
                </div>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
