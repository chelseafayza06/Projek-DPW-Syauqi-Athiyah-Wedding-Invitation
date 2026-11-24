// ===============================
// SUPABASE CONNECTION
// ===============================

const SUPABASE_URL = "https://hmdavwydajepjdyutgtz.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_JgDkbZHWitlSp03oazfSZA_hh-Ib0_u";

const { createClient } = window.supabase;

const supabaseClient = createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);

console.log("Supabase berhasil terhubung!");

async function testSupabaseConnection() {
    const { data, error } = await supabaseClient
        .from("couple")
        .select("*");

    if (error) {
        console.error("Database gagal diakses:", error.message);
        return;
    }

    console.log("Database berhasil diakses!");
    console.log("Data couple:", data);
}

testSupabaseConnection();