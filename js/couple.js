// ===============================
// COUPLE MANAGEMENT
// ===============================

const coupleForm = document.getElementById("coupleForm");
const coupleMessage = document.getElementById("coupleMessage");

// Mengambil data couple dari database
async function loadCouple() {

    const { data, error } = await supabaseClient
        .from("couple")
        .select("*")
        .limit(1)
        .maybeSingle();

    if (error) {
        console.error(error);
        return;
    }

    if (data) {
        document.getElementById("groomName").value =
            data.groom_name || "";

        document.getElementById("brideName").value =
            data.bride_name || "";

        document.getElementById("groomDescription").value =
            data.groom_description || "";

        document.getElementById("brideDescription").value =
            data.bride_description || "";

        document.getElementById("groomPhoto").value =
            data.groom_photo || "";

        document.getElementById("bridePhoto").value =
            data.bride_photo || "";
    }
}


// Menyimpan perubahan
if (coupleForm) {

    coupleForm.addEventListener("submit", async (event) => {

        event.preventDefault();

        const coupleData = {
            groom_name: document.getElementById("groomName").value,
            bride_name: document.getElementById("brideName").value,
            groom_description: document.getElementById("groomDescription").value,
            bride_description: document.getElementById("brideDescription").value,
            groom_photo: document.getElementById("groomPhoto").value,
            bride_photo: document.getElementById("bridePhoto").value
        };

        const { data: existing, error: checkError } =
            await supabaseClient
                .from("couple")
                .select("id")
                .limit(1)
                .maybeSingle();

        if (checkError) {
            coupleMessage.textContent = checkError.message;
            coupleMessage.className = "notification is-danger mt-4";
            return;
        }

        let result;

        if (existing) {
            result = await supabaseClient
                .from("couple")
                .update(coupleData)
                .eq("id", existing.id);
        } else {
            result = await supabaseClient
                .from("couple")
                .insert([coupleData]);
        }

        if (result.error) {
            coupleMessage.textContent =
                "Gagal menyimpan: " + result.error.message;

            coupleMessage.className =
                "notification is-danger mt-4";

            return;
        }

        coupleMessage.textContent =
            "Data mempelai berhasil disimpan! ♡";

        coupleMessage.className =
            "notification is-success mt-4";

    });

}

loadCouple();

