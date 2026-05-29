const supabase = window.supabase.createClient(
  "https://dknksfcesarrvyfufdti.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRrbmtzZmNlc2FycnZ5ZnVmZHRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4OTI4ODMsImV4cCI6MjA5NTQ2ODg4M30.bemPqKzMlUrK7C9bddrAuspC-JtYIfciCxi7eECQEwk"
);

/* =========================
   REGISTER USER
========================= */
async function registerUser() {

  try {

    const phone =
      document.getElementById(
        "registerPhone"
      ).value.trim();

    const password =
      document.getElementById(
        "registerPassword"
      ).value.trim();

    const confirmPassword =
      document.getElementById(
        "confirmPassword"
      ).value.trim();

    const referralCode =
      document.getElementById(
        "referralCode"
      ).value.trim();

    if (
      !phone ||
      !password ||
      !confirmPassword
    ) {

      alert("Fill all fields");

      return;
    }

    if (
      password !== confirmPassword
    ) {

      alert(
        "Passwords do not match"
      );

      return;
    }

    /* CHECK EXISTING USER */
    const {
      data: existingUser,
      error: checkError
    } =
      await supabase
        .from("users")
        .select("*")
        .eq("phone", phone)
        .maybeSingle();

    if (checkError) {

      alert(
        "Database error"
      );

      console.log(checkError);

      return;
    }

    if (existingUser) {

      alert(
        "Phone already registered"
      );

      return;
    }

    /* REGISTER USER */
    const {
      data,
      error
    } =
      await supabase
        .from("users")
        .insert([{
          phone: phone,
          password: password,
          referral_code:
            referralCode || null,
          balance: 0
        }]);

    if (error) {

      console.log(error);

      alert(
        "Registration failed: "
        + error.message
      );

      return;
    }

    alert(
      "Registration successful"
    );

    window.location.href =
      "login.html";

  } catch (err) {

    console.log(err);

    alert(
      "Unexpected error occurred"
    );
  }
}

/* =========================
   LOGIN USER
========================= */
async function loginUser() {

  try {

    const phone =
      document.getElementById(
        "loginPhone"
      ).value.trim();

    const password =
      document.getElementById(
        "loginPassword"
      ).value.trim();

    if (!phone || !password) {

      alert("Fill all fields");

      return;
    }

    const {
      data: user,
      error
    } =
      await supabase
        .from("users")
        .select("*")
        .eq("phone", phone)
        .eq("password", password)
        .maybeSingle();

    if (error || !user) {

      alert(
        "Invalid login details"
      );

      return;
    }

    localStorage.setItem(
      "userId",
      user.id
    );

    alert(
      "Login successful"
    );

    window.location.href =
      "dashboard.html";

  } catch (err) {

    console.log(err);

    alert(
      "Login failed"
    );
  }
}

/* =========================
   LOGOUT
========================= */
function logoutUser() {

  localStorage.removeItem(
    "userId"
  );

  window.location.href =
    "login.html";
}

alert("SCRIPT CONNECTED");