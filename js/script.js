// ==========================================
// NAVBAR MOBILE
// ==========================================

const burger = document.querySelector(".navbar-burger");
const navMenu = document.getElementById("wNav");

if (burger && navMenu) {
    burger.addEventListener("click", () => {
        burger.classList.toggle("is-active");
        navMenu.classList.toggle("is-active");
    });
}

document.querySelectorAll(".wedding-navbar .navbar-item")
    .forEach(link => {
        link.addEventListener("click", () => {
            burger?.classList.remove("is-active");
            navMenu?.classList.remove("is-active");
        });
    });


// ==========================================
// HELPER
// ==========================================

function escapeHTML(text) {
    const element = document.createElement("div");
    element.textContent = text ?? "";
    return element.innerHTML;
}


// ==========================================
// COUPLE DATA
// ==========================================

async function loadCouple() {
    const { data, error } = await supabaseClient
        .from("couple")
        .select("*")
        .limit(1)
        .maybeSingle();

    if (error) {
        console.error("Gagal mengambil data couple:", error);
        return;
    }

    if (!data) return;

    const coverTitle = document.querySelector("#home h1");

    if (coverTitle) {
        coverTitle.innerHTML = `
            ${escapeHTML(data.groom_name)}
            <br>
            <span>&amp;</span>
            ${escapeHTML(data.bride_name)}
        `;
    }

    const persons = document.querySelectorAll(".person");

    if (persons.length >= 2) {
        const groom = persons[0];
        const bride = persons[1];

        groom.querySelector("h3").textContent = data.groom_name;
        bride.querySelector("h3").textContent = data.bride_name;

        const groomDescription = groom.querySelectorAll("p")[0];
        const brideDescription = bride.querySelectorAll("p")[0];

        if (groomDescription && data.groom_description) {
            groomDescription.textContent = data.groom_description;
        }

        if (brideDescription && data.bride_description) {
            brideDescription.textContent = data.bride_description;
        }

        const groomPhoto = groom.querySelector("img");
        const bridePhoto = bride.querySelector("img");

        if (data.groom_photo && groomPhoto) {
            groomPhoto.src = data.groom_photo;
        }

        if (data.bride_photo && bridePhoto) {
            bridePhoto.src = data.bride_photo;
        }
    }
}


// ==========================================
// EVENT DATA
// ==========================================

async function loadEvents() {
    const { data, error } = await supabaseClient
        .from("events")
        .select("*")
        .order("event_date", { ascending: true });

    if (error) {
        console.error("Gagal mengambil data event:", error);
        return;
    }

    if (!data || data.length === 0) return;

    const eventCards = document.querySelectorAll(".event-card");

    data.forEach((event, index) => {
        const card = eventCards[index];

        if (!card) return;

        const title = card.querySelector("h3");

        if (title) {
            title.textContent = event.event_name;
        }

        const dateElement = card.querySelector(".event-date");

        if (dateElement && event.event_date) {
            dateElement.textContent = new Date(
                event.event_date + "T00:00:00"
            ).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric"
            });
        }

        const paragraphs = card.querySelectorAll("p");

        if (paragraphs[1] && event.event_time) {
            paragraphs[1].textContent = event.event_time;
        }

        if (paragraphs[2]) {
            paragraphs[2].textContent =
                `${event.location || ""} ${event.address || ""}`.trim();
        }

        const mapButton = card.querySelector("a");

        if (mapButton && event.maps_url) {
            mapButton.href = event.maps_url;
        }
    });
}


// ==========================================
// GALLERY DATA
// ==========================================

async function loadGallery() {
    const galleryContainer = document.querySelector(
        "#gallery .columns.is-multiline"
    );

    if (!galleryContainer) return;

    const { data, error } = await supabaseClient
        .from("gallery")
        .select("*")
        .order("display_order", { ascending: true });

    if (error) {
        console.error("Gagal mengambil galeri:", error);
        initializeGalleryModal();
        return;
    }

    // Supabase kosong: pertahankan foto bawaan HTML
    if (!data || data.length === 0) {
        console.log("Menggunakan galeri bawaan HTML.");
        initializeGalleryModal();
        return;
    }

    // Supabase berisi data: tampilkan galeri dari dashboard
    galleryContainer.innerHTML = "";

    data.forEach(item => {
        const column = document.createElement("div");
        column.className = "column is-4";

        const galleryItem = document.createElement("div");
        galleryItem.className = "gallery-item";

        const image = document.createElement("img");
        image.src = item.image_url;
        image.alt = item.caption || "Wedding Memory";
        image.setAttribute("data-img", item.image_url);

        const caption = document.createElement("p");
        caption.textContent = item.caption || "";

        galleryItem.append(image, caption);
        column.appendChild(galleryItem);
        galleryContainer.appendChild(column);
    });

    initializeGalleryModal();
}


// ==========================================
// GALLERY MODAL
// ==========================================

