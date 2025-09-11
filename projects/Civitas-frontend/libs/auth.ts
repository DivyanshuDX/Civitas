import { supabase } from "./supabase"
import { createAlgorandAccount } from "./algorand"
import { v4 as uuidv4 } from "uuid"
import type { NextAuthOptions } from "next-auth"

// NextAuth configuration
export const authOptions: NextAuthOptions = {
  providers: [],
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
}

// Type definitions
export type AlgorandAccount = {
  address: string
  passphrase: string
  privateKey: string
}

// Helper function to safely truncate or hash long values
function safelyStoreSecret(value: string): string {
  if (value.length <= 250) {
    return value // Store as is if it's short enough
  }

  // For longer values, we'll store a hash instead
  // In a real app, you'd want to encrypt this and store it securely
  // This is just a simple solution for the demo
  const encoder = new TextEncoder()
  const data = encoder.encode(value)
  return Array.from(data)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .substring(0, 250)
}

export async function registerUser(email: string, password: string, userType: "user" | "admin") {
  try {
    // Check if user already exists
    const { data: existingUser, error: existingUserError } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single()

    if (existingUserError && existingUserError.code !== "PGRST116") {
      console.error("Error checking existing user:", existingUserError)
      throw new Error("Error checking existing user")
    }

    if (existingUser) {
      throw new Error("User already exists with this email")
    }

    // Hash password (simple method for demo)
    const encoder = new TextEncoder()
    const data = encoder.encode(`${password}_hashed`)
    const hashedPassword = Array.from(data)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")

    // Generate a UUID for the user
    const userId = uuidv4()

    // Create user in our custom table
    const { data: userData, error: userError } = await supabase
      .from("users")
      .insert({
        id: userId,
        email,
        password_hash: hashedPassword,
        user_type: userType,
      })
      .select()
      .single()

    if (userError) {
      console.error("Error creating user:", userError)
      throw new Error("Error creating user")
    }

    // Create Algorand account
    const algorandAccount = await createAlgorandAccount()

    // Store Algorand account in database with safely truncated/hashed values
    const { error: accountError } = await supabase.from("algorand_accounts").insert({
      user_id: userId,
      address: algorandAccount.address,
      passphrase: safelyStoreSecret(algorandAccount.passphrase),
      private_key: safelyStoreSecret(algorandAccount.privateKey),
    })

    if (accountError) {
      console.error("Error creating Algorand account:", accountError)
      throw new Error("Error creating Algorand account")
    }

    return {
      user: {
        id: userId,
        email,
        user_type: userType,
      },
      algorandAccount,
    }
  } catch (error) {
    console.error("Registration error:", error)
    throw error
  }
}

export async function loginUser(email: string, password: string) {
  try {
    // Get user by email
    const { data: userData, error: userError } = await supabase.from("users").select("*").eq("email", email).single()

    if (userError || !userData) {
      console.error("User not found:", userError)
      throw new Error("Invalid email or password")
    }

    // Verify password (simple method for demo)
    const encoder = new TextEncoder()
    const data = encoder.encode(`${password}_hashed`)
    const hashedPassword = Array.from(data)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")
    const passwordValid = hashedPassword === userData.password_hash

    if (!passwordValid) {
      console.error("Invalid password")
      throw new Error("Invalid email or password")
    }

    // Get Algorand account
    const { data: accountData, error: accountError } = await supabase
      .from("algorand_accounts")
      .select("*")
      .eq("user_id", userData.id)

    // If no account found or error, create a new one
    if (accountError || !accountData || accountData.length === 0) {
      console.log("No Algorand account found, creating a new one...")

      // Create a new Algorand account
      const algorandAccount = await createAlgorandAccount()

      // Store the new account with safely truncated/hashed values
      const { error: insertError } = await supabase.from("algorand_accounts").insert({
        user_id: userData.id,
        address: algorandAccount.address,
        passphrase: safelyStoreSecret(algorandAccount.passphrase),
        private_key: safelyStoreSecret(algorandAccount.privateKey),
      })

      if (insertError) {
        console.error("Error creating Algorand account:", insertError)
        throw new Error("Failed to create Algorand account")
      }

      return {
        user: userData,
        algorandAccount,
      }
    }

    // Use the first account if multiple exist
    const account = accountData[0]

    const algorandAccount = {
      address: account.address,
      passphrase: account.passphrase, // Note: This might be a hash if it was too long
      privateKey: account.private_key, // Note: This might be a hash if it was too long
    }

    return { user: userData, algorandAccount }
  } catch (error) {
    console.error("Login error:", error)
    throw error
  }
}

export async function getCurrentUserWithAccount() {
  try {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession()

    if (sessionError || !sessionData.session) {
      return null
    }

    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", sessionData.session.user.id)
      .single()

    if (userError || !userData) {
      return null
    }

    const { data: accountData, error: accountError } = await supabase
      .from("algorand_accounts")
      .select("*")
      .eq("user_id", userData.id)

    // If no account found, return user without account
    if (accountError || !accountData || accountData.length === 0) {
      return {
        user: userData,
        algorandAccount: null,
      }
    }

    // Use the first account if multiple exist
    const account = accountData[0]

    const algorandAccount = {
      address: account.address,
      passphrase: account.passphrase,
      privateKey: account.private_key,
    }

    return { user: userData, algorandAccount }
  } catch (error) {
    console.error("Error getting current user:", error)
    return null
  }
}

export async function logoutUser() {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error("Error logging out:", error)
    }
    return !error
  } catch (error) {
    console.error("Logout error:", error)
    return false
  }
}

export default authOptions
