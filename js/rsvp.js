
// =====================================
// RSVP & WISHES MANAGEMENT
// =====================================

const rsvpList = document.getElementById("rsvpList");
const searchRSVP = document.getElementById("searchRSVP");
const rsvpMessage = document.getElementById("rsvpMessage");

let allRSVP = [];

// =====================================
// LOAD DATA RSVP
// =====================================

async function loadRSVP() {
    rsvpList.innerHTML = `
        <tr>
            <td colspan="7" class="has-text-centered">
                Memuat data...
            </td>
        </tr>
    `;

    const { data, error } = await supabaseClient
        .from("rsvps")
        .select("*")
        .order("submitted_at", { ascending: false });

    if (error) {
        console.error("Gagal mengambil RSVP:", error.message);

        rsvpList.innerHTML = `
            <tr>
                <td colspan="7" class="has-text-centered has-text-danger">
                    Gagal memuat data RSVP.
                </td>
            </tr>
        `;
        return;
    }

    allRSVP = data || [];

    updateStatistics(allRSVP);
    displayRSVP(allRSVP);
}

// =====================================
// STATISTIK RSVP
// =====================================

function updateStatistics(data) {
    const total = data.length;

    const hadir = data.filter(item =>
        item.attendance === "Hadir"
    ).length;

    const tidakHadir = data.filter(item =>
        item.attendance === "Tidak Hadir"
    ).length;

    document.getElementById("totalRSVP").textContent = total;
    document.getElementById("totalHadir").textContent = hadir;
    document.getElementById("totalTidakHadir").textContent = tidakHadir;
}

// =====================================
// MENAMPILKAN DATA RSVP
// =====================================

function displayRSVP(data) {
    if (data.length === 0) {
        rsvpList.innerHTML = `
            <tr>
                <td colspan="7" class="has-text-centered">
                    Belum ada konfirmasi RSVP.
                </td>
            </tr>
        `;
        return;
    }

    rsvpList.innerHTML = data.map((item, index) => {
        const attendanceClass =
            item.attendance === "Hadir"
                ? "is-success"
                : "is-danger";

        const submittedDate = item.submitted_at
            ? new Date(item.submitted_at).toLocaleString("id-ID")
            : "-";

        return `
            <tr>
                <td>${index + 1}</td>
                <td>${escapeHTML(item.guest_name || "-")}</td>
                <td>
                    <span class="tag ${attendanceClass}">
                        ${escapeHTML(item.attendance || "-")}
                    </span>
                </td>
                <td>${item.guest_count ?? "-"}</td>
                <td>${escapeHTML(item.message || "-")}</td>
                <td>${submittedDate}</td>
                <td>
                    <button
                        class="button is-small is-danger"
                        onclick="deleteRSVP('${item.id}')">
                        Hapus
                    </button>
                </td>
            </tr>
        `;
    }).join("");
}

// =====================================
// PENCARIAN RSVP
// =====================================

searchRSVP.addEventListener("input", function () {
    const keyword = this.value.toLowerCase();

    const filtered = allRSVP.filter(item =>
        (item.guest_name || "").toLowerCase().includes(keyword) ||
        (item.message || "").toLowerCase().includes(keyword)
    );

    displayRSVP(filtered);
});

// =====================================
// HAPUS RSVP
// =====================================

async function deleteRSVP(id) {
    const confirmation = confirm(
        "Apakah kamu yakin ingin menghapus data RSVP ini?"
    );

    if (!confirmation) return;

    const { error } = await supabaseClient
        .from("rsvps")
        .delete()
        .eq("id", id);

    if (error) {
        console.error("Gagal menghapus RSVP:", error.message);
        showRSVPMessage("Gagal menghapus data RSVP.", "danger");
        return;
    }

    showRSVPMessage("Data RSVP berhasil dihapus!", "success");
    await loadRSVP();
}

// =====================================
// NOTIFIKASI
// =====================================

function showRSVPMessage(message, type) {
    rsvpMessage.textContent = message;
    rsvpMessage.className = `notification is-${type}`;
}

// =====================================
// MENCEGAH HTML INJECTION
// =====================================

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[character]);
}

// =====================================
// JALANKAN
// =====================================

loadRSVP();

