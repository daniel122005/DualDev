import { useEffect, useId, useRef, type ReactNode } from 'react'

// Diálogo accesible con el lenguaje visual de las tarjetas (Esc o clic fuera para cerrar).
export default function Modal({ titulo, onCerrar, children }: { titulo: string; onCerrar: () => void; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null)
  const idTitulo = useId()

  useEffect(() => {
    const dialogo = ref.current
    if (dialogo && !dialogo.open) dialogo.showModal()
    return () => dialogo?.close()
  }, [])

  return (
    <dialog
      ref={ref}
      aria-labelledby={idTitulo}
      onCancel={(e) => {
        e.preventDefault()
        onCerrar()
      }}
      onClick={(e) => {
        if (e.target === ref.current) onCerrar()
      }}
      className="card-border m-auto w-[min(92vw,440px)] p-0 backdrop:bg-black/60"
      style={{ background: 'var(--color-surface)', color: 'var(--color-text)', borderColor: 'rgba(30,212,138,0.3)' }}
    >
      <div className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 id={idTitulo} className="font-display text-lg font-bold">
            {titulo}
          </h2>
          <button onClick={onCerrar} aria-label="Cerrar" className="rounded-lg px-2 py-1 text-lg" style={{ color: 'var(--color-muted)' }}>
            ✕
          </button>
        </div>
        {children}
      </div>
    </dialog>
  )
}
