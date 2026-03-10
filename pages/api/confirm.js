/**
 * pages/api/confirm.js
 * Confirms subscriber email via token link
 */

import { getServiceClient } from '../../lib/supabase'

export default async function handler(req, res) {
  const { token } = req.query
  if (!token) return res.redirect('/confirm?status=invalid')

  const db = getServiceClient()

  const { data, error } = await db
    .from('subscribers')
    .update({ confirmed: true })
    .eq('token', token)
    .select()
    .single()

  if (error || !data) return res.redirect('/confirm?status=invalid')

  return res.redirect('/confirm?status=success')
}
