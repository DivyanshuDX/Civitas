import algosdk from 'algosdk'
import { ParsedConsentRequest } from '../types'

export function buildUaBoxName(address: string, docType: number): Uint8Array {
  const pk = algosdk.decodeAddress(address).publicKey
  const docTypeBytes = new Uint8Array(8)
  new DataView(docTypeBytes.buffer).setBigUint64(0, BigInt(docType))
  return new Uint8Array([...new TextEncoder().encode('ua_'), ...pk, ...docTypeBytes])
}

export function buildCrBoxName(requestId: number): Uint8Array {
  const idBytes = new Uint8Array(8)
  new DataView(idBytes.buffer).setBigUint64(0, BigInt(requestId))
  return new Uint8Array([...new TextEncoder().encode('cr_'), ...idBytes])
}

export function buildWlBoxName(address: string): Uint8Array {
  const pk = algosdk.decodeAddress(address).publicKey
  return new Uint8Array([...new TextEncoder().encode('wl_'), ...pk])
}

export function parseConsentRequest(data: Uint8Array, requestId: number): ParsedConsentRequest | null {
  try {
    const dv = new DataView(data.buffer, data.byteOffset, data.byteLength)
    const org = algosdk.encodeAddress(data.slice(0, 32))
    const user = algosdk.encodeAddress(data.slice(32, 64))
    const docType = data[64]
    // reason and idDetails are dynamic (arc4.String) — offsets stored as UInt16
    const reasonOffset = (data[65] << 8) | data[66]
    const idDetailsOffset = (data[67] << 8) | data[68]
    // requestedFields: UInt16 at byte 69
    const requestedFields = (data[69] << 8) | data[70]
    // sharedFields: UInt16 at byte 71
    const sharedFields = (data[71] << 8) | data[72]
    // expiry: UInt64 at byte 73
    const expiry = Number(dv.getBigUint64(73))
    // duration: UInt64 at byte 81
    const duration = Number(dv.getBigUint64(81))
    // createdAt: UInt64 at byte 89
    const createdAt = Number(dv.getBigUint64(89))
    // status: UInt8 at byte 97
    const status = data[97]
    const reasonLen = (data[reasonOffset] << 8) | data[reasonOffset + 1]
    const reason = new TextDecoder().decode(data.slice(reasonOffset + 2, reasonOffset + 2 + reasonLen))
    const idDetailsLen = (data[idDetailsOffset] << 8) | data[idDetailsOffset + 1]
    const idDetails = new TextDecoder().decode(data.slice(idDetailsOffset + 2, idDetailsOffset + 2 + idDetailsLen))
    const now = Math.floor(Date.now() / 1000)
    return { requestId, org, user, docType, reason, idDetails, requestedFields, sharedFields, expiry, duration, createdAt, status, isExpired: now > expiry }
  } catch {
    return null
  }
}

export function parseUserAsset(data: Uint8Array): { assetId: bigint; docType: number; createdAt: number } | null {
  try {
    const dv = new DataView(data.buffer, data.byteOffset, data.byteLength)
    const assetId = dv.getBigUint64(0)
    const docType = data[8]
    const createdAt = Number(dv.getBigUint64(9))
    return { assetId, docType, createdAt }
  } catch {
    return null
  }
}
