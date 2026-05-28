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

/* ================= COPY REFERRAL ================= */
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

/* ================= BUY VIP ================= */
async function buyVip(packageName, price) {

  const { data: user } = await supabase
    .from("users")
    .select("*")
    .eq("id", currentUser.id)
    .single();

  if (user.balance < price) {
    alert("Not enough balance");
    return;
  }

  await supabase
    .from("users")
    .update({
      balance: user.balance - price
    })
    .eq("id", currentUser.id);

  await supabase
    .from("user_vip")
    .insert([{
      user_id: currentUser.id,
      package_name: packageName,
      price: price,
      last_profit_time: new Date()
    }]);

  alert("VIP Activated!");
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
    alert("No active VIP");
    return;
  }

  const diff = newPrice - vip.price;

  if (diff <= 0) {
    alert("Already same or higher VIP");
    return;
  }

  const { data: user } = await supabase
    .from("users")
    .select("*")
    .eq("id", currentUser.id)
    .single();

  if (user.balance < diff) {
    alert("Not enough balance");
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
      package_name: newPackage,
      price: newPrice
    })
    .eq("id", vip.id);

  alert("VIP Upgraded!");
  loadUser();
}

/* ================= DAILY PROFIT ENGINE (6B CORE) ================= */
async function generateDailyProfit() {

  const { data: vip } = await supabase
    .from("user_vip")
    .select("*")
    .eq("user_id", currentUser.id)
    .eq("status", "active")
    .single();

  if (!vip) return;

  const lastTime = new Date(vip.last_profit_time);
  const now = new Date();

  const diffHours = (now - lastTime) / (1000 * 60 * 60);

  if (diffHours < 24) return;

  let rate = 0;

  switch (vip.price) {
    case 1500: rate = 0.05; break;
    case 3000: rate = 0.06; break;
    case 6000: rate = 0.07; break;
    case 12000: rate = 0.08; break;
    case 24000: rate = 0.09; break;
    case 48000: rate = 0.10; break;
    case 96000: rate = 0.11; break;
  }

  const profit = vip.price * rate;

  const { data: user } = await supabase
    .from("users")
    .select("*")
    .eq("id", currentUser.id)
    .single();

  await supabase
    .from("users")
    .update({
      balance: user.balance + profit
    })
    .eq("id", currentUser.id);

  await supabase
    .from("earnings")
    .insert([{
      user_id: currentUser.id,
      amount: profit,
      vip_level: vip.package_name
    }]);

  await supabase
    .from("user_vip")
    .update({
      last_profit_time: new Date()
    })
    .eq("id", vip.id);

  loadUser();
}

/* ================= AUTO RUN ENGINE ================= */
setInterval(() => {
  if (currentUser) {
    generateDailyProfit();
  }
}, 60000);

/* ================= WITHDRAWAL RULE CHECK ================= */
function canWithdraw() {

  const hour = new Date().getHours();

  if (hour < 5 || hour > 23) {
    alert("Withdrawal allowed 5 AM - 11 PM");
    return false;
  }

  if (currentUser.balance < 300) {
    alert("Minimum 300 ETB");
    return false;
  }

  return true;
}
