// ===================================
// LOVE STORY MANAGEMENT
// ===================================

const storyForm = document.getElementById("storyForm");
const storyList = document.getElementById("storyList");

const storyImage = document.getElementById("storyImage");
const storyPreview = document.getElementById("storyPreview");

const storyMessage = document.getElementById("storyMessage");

const storyId = document.getElementById("storyId");
const oldImageUrl = document.getElementById("oldImageUrl");

const formTitle = document.getElementById("formTitle");
const cancelStoryEdit = document.getElementById("cancelStoryEdit");

const STORY_BUCKET = "wedding-gallery";


// ===================================
// NOTIFIKASI
// ===================================

function showStoryMessage(message, type) {

    storyMessage.textContent = message;

    storyMessage.className =
        `notification is-${type} mt-4`;

}


// ===================================
// PREVIEW FOTO
// ===================================

storyImage.addEventListener("change", () => {

    const file = storyImage.files[0];

    if (!file) return;

    storyPreview.src = URL.createObjectURL(file);

    storyPreview.style.display = "block";

});


// ===================================
// UPLOAD FOTO
// ===================================

async function uploadStoryImage(file) {

    const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp"
    ];

    if (!allowedTypes.includes(file.type)) {
        throw new Error("Format foto tidak didukung.");
    }

    if (file.size > 5 * 1024 * 1024) {
        throw new Error("Ukuran foto maksimal 5 MB.");
    }

    const extension = file.name.split(".").pop().toLowerCase();

    const filePath =
        `love-story/${Date.now()}-${crypto.randomUUID()}.${extension}`;

    const { error } = await supabaseClient.storage
        .from(STORY_BUCKET)
        .upload(filePath, file, {
            contentType: file.type,
            upsert: false
        });

    if (error) throw error;

    const { data } = supabaseClient.storage
        .from(STORY_BUCKET)
        .getPublicUrl(filePath);

    return data.publicUrl;

}


// ===================================
// LOAD LOVE STORY
// ===================================

async function loadStories() {

    storyList.innerHTML = "<p>Memuat cerita...</p>";

    const { data, error } = await supabaseClient
        .from("love_stories")
        .select("*")
        .order("display_order", { ascending: true });

    if (error) {

        storyList.textContent = error.message;

        return;

    }

    storyList.innerHTML = "";

    if (!data || data.length === 0) {

        storyList.innerHTML = `
            <div class="column is-12">
                <p>Belum ada cerita perjalanan cinta.</p>
            </div>
        `;

        return;

    }

    data.forEach(story => {

        const column = document.createElement("div");

        column.className = "column is-6";

        const card = document.createElement("div");

        card.className = "box";

        const image = document.createElement("img");

        if (story.image_url) {

            image.src = story.image_url;
            image.alt = story.title;
            image.style.width = "100%";
            image.style.height = "220px";
            image.style.objectFit = "cover";
            image.style.borderRadius = "10px";

            card.appendChild(image);

        }

        const year = document.createElement("p");

        year.className = "has-text-weight-bold mt-3";
        year.textContent = story.year || "-";

        const title = document.createElement("h3");

        title.className = "title is-5";
        title.textContent = story.title;

        const description = document.createElement("p");

        description.textContent =
            story.description || "Belum ada deskripsi.";

        const order = document.createElement("p");

        order.className = "mt-2";
        order.textContent =
            `Urutan: ${story.display_order ?? "-"}`;

        const buttons = document.createElement("div");

        buttons.className = "buttons mt-3";

        const editButton = document.createElement("button");

        editButton.className = "button is-warning is-small";
        editButton.textContent = "Edit";

        editButton.addEventListener("click", () => {
            editStory(story);
        });

        const deleteButton = document.createElement("button");

        deleteButton.className = "button is-danger is-small";
        deleteButton.textContent = "Hapus";

        deleteButton.addEventListener("click", () => {
            deleteStory(story);
        });

        buttons.append(editButton, deleteButton);

        card.append(year, title, description, order, buttons);

        column.appendChild(card);

        storyList.appendChild(column);

    });

}


