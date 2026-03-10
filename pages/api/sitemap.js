/**
 * pages/api/sitemap.js
 * Generates dynamic XML sitemap for all recall pages
 * Add to Google Search Console for fast indexing
 *
 * Usage: https://recallalert.com/api/sitemap
 */

import { supabase } from '../../lib/supabase'

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://recallalert.com'

export default async function handler(req, res) {
  // Fetch all recall slugs
  const { data } = await supabase
    .from('recalls')
    .select('slug, recall_initiation_date, synced_at')
    .not('slug', 'is', null)
    .order('recall_initiation_date', { ascending: false })

  const staticPages = ['', '/about', '/category/food', '/category/drug', '/category/device']

  const staticUrls = staticPages.map(path => `
  <url>
    <loc>${SITE}${path}</loc>
    <changefreq>daily</changefreq>
    <priority>${path === '' ? '1.0' : '0.7'}</priority>
  </url>`).join('')

  const recallUrls = (data || []).map(r => {
    const date = r.recall_initiation_date
      ? `${r.recall_initiation_date.slice(0,4)}-${r.recall_initiation_date.slice(4,6)}-${r.recall_initiation_date.slice(6,8)}`
      : new Date().toISOString().slice(0, 10)
    return `
  <url>
    <loc>${SITE}/recalls/${r.slug}</loc>
    <lastmod>${date}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`
  }).join('')

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticUrls}
${recallUrls}
</urlset>`

  res.setHeader('Content-Type', 'application/xml')
  res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600')
  res.status(200).send(sitemap)
}
