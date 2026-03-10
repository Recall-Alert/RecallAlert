/**
 * pages/recalls/[slug].js
 * Auto-generated SEO page per recall (Next.js ISR)
 * URL: /recalls/f-2024-r-012345
 */

import Head from 'next/head'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://recallalert.com'

const CLASS_COLOR = {
  'Class I':   { bg: '#FFF0F0', border: '#FF4444', text: '#CC0000' },
  'Class II':  { bg: '#FFF7ED', border: '#F97316', text: '#C2410C' },
  'Class III': { bg: '#EFF6FF', border: '#3B82F6', text: '#1D4ED8' },
}

function fmtDate(s) {
  if (!s) return '—'
  return new Date(`${s.slice(0,4)}-${s.slice(4,6)}-${s.slice(6,8)}`).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

export async function getStaticPaths() {
  // Pre-build the 2000 most recent recalls at deploy time
  const { data } = await supabase
    .from('recalls')
    .select('slug')
    .not('slug', 'is', null)
    .order('recall_initiation_date', { ascending: false })
    .limit(2000)

  return {
    paths: (data || []).map(r => ({ params: { slug: r.slug } })),
    fallback: 'blocking', // Generate remaining pages on-demand
  }
}

export async function getStaticProps({ params }) {
  const { data: recall } = await supabase
    .from('recalls')
    .select('*')
    .eq('slug', params.slug)
    .single()

  if (!recall) return { notFound: true }

  // Fetch related recalls (same category, different recall)
  const { data: related } = await supabase
    .from('recalls')
    .select('id, slug, recalling_firm, classification, recall_initiation_date, category, ai_summary')
    .eq('category', recall.category)
    .neq('id', recall.id)
    .order('recall_initiation_date', { ascending: false })
    .limit(4)

  return {
    props: { recall, related: related || [] },
    revalidate: 86400, // Re-generate once per day
  }
}

export default function RecallPage({ recall, related }) {
  const cc = CLASS_COLOR[recall.classification] || { bg: '#F5F5F5', border: '#ccc', text: '#666' }
  const title = `${recall.recalling_firm} FDA Recall (${recall.recall_number})`
  const description = recall.ai_summary || recall.reason_for_recall?.slice(0, 160) || ''
  const canonicalUrl = `${SITE}/recalls/${recall.slug}`

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: title,
    description,
    datePublished: recall.recall_initiation_date
      ? `${recall.recall_initiation_date.slice(0,4)}-${recall.recall_initiation_date.slice(4,6)}-${recall.recall_initiation_date.slice(6,8)}`
      : undefined,
    url: canonicalUrl,
    publisher: {
      '@type': 'Organization',
      name: 'RecallAlert',
      url: SITE,
    },
    about: {
      '@type': 'Product',
      name: recall.recalling_firm,
      description: recall.product_description,
    },
  }

  const fields = [
    { label: 'Recalling Firm',          value: recall.recalling_firm },
    { label: 'Classification',          value: recall.classification },
    { label: 'Status',                  value: recall.status },
    { label: 'Voluntary / Mandated',    value: recall.voluntary_mandated },
    { label: 'Product Description',     value: recall.product_description },
    { label: 'Reason for Recall',       value: recall.reason_for_recall },
    { label: 'Code Info / Lot Numbers', value: recall.code_info },
    { label: 'Quantity Recalled',       value: recall.product_quantity },
    { label: 'Distribution Pattern',    value: recall.distribution_pattern },
    { label: 'Location',                value: [recall.city, recall.state, recall.country].filter(Boolean).join(', ') },
    { label: 'Recall Initiation Date',  value: fmtDate(recall.recall_initiation_date) },
    { label: 'Report Date',             value: fmtDate(recall.report_date) },
    { label: 'Termination Date',        value: recall.termination_date ? fmtDate(recall.termination_date) : '🔴 Ongoing' },
  ].filter(f => f.value)

  return (
    <>
      <Head>
        <title>{title} | RecallAlert</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content="article" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </Head>

      <div style={{ minHeight: '100vh', background: '#F4F6FA', fontFamily: 'system-ui, sans-serif' }}>
        {/* Nav */}
        <nav style={{ background: '#060D1F', padding: '0 24px', height: 56, display: 'flex', alignItems: 'center' }}>
          <Link href="/" style={{ fontWeight: 900, fontSize: 20, color: '#FF4444', textDecoration: 'none', letterSpacing: '-0.01em' }}>
            RecallAlert
          </Link>
          <Link href="/" style={{ marginLeft: 20, fontSize: 13, color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>
            ← Back to Search
          </Link>
        </nav>

        <div style={{ maxWidth: 760, margin: '0 auto', padding: '36px 20px 60px' }}>
          {/* Breadcrumb */}
          <div style={{ fontSize: 13, color: '#8A9BB8', marginBottom: 20 }}>
            <Link href="/" style={{ color: '#8A9BB8', textDecoration: 'none' }}>Home</Link>
            {' / '}
            <Link href={`/category/${recall.category}`} style={{ color: '#8A9BB8', textDecoration: 'none', textTransform: 'capitalize' }}>{recall.category} Recalls</Link>
            {' / '}
            <span>{recall.recall_number}</span>
          </div>

          {/* Header */}
          <div style={{ background: '#fff', border: '1px solid #E8ECF4', borderRadius: 16, padding: '28px 32px', marginBottom: 20 }}>
            <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', background: cc.bg, color: cc.text, border: `1px solid ${cc.border}44`, borderRadius: 6, padding: '3px 12px' }}>
                {recall.classification}
              </span>
              <span style={{ fontSize: 11, color: '#8A9BB8', background: '#F4F6FA', borderRadius: 6, padding: '3px 12px', fontWeight: 600 }}>
                {recall.category?.toUpperCase()} RECALL
              </span>
              <span style={{ fontSize: 11, color: '#8A9BB8', fontFamily: 'monospace' }}>{recall.recall_number}</span>
            </div>

            <h1 style={{ fontSize: 26, fontWeight: 800, color: '#0A0F1E', lineHeight: 1.3, marginBottom: 16 }}>
              {recall.recalling_firm} FDA Recall
            </h1>

            {recall.ai_summary && (
              <div style={{ background: '#F8FAFF', border: '1px solid #E0E8FF', borderRadius: 10, padding: '14px 18px', fontSize: 15, color: '#334155', lineHeight: 1.7 }}>
                <strong style={{ color: '#1D4ED8', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>📋 Summary</strong>
                {recall.ai_summary}
              </div>
            )}
          </div>

          {/* Details */}
          <div style={{ background: '#fff', border: '1px solid #E8ECF4', borderRadius: 16, padding: '24px 32px', marginBottom: 20 }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: '#0A0F1E', marginBottom: 20 }}>Full Recall Details</h2>
            <div style={{ display: 'grid', gap: 18 }}>
              {fields.map(f => (
                <div key={f.label} style={{ borderBottom: '1px solid #F4F6FA', paddingBottom: 16 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.09em', color: '#C5D0E0', marginBottom: 6 }}>{f.label}</div>
                  <div style={{ fontSize: 14, color: '#0A0F1E', lineHeight: 1.65 }}>{f.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Related */}
          {related.length > 0 && (
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 800, color: '#0A0F1E', marginBottom: 14 }}>
                Related {recall.category} Recalls
              </h2>
              <div style={{ display: 'grid', gap: 10 }}>
                {related.map(r => {
                  const rc = CLASS_COLOR[r.classification] || {}
                  return (
                    <Link key={r.id} href={`/recalls/${r.slug}`} style={{ textDecoration: 'none' }}>
                      <div style={{ background: '#fff', border: '1px solid #E8ECF4', borderLeft: `3px solid ${rc.border || '#ccc'}`, borderRadius: 10, padding: '14px 18px', transition: 'all 0.15s' }}>
                        <div style={{ fontWeight: 700, fontSize: 14, color: '#0A0F1E', marginBottom: 4 }}>{r.recalling_firm}</div>
                        <div style={{ fontSize: 12, color: '#8A9BB8', lineHeight: 1.5 }}>{r.ai_summary?.slice(0, 100) || ''}…</div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
