const supabaseUrl = "https://dknksfcesarrvyfufdti.supabase.co";
const supabaseKey = "YOUR_ANON_KEY_HERE";

const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

/* ================= CURRENT USER ================= */
let currentUser = JSON.parse(localStorage.getItem("tngUser"));

if (!currentUser && window.location.pathname.includes("dashboard")) {
  window.location.href = "login.html";
}

/* ================= LOAD USER DATA ================= */
async function loadUser() {

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", currentUser.id)
    .single();

  if (error || !data) return;

  currentUser = data;

  document.getElementById("userPhone").innerText = data.phone;
  document.getElementById("userBalance").innerText = data.balance;
  document.getElementById("userReferral").innerText = data.referral_code;

  document.getElementById("referralLink").value =
    window.location.origin +
    "/register.html?ref=" +
    data.referral_code;
}

loadUser();

/* ================= COPY REFERRAL ================= */
function copyReferralLink() {
  const input = document.getElementById("referralLink");
  input.select();
  document.execCommand("copy");
  alert("Referral Link Copied!");
}

/* ================= LOGOUT ================= */
function logoutUser() {
  localStorage.removeItem("tngUser");
  window.location.href = "login.html";
}

/* ================= BUY VIP ================= */
async function buyVip(packageName, price) {

  const { data: user } = await supabase
    .from("users")
    .select("*")
    .eq("id", currentUser.id)
    .single();

  if (!user) return;

  if (user.balance < price) {
    alert("Not enough balance");
    return;
  }

  // deduct balance
  await supabase
    .from("users")
    .update({
      balance: user.balance - price
    })
    .eq("id", currentUser.id);

  // create VIP
  await supabase
    .from("user_vip")
    .insert([{
      user_id: currentUser.id,
      package_name: packageName,
      price: price,
      last_profit_time: new Date()
    }]);

  alert("VIP Purchased Successfully!");
  loadUser();
}

/* ================= VIP UPGRADE (DIFFERENCE ONLY) ================= */
async function upgradeVip(newPackage, newPrice) {

  const { data: vip } = await supabase
    .from("user_vip")
    .select("*")
    .eq("user_id", currentUser.id)
    .eq("status", "active")
    .single();

  if (!vip) {
    alert("No active VIP found");
    return;
  }

  const currentPrice = vip.price;

  // difference calculation (IMPORTANT RULE)
  const diff = newPrice - currentPrice;

  if (diff <= 0) {
    alert("You already have this or higher VIP");
    return;
  }

  const { data: user } = await supabase
    .from("users")
    .select("*")
    .eq("id", currentUser.id)
    .single();

  if (user.balance < diff) {
    alert("Not enough balance for upgrade");
    return;
  }

  // deduct only difference
  await supabase
    .from("users")
    .update({
      balance: user.balance - diff
    })
    .eq("id", currentUser.id);

  // update VIP
  await supabase
    .from("user_vip")
    .update({
      package_name: newPackage,
      price: newPrice
    })
    .eq("id", vip.id);

  alert("VIP Upgraded Successfully!");
  loadUser();
}

/* ================= WITHDRAWAL RULE CHECK ================= */
function canWithdraw() {

  const hour = new Date().getHours();

  if (hour < 5 || hour > 23) {
    alert("Withdrawal allowed only 5 AM - 11 PM");
    return false;
  }

  if (currentUser.balance < 300) {
    alert("Minimum withdrawal is 300 ETB");
    return false;
  }

  return true;
}

/* ================= REFERRAL AUTO FILL ================= */
const urlParams = new URLSearchParams(window.location.search);
const ref = urlParams.get("ref");

const refInput = document.getElementById("referralCode");

if (ref && refInput) {
  refInput.value = ref;
}
