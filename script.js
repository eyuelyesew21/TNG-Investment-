const supabase = window.supabase.createClient(
  "https://dknksfcesarrvyfufdti.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRrbmtzZmNlc2FycnZ5ZnVmZHRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4OTI4ODMsImV4cCI6MjA5NTQ2ODg4M30.bemPqKzMlUrK7C9bddrAuspC-JtYIfciCxi7eECQEwk"
);

/* REGISTER */
async function registerUser() {

  alert("Register button clicked");

  const phone =
    document.getElementById("registerPhone").value;

  const password =
    document.getElementById("registerPassword").value;

  const confirmPassword =
    document.getElementById("confirmPassword").value;

  if (!phone || !password || !confirmPassword) {

    alert("Fill all fields");

    return;
  }

  if (password !== confirmPassword) {

    alert("Passwords do not match");

    return;
  }

  const { error } =
    await supabase
      .from("users")
      .insert([
        {
          phone: phone,
          password: password,
          balance: 0
        }
      ]);

  if (error) {

    alert(error.message);

    return;
  }

  alert("Registration successful");

  window.location.href = "login.html";
}

/* LOGIN */
async function loginUser() {

  alert("Login button clicked");

  const phone =
    document.getElementById("loginPhone").value;

  const password =
    document.getElementById("loginPassword").value;

  const { data, error } =
    await supabase
      .from("users")
      .select("*")
      .eq("phone", phone)
      .eq("password", password)
      .single();

  if (error || !data) {

    alert("Invalid login");

    return;
  }

  localStorage.setItem(
    "userId",
    data.id
  );

  alert("Login successful");

  window.location.href =
    "dashboard.html";
}

alert("SCRIPT CONNECTED");