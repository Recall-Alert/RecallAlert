/**
 * lib/sync.js
 * FDA Recall Sync Worker
 * ─────────────────────────────────────────────────────────
 * Pulls new recalls from openFDA, generates AI summaries,
 * and upserts into Supabase. Safe to re-run — idempotent.
 */

import Anthropic from '@anthropic-ai/sdk'
import { getServiceClient } from './supabase'

const ai = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const ENDPOINTS = [
  { id: 'food',   path: 'food/enforcement'   },
  { id: 'drug',   path: 'drug/enforcement'   },
  { id: 'device', path: 'device/enforcement' },
]

const LIMIT = 100

// ── Generate plain-English AI summary ─────────────────────
async function generateSummary(recall) {
  try {
    const msg = await ai.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 180,
      messages: [{
        role: 'user',
        content: `Write a 2-sentence plain-English summary of this FDA recall for a general consumer audience. Be clear about what the risk is and who is affected. Do not start with "This recall".

Firm: ${recall.recalling_firm || 'Unknown'}
Product: ${recall.product_description?.slice(0, 300) || 'Unknown'}
Reason: ${recall.reason_for_recall?.slice(0, 400) || 'Unknown'}
Class: ${recall.classification || 'Unknown'}`
      }]
    })
    return msg.content[0]?.text?.trim() || null
  } catch (err) {
    console.warn('AI summary failed, skipping:', err.message)
    return null
  }
}

// ── Build URL slug from recall number ─────────────────────
function toSlug(recallNumber) {
  return recallNumber?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || null
}

// ── Fetch one page from openFDA ───────────────────────────
async function fetchPage(endpoint, skip) {
  const url = `https://api.fda.gov/${endpoint}.json?limit=${LIMIT}&skip=${skip}&sort=recall_initiation_date:desc`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`FDA API error: ${res.status}`)
  return res.json()
}

// ── Sync a single category ────────────────────────────────
async function syncCategory(ep, db) {
  let skip = 0
  let newCount = 0
  let hitExisting = false

  console.log(`\n📦 Syncing ${ep.id}...`)

  while (!hitExisting) {
    let data
    try {
      data = await fetchPage(ep.path, skip)
    } catch (err) {
      console.error(`  ✗ Fetch failed at skip=${skip}:`, err.message)
      break
    }

    const records = data.results || []
    if (!records.length) break

    for (const r of records) {
      if (!r.recall_number) continue

      // Check if we already have this recall
      const { data: existing } = await db
        .from('recalls')
        .select('id')
        .eq('recall_number', r.recall_number)
        .maybeSingle()

      if (existing) {
        // Hit a record we already have — stop crawling this category
        hitExisting = true
        break
      }

      // Generate AI summary
      const ai_summary = await generateSummary(r)

      // Insert new recall
      const { error } = await db.from('recalls').insert({
        recall_number:          r.recall_number,
        slug:                   toSlug(r.recall_number),
        category:               ep.id,
        recalling_firm:         r.recalling_firm,
        classification:         r.classification,
        reason_for_recall:      r.reason_for_recall,
        product_description:    r.product_description,
        code_info:              r.code_info,
        distribution_pattern:   r.distribution_pattern,
        product_quantity:       r.product_quantity,
        status:                 r.status,
        voluntary_mandated:     r.voluntary_mandated,
        city:                   r.city,
        state:                  r.state,
        country:                r.country,
        recall_initiation_date: r.recall_initiation_date,
        report_date:            r.report_date,
        termination_date:       r.termination_date || null,
        ai_summary,
        synced_at:              new Date().toISOString(),
      })

      if (error) {
        console.warn(`  ⚠ Insert failed for ${r.recall_number}:`, error.message)
      } else {
        newCount++
        console.log(`  ✓ [${r.classification || '?'}] ${r.recalling_firm} — ${r.recall_number}`)
      }
    }

    skip += LIMIT
    const totalAvailable = data.meta?.results?.total || 0
    if (skip >= totalAvailable) break

    // Small delay to be polite to the API
    await new Promise(r => setTimeout(r, 200))
  }

  console.log(`  → ${newCount} new recalls added for ${ep.id}`)
  return newCount
}

// ── Main export ───────────────────────────────────────────
export async function syncAllRecalls() {
  const db = getServiceClient()
  const results = {}
  let totalNew = 0

  for (const ep of ENDPOINTS) {
    const count = await syncCategory(ep, db)
    results[ep.id] = count
    totalNew += count
  }

  console.log(`\n✅ Sync complete. Total new: ${totalNew}`)
  return { totalNew, results }
}

// ── Get IDs of recalls added in last N minutes ────────────
export async function getRecentRecallIds(minutes = 360) {
  const db = getServiceClient()
  const since = new Date(Date.now() - minutes * 60 * 1000).toISOString()

  const { data } = await db
    .from('recalls')
    .select('id')
    .gte('synced_at', since)

  return data?.map(r => r.id) || []
}
