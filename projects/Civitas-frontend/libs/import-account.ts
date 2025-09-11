import { supabase } from "./supabase"

type AlgorandAccountImport = {
  address: string
  passphrase: string
  privateKey: string
}

export async function importAlgorandAccount(userId: string, accountData: AlgorandAccountImport): Promise<boolean> {
  try {
    // Check if user already has an account
    const { data: existingAccount, error: checkError } = await supabase
      .from("algorand_accounts")
      .select("*")
      .eq("user_id", userId)

    if (checkError) {
      console.error("Error checking existing account:", checkError)
      return false
    }

    // If account exists, update it
    if (existingAccount && existingAccount.length > 0) {
      const { error: updateError } = await supabase
        .from("algorand_accounts")
        .update({
          address: accountData.address,
          passphrase: accountData.passphrase,
          private_key: accountData.privateKey,
        })
        .eq("user_id", userId)

      if (updateError) {
        console.error("Error updating account:", updateError)
        return false
      }

      return true
    }

    // If no account exists, create a new one
    const { error: insertError } = await supabase.from("algorand_accounts").insert([
      {
        user_id: userId,
        address: accountData.address,
        passphrase: accountData.passphrase,
        private_key: accountData.privateKey,
      },
    ])

    if (insertError) {
      console.error("Error creating account:", insertError)
      return false
    }

    return true
  } catch (error) {
    console.error("Error importing account:", error)
    return false
  }
}
