// ===================================
// GALLERY MANAGEMENT
// ===================================

const galleryForm = document.getElementById("galleryForm");
const galleryList = document.getElementById("galleryList");

const galleryImage = document.getElementById("galleryImage");
const imagePreview = document.getElementById("imagePreview");

const galleryMessage = document.getElementById("galleryMessage");

const galleryId = document.getElementById("galleryId");
const oldImageUrl = document.getElementById("oldImageUrl");

const formTitle = document.getElementById("formTitle");
const cancelGalleryEdit = document.getElementById("cancelGalleryEdit");

const BUCKET_NAME = "wedding-gallery";


// ===================================
// NOTIFIKASI
// ===================================

function showGalleryMessage(message, type) {

    galleryMessage.textContent = message;

    galleryMessage.className =
        `notification is-${type} mt-4`;

}


// ===================================
// PREVIEW FOTO
// ===================================

galleryImage.addEventListener("change", () => {

    const file = galleryImage.files[0];

    if (!file) return;

    imagePreview.src = URL.createObjectURL(file);

    imagePreview.style.display = "block";

});


// ===================================
// LOAD GALERI
// ===================================

async function loadGallery() {

    galleryList.innerHTML = "<p>Memuat foto...</p>";

    const { data, error } = await supabaseClient
        .from("gallery")
        .select("*")
        .order("display_order", { ascending: true });

    if (error) {

        galleryList.textContent = error.message;

        return;

    }

    galleryList.innerHTML = "";

    if (!data || data.length === 0) {

        galleryList.innerHTML = `
            <div class="column is-12">
                <p>Belum ada foto dalam galeri.</p>
            </div>
        `;

        return;

    }

    data.forEach(photo => {

        const column = document.createElement("div");

        column.className = "column is-4";

        const card = document.createElement("div");

        card.className = "box";

        const image = document.createElement("img");

        image.src = photo.image_url;

        image.alt = photo.caption || "Foto pernikahan";

        image.style.width = "100%";
        image.style.height = "220px";
        image.style.objectFit = "cover";
        image.style.borderRadius = "10px";

        const caption = document.createElement("p");

        caption.textContent = photo.caption || "Tanpa caption";

        caption.className = "mt-3";

        const order = document.createElement("p");

        order.textContent = `Urutan: ${photo.display_order ?? "-"}`;

        const buttons = document.createElement("div");

        buttons.className = "buttons mt-3";

        const editButton = document.createElement("button");

        editButton.className = "button is-warning is-small";

        editButton.textContent = "Edit";

        editButton.addEventListener("click", () => {
            editGallery(photo);
        });

        const deleteButton = document.createElement("button");

        deleteButton.className = "button is-danger is-small";

        deleteButton.textContent = "Hapus";

        deleteButton.addEventListener("click", () => {
            deleteGallery(photo);
        });

        buttons.append(editButton, deleteButton);

        card.append(image, caption, order, buttons);

        column.appendChild(card);

        galleryList.appendChild(column);

    });

}


// ===================================
// UPLOAD FOTO KE STORAGE
// ===================================

async function uploadGalleryImage(file) {

    const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp"
    ];

    if (!allowedTypes.includes(file.type)) {
        throw new Error("Format foto harus JPG, PNG, atau WebP.");
    }

    if (file.size > 5 * 1024 * 1024) {
        throw new Error("Ukuran foto maksimal 5 MB.");
    }

    const extension = file.name.split(".").pop().toLowerCase();

    const filePath =
        `${Date.now()}-${crypto.randomUUID()}.${extension}`;

    const { error } = await supabaseClient.storage
        .from(BUCKET_NAME)
        .upload(filePath, file, {
            contentType: file.type,
            upsert: false
        });

    if (error) throw error;

    const { data } = supabaseClient.storage
        .from(BUCKET_NAME)
        .getPublicUrl(filePath);

    return data.publicUrl;

}


// ===================================
// SIMPAN FOTO
// ===================================

galleryForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    const button = document.getElementById("saveGalleryButton");

    button.disabled = true;

    try {

        const file = galleryImage.files[0];

        let imageUrl = oldImageUrl.value;

        // Upload foto baru jika dipilih
        if (file) {

            imageUrl = await uploadGalleryImage(file);

        }

        // Foto wajib tersedia
        if (!imageUrl) {

            throw new Error("Silakan pilih foto terlebih dahulu.");

        }

        const galleryData = {

            image_url: imageUrl,

            caption:
                document.getElementById("galleryCaption").value.trim(),

            display_order:
                Number(document.getElementById("displayOrder").value) || 1

        };


        let result;

        if (galleryId.value) {

            result = await supabaseClient
                .from("gallery")
                .update(galleryData)
                .eq("id", galleryId.value);

            // Hapus foto lama jika diganti
            if (!result.error && file && oldImageUrl.value) {

                await deleteStorageImage(oldImageUrl.value);

            }

        } else {

            result = await supabaseClient
                .from("gallery")
                .insert([galleryData]);

        }


        if (result.error) throw result.error;

        showGalleryMessage(
            "Foto berhasil disimpan! ♡",
            "success"
        );

        resetGalleryForm();

        await loadGallery();

    } catch (error) {

        showGalleryMessage(
            "Gagal menyimpan foto: " + error.message,
            "danger"
        );

    } finally {

        button.disabled = false;

    }

});


// ===================================
// EDIT FOTO
// ===================================

function editGallery(photo) {

    galleryId.value = photo.id;

    oldImageUrl.value = photo.image_url;

    document.getElementById("galleryCaption").value =
        photo.caption || "";

    document.getElementById("displayOrder").value =
        photo.display_order ?? 1;

    imagePreview.src = photo.image_url;

    imagePreview.style.display = "block";

    formTitle.textContent = "Edit Foto";

    cancelGalleryEdit.classList.remove("is-hidden");

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


// ===================================
// HAPUS FILE STORAGE
// ===================================

async function deleteStorageImage(imageUrl) {

    const marker = `/storage/v1/object/public/${BUCKET_NAME}/`;

    const index = imageUrl.indexOf(marker);

    if (index === -1) return;

    const filePath = imageUrl.substring(index + marker.length);

    const { error } = await supabaseClient.storage
        .from(BUCKET_NAME)
        .remove([filePath]);

    if (error) throw error;

}


// ===================================
// HAPUS FOTO GALERI
// ===================================

async function deleteGallery(photo) {

    const confirmation = confirm(
        "Yakin ingin menghapus foto ini?"
    );

    if (!confirmation) return;

    try {

        const { error } = await supabaseClient
            .from("gallery")
            .delete()
            .eq("id", photo.id);

        if (error) throw error;

        // Hapus file dari Storage
        await deleteStorageImage(photo.image_url);

        showGalleryMessage(
            "Foto berhasil dihapus!",
            "success"
        );

        await loadGallery();

    } catch (error) {

        showGalleryMessage(
            "Gagal menghapus foto: " + error.message,
            "danger"
        );

    }

}


// ===================================
// RESET FORM
// ===================================

function resetGalleryForm() {

    galleryForm.reset();

    galleryId.value = "";

    oldImageUrl.value = "";

    imagePreview.src = "";

    imagePreview.style.display = "none";

    formTitle.textContent = "Tambahkan Foto";

    cancelGalleryEdit.classList.add("is-hidden");

}


cancelGalleryEdit.addEventListener("click", resetGalleryForm);


// ===================================
// JALANKAN
// ===================================

loadGallery();