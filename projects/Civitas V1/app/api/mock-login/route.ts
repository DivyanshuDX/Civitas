import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { v4 as uuidv4 } from "uuid"

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    // Check if user exists
    const { data: existingUser, error: checkError } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single()

    if (checkError && checkError.code !== "PGRST116") {
      console.error("Error checking for existing user:", checkError)
    }

    let userId

    // If user doesn't exist, create one
    if (!existingUser) {
      userId = uuidv4()

      // Create user
      const { error: createUserError } = await supabase.from("users").insert({
        id: userId,
        email,
        password_hash: Buffer.from(`${password}_hashed`).toString("base64"),
        user_type: "user",
      })

      if (createUserError) {
        console.error("Error creating user:", createUserError)
        return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
      }

      // Create Algorand account
      const address = `ALGO${Math.random().toString(36).substring(2, 15)}`
      const passphrase = "test mnemonic for demo purposes only"
      const privateKey = Buffer.from("demo_private_key").toString("base64")

      const { error: createAccountError } = await supabase.from("algorand_accounts").insert({
        user_id: userId,
        address,
        passphrase,
        private_key: privateKey,
      })

      if (createAccountError) {
        console.error("Error creating Algorand account:", createAccountError)
        return NextResponse.json({ error: "Failed to create Algorand account" }, { status: 500 })
      }
    } else {
      userId = existingUser.id
    }

    // Get user data
    const { data: userData, error: userError } = await supabase.from("users").select("*").eq("id", userId).single()

    if (userError) {
      console.error("Error getting user data:", userError)
      return NextResponse.json({ error: "Failed to retrieve user data" }, { status: 500 })
    }

    // Get Algorand account
    const { data: accountData, error: accountError } = await supabase
      .from("algorand_accounts")
      .select("*")
      .eq("user_id", userId)
      .single()

    if (accountError) {
      console.error("Error getting Algorand account:", accountError)
      return NextResponse.json({ error: "Failed to retrieve Algorand account" }, { status: 500 })
    }

    return NextResponse.json({
      user: userData,
      algorandAccount: {
        address: accountData.address,
        passphrase: accountData.passphrase,
        privateKey: accountData.private_key,
      },
    })
  } catch (error) {
    console.error("Mock login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
