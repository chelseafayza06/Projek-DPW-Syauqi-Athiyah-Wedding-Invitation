// =====================================
// INVITATION SETTINGS
// =====================================

const settingsForm = document.getElementById("settingsForm");
const settingsMessage = document.getElementById("settingsMessage");

let settingsId = null;

// LOAD SETTINGS
async function loadSettings() {
    const { data, error } = await supabaseClient
        .from("invitation_settings")
        .select("*")
        .limit(1)
        .maybeSingle();

    if (error) {
        console.error(error);
        showSettingsMessage("Gagal mengambil pengaturan.", "danger");
        return;
    }

    if (!data) return;

    settingsId = data.id;

    document.getElementById("musicUrl").value = data.music_url || "";
    document.getElementById("musicAutoplay").checked = data.music_autoplay;
    document.getElementById("showCountdown").checked = data.show_countdown;
    document.getElementById("showRSVP").checked = data.show_rsvp;
    document.getElementById("showGift").checked = data.show_gift;
    document.getElementById("showGallery").checked = data.show_gallery;
}

// SAVE SETTINGS
settingsForm.addEventListener("submit", async function(event) {
    event.preventDefault();

    const settingsData = {
        music_url: document.getElementById("musicUrl").value.trim(),
        music_autoplay: document.getElementById("musicAutoplay").checked,
        show_countdown: document.getElementById("showCountdown").checked,
        show_rsvp: document.getElementById("showRSVP").checked,
        show_gift: document.getElementById("showGift").checked,
        show_gallery: document.getElementById("showGallery").checked,
        updated_at: new Date().toISOString()
    };

    let result;

    if (settingsId) {
        result = await supabaseClient
            .from("invitation_settings")
            .update(settingsData)
            .eq("id", settingsId);
    } else {
        result = await supabaseClient
            .from("invitation_settings")
            .insert([settingsData]);
    }

    if (result.error) {
        showSettingsMessage(
            "Gagal menyimpan: " + result.error.message,
            "danger"
        );
        return;
    }

    showSettingsMessage("Pengaturan berhasil disimpan!", "success");

    await loadSettings();
});

// NOTIFICATION
function showSettingsMessage(message, type) {
    settingsMessage.textContent = message;
    settingsMessage.className = `notification is-${type} mt-4`;
}

// RUN
loadSettings();