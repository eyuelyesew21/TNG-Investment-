const supabaseUrl = "https://dknksfcesarrvyfufdti.supabase.co";
const supabaseKey = "YOUR_ANON_KEY";

const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

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

  currentUser = data;

  document.getElementById("userPhone").innerText = data.phone;
  document.getElementById("userBalance").innerText = data.balance;
  document.getElementById("userReferral").innerText = data.referral_code;

  document.getElementById("referralLink").value =
    window.location.origin + "/register.html?ref=" + data.referral_code;
}

loadUser();

/* ================= COPY ================= */
function copyReferralLink() {
  const input = document.getElementById("referralLink");
  input.select();
  document.execCommand("copy");
}

/* ================= LOGOUT ================= */
function logoutUser() {
  localStorage.removeItem("tngUser");
  window.location.href = "login.html";
}

/* ================= VIP BUY ================= */
async function buyVip(name, price) {

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
      package_name: name,
      price: price,
      last_profit_time: new Date(),
      status: "active"
    }]);

  alert("VIP Activated!");
  loadUser();
}

/* ================= VIP UPGRADE ================= */
async function upgradeVip(name, newPrice) {

  const { data: vip } = await supabase
    .from("user_vip")
    .select("*")
    .eq("user_id", currentUser.id)
    .single();

  const diff = newPrice - vip.price;

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
      package_name: name,
      price: newPrice
    })
    .eq("id", vip.id);

  alert("Upgraded!");
  loadUser();
}

/* ================= WITHDRAW ================= */
function canWithdraw() {
  const hour = new Date().getHours();
  return !(hour < 5 || hour > 23);
}

async function requestWithdrawal(amount) {

  amount = parseFloat(amount);

  if (!canWithdraw()) {
    alert("Withdrawal allowed 5AM - 11PM");
    return;
  }

  if (amount < 300) {
    alert("Minimum 300 ETB");
    return;
  }

  const fee = amount * 0.10;
  const net = amount - fee;

  await supabase
    .from("withdrawals")
    .insert([{
      user_id: currentUser.id,
      amount,
      fee,
      net_amount: net,
      status: "pending"
    }]);

  alert("Withdrawal requested!");
}

/* ================= DAILY PROFIT ================= */
async function generateDailyProfit() {

  const { data: vip } = await supabase
    .from("user_vip")
    .select("*")
    .eq("user_id", currentUser.id)
    .single();

  if (!vip) return;

  const last = new Date(vip.last_profit_time);
  const now = new Date();

  const hours = (now - last) / 3600000;

  if (hours < 24) return;

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

/* AUTO RUN */
setInterval(() => {
  if (currentUser) {
    generateDailyProfit();
  }
}, 60000);
