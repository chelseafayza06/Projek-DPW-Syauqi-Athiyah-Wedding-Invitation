// ===================================
// EVENTS MANAGEMENT
// ===================================

const eventForm = document.getElementById("eventForm");
const eventList = document.getElementById("eventList");
const eventMessage = document.getElementById("eventMessage");

const eventId = document.getElementById("eventId");
const formTitle = document.getElementById("formTitle");
const cancelEdit = document.getElementById("cancelEdit");


// ===================================
// MENAMPILKAN NOTIFIKASI
// ===================================

function showEventMessage(message, type) {

    eventMessage.textContent = message;

    eventMessage.className =
        `notification is-${type} mt-4`;

}


// ===================================
// MENGAMBIL DATA ACARA
// ===================================

async function loadEvents() {

    eventList.innerHTML = "<p>Memuat data acara...</p>";

    const { data, error } = await supabaseClient
        .from("events")
        .select("*")
        .order("event_date", { ascending: true });

    if (error) {

        eventList.innerHTML =
            `<p class="has-text-danger">${error.message}</p>`;

        return;
    }

    if (!data || data.length === 0) {

        eventList.innerHTML = `
            <p class="has-text-grey">
                Belum ada acara yang ditambahkan.
            </p>
        `;

        return;
    }

    eventList.innerHTML = "";

    data.forEach(event => {

        const card = document.createElement("div");

        card.className = "box";

        const heading = document.createElement("h3");
        heading.className = "title is-5";
        heading.textContent = event.event_name;

        const details = document.createElement("div");
        details.className = "content";

        const date = document.createElement("p");
        date.textContent =
            `Tanggal: ${event.event_date || "-"}`;

        const time = document.createElement("p");
        time.textContent =
            `Waktu: ${event.event_time || "-"}`;

        const location = document.createElement("p");
        location.textContent =
            `Lokasi: ${event.location || "-"}`;

        const address = document.createElement("p");
        address.textContent =
            `Alamat: ${event.address || "-"}`;

        details.append(date, time, location, address);

        const buttons = document.createElement("div");
        buttons.className = "buttons";

        const editButton = document.createElement("button");
        editButton.className = "button is-warning";
        editButton.textContent = "Edit";

        editButton.addEventListener("click", () => {
            editEvent(event);
        });

        const deleteButton = document.createElement("button");
        deleteButton.className = "button is-danger";
        deleteButton.textContent = "Hapus";

        deleteButton.addEventListener("click", () => {
            deleteEvent(event.id);
        });

        buttons.append(editButton, deleteButton);

        card.append(heading, details, buttons);

        eventList.appendChild(card);

    });

}


// ===================================
// MENAMBAHKAN ATAU MENGEDIT ACARA
// ===================================

eventForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    const eventData = {

        event_name: document.getElementById("eventName").value.trim(),

        event_date:
            document.getElementById("eventDate").value || null,

        event_time:
            document.getElementById("eventTime").value || null,

        location:
            document.getElementById("eventLocation").value.trim(),

        address:
            document.getElementById("eventAddress").value.trim(),

        maps_url:
            document.getElementById("eventMaps").value.trim()

    };


    let result;

    if (eventId.value) {

        // UPDATE ACARA

        result = await supabaseClient
            .from("events")
            .update(eventData)
            .eq("id", eventId.value);

    } else {

        // INSERT ACARA

        result = await supabaseClient
            .from("events")
            .insert([eventData]);

    }


    if (result.error) {

        showEventMessage(
            "Gagal menyimpan acara: " + result.error.message,
            "danger"
        );

        return;
    }


    showEventMessage(
        "Data acara berhasil disimpan! ♡",
        "success"
    );

    resetEventForm();

    loadEvents();

});


// ===================================
// EDIT ACARA
// ===================================

function editEvent(event) {

    eventId.value = event.id;

    document.getElementById("eventName").value =
        event.event_name || "";

    document.getElementById("eventDate").value =
        event.event_date || "";

    document.getElementById("eventTime").value =
        event.event_time
            ? event.event_time.substring(0, 5)
            : "";

    document.getElementById("eventLocation").value =
        event.location || "";

    document.getElementById("eventAddress").value =
        event.address || "";

    document.getElementById("eventMaps").value =
        event.maps_url || "";

    formTitle.textContent = "Edit Acara";

    cancelEdit.classList.remove("is-hidden");

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


// ===================================
// HAPUS ACARA
// ===================================

async function deleteEvent(id) {

    const confirmation = confirm(
        "Apakah kamu yakin ingin menghapus acara ini?"
    );

    if (!confirmation) return;

    const { error } = await supabaseClient
        .from("events")
        .delete()
        .eq("id", id);

    if (error) {

        showEventMessage(
            "Gagal menghapus acara: " + error.message,
            "danger"
        );

        return;
    }

    showEventMessage(
        "Acara berhasil dihapus!",
        "success"
    );

    loadEvents();

}


// ===================================
// RESET FORM
// ===================================

function resetEventForm() {

    eventForm.reset();

    eventId.value = "";

    formTitle.textContent = "Tambahkan Acara";

    cancelEdit.classList.add("is-hidden");

}


cancelEdit.addEventListener("click", resetEventForm);


// ===================================
// JALANKAN SAAT HALAMAN DIBUKA
// ===================================

loadEvents();