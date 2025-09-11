import { supabase } from "./supabase"

/**
 * Execute SQL query safely
 * @param sqlQuery SQL query to execute
 * @returns Result of the query execution
 */
export async function executeSql(sqlQuery: string) {
  try {
    // Use the query method which is available in the Supabase client
    const result = await supabase.query(sqlQuery)
    return { success: true, data: result.data, error: null }
  } catch (error) {
    console.error("Error executing SQL:", error)
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

/**
 * Get list of tables in the public schema
 * @returns Array of table names
 */
export async function getTableList() {
  try {
    const { data, error } = await supabase.from("pg_tables").select("tablename").eq("schemaname", "public")

    if (error) {
      console.error("Error fetching tables:", error)
      return { success: false, tables: [], error: error.message }
    }

    const tables = data.map((t) => t.tablename)
    return { success: true, tables, error: null }
  } catch (error) {
    console.error("Error getting table list:", error)
    return {
      success: false,
      tables: [],
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

/**
 * Get record count for a specific table
 * @param tableName Name of the table
 * @returns Count of records in the table
 */
export async function getTableCount(tableName: string) {
  try {
    const { count, error } = await supabase.from(tableName).select("*", { count: "exact", head: true })

    if (error) {
      console.error(`Error counting records in ${tableName}:`, error)
      return { success: false, count: -1, error: error.message }
    }

    return { success: true, count: count || 0, error: null }
  } catch (error) {
    console.error(`Error getting count for ${tableName}:`, error)
    return {
      success: false,
      count: -1,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}
