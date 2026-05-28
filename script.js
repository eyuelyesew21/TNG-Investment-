const supabaseUrl = "https://dknksfcesarrvyfufdti.supabase.co";

const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJIUzI1NiIsInJlZiI6ImRrbmtzZmNlc2FycnZ5ZnVmZHRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4OTI4ODMsImV4cCI6MjA5NTQ2ODg4M30.bemPqKzMlUrK7C9bddrAuspC-JtYIfciCxi7eECQEwk";

const supabase = window.supabase.createClient(
  supabaseUrl,
  supabaseKey
);

function generateReferralCode() {

  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  let code = "";

  for (let i = 0; i < 4; i++) {

    code += letters.charAt(
      Math.floor(Math.random() * letters.length)
    );

  }

  return code;
}

async function registerUser() {

  const phone = document.getElementById("phone").value;

  const password = document.getElementById("password").value;

  const confirmPassword =
    document.getElementById("confirmPassword").value;

  const referralCodeInput =
    document.getElementById("referralCode").value;

  const phoneRegex = /^(09|07)\d{8}$/;

  const passwordRegex = /^\d{6}$/;

  if (!phoneRegex.test(phone)) {

    alert("Invalid phone number");

    return;
  }

  if (!passwordRegex.test(password)) {

    alert("Password must be 6 digits");

    return;
  }

  if (password !== confirmPassword) {

    alert("Passwords do not match");

    return;
  }

  const myReferralCode =
    generateReferralCode();

  const { data, error } = await supabase
    .from("users")
    .insert([
      {
        phone: phone,

        password: password,

        referral_code: myReferralCode,

        referred_by: referralCodeInput || null
      }
    ]);

  if (error) {

    if (error.message.includes("duplicate")) {

      alert("Phone number already registered");

    } else {

      alert(error.message);

    }

    return;
  }

  alert(
    "Registration Successful\nYour Referral Code: " +
    myReferralCode
  );

  window.location.href = "login.html";
}

async function loginUser() {

  const phone =
    document.getElementById("loginPhone").value;

  const password =
    document.getElementById("loginPassword").value;

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("phone", phone)
    .eq("password", password)
    .single();

  if (error || !data) {

    alert("Invalid phone number or password");

    return;
  }

  localStorage.setItem(
    "tngUser",
    JSON.stringify(data)
  );

  alert("Login Successful");

  window.location.href = "dashboard.html";
}

const currentUser = JSON.parse(
  localStorage.getItem("tngUser")
);

if (
  window.location.pathname.includes("dashboard.html")
) {

  if (!currentUser) {

    window.location.href = "login.html";

  }

}

if (currentUser) {

  const phoneElement =
    document.getElementById("userPhone");

  const balanceElement =
    document.getElementById("userBalance");

  if (phoneElement) {

    phoneElement.innerText =
      currentUser.phone;

  }

  if (balanceElement) {

    balanceElement.innerText =
      currentUser.balance;

  }

}

function logoutUser() {

  localStorage.removeItem("tngUser");

  alert("Logged Out");

  window.location.href = "login.html";
}
