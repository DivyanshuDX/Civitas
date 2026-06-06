import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {
  try {
    console.log("Starting data separation fix...")

    // Get user IDs
    const { data: users, error: userError } = await supabase
      .from("users")
      .select("id, email")
      .in("email", ["user1@example.com", "user2@example.com", "user@example.com"])

    if (userError) {
      console.error("Error fetching users:", userError)
      return NextResponse.json({ error: userError.message }, { status: 500 })
    }

    const user1 = users?.find((u) => u.email === "user1@example.com")
    const user2 = users?.find((u) => u.email === "user2@example.com")
    const userExample = users?.find((u) => u.email === "user@example.com")

    console.log("Found users:", {
      user1: user1?.id,
      user2: user2?.id,
      userExample: userExample?.id,
    })

    if (!user1 || !user2) {
      console.log("Required users not found, skipping some operations")
    }

    // Check if user_blockchain_accounts table exists
    let blockchainTableExists = false
    try {
      const { count, error: tableCheckError } = await supabase
        .from("user_blockchain_accounts")
        .select("*", { count: "exact", head: true })

      if (tableCheckError) {
        console.log("Error checking user_blockchain_accounts table:", tableCheckError.message)
      } else {
        blockchainTableExists = true
        console.log("user_blockchain_accounts table exists")
      }
    } catch (error) {
      console.log(
        "user_blockchain_accounts table might not exist:",
        error instanceof Error ? error.message : String(error),
      )
    }

    if (blockchainTableExists) {
      if (user1) {
        // First check if an entry already exists for user1
        try {
          const { data: existingAccount, error: checkError } = await supabase
            .from("user_blockchain_accounts")
            .select("*")
            .eq("user_id", user1.id)

          if (checkError) {
            console.error("Error checking existing blockchain account for user1:", checkError)
          } else if (!existingAccount || existingAccount.length === 0) {
            // Insert new account if none exists
            const { error: insertError } = await supabase.from("user_blockchain_accounts").insert({
              user_id: user1.id,
              address: "PTC5H4VMUILLJWWE74VEQBXKBISAP447ZG6I72D3TEZNCLVDXUZ2G5PBHQ",
              blockchain_type: "algorand",
              is_primary: true,
            })

            if (insertError) {
              console.error("Error inserting blockchain account for user1:", insertError)
            } else {
              console.log("Successfully inserted blockchain account for user1")
            }
          } else {
            // Update existing account
            const { error: updateError } = await supabase
              .from("user_blockchain_accounts")
              .update({
                address: "PTC5H4VMUILLJWWE74VEQBXKBISAP447ZG6I72D3TEZNCLVDXUZ2G5PBHQ",
                blockchain_type: "algorand",
                is_primary: true,
              })
              .eq("user_id", user1.id)

            if (updateError) {
              console.error("Error updating blockchain account for user1:", updateError)
            } else {
              console.log("Successfully updated blockchain account for user1")
            }
          }
        } catch (error) {
          console.error(
            "Error handling blockchain account for user1:",
            error instanceof Error ? error.message : String(error),
          )
        }
      }

      // Handle user2 blockchain account
      if (user2) {
        try {
          // First check if an entry already exists for user2
          const { data: existingAccount, error: checkError } = await supabase
            .from("user_blockchain_accounts")
            .select("*")
            .eq("user_id", user2.id)

          if (checkError) {
            console.error("Error checking existing blockchain account for user2:", checkError)
          } else if (!existingAccount || existingAccount.length === 0) {
            // Insert new account if none exists
            const { error: insertError } = await supabase.from("user_blockchain_accounts").insert({
              user_id: user2.id,
              address: "UXVAPU4KERSMNUILDVZVO457RLILQMG3DAPV77CZJQVPJRG5FQHKXKJCYE",
              blockchain_type: "algorand",
              is_primary: true,
            })

            if (insertError) {
              console.error("Error inserting blockchain account for user2:", insertError)
            } else {
              console.log("Successfully inserted blockchain account for user2")
            }
          } else {
            // Update existing account
            const { error: updateError } = await supabase
              .from("user_blockchain_accounts")
              .update({
                address: "UXVAPU4KERSMNUILDVZVO457RLILQMG3DAPV77CZJQVPJRG5FQHKXKJCYE",
                blockchain_type: "algorand",
                is_primary: true,
              })
              .eq("user_id", user2.id)

            if (updateError) {
              console.error("Error updating blockchain account for user2:", updateError)
            } else {
              console.log("Successfully updated blockchain account for user2")
            }
          }
        } catch (error) {
          console.error(
            "Error handling blockchain account for user2:",
            error instanceof Error ? error.message : String(error),
          )
        }
      }
    }

    // Update document assets
    if (user1 && user2) {
      // Check if document_assets table exists
      let assetsTableExists = false
      try {
        const { count, error: assetsTableCheckError } = await supabase
          .from("document_assets")
          .select("*", { count: "exact", head: true })

        if (assetsTableCheckError) {
          console.log("Error checking document_assets table:", assetsTableCheckError.message)
        } else {
          assetsTableExists = true
          console.log("document_assets table exists")
        }
      } catch (error) {
        console.log("document_assets table might not exist:", error instanceof Error ? error.message : String(error))
      }

      if (assetsTableExists) {
        try {
          // Update PAN and Aadhaar to user1
          const { error: updateUser1Error } = await supabase
            .from("document_assets")
            .update({ user_id: user1.id })
            .in("asset_id", [738575610, 738575873])

          if (updateUser1Error) {
            console.error("Error updating document assets for user1:", updateUser1Error)
          } else {
            console.log("Successfully updated document assets for user1")
          }
        } catch (error) {
          console.error(
            "Error updating document assets for user1:",
            error instanceof Error ? error.message : String(error),
          )
        }

        try {
          // Update Driving License to user2
          const { error: updateUser2Error } = await supabase
            .from("document_assets")
            .update({ user_id: user2.id })
            .eq("asset_id", 738619279)

          if (updateUser2Error) {
            console.error("Error updating document assets for user2:", updateUser2Error)
          } else {
            console.log("Successfully updated document assets for user2")
          }
        } catch (error) {
          console.error(
            "Error updating document assets for user2:",
            error instanceof Error ? error.message : String(error),
          )
        }
      }
    }

    // Create access history entries
    // Check if access_history table exists
    let historyTableExists = false
    try {
      const { count, error: historyTableCheckError } = await supabase
        .from("access_history")
        .select("*", { count: "exact", head: true })

      if (historyTableCheckError) {
        console.log("Error checking access_history table:", historyTableCheckError.message)
      } else {
        historyTableExists = true
        console.log("access_history table exists")
      }
    } catch (error) {
      console.log("access_history table might not exist:", error instanceof Error ? error.message : String(error))
    }

    if (historyTableExists) {
      if (user1) {
        try {
          const { data: existingHistory, error: historyCheckError } = await supabase
            .from("access_history")
            .select("id")
            .eq("user_id", user1.id)

          if (historyCheckError) {
            console.error("Error checking existing history for user1:", historyCheckError)
          } else if (!existingHistory || existingHistory.length === 0) {
            console.log("No existing history for user1, creating entries")

            const { error: insertHistoryError } = await supabase.from("access_history").insert([
              {
                user_id: user1.id,
                action: "grant",
                timestamp: new Date(Date.now() - 86400000).toISOString(),
                transaction_hash:
                  "0x" +
                  Array(64)
                    .fill(0)
                    .map(() => Math.floor(Math.random() * 16).toString(16))
                    .join(""),
              },
              {
                user_id: user1.id,
                action: "request",
                timestamp: new Date(Date.now() - 259200000).toISOString(),
                transaction_hash:
                  "0x" +
                  Array(64)
                    .fill(0)
                    .map(() => Math.floor(Math.random() * 16).toString(16))
                    .join(""),
              },
            ])

            if (insertHistoryError) {
              console.error("Error inserting history for user1:", insertHistoryError)
            } else {
              console.log("Successfully inserted history for user1")
            }
          } else {
            console.log("History already exists for user1")
          }
        } catch (error) {
          console.error("Error handling history for user1:", error instanceof Error ? error.message : String(error))
        }
      }

      if (user2) {
        try {
          const { data: existingHistory, error: historyCheckError } = await supabase
            .from("access_history")
            .select("id")
            .eq("user_id", user2.id)

          if (historyCheckError) {
            console.error("Error checking existing history for user2:", historyCheckError)
          } else if (!existingHistory || existingHistory.length === 0) {
            console.log("No existing history for user2, creating entries")

            const { error: insertHistoryError } = await supabase.from("access_history").insert([
              {
                user_id: user2.id,
                action: "grant",
                timestamp: new Date(Date.now() - 172800000).toISOString(),
                transaction_hash:
                  "0x" +
                  Array(64)
                    .fill(0)
                    .map(() => Math.floor(Math.random() * 16).toString(16))
                    .join(""),
              },
              {
                user_id: user2.id,
                action: "revoke",
                timestamp: new Date(Date.now() - 432000000).toISOString(),
                transaction_hash:
                  "0x" +
                  Array(64)
                    .fill(0)
                    .map(() => Math.floor(Math.random() * 16).toString(16))
                    .join(""),
              },
            ])

            if (insertHistoryError) {
              console.error("Error inserting history for user2:", insertHistoryError)
            } else {
              console.log("Successfully inserted history for user2")
            }
          } else {
            console.log("History already exists for user2")
          }
        } catch (error) {
          console.error("Error handling history for user2:", error instanceof Error ? error.message : String(error))
        }
      }

      // Fix any null user_id entries in access_history
      if (user1) {
        try {
          const { error: updateNullError } = await supabase
            .from("access_history")
            .update({ user_id: user1.id })
            .is("user_id", null)

          if (updateNullError) {
            console.error("Error updating null user_id entries:", updateNullError)
          } else {
            console.log("Successfully updated null user_id entries")
          }
        } catch (error) {
          console.error("Error updating null user_id entries:", error instanceof Error ? error.message : String(error))
        }
      }
    }

    // Also check and update algorand_accounts table if it exists
    let algorandTableExists = false
    try {
      const { count, error: algorandTableCheckError } = await supabase
        .from("algorand_accounts")
        .select("*", { count: "exact", head: true })
        .limit(1)

      if (algorandTableCheckError) {
        console.log("Error checking algorand_accounts table:", algorandTableCheckError.message)
      } else {
        algorandTableExists = true
        console.log("algorand_accounts table exists")
      }
    } catch (error) {
      console.log("algorand_accounts table might not exist:", error instanceof Error ? error.message : String(error))
    }

    if (algorandTableExists) {
      // Handle user1 algorand account
      if (user1) {
        try {
          const { data: existingAlgoAccount, error: checkAlgoError } = await supabase
            .from("algorand_accounts")
            .select("*")
            .eq("user_id", user1.id)

          if (checkAlgoError) {
            console.error("Error checking existing algorand account for user1:", checkAlgoError)
          } else if (!existingAlgoAccount || existingAlgoAccount.length === 0) {
            // Insert new account if none exists
            const { error: insertAlgoError } = await supabase.from("algorand_accounts").insert({
              user_id: user1.id,
              address: "PTC5H4VMUILLJWWE74VEQBXKBISAP447ZG6I72D3TEZNCLVDXUZ2G5PBHQ",
              passphrase: "safely_stored_passphrase",
              private_key: "safely_stored_private_key",
            })

            if (insertAlgoError) {
              console.error("Error inserting algorand account for user1:", insertAlgoError)
            } else {
              console.log("Successfully inserted algorand account for user1")
            }
          }
        } catch (error) {
          console.error(
            "Error handling algorand account for user1:",
            error instanceof Error ? error.message : String(error),
          )
        }
      }

      // Handle user2 algorand account
      if (user2) {
        try {
          const { data: existingAlgoAccount, error: checkAlgoError } = await supabase
            .from("algorand_accounts")
            .select("*")
            .eq("user_id", user2.id)

          if (checkAlgoError) {
            console.error("Error checking existing algorand account for user2:", checkAlgoError)
          } else if (!existingAlgoAccount || existingAlgoAccount.length === 0) {
            // Insert new account if none exists
            const { error: insertAlgoError } = await supabase.from("algorand_accounts").insert({
              user_id: user2.id,
              address: "UXVAPU4KERSMNUILDVZVO457RLILQMG3DAPV77CZJQVPJRG5FQHKXKJCYE",
              passphrase: "safely_stored_passphrase",
              private_key: "safely_stored_private_key",
            })

            if (insertAlgoError) {
              console.error("Error inserting algorand account for user2:", insertAlgoError)
            } else {
              console.log("Successfully inserted algorand account for user2")
            }
          }
        } catch (error) {
          console.error(
            "Error handling algorand account for user2:",
            error instanceof Error ? error.message : String(error),
          )
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: "User data separation fixed successfully",
    })
  } catch (error) {
    console.error("Error fixing user data separation:", error)
    return NextResponse.json(
      {
        success: false,
        error: `Failed to fix user data separation: ${error instanceof Error ? error.message : String(error)}`,
      },
      { status: 500 },
    )
  }
}
