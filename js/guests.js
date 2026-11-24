// =====================================
// GUEST MANAGEMENT
// =====================================

const guestForm = document.getElementById("guestForm");
const guestList = document.getElementById("guestList");

const guestMessage = document.getElementById("guestMessage");

const guestId = document.getElementById("guestId");
const formTitle = document.getElementById("formTitle");

const cancelGuestEdit = document.getElementById("cancelGuestEdit");


// =====================================
// NOTIFIKASI
// =====================================

function showGuestMessage(message, type) {

    guestMessage.textContent = message;

    guestMessage.className =
        `notification is-${type} mt-4`;

}


// =====================================
// LOAD DATA TAMU
// =====================================

async function loadGuests() {

    guestList.innerHTML = `
        <tr>
            <td colspan="5">Memuat data tamu...</td>
        </tr>
    `;

    const { data, error } = await supabaseClient
        .from("guests")
        .select("*")
        .order("id", { ascending: false });

    if (error) {

        guestList.innerHTML = `
            <tr>
                <td colspan="5">
                    Gagal mengambil data: ${escapeGuestHTML(error.message)}
                </td>
            </tr>
        `;

        return;

    }

    guestList.innerHTML = "";

    if (!data || data.length === 0) {

        guestList.innerHTML = `
            <tr>
                <td colspan="5">
                    Belum ada tamu yang ditambahkan.
                </td>
            </tr>
        `;

        return;

    }

    data.forEach((guest, index) => {

        const row = document.createElement("tr");

        const nameCell = document.createElement("td");
        nameCell.textContent = guest.guest_name;

        const categoryCell = document.createElement("td");
        categoryCell.textContent = guest.category || "-";

        const linkCell = document.createElement("td");

        const invitationLink = createInvitationLink(guest.invite_token);

        const copyButton = document.createElement("button");

        copyButton.className = "button is-small is-link";
        copyButton.textContent = "Salin Link";

        copyButton.addEventListener("click", () => {
            copyInvitationLink(invitationLink);
        });

        linkCell.appendChild(copyButton);

        const actionCell = document.createElement("td");

        const editButton = document.createElement("button");

        editButton.className = "button is-small is-warning mr-2";
        editButton.textContent = "Edit";

        editButton.addEventListener("click", () => {
            editGuest(guest);
        });

        const deleteButton = document.createElement("button");

        deleteButton.className = "button is-small is-danger";
        deleteButton.textContent = "Hapus";

        deleteButton.addEventListener("click", () => {
            deleteGuest(guest);
        });

        actionCell.append(editButton, deleteButton);

        const numberCell = document.createElement("td");
        numberCell.textContent = index + 1;

        row.append(
            numberCell,
            nameCell,
            categoryCell,
            linkCell,
            actionCell
        );

        guestList.appendChild(row);

    });

}


// =====================================
// MEMBUAT LINK UNDANGAN
// =====================================

function createInvitationLink(token) {

    if (!token) return "";

    return `${window.location.origin}/index.html?to=${encodeURIComponent(token)}`;

}


// =====================================
// SALIN LINK UNDANGAN
// =====================================

async function copyInvitationLink(link) {

    try {

        await navigator.clipboard.writeText(link);

        showGuestMessage(
            "Link undangan berhasil disalin!",
            "success"
        );

    } catch (error) {

        showGuestMessage(
            "Gagal menyalin link. Pastikan browser mengizinkan clipboard.",
            "danger"
        );

    }

}


// =====================================
// TAMBAH DAN EDIT TAMU
// =====================================

guestForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    const button = document.getElementById("saveGuestButton");

    button.disabled = true;

    const name = document.getElementById("guestName").value.trim();

    const category =
        document.getElementById("guestCategory").value;

    if (!name) {

        showGuestMessage("Nama tamu wajib diisi.", "danger");

        button.disabled = false;

        return;

    }

    try {

        const guestData = {
            guest_name: name,
            category: category
        };

        let result;

        if (guestId.value) {

            // UPDATE TAMU

            result = await supabaseClient
                .from("guests")
                .update(guestData)
                .eq("id", guestId.value);

        } else {

            // TAMBAH TAMU

            guestData.invite_token = crypto.randomUUID();
            guestData.invitation_status = "Belum Dikirim";

            result = await supabaseClient
                .from("guests")
                .insert([guestData]);

        }

        if (result.error) throw result.error;

        showGuestMessage(
            guestId.value
                ? "Data tamu berhasil diperbarui!"
                : "Tamu berhasil ditambahkan!",
            "success"
        );

        resetGuestForm();

        await loadGuests();

    } catch (error) {

        showGuestMessage(
            "Gagal menyimpan tamu: " + error.message,
            "danger"
        );

    } finally {

        button.disabled = false;

    }

});


// =====================================
// EDIT TAMU
// =====================================

function editGuest(guest) {

    guestId.value = guest.id;

    document.getElementById("guestName").value =
        guest.guest_name;

    document.getElementById("guestCategory").value =
        guest.category || "Lainnya";

    formTitle.textContent = "Edit Data Tamu";

    cancelGuestEdit.classList.remove("is-hidden");

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


// =====================================
// HAPUS TAMU
// =====================================

async function deleteGuest(guest) {

    const confirmation = confirm(
        `Yakin ingin menghapus tamu ${guest.guest_name}?`
    );

    if (!confirmation) return;

    try {

        const { error } = await supabaseClient
            .from("guests")
            .delete()
            .eq("id", guest.id);

        if (error) throw error;

        showGuestMessage(
            "Data tamu berhasil dihapus!",
            "success"
        );

        await loadGuests();

    } catch (error) {

        showGuestMessage(
            "Gagal menghapus tamu: " + error.message,
            "danger"
        );

    }

}


// =====================================
// RESET FORM
// =====================================

function resetGuestForm() {

    guestForm.reset();

    guestId.value = "";

    formTitle.textContent = "Tambahkan Tamu";

    cancelGuestEdit.classList.add("is-hidden");

}

cancelGuestEdit.addEventListener("click", resetGuestForm);


// =====================================
// ESCAPE HTML
// =====================================

function escapeGuestHTML(value) {

    const element = document.createElement("div");

    element.textContent = value;

    return element.innerHTML;

}


// =====================================
// JALANKAN
// =====================================

loadGuests();