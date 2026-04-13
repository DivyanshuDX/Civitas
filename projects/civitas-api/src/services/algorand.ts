import { AlgorandClient } from '@algorandfoundation/algokit-utils'
import { OrgConsentClient } from '../contracts/OrgConsent'
import { UserIdentityClient } from '../contracts/UserIdentity'
import { DxClient } from '../contracts/Dx'
import { Env } from '../types'

export function getAlgorandClient(env: Env): AlgorandClient {
  return AlgorandClient.fromConfig({
    algodConfig: {
      server: env.ALGOD_SERVER,
      port: env.ALGOD_PORT,
      token: env.ALGOD_TOKEN,
    },
  })
}

export function getOrgConsentClient(env: Env, algorand: AlgorandClient, sender?: string) {
  return new OrgConsentClient({
    appId: BigInt(env.ORG_CONSENT_APP_ID),
    algorand,
    defaultSender: sender,
  })
}

export function getUserIdentityClient(env: Env, algorand: AlgorandClient, sender?: string) {
  return new UserIdentityClient({
    appId: BigInt(env.USER_IDENTITY_APP_ID),
    algorand,
    defaultSender: sender,
  })
}

export function getDxClient(env: Env, algorand: AlgorandClient, sender?: string) {
  return new DxClient({
    appId: BigInt(env.DX_APP_ID),
    algorand,
    defaultSender: sender,
  })
}
