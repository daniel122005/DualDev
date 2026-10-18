import * as dashboardService from '../services/dashboard.service.js'

export async function dashboard(req, res, next) {
  try {
    res.json(await dashboardService.obtenerDashboard(req.user.id))
  } catch (err) {
    next(err)
  }
}
