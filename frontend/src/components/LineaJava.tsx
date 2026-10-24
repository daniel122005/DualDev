import type { Ficha, TipoFicha } from '@/utils/resaltadoJava'

// Colores de la paleta verde del proyecto (sin azules ni morados). Sin negrita: en el editor el texto
// resaltado debe calzar carácter por carácter con el textarea que va encima.
const ESTILO: Record<TipoFicha, { color?: string; fontStyle?: string }> = {
  clave: { color: '#1ed48a' },
  tipo: { color: '#7af0b4' },
  texto: { color: '#fdba74' },
  numero: { color: '#fbbf24' },
  comentario: { color: '#5f8f78' },
  clase: { color: '#b4e9cf' },
  normal: {},
}

export default function LineaJava({ fichas }: { fichas: Ficha[] }) {
  if (!fichas.length) return ' '
  return (
    <>
      {fichas.map((f, i) =>
        f.tipo === 'normal' ? (
          f.texto
        ) : (
          <span key={i} style={ESTILO[f.tipo]}>
            {f.texto}
          </span>
        ),
      )}
    </>
  )
}
