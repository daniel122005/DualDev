// PostgREST devuelve como máximo 1000 filas por petición y corta sin avisar.
// construir() debe devolver una consulta NUEVA y con orden estable (si no, las páginas se solapan).
const TAM_PAGINA = 1000

export async function todasLasFilas(construir) {
  const filas = []
  for (let desde = 0; ; desde += TAM_PAGINA) {
    const { data, error } = await construir().range(desde, desde + TAM_PAGINA - 1)
    if (error) throw error
    filas.push(...data)
    if (data.length < TAM_PAGINA) return filas
  }
}