function initializeGalleryModal() {
    const modal = document.getElementById("modal");
    const modalImg = document.getElementById("modalImg");
    const modalClose = document.querySelector(".modal-close");

    if (!modal || !modalImg) return;

    document.querySelectorAll("#gallery .gallery-item img")
        .forEach(image => {
            if (!image.hasAttribute("data-img")) {
                image.setAttribute("data-img", image.src);
            }
        });

    document.querySelectorAll("#gallery [data-img]")
        .forEach(image => {
            image.onclick = () => {
                modalImg.src = image.getAttribute("data-img");
                modal.classList.add("is-active");
            };
        });

    if (modalClose) {
        modalClose.onclick = () => {
            modal.classList.remove("is-active");
        };
    }

    modal.onclick = event => {
        if (event.target === modal) {
            modal.classList.remove("is-active");
        }
    };
}


// ==========================================
// LOVE STORY DATA
// ==========================================

async function loadLoveStories() {
    const timeline = document.querySelector("#story .timeline");

    if (!timeline) return;

    const { data, error } = await supabaseClient
        .from("love_stories")
        .select("*")
        .order("display_order", { ascending: true });

    if (error) {
        console.error("Gagal mengambil love story:", error);
        return;
    }

    // Supabase kosong: pertahankan Love Story bawaan HTML
    if (!data || data.length === 0) {
        console.log("Menggunakan Love Story bawaan HTML.");
        return;
    }

    // Supabase berisi data: tampilkan cerita dari dashboard
    timeline.innerHTML = "";

    data.forEach(story => {
        const article = document.createElement("article");
        article.className = "timeline-item";

        const imageWrapper = document.createElement("div");
        imageWrapper.className = "timeline-image";

        if (story.image_url) {
            const image = document.createElement("img");
            image.src = story.image_url;
            image.alt = story.title || "Love Story";
            imageWrapper.appendChild(image);
        }

        const content = document.createElement("div");
        content.className = "timeline-content";

        const year = document.createElement("span");
        year.className = "timeline-year";
        year.textContent = story.year || "";

        const title = document.createElement("h3");
        title.textContent = story.title || "";

        const description = document.createElement("p");
        description.textContent = story.description || "";

        content.append(year, title, description);
        article.append(imageWrapper, content);
        timeline.appendChild(article);
    });
}


// ==========================================
// RSVP FORM
// ==========================================

const rsvpForm = document.getElementById("rsvpForm");
const rsvpMessage = document.getElementById("rsvpResult");

if (rsvpForm) {
    rsvpForm.addEventListener("submit", async function(event) {
        event.preventDefault();

        const name = document.getElementById("guestName").value.trim();
        const attendance = document.getElementById("attendance").value;
        const message = document.getElementById("guestMessage").value.trim();

        if (!name || !attendance) {
            alert("Silakan lengkapi nama dan kehadiran!");
            return;
        }

        const params = new URLSearchParams(window.location.search);
        const token = params.get("to");

        if (!token) {
            alert("Link undangan tidak memiliki token tamu.");
            return;
        }

        try {
            const { data: guest, error: guestError } = await supabaseClient
                .from("guests")
                .select("id, guest_name")
                .eq("invite_token", token)
                .maybeSingle();

            if (guestError) throw guestError;

            if (!guest) {
                alert("Data tamu tidak ditemukan.");
                return;
            }

            const { error } = await supabaseClient
                .from("rsvps")
                .insert({
                    guest_id: guest.id,
                    guest_name: name,
                    attendance: attendance,
                    guest_count: null,
                    message: message
                });

            if (error) throw error;

            if (rsvpMessage) {
                rsvpMessage.textContent =
                    `Terima kasih, ${name}! RSVP berhasil dikirim ♡`;

                rsvpMessage.style.display = "block";
            }

            rsvpForm.reset();

        } catch (error) {
            console.error("Gagal mengirim RSVP:", error);
            alert("RSVP gagal dikirim: " + error.message);
        }
    });
}


// ==========================================
// PERSONALISASI TAMU
// ==========================================

async function loadGuestName() {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("to");

    const greeting = document.getElementById("guestGreeting");

    if (!greeting) return;

    if (!token) {
        greeting.textContent = "Dear You,";
        return;
    }

    const { data, error } = await supabaseClient
        .from("guests")
        .select("guest_name")
        .eq("invite_token", token)
        .maybeSingle();

    if (error) {
        console.error("Gagal mengambil nama tamu:", error);
        greeting.textContent = "Dear You,";
        return;
    }

    greeting.textContent = data
        ? `Dear ${data.guest_name},`
        : "Dear You,";
}


// ==========================================
// BACKGROUND MUSIC
// ==========================================

const bgMusic = document.getElementById("bgMusic");
const musicButton = document.getElementById("musicButton");
const openInvitation = document.getElementById("openInvitation");

if (openInvitation && bgMusic) {
    openInvitation.addEventListener("click", function() {
        bgMusic.play()
            .then(() => {
                if (musicButton) musicButton.textContent = "🎵";
            })
            .catch(error => console.log("Musik gagal diputar:", error));
    });
}

if (musicButton && bgMusic) {
    musicButton.addEventListener("click", function() {
        if (bgMusic.paused) {
            bgMusic.play()
                .then(() => musicButton.textContent = "🎵")
                .catch(error => console.log(error));
        } else {
            bgMusic.pause();
            musicButton.textContent = "🔇";
        }
    });
}


// ==========================================
// JALANKAN SEMUA FUNGSI
// ==========================================

async function initializeInvitation() {
    await Promise.all([
        loadCouple(),
        loadEvents(),
        loadGallery(),
        loadLoveStories(),
        loadGuestName()
    ]);
}

initializeInvitation();