const supabase = window.supabase.createClient(
  "https://dknksfcesarrvyfufdti.supabase.co",
  "YOUR_ANON_KEY"
);

let currentUser = JSON.parse(localStorage.getItem("tngUser"));

/* LOAD USER */
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
}

loadUser();

/* VIP BUY */
async function buyVip(name, price) {

  const { data: user } = await supabase
    .from("users")
    .select("*")
    .eq("id", currentUser.id)
    .single();

  if (user.balance < price) {
    alert("No balance");
    return;
  }

  await supabase
    .from("users")
    .update({ balance: user.balance - price })
    .eq("id", currentUser.id);

  await supabase
    .from("user_vip")
    .insert([{
      user_id: currentUser.id,
      package_name: name,
      price: price,
      last_profit_time: new Date(),
      expires_at: new Date(new Date().setDate(new Date().getDate() + 365)),
      status: "active"
    }]);

  alert("VIP Activated");
  loadUser();
}

/* DEPOSIT */
async function submitDeposit() {

  const amount = document.getElementById("depositAmount").value;
  const tx = document.getElementById("transactionId").value;

  const { error } = await supabase
    .from("deposits")
    .insert([{
      user_id: currentUser.id,
      amount,
      transaction_id: tx,
      status: "pending"
    }]);

  if (!error) alert("Deposit submitted");
}

/* WITHDRAW */
async function requestWithdrawal(amount) {

  const fee = amount * 0.1;
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

  alert("Withdrawal requested");
}
