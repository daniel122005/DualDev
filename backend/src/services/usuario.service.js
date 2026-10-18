import * as usuarioRepository from '../repositories/usuario.repository.js'
import { HttpError } from '../utils/httpError.js'
import { resumenDeNivel, resumenSemanal } from './progreso.service.js'

export async function obtenerMiPerfil(idUsuario) {
  const [perfil, nivel, semanal] = await Promise.all([
    usuarioRepository.obtenerPerfil(idUsuario),
    resumenDeNivel(idUsuario),
    resumenSemanal(idUsuario),
  ])
  if (!perfil) throw new HttpError(404, 'Perfil no encontrado')

  const { progreso: _progreso, ...usuario } = perfil
  return { ...usuario, ...nivel, progreso_semanal: semanal }
}
