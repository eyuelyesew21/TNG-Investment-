const supabaseUrl = "https://dknksfcesarrvyfufdti.supabase.co";
const supabaseKey = "YOUR_ANON_KEY_HERE";

const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

/* ================= CURRENT USER ================= */
let currentUser = JSON.parse(localStorage.getItem("tngUser"));

if (!currentUser && window.location.pathname.includes("dashboard")) {
  window.location.href = "login.html";
}

/* ================= LOAD USER ================= */
async function loadUser() {

  const { data } = await supabase
    .from("users")
    .select("*")
    .eq("id", currentUser.id)
    .single();

  if (!data) return;

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

/* ================= COPY REF LINK ================= */
function copyReferralLink() {
  const input = document.getElementById("referralLink");
  input.select();
  document.execCommand("copy");
  alert("Copied!");
}

/* ================= LOGOUT ================= */
function logoutUser() {
  localStorage.removeItem("tngUser");
  window.location.href = "login.html";
}

/* ================= VIP PURCHASE ================= */
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

  // activate VIP
  await supabase
    .from("user_vip")
    .insert([{
      user_id: currentUser.id,
      package_name: packageName,
      price: price,
      last_profit_time: new Date()
    }]);

  alert("VIP Purchased!");
  loadUser();
}

/* ================= VIP UPGRADE (ONLY DIFFERENCE) ================= */
async function upgradeVip(newPrice, currentPrice) {

  const diff = newPrice - currentPrice;

  const { data: user } = await supabase
    .from("users")
    .select("*")
    .eq("id", currentUser.id)
    .single();

  if (user.balance < diff) {
    alert("Not enough balance for upgrade");
    return;
  }

  await supabase
    .from("users")
    .update({
      balance: user.balance - diff
    })
    .eq("id", currentUser.id);

  await supabase
    .from("user_vip")
    .update({
      price: newPrice
    })
    .eq("user_id", currentUser.id);

  alert("VIP Upgraded!");
  loadUser();
}

/* ================= WITHDRAWAL RULE CHECK ================= */
function canWithdraw() {

  const hour = new Date().getHours();

  if (hour < 5 || hour > 23) {
    alert("Withdrawal allowed 5 AM - 11 PM");
    return false;
  }

  if (!currentUser.vip_active && !currentUser.vip_id) {
    alert("VIP required to withdraw");
    return false;
  }

  if (currentUser.balance < 300) {
    alert("Minimum withdrawal is 300");
    return false;
  }

  return true;
}

/* ================= REFERRAL LINK AUTO ================= */
const urlParams = new URLSearchParams(window.location.search);
const ref = urlParams.get("ref");

const refInput = document.getElementById("referralCode");

if (ref && refInput) {
  refInput.value = ref;
}
