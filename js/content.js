// =====================================
// WEBSITE CONTENT MANAGEMENT
// =====================================

const contentForm = document.getElementById("contentForm");
const contentMessage = document.getElementById("contentMessage");

let currentContentId = null;

// LOAD CONTENT
async function loadContent() {
    const { data, error } = await supabaseClient
        .from("site_settings")
        .select("*")
        .limit(1)
        .maybeSingle();

    if (error) {
        console.error(error);
        showContentMessage("Gagal mengambil data.", "danger");
        return;
    }

    if (!data) return;

    currentContentId = data.id;

    document.getElementById("invitationTitle").value =
        data.invitation_title || "";

    document.getElementById("tagline").value =
        data.tagline || "";

    document.getElementById("openingText").value =
        data.opening_text || "";

    document.getElementById("closingText").value =
        data.closing_text || "";

    document.getElementById("thankYouText").value =
        data.thank_you_text || "";
}

// SAVE CONTENT
contentForm.addEventListener("submit", async function(event) {
    event.preventDefault();

    const contentData = {
        invitation_title: document.getElementById("invitationTitle").value.trim(),
        tagline: document.getElementById("tagline").value.trim(),
        opening_text: document.getElementById("openingText").value.trim(),
        closing_text: document.getElementById("closingText").value.trim(),
        thank_you_text: document.getElementById("thankYouText").value.trim(),
        updated_at: new Date().toISOString()
    };

    let result;

    if (currentContentId) {
        result = await supabaseClient
            .from("site_settings")
            .update(contentData)
            .eq("id", currentContentId);
    } else {
        result = await supabaseClient
            .from("site_settings")
            .insert([contentData]);
    }

    if (result.error) {
        showContentMessage("Gagal menyimpan: " + result.error.message, "danger");
        return;
    }

    showContentMessage("Konten berhasil disimpan!", "success");

    await loadContent();
});

// NOTIFICATION
function showContentMessage(message, type) {
    contentMessage.textContent = message;
    contentMessage.className = `notification is-${type} mt-4`;
}

// RUN
loadContent();