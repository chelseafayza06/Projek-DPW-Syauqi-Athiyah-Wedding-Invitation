// ===============================
// ADMIN LOGIN
// ===============================

const loginForm = document.getElementById("loginForm");
const loginMessage = document.getElementById("loginMessage");

if (loginForm) {

    loginForm.addEventListener("submit", async (event) => {

        event.preventDefault();

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;

        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email: email,
            password: password
        });

        if (error) {
            loginMessage.textContent = "Login gagal: " + error.message;
            loginMessage.classList.remove("is-hidden");
            loginMessage.classList.add("is-danger");
            return;
        }

        window.location.href = "admin/dashboard.html";

    });

}

// ===============================
// DASHBOARD AUTHENTICATION
// ===============================

const logoutButton = document.getElementById("logoutButton");

async function checkAdminAccess() {

    const { data: { user }, error } =
        await supabaseClient.auth.getUser();

    if (error || !user) {
        window.location.href = "../admin.html";
        return;
    }

    const { data: admin, error: adminError } =
        await supabaseClient
            .from("admin_users")
            .select("user_id")
            .eq("user_id", user.id)
            .maybeSingle();

    if (adminError || !admin) {
        await supabaseClient.auth.signOut();
        window.location.href = "../admin.html";
    }
}

if (document.getElementById("logoutButton")) {
    checkAdminAccess();
}

if (logoutButton) {
    logoutButton.addEventListener("click", async () => {
        await supabaseClient.auth.signOut();
        window.location.href = "../admin.html";
    });
}