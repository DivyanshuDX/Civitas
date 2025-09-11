import algosdk from "algosdk"

// Type definitions
export type AlgorandAccount = {
  address: string
  passphrase: string
  privateKey: string
}

// Connect to TestNet
export function getAlgodClient() {
  const algodToken = ""
  const algodServer = "https://testnet-api.algonode.cloud"
  const algodPort = 443
  return new algosdk.Algodv2(algodToken, algodServer, algodPort)
}

// Create a real Algorand account using the SDK
export async function createAlgorandAccount(): Promise<AlgorandAccount> {
  try {
    // Generate a new account using algosdk
    const account = algosdk.generateAccount()
    const address = account.addr

    // Convert the secret key to a mnemonic passphrase
    // Truncate to avoid database column length issues
    const passphrase = algosdk.secretKeyToMnemonic(account.sk).substring(0, 250)

    // Store the private key as a base64 string
    const privateKey = Array.from(account.sk)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")

    return {
      address,
      passphrase,
      privateKey,
    }
  } catch (error) {
    console.error("Error creating Algorand account:", error)

    // Return a mock account for testing
    return {
      address: "MOCK_ADDRESS_" + Math.random().toString(36).substring(2, 10),
      passphrase: "mock passphrase",
      privateKey: "mock private key",
    }
  }
}

// Check account balance
export async function getAccountBalance(address: string): Promise<number> {
  try {
    const client = getAlgodClient()
    const accountInfo = await client.accountInformation(address).do()

    // Fix the BigInt issue by explicitly converting to Number
    // Use String() to convert BigInt to string first, then parse to Number
    const amountInMicroAlgos = Number(String(accountInfo.amount))
    return amountInMicroAlgos / 1000000 // Convert microAlgos to Algos
  } catch (error) {
    console.error("Error getting Algorand account balance:", error)
    return 0
  }
}

// Get assets for an account using the indexer
export async function getAccountAssets(address: string): Promise<any[]> {
  try {
    // Initialize the indexer client
    const indexerClient = new algosdk.Indexer("", "https://testnet-idx.voi.nodely.dev", "")

    // Fetch account assets
    const accountAssets = await indexerClient.lookupAccountAssets(address).do()

    // Process and return the assets
    return accountAssets.assets || []
  } catch (error) {
    console.error("Error getting account assets:", error)
    return []
  }
}

// Create an Algorand token (ASA) for a verified document
export async function createDocumentToken(
  userAddress: string,
  privateKey: string,
  documentType: string,
  documentId: string,
): Promise<number> {
  try {
    // Convert the private key from hex string back to Uint8Array
    const privateKeyBytes = new Uint8Array(privateKey.match(/.{1,2}/g)?.map((byte) => Number.parseInt(byte, 16)) || [])

    // Connect to the Algorand node
    const algodClient = getAlgodClient()

    // Get suggested transaction parameters
    const suggestedParams = await algodClient.getTransactionParams().do()

    // Create asset name and unit name based on document type
    const assetName = `${documentType.toUpperCase()}_${documentId.substring(0, 8)}`
    const unitName = documentType.substring(0, 4).toUpperCase()

    // Create an asset creation transaction
    const txn = algosdk.makeAssetCreateTxnWithSuggestedParamsFromObject({
      from: userAddress,
      suggestedParams,
      defaultFrozen: false,
      unitName: unitName,
      assetName: assetName,
      manager: userAddress,
      reserve: userAddress,
      freeze: userAddress,
      clawback: userAddress,
      total: 1, // Only one token per document (NFT-like)
      decimals: 0, // No decimals for document tokens
    })

    // Sign the transaction
    const signedTxn = algosdk.signTransaction(txn, privateKeyBytes)

    // Submit the transaction to the network
    await algodClient.sendRawTransaction(signedTxn.blob).do()

    // Wait for confirmation
    const result = await algosdk.waitForConfirmation(algodClient, txn.txID().toString(), 3)

    // Return the asset ID
    return Number(String(result["asset-index"]))
  } catch (error) {
    console.error("Error creating document token:", error)
    throw new Error("Failed to create document token")
  }
}
