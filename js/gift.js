// =====================================
// WEDDING GIFT MANAGEMENT
// =====================================

const giftForm = document.getElementById("giftForm");
const giftList = document.getElementById("giftList");
const giftMessage = document.getElementById("giftMessage");

const giftId = document.getElementById("giftId");
const bankName = document.getElementById("bankName");
const accountNumber = document.getElementById("accountNumber");
const accountHolder = document.getElementById("accountHolder");

const cancelGiftEdit = document.getElementById("cancelGiftEdit");


// =====================================
// LOAD DATA
// =====================================

async function loadGifts() {
    const { data, error } = await supabaseClient
        .from("wedding_gifts")
        .select("*")
        .order("id", { ascending: true });

    if (error) {
        console.error(error);
        giftList.innerHTML = `
            <tr>
                <td colspan="5" class="has-text-centered has-text-danger">
                    Gagal mengambil data rekening.
                </td>
            </tr>
        `;
        return;
    }

    displayGifts(data || []);
}


// =====================================
// DISPLAY DATA
// =====================================

function displayGifts(data) {
    if (data.length === 0) {
        giftList.innerHTML = `
            <tr>
                <td colspan="5" class="has-text-centered">
                    Belum ada rekening yang ditambahkan.
                </td>
            </tr>
        `;
        return;
    }

    giftList.innerHTML = data.map((gift, index) => `
        <tr>
            <td>${index + 1}</td>
            <td>${escapeHTML(gift.bank_name)}</td>
            <td>${escapeHTML(gift.account_number)}</td>
            <td>${escapeHTML(gift.account_holder)}</td>
            <td>
                <button class="button is-small is-warning"
                    onclick="editGift(${gift.id})">
                    Edit
                </button>

                <button class="button is-small is-danger"
                    onclick="deleteGift(${gift.id})">
                    Hapus
                </button>
            </td>
        </tr>
    `).join("");
}


// =====================================
// SIMPAN DATA
// =====================================

giftForm.addEventListener("submit", async function(event) {
    event.preventDefault();

    const giftData = {
        bank_name: bankName.value.trim(),
        account_number: accountNumber.value.trim(),
        account_holder: accountHolder.value.trim()
    };

    let result;

    if (giftId.value) {
        result = await supabaseClient
            .from("wedding_gifts")
            .update(giftData)
            .eq("id", giftId.value);
    } else {
        result = await supabaseClient
            .from("wedding_gifts")
            .insert([giftData]);
    }

    if (result.error) {
        showGiftMessage("Gagal menyimpan: " + result.error.message, "danger");
        return;
    }

    showGiftMessage("Informasi rekening berhasil disimpan!", "success");

    resetGiftForm();
    loadGifts();
});


// =====================================
// EDIT DATA
// =====================================

async function editGift(id) {
    const { data, error } = await supabaseClient
        .from("wedding_gifts")
        .select("*")
        .eq("id", id)
        .single();

    if (error) {
        showGiftMessage("Gagal mengambil data rekening.", "danger");
        return;
    }

    giftId.value = data.id;
    bankName.value = data.bank_name;
    accountNumber.value = data.account_number;
    accountHolder.value = data.account_holder;

    document.getElementById("formTitle").textContent = "Edit Rekening";
    document.getElementById("saveGiftButton").textContent = "Update Rekening";

    cancelGiftEdit.style.display = "inline-flex";

    window.scrollTo({ top: 0, behavior: "smooth" });
}


// =====================================
// HAPUS DATA
// =====================================

async function deleteGift(id) {
    if (!confirm("Yakin ingin menghapus rekening ini?")) return;

    const { error } = await supabaseClient
        .from("wedding_gifts")
        .delete()
        .eq("id", id);

    if (error) {
        showGiftMessage("Gagal menghapus rekening: " + error.message, "danger");
        return;
    }

    showGiftMessage("Rekening berhasil dihapus!", "success");
    loadGifts();
}


// =====================================
// RESET FORM
// =====================================

function resetGiftForm() {
    giftForm.reset();
    giftId.value = "";

    document.getElementById("formTitle").textContent = "Tambah Rekening";
    document.getElementById("saveGiftButton").textContent = "Simpan Rekening";

    cancelGiftEdit.style.display = "none";
}

cancelGiftEdit.addEventListener("click", resetGiftForm);


// =====================================
// NOTIFIKASI
// =====================================

function showGiftMessage(message, type) {
    giftMessage.textContent = message;
    giftMessage.className = `notification is-${type} mt-4`;
}


// =====================================
// ESCAPE HTML
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

loadGifts();