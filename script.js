const supabase = window.supabase.createClient(
  "https://dknksfcesarrvyfufdti.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRrbmtzZmNlc2FycnZ5ZnVmZHRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4OTI4ODMsImV4cCI6MjA5NTQ2ODg4M30.bemPqKzMlUrK7C9bddrAuspC-JtYIfciCxi7eECQEwk"
);

/* =========================
   REGISTER USER
========================= */
async function registerUser() {

  const phone =
    document.getElementById(
      "registerPhone"
    ).value;

  const password =
    document.getElementById(
      "registerPassword"
    ).value;

  const confirmPassword =
    document.getElementById(
      "confirmPassword"
    ).value;

  const referralCode =
    document.getElementById(
      "referralCode"
    ).value;

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

  const { data: existingUser } =
    await supabase
      .from("users")
      .select("*")
      .eq("phone", phone)
      .single();

  if (existingUser) {

    alert(
      "Phone already registered"
    );

    return;
  }

  const { error } =
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

    alert(error.message);

    return;
  }

  alert(
    "Registration successful"
  );

  window.location.href =
    "login.html";
}

/* =========================
   LOGIN USER
========================= */
async function loginUser() {

  const phone =
    document.getElementById(
      "loginPhone"
    ).value;

  const password =
    document.getElementById(
      "loginPassword"
    ).value;

  if (!phone || !password) {

    alert("Fill all fields");

    return;
  }

  const { data: user, error } =
    await supabase
      .from("users")
      .select("*")
      .eq("phone", phone)
      .eq("password", password)
      .single();

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

  alert("Login successful");

  window.location.href =
    "dashboard.html";
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