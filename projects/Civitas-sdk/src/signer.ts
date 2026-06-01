import type { TransactionSigner } from './types'
import { VenomSigningError } from './errors'

/**
 * Creates a TransactionSigner from an Algorand mnemonic.
 * Requires `algosdk` as a peer dependency.
 */
export function mnemonicSigner(mnemonic: string): TransactionSigner {
  return async (unsignedTxns: Uint8Array[]): Promise<Uint8Array[]> => {
    let algosdk: typeof import('algosdk')
    try {
      algosdk = await import('algosdk')
    } catch {
      throw new VenomSigningError(
        'algosdk is required for mnemonicSigner. Install it with: npm install algosdk',
      )
    }

    const account = algosdk.mnemonicToSecretKey(mnemonic)
    const signed: Uint8Array[] = []

    for (const txnBytes of unsignedTxns) {
      const txn = algosdk.decodeUnsignedTransaction(txnBytes)
      const signedTxn = txn.signTxn(account.sk)
      signed.push(signedTxn)
    }

    return signed
  }
}

/**
 * Sentinel signer that throws when called.
 * Used as the default when no signer is configured.
 */
export const NO_SIGNER: TransactionSigner = async () => {
  throw new VenomSigningError(
    'No signer configured. Pass a signer to VenomClient or use mnemonicSigner().',
  )
}
