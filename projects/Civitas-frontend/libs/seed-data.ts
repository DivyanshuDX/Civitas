import { supabase } from "@/lib/supabase"
import { createAlgorandAccount } from "@/lib/algorand"
import { v4 as uuidv4 } from "uuid"

export async function seedDatabase() {
  try {
    console.log("Seeding database...")

    // Check if we already have users
    const { data: existingUsers, error: checkError } = await supabase.from("users").select("*").limit(1)

    if (checkError) {
      console.error("Error checking existing users:", checkError)
      throw new Error(`Failed to check existing users: ${checkError.message}`)
    }

    if (existingUsers && existingUsers.length > 0) {
      console.log("Database already seeded")
      return {
        success: true,
        message: "Database already seeded",
        data: {
          user: {
            email: "user@example.com",
            password: "password123",
          },
          admin: {
            email: "admin@example.com",
            password: "password123",
          },
        },
      }
    }

    // Create demo user
    const userEmail = "user@example.com"
    const userPassword = "password123"
    // Use a simple hash for demo purposes since bcrypt might not work well in serverless
    const hashedUserPassword = Buffer.from(`${userPassword}_hashed`).toString("base64")

    // Generate a UUID for the user
    const userId = uuidv4()

    // Create user in our custom table directly
    const { error: userError } = await supabase.from("users").insert({
      id: userId,
      email: userEmail,
      password_hash: hashedUserPassword,
      user_type: "user",
    })

    if (userError) {
      console.error("Error creating user:", userError)
      throw new Error(`Failed to create user: ${userError.message}`)
    }

    // Create Algorand account for user
    const userAlgorandAccount = await createAlgorandAccount()

    // Store Algorand account in database
    const { error: userAccountError } = await supabase.from("algorand_accounts").insert({
      user_id: userId,
      address: userAlgorandAccount.address,
      passphrase: userAlgorandAccount.passphrase,
      private_key: userAlgorandAccount.privateKey,
    })

    if (userAccountError) {
      console.error("Error creating user Algorand account:", userAccountError)
      throw new Error(`Failed to create user Algorand account: ${userAccountError.message}`)
    }

    // Create demo admin
    const adminEmail = "admin@example.com"
    const adminPassword = "password123"
    // Use a simple hash for demo purposes
    const hashedAdminPassword = Buffer.from(`${adminPassword}_hashed`).toString("base64")

    // Generate a UUID for the admin
    const adminId = uuidv4()

    // Create admin in our custom table directly
    const { error: adminError } = await supabase.from("users").insert({
      id: adminId,
      email: adminEmail,
      password_hash: hashedAdminPassword,
      user_type: "admin",
    })

    if (adminError) {
      console.error("Error creating admin:", adminError)
      throw new Error(`Failed to create admin: ${adminError.message}`)
    }

    // Create Algorand account for admin
    const adminAlgorandAccount = await createAlgorandAccount()

    // Store Algorand account in database
    const { error: adminAccountError } = await supabase.from("algorand_accounts").insert({
      user_id: adminId,
      address: adminAlgorandAccount.address,
      passphrase: adminAlgorandAccount.passphrase,
      private_key: adminAlgorandAccount.privateKey,
    })

    if (adminAccountError) {
      console.error("Error creating admin Algorand account:", adminAccountError)
      throw new Error(`Failed to create admin Algorand account: ${adminAccountError.message}`)
    }

    console.log("Database seeded successfully")

    return {
      success: true,
      message: "Database seeded successfully",
      data: {
        user: {
          email: userEmail,
          password: userPassword,
          algorandAddress: userAlgorandAccount.address,
        },
        admin: {
          email: adminEmail,
          password: adminPassword,
          algorandAddress: adminAlgorandAccount.address,
        },
      },
    }
  } catch (error) {
    console.error("Error seeding database:", error)
    throw error
  }
}
