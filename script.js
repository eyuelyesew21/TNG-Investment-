const supabaseUrl = "https://dknksfcesarrvyfufdti.supabase.co";

const supabaseKey = "YOUR_ANON_KEY_HERE";

const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

/* ================= CURRENT USER ================= */
const currentUser = JSON.parse(localStorage.getItem("tngUser"));

if (!currentUser) {
  window.location.href = "login.html";
}

/* ================= LOAD USER DATA ================= */
async function loadUser() {

  const { data } = await supabase
    .from("users")
    .select("*")
    .eq("id", currentUser.id)
    .single();

  if (!data) return;

  document.getElementById("userPhone").innerText = data.phone;
  document.getElementById("userBalance").innerText = data.balance;
  document.getElementById("userReferral").innerText = data.referral_code;

  document.getElementById("referralLink").value =
    window.location.origin +
    "/register.html?ref=" +
    data.referral_code;
}

loadUser();

/* ================= COPY LINK ================= */
function copyReferralLink() {
  const link = document.getElementById("referralLink");

  link.select();
  document.execCommand("copy");

  alert("Referral Link Copied");
}

/* ================= LOGOUT ================= */
function logoutUser() {
  localStorage.removeItem("tngUser");
  window.location.href = "login.html";
}

/* ================= WITHDRAWAL RULE CHECK ================= */
function canWithdraw() {

  const hour = new Date().getHours();

  if (hour < 5 || hour > 23) {
    alert("Withdrawal allowed only 5 AM - 11 PM");
    return false;
  }

  if (!currentUser.vip_active) {
    alert("You must buy VIP to withdraw");
    return false;
  }

  if (currentUser.balance < 300) {
    alert("Minimum withdrawal is 300 ETB");
    return false;
  }

  return true;
}
