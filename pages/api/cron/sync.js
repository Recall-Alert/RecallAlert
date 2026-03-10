/**
 * pages/api/cron/sync.js
 * Vercel Cron — runs every 6 hours (see vercel.json)
 * Also callable manually: POST /api/cron/sync with Authorization header
 */

import { syncAllRecalls, getRecentRecallIds } from '../../../lib/sync'
import { dispatchAlerts } from '../../../lib/alerts'

export default async function handler(req, res) {
  // Verify cron secret
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  console.log('🔄 Starting FDA recall sync...')
  const startTime = Date.now()

  try {
    // 1. Sync new recalls from FDA
    const syncResult = await syncAllRecalls()

    // 2. If new recalls found, dispatch email alerts
    let alertResult = { sent: 0, skipped: 0 }
    if (syncResult.totalNew > 0) {
      const recentIds = await getRecentRecallIds(360) // Last 6 hours
      alertResult = await dispatchAlerts(recentIds)
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(1)

    return res.status(200).json({
      ok: true,
      duration: `${duration}s`,
      sync: syncResult,
      alerts: alertResult,
    })
  } catch (err) {
    console.error('Sync failed:', err)
    return res.status(500).json({ ok: false, error: err.message })
  }
}
