import { Env } from '../types'
import { getSupabase } from '../db/supabase'

const DOC_TYPES = ['Aadhaar', 'PAN', 'Voter ID']
const FROM = 'Civitas <noreply@dcivitas.online>'

async function sendEmail(env: Env, to: string, subject: string, html: string): Promise<boolean> {
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({ from: FROM, to: [to], subject, html }),
    })
    return res.ok
  } catch {
    return false
  }
}

function wrap(content: string): string {
  return `
    <div style="font-family: -apple-system, sans-serif; max-width: 520px; margin: 0 auto; padding: 40px 20px;">
      <h2 style="color: #1925aa; margin-bottom: 4px; font-size: 20px;">Civitas</h2>
      <p style="color: #ccc; font-size: 12px; margin-bottom: 24px; border-bottom: 1px solid #eee; padding-bottom: 16px;">Consent Management on Algorand</p>
      ${content}
      <p style="color: #bbb; font-size: 11px; margin-top: 32px; border-top: 1px solid #eee; padding-top: 16px;">
        This is an automated notification from Civitas. Do not reply to this email.
      </p>
    </div>
  `
}

/**
 * Notify user that an org has requested consent for their document.
 * Looks up user email from wallet_emails table.
 */
export async function notifyUserConsentRequested(
  env: Env,
  userAddress: string,
  orgName: string,
  orgAddress: string,
  docType: number,
  reason: string,
  durationHours: number,
): Promise<boolean> {
  const supabase = getSupabase(env)
  const { data } = await supabase
    .from('wallet_emails')
    .select('email')
    .eq('wallet_address', userAddress)
    .eq('is_verified', true)
    .single()

  if (!data?.email) return false

  const docName = DOC_TYPES[docType] ?? 'Document'
  const shortAddr = `${orgAddress.slice(0, 8)}...${orgAddress.slice(-4)}`

  const html = wrap(`
    <div style="background: #f8f8f8; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
      <p style="color: #333; font-size: 15px; font-weight: 600; margin-bottom: 12px;">New Consent Request</p>
      <p style="color: #555; font-size: 14px; line-height: 1.6; margin-bottom: 16px;">
        An organisation has requested access to your <strong>${docName}</strong>.
      </p>
      <table style="width: 100%; font-size: 13px; color: #555;">
        <tr>
          <td style="padding: 6px 0; color: #999;">Organisation</td>
          <td style="padding: 6px 0; font-weight: 500;">${orgName}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #999;">Wallet</td>
          <td style="padding: 6px 0; font-family: monospace; font-size: 12px;">${shortAddr}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #999;">Document</td>
          <td style="padding: 6px 0; font-weight: 500;">${docName}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #999;">Reason</td>
          <td style="padding: 6px 0;">${reason}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #999;">Duration</td>
          <td style="padding: 6px 0;">${durationHours} hour${durationHours !== 1 ? 's' : ''}</td>
        </tr>
      </table>
    </div>
    <p style="color: #555; font-size: 14px; line-height: 1.6;">
      Log in to <strong>Civitas</strong> to review and approve or reject this request.
    </p>
  `)

  return sendEmail(env, data.email, `Consent Requested — ${docName}`, html)
}

/**
 * Notify org that a user has approved or rejected their consent request.
 * Looks up org email from tenants table by algorand address.
 */
export async function notifyOrgConsentResponse(
  env: Env,
  orgAddress: string,
  userAddress: string,
  docType: number,
  requestId: number,
  action: 'approved' | 'rejected',
): Promise<boolean> {
  const supabase = getSupabase(env)

  // Try wallet_emails first (verified linked email), then fall back to tenants
  const { data: walletEmail } = await supabase
    .from('wallet_emails')
    .select('email')
    .eq('wallet_address', orgAddress)
    .eq('is_verified', true)
    .single()

  const { data: tenant } = await supabase
    .from('tenants')
    .select('email, name')
    .eq('algorand_address', orgAddress)
    .single()

  const email = walletEmail?.email ?? tenant?.email
  if (!email) return false

  const orgName = tenant?.name ?? 'Organisation'
  const docName = DOC_TYPES[docType] ?? 'Document'
  const shortUser = `${userAddress.slice(0, 8)}...${userAddress.slice(-4)}`
  const isApproved = action === 'approved'
  const statusColor = isApproved ? '#16a34a' : '#dc2626'
  const statusLabel = isApproved ? 'Approved' : 'Rejected'

  const html = wrap(`
    <div style="background: #f8f8f8; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
      <p style="color: #333; font-size: 15px; font-weight: 600; margin-bottom: 12px;">Consent ${statusLabel}</p>
      <div style="display: inline-block; background: ${statusColor}15; color: ${statusColor}; font-size: 13px; font-weight: 600; padding: 4px 12px; border-radius: 6px; margin-bottom: 16px;">
        ${statusLabel.toUpperCase()}
      </div>
      <p style="color: #555; font-size: 14px; line-height: 1.6; margin-bottom: 16px;">
        A user has <strong>${action}</strong> your consent request for their <strong>${docName}</strong>.
      </p>
      <table style="width: 100%; font-size: 13px; color: #555;">
        <tr>
          <td style="padding: 6px 0; color: #999;">Request ID</td>
          <td style="padding: 6px 0; font-weight: 500;">#${requestId}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #999;">User Wallet</td>
          <td style="padding: 6px 0; font-family: monospace; font-size: 12px;">${shortUser}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #999;">Document</td>
          <td style="padding: 6px 0; font-weight: 500;">${docName}</td>
        </tr>
      </table>
    </div>
    ${isApproved
      ? '<p style="color: #555; font-size: 14px; line-height: 1.6;">Log in to <strong>Civitas</strong> to view the shared document details.</p>'
      : '<p style="color: #555; font-size: 14px; line-height: 1.6;">The user has declined to share their document at this time.</p>'
    }
  `)

  return sendEmail(env, email, `Consent ${statusLabel} — ${docName} #${requestId}`, html)
}
