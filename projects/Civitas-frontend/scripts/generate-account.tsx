import algosdk from "algosdk"
import fs from "fs"

// Function to wait for user input
function keypress() {
  return new Promise((resolve) => {
    process.stdin.once("data", () => {
      resolve()
    })
  })
}

async function createAccountAndExport() {
  // Create an account
  const generatedAccount = algosdk.generateAccount()
  const passphrase = algosdk.secretKeyToMnemonic(generatedAccount.sk)
  console.log(`My address: ${generatedAccount.addr}`)
  console.log(`My passphrase: ${passphrase}`)
  const dispenser_url = `https://dispenser.testnet.aws.algodev.network/?account=${generatedAccount.addr}`
  console.log(`Fund the wallet via Algorand Dispenser: ${dispenser_url}`)
  console.log("Press any key when the account is funded")
  await keypress()

  // Convert the private key to base64 string
  const privateKeyBase64 = Buffer.from(generatedAccount.sk).toString("base64")

  // Export the account details as JSON
  const accountData = {
    address: generatedAccount.addr,
    passphrase: passphrase,
    privateKey: privateKeyBase64,
  }
  fs.writeFileSync("account.json", JSON.stringify(accountData, null, 2))

  console.log("Account details exported to account.json")
  console.log("You can now import this account into the DeCoMan platform.")
  console.log("1. Log in to the admin dashboard")
  console.log("2. Click on 'Import Algorand Account'")
  console.log("3. Paste the contents of account.json")

  process.exit()
}

createAccountAndExport()
