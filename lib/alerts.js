/**
 * lib/alerts.js
 * Email Alert Dispatcher
 * ─────────────────────────────────────────────────────────
 * Matches new recalls to subscribers by category preference,
 * deduplicates against alert_log, and sends via Resend.
 */

import { Resend } from 'resend'
import { getServiceClient } from './supabase'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM   = process.env.ALERT_FROM_EMAIL || 'alerts@recallalert.com'
const SITE   = process.env.NEXT_PUBLIC_SITE_URL || 'https://recallalert.com'

// ── HTML email template ───────────────────────────────────
function buildEmail(recalls, subscriber) {
  const classColor = (c) => c === 'Class I' ? '#FF4444' : c === 'Class II' ? '#F97316' : '#3B82F6'
  const fmtDate = (s) => {
    if (!s) return '—'
    return new Date(`${s.slice(0,4)}-${s.slice(4,6)}-${s.slice(6,8)}`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const recallCards = recalls.map(r => `
    <div style="border-left:4px solid ${classColor(r.classification)};padding:16px 20px;margin-bottom:16px;background:#FAFBFF;border-radius:0 10px 10px 0;font-family:system-ui,sans-serif">
      <div style="font-size:10px;text-transform:uppercase;letter-spacing:0.1em;color:${classColor(r.classification)};font-weight:800;margin-bottom:8px">
        ${r.classification || 'Unknown Class'} · ${r.category?.toUpperCase()} · ${fmtDate(r.recall_initiation_date)}
      </div>
      <div style="font-weight:700;font-size:16px;color:#0A0F1E;margin-bottom:8px;line-height:1.3">
        ${r.recalling_firm || 'Unknown Firm'}
      </div>
      <div style="font-size:13px;color:#6B7A99;line-height:1.6;margin-bottom:12px">
        ${r.ai_summary || r.reason_for_recall?.slice(0, 220) || 'See full details for recall information.'}
      </div>
      ${r.product_description ? `<div style="font-size:12px;color:#8A9BB8;margin-bottom:12px;background:#F0F4FF;padding:8px 12px;border-radius:6px"><strong>Product:</strong> ${r.product_description.slice(0, 150)}${r.product_description.length > 150 ? '…' : ''}</div>` : ''}
      <a href="${SITE}/recalls/${r.slug}" style="display:inline-block;font-size:13px;color:#FF4444;text-decoration:none;font-weight:700;border:1px solid #FF444433;border-radius:7px;padding:6px 14px;background:#FFF0F0">
        View Full Recall →
      </a>
    </div>
  `).join('')

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F4F6FA;font-family:system-ui,-apple-system,sans-serif">
  <div style="max-width:600px;margin:0 auto;padding:24px 16px">

    <!-- Header -->
    <div style="background:#060D1F;padding:20px 24px;border-radius:14px;margin-bottom:24px;display:flex;align-items:center">
      <span style="font-size:22px;font-weight:900;color:#FF4444;letter-spacing:-0.02em">RecallAlert</span>
      <span style="font-size:11px;font-weight:700;color:rgba(255,255,255,0.3);margin-left:10px;text-transform:uppercase;letter-spacing:0.1em">FDA Recall Intelligence</span>
    </div>

    <!-- Title -->
    <h2 style="font-size:22px;font-weight:800;color:#0A0F1E;margin:0 0 6px">
      ⚠️ ${recalls.length} New Recall${recalls.length > 1 ? 's' : ''}
    </h2>
    <p style="font-size:14px;color:#8A9BB8;margin:0 0 24px;line-height:1.5">
      ${recalls.length} new FDA recall${recalls.length > 1 ? 's have' : ' has'} been issued since your last alert.
    </p>

    <!-- Recall cards -->
    ${recallCards}

    <!-- CTA -->
    <div style="text-align:center;margin:28px 0">
      <a href="${SITE}" style="display:inline-block;background:#FF4444;color:#fff;font-size:15px;font-weight:800;text-decoration:none;padding:14px 32px;border-radius:12px">
        Search All Recalls →
      </a>
    </div>

    <!-- Footer -->
    <div style="border-top:1px solid #E8ECF4;padding-top:18px;margin-top:12px">
      <p style="font-size:12px;color:#C5D0E0;line-height:1.7;margin:0">
        You're receiving this because you subscribed to ${subscriber.category === 'all' ? 'all' : subscriber.category} recall alerts on RecallAlert.
        <br>
        <a href="${SITE}/unsubscribe?token=${subscriber.token}" style="color:#FF4444;text-decoration:none">Unsubscribe</a>
        · <a href="${SITE}/preferences?token=${subscriber.token}" style="color:#8A9BB8;text-decoration:none">Manage Preferences</a>
        · Data from openFDA.gov · Not affiliated with FDA
      </p>
    </div>

  </div>
</body>
</html>`
}

// ── Main dispatch function ────────────────────────────────
export async function dispatchAlerts(newRecallIds) {
  if (!newRecallIds?.length) {
    console.log('No new recalls to alert on.')
    return { sent: 0, skipped: 0 }
  }

  const db = getServiceClient()
  let totalSent = 0
  let totalSkipped = 0

  // Fetch all confirmed subscribers
  const { data: subscribers, error: subErr } = await db
    .from('subscribers')
    .select('*')
    .eq('confirmed', true)

  if (subErr) throw subErr
  if (!subscribers?.length) {
    console.log('No confirmed subscribers.')
    return { sent: 0, skipped: 0 }
  }

  // Fetch all new recalls once
  const { data: allNewRecalls } = await db
    .from('recalls')
    .select('*')
    .in('id', newRecallIds)

  console.log(`\n📧 Dispatching to ${subscribers.length} subscribers...`)

  for (const sub of subscribers) {
    // Filter recalls by subscriber's category preference
    const relevant = sub.category === 'all'
      ? allNewRecalls
      : allNewRecalls.filter(r => r.category === sub.category)

    if (!relevant.length) { totalSkipped++; continue }

    // Check what we've already sent to this subscriber
    const { data: alreadySent } = await db
      .from('alert_log')
      .select('recall_id')
      .eq('subscriber_id', sub.id)
      .in('recall_id', relevant.map(r => r.id))

    const sentSet = new Set(alreadySent?.map(s => s.recall_id) || [])
    const unsent  = relevant.filter(r => !sentSet.has(r.id))

    if (!unsent.length) { totalSkipped++; continue }

    // Send the email
    try {
      await resend.emails.send({
        from:    FROM,
        to:      sub.email,
        subject: `⚠️ ${unsent.length} New FDA Recall${unsent.length > 1 ? 's' : ''} — RecallAlert`,
        html:    buildEmail(unsent, sub),
      })

      // Log which recalls were sent to prevent duplicates
      await db.from('alert_log').insert(
        unsent.map(r => ({ subscriber_id: sub.id, recall_id: r.id }))
      )

      // Update last_sent timestamp
      await db.from('subscribers')
        .update({ last_sent: new Date().toISOString() })
        .eq('id', sub.id)

      console.log(`  ✓ Sent ${unsent.length} alerts to ${sub.email}`)
      totalSent++
    } catch (err) {
      console.error(`  ✗ Failed to send to ${sub.email}:`, err.message)
    }

    // Small delay to respect Resend rate limits
    await new Promise(r => setTimeout(r, 50))
  }

  console.log(`\n✅ Alert dispatch complete. Sent: ${totalSent} | Skipped: ${totalSkipped}`)
  return { sent: totalSent, skipped: totalSkipped }
}

// ── Confirmation email ────────────────────────────────────
export async function sendConfirmationEmail(subscriber) {
  const confirmUrl = `${SITE}/api/confirm?token=${subscriber.token}`

  await resend.emails.send({
    from:    FROM,
    to:      subscriber.email,
    subject: 'Confirm your RecallAlert subscription',
    html: `<!DOCTYPE html><html><body style="font-family:system-ui;max-width:500px;margin:40px auto;padding:0 20px">
      <div style="background:#060D1F;padding:20px 24px;border-radius:14px;margin-bottom:24px">
        <span style="font-size:20px;font-weight:900;color:#FF4444">RecallAlert</span>
      </div>
      <h2 style="color:#0A0F1E">Confirm your email</h2>
      <p style="color:#6B7A99;line-height:1.6">Click the button below to confirm your FDA recall alert subscription. You'll start receiving alerts right away.</p>
      <a href="${confirmUrl}" style="display:inline-block;margin:20px 0;background:#FF4444;color:#fff;font-weight:800;text-decoration:none;padding:14px 28px;border-radius:12px;font-size:15px">
        Confirm Subscription →
      </a>
      <p style="font-size:12px;color:#C5D0E0">If you didn't sign up, you can ignore this email.</p>
    </body></html>`
  })
}
