/**
 * pages/api/search.js
 * Search recalls from Supabase (used by frontend after DB is populated)
 * Falls back to live openFDA query if DB is empty
 */

import { supabase } from '../../lib/supabase'

export default async function handler(req, res) {
  const { q = '', category = 'food', classification, page = 0, limit = 20 } = req.query
  const skip = parseInt(page) * parseInt(limit)

  let query = supabase
    .from('recalls')
    .select('*', { count: 'exact' })
    .eq('category', category)
    .order('recall_initiation_date', { ascending: false })
    .range(skip, skip + parseInt(limit) - 1)

  if (q.trim()) {
    query = query.textSearch(
      'fts', // requires a generated column — see schema
      q.trim(),
      { config: 'english', type: 'websearch' }
    )
  }

  if (classification && classification !== 'all') {
    query = query.eq('classification', classification)
  }

  const { data, count, error } = await query

  if (error) return res.status(500).json({ error: error.message })

  return res.status(200).json({
    results: data || [],
    total: count || 0,
    page: parseInt(page),
  })
}
