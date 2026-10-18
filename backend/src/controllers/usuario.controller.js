import * as usuarioService from '../services/usuario.service.js'

export async function me(req, res, next) {
  try {
    res.json(await usuarioService.obtenerMiPerfil(req.user.id))
  } catch (err) {
    next(err)
  }
}