// ===================================
// SIMPAN CERITA
// ===================================

storyForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    const button = document.getElementById("saveStoryButton");

    button.disabled = true;

    let uploadedImageUrl = null;

    try {

        const file = storyImage.files[0];

        let imageUrl = oldImageUrl.value;

        if (file) {

            imageUrl = await uploadStoryImage(file);

            uploadedImageUrl = imageUrl;

        }

        const storyData = {

            year: document.getElementById("storyYear").value.trim(),

            title: document.getElementById("storyTitle").value.trim(),

            description:
                document.getElementById("storyDescription").value.trim(),

            image_url: imageUrl || null,

            display_order:
                Number(document.getElementById("storyOrder").value) || 1

        };

        let result;

        if (storyId.value) {

            result = await supabaseClient
                .from("love_stories")
                .update(storyData)
                .eq("id", storyId.value);

        } else {

            result = await supabaseClient
                .from("love_stories")
                .insert([storyData]);

        }

        if (result.error) throw result.error;

        // Hapus foto lama hanya setelah update database berhasil.
        if (storyId.value && file && oldImageUrl.value) {

            await deleteStoryStorageImage(oldImageUrl.value);

        }

        showStoryMessage(
            "Cerita berhasil disimpan! ♡",
            "success"
        );

        resetStoryForm();

        await loadStories();

    } catch (error) {

        // Bersihkan upload baru jika penyimpanan database gagal.
        if (uploadedImageUrl) {
            await deleteStoryStorageImage(uploadedImageUrl);
        }

        showStoryMessage(
            "Gagal menyimpan cerita: " + error.message,
            "danger"
        );

    } finally {

        button.disabled = false;

    }

});


// ===================================
// EDIT CERITA
// ===================================

function editStory(story) {

    storyId.value = story.id;

    oldImageUrl.value = story.image_url || "";

    document.getElementById("storyYear").value =
        story.year || "";

    document.getElementById("storyTitle").value =
        story.title || "";

    document.getElementById("storyDescription").value =
        story.description || "";

    document.getElementById("storyOrder").value =
        story.display_order ?? 1;

    if (story.image_url) {

        storyPreview.src = story.image_url;

        storyPreview.style.display = "block";

    } else {

        storyPreview.style.display = "none";

    }

    formTitle.textContent = "Edit Cerita";

    cancelStoryEdit.classList.remove("is-hidden");

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


// ===================================
// HAPUS FOTO STORAGE
// ===================================

async function deleteStoryStorageImage(imageUrl) {

    const marker =
        `/storage/v1/object/public/${STORY_BUCKET}/`;

    const index = imageUrl.indexOf(marker);

    if (index === -1) return;

    const filePath =
        imageUrl.substring(index + marker.length);

    const { error } = await supabaseClient.storage
        .from(STORY_BUCKET)
        .remove([filePath]);

    if (error) throw error;

}


// ===================================
// HAPUS CERITA
// ===================================

async function deleteStory(story) {

    const confirmation = confirm(
        "Yakin ingin menghapus cerita ini?"
    );

    if (!confirmation) return;

    try {

        const { error } = await supabaseClient
            .from("love_stories")
            .delete()
            .eq("id", story.id);

        if (error) throw error;

        if (story.image_url) {

            await deleteStoryStorageImage(story.image_url);

        }

        showStoryMessage(
            "Cerita berhasil dihapus!",
            "success"
        );

        await loadStories();

    } catch (error) {

        showStoryMessage(
            "Gagal menghapus cerita: " + error.message,
            "danger"
        );

    }

}


// ===================================
// RESET FORM
// ===================================

function resetStoryForm() {

    storyForm.reset();

    storyId.value = "";

    oldImageUrl.value = "";

    storyPreview.src = "";

    storyPreview.style.display = "none";

    formTitle.textContent = "Tambahkan Cerita";

    cancelStoryEdit.classList.add("is-hidden");

}


cancelStoryEdit.addEventListener("click", resetStoryForm);


// ===================================
// JALANKAN
// ===================================

loadStories();