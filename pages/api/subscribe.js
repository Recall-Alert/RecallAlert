/**
 * pages/api/subscribe.js
 * Handles new email subscriptions
 */

import { getServiceClient } from '../../lib/supabase'
import { sendConfirmationEmail } from '../../lib/alerts'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { email, category = 'all', frequency = 'weekly' } = req.body

  // Validate
  if (!email || !email.includes('@') || email.length > 255) {
    return res.status(400).json({ error: 'Invalid email address' })
  }
  if (!['all', 'food', 'drug', 'device'].includes(category)) {
    return res.status(400).json({ error: 'Invalid category' })
  }
  if (!['instant', 'daily', 'weekly'].includes(frequency)) {
    return res.status(400).json({ error: 'Invalid frequency' })
  }

  const db = getServiceClient()

  try {
    // Upsert subscriber (handles re-subscriptions gracefully)
    const { data: subscriber, error } = await db
      .from('subscribers')
      .upsert({ email: email.toLowerCase().trim(), category, frequency }, { onConflict: 'email' })
      .select()
      .single()

    if (error) throw error

    // Send confirmation email
    await sendConfirmationEmail(subscriber)

    return res.status(200).json({ ok: true, message: 'Check your email to confirm your subscription.' })
  } catch (err) {
    console.error('Subscribe error:', err)
    return res.status(500).json({ error: 'Failed to subscribe. Please try again.' })
  }
}
