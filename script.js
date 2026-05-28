const supabaseUrl = "https://dknksfcesarrvyfufdti.supabase.co";

const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJI1NiIsInJlZiI6ImRrbmtzZmNlc2FycnZ5ZnVmZHRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4OTI4ODMsImV4cCI6MjA5NTQ2ODg4M30.bemPqKzMlUrK7C9bddrAuspCxi7eECQEwk";

const supabase = window.supabase.createClient(
  supabaseUrl,
  supabaseKey
);

/* =========================
   REFERRAL CODE GENERATOR
========================= */
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

/* =========================
   REGISTER USER (NO REF BONUS HERE)
========================= */
async function registerUser() {

  const phone = document.getElementById("phone").value;
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirmPassword").value;
  const referralCodeInput = document.getElementById("referralCode");

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

  const myReferralCode = generateReferralCode();

  const { data, error } = await supabase
    .from("users")
    .insert([
      {
        phone: phone,
        password: password,
        balance: 200,
        referral_code: myReferralCode,
        referred_by: referralCodeInput?.value || null
      }
    ]);

  if (error) {
    alert(error.message);
    return;
  }

  alert(
    "Registration Successful\nYour Referral Code: " + myReferralCode
  );

  window.location.href = "login.html";
}

/* =========================
   LOGIN USER
========================= */
async function loginUser() {

  const phone = document.getElementById("loginPhone").value;
  const password = document.getElementById("loginPassword").value;

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

  localStorage.setItem("tngUser", JSON.stringify(data));

  window.location.href = "dashboard.html";
}

/* =========================
   CURRENT USER
========================= */
const currentUser = JSON.parse(localStorage.getItem("tngUser"));

if (window.location.pathname.includes("dashboard.html")) {
  if (!currentUser) {
    window.location.href = "login.html";
  }
}

/* =========================
   DASHBOARD DISPLAY
========================= */
if (currentUser) {

  const phoneElement = document.getElementById("userPhone");
  const balanceElement = document.getElementById("userBalance");
  const referralElement = document.getElementById("userReferral");
  const referralLinkElement = document.getElementById("referralLink");

  if (phoneElement) phoneElement.innerText = currentUser.phone;
  if (balanceElement) balanceElement.innerText = currentUser.balance;
  if (referralElement) referralElement.innerText = currentUser.referral_code;

  if (referralLinkElement) {
    referralLinkElement.value =
      window.location.origin +
      "/register.html?ref=" +
      currentUser.referral_code;
  }
}

/* =========================
   COPY REFERRAL LINK
========================= */
function copyReferralLink() {
  const referralLink = document.getElementById("referralLink");

  referralLink.select();
  referralLink.setSelectionRange(0, 99999);

  navigator.clipboard.writeText(referralLink.value);

  alert("Referral Link Copied");
}

/* =========================
   VIP REFERRAL BONUS SYSTEM
   (ONLY VIP PURCHASE)
========================= */
async function processVipReferralBonus(refCode, vipAmount) {

  if (!refCode) return;

  // LEVEL 1 (10%)
  const level1 = await getUserByReferralCode(refCode);
  if (!level1) return;

  await addBalance(level1.id, vipAmount * 0.10);

  // LEVEL 2 (7%)
  if (level1.referred_by) {
    const level2 = await getUserByReferralCode(level1.referred_by);

    if (level2) {
      await addBalance(level2.id, vipAmount * 0.07);

      // LEVEL 3 (2%)
      if (level2.referred_by) {
        const level3 = await getUserByReferralCode(level2.referred_by);

        if (level3) {
          await addBalance(level3.id, vipAmount * 0.02);
        }
      }
    }
  }
}

/* =========================
   HELPER: GET USER
========================= */
async function getUserByReferralCode(code) {

  if (!code) return null;

  const { data } = await supabase
    .from("users")
    .select("*")
    .eq("referral_code", code)
    .single();

  return data || null;
}

/* =========================
   HELPER: ADD BALANCE
========================= */
async function addBalance(userId, amount) {

  const { data } = await supabase
    .from("users")
    .select("balance")
    .eq("id", userId)
    .single();

  if (!data) return;

  await supabase
    .from("users")
    .update({
      balance: data.balance + amount
    })
    .eq("id", userId);
}

/* =========================
   LOGOUT
========================= */
function logoutUser() {
  localStorage.removeItem("tngUser");
  window.location.href = "login.html";
}

/* =========================
   AUTO REF CODE FROM URL
========================= */
const urlParams = new URLSearchParams(window.location.search);
const refCode = urlParams.get("ref");
const referralInput = document.getElementById("referralCode");

if (refCode && referralInput) {
  referralInput.value = refCode;
    }
