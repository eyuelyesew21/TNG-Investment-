const supabase = window.supabase.createClient(
  "https://dknksfcesarrvyfufdti.supabase.co",
  "YOUR_ANON_KEY"
);

let currentUser = JSON.parse(localStorage.getItem("tngUser"));

let selectedMethod = "";

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

/* NEWS */
async function loadNews() {

  const { data } = await supabase
    .from("news")
    .select("*")
    .order("created_at", { ascending: false });

  document.getElementById("newsBox").innerHTML =
    data.map(n => `
      <div class="news-item">
        <h4>${n.title}</h4>
        <p>${n.content}</p>
      </div>
    `).join('');
}

loadNews();

/* VIP BUY */
async function buyVip(name, price) {

  const { data: user } = await supabase
    .from("users")
    .select("*")
    .eq("id", currentUser.id)
    .single();

  if (user.balance < price) {
    alert("Insufficient balance");
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
      status: "active",
      last_profit_time: new Date(),
      expires_at: new Date(
        new Date().setDate(
          new Date().getDate() + 365
        )
      )
    }]);

  alert("VIP Activated");

  loadUser();
}

/* PAYMENT METHOD */
function selectMethod(method) {
  selectedMethod = method;
  alert("Selected: " + method);
}

/* COPY */
function copyText(text) {

  navigator.clipboard.writeText(text);

  alert("Copied");
}

/* DEPOSIT */
async function submitDeposit() {

  const amount =
    document.getElementById("depositAmount").value;

  const tx =
    document.getElementById("transactionId").value;

  if (!amount || !tx || !selectedMethod) {
    alert("Fill all fields");
    return;
  }

  /* DUPLICATE CHECK */
  const { data: existing } = await supabase
    .from("deposits")
    .select("*")
    .eq("transaction_id", tx)
    .single();

  if (existing) {
    alert("Duplicate Transaction ID");
    return;
  }

  const file =
    document.getElementById("receipt").files[0];

  let fileUrl = "";

  if (file) {

    const { data } = await supabase.storage
      .from("receipts")
      .upload(
        `${Date.now()}-${file.name}`,
        file
      );

    fileUrl = data.path;
  }

  await supabase
    .from("deposits")
    .insert([{
      user_id: currentUser.id,
      amount: amount,
      method: selectedMethod,
      transaction_id: tx,
      receipt: fileUrl,
      status: "pending"
    }]);

  alert("Deposit Submitted (Pending)");
}

/* WITHDRAW */
async function requestWithdrawal(amount) {

  if (amount < 300) {
    alert("Minimum withdrawal is 300");
    return;
  }

  const fee = amount * 0.10;
  const net = amount - fee;

  await supabase
    .from("withdrawals")
    .insert([{
      user_id: currentUser.id,
      amount: amount,
      fee: fee,
      net_amount: net,
      status: "pending"
    }]);

  alert("Withdrawal Request Sent");
}

/* CHAT */
async function sendMessage() {

  const msg =
    document.getElementById("chatMsg").value;

  if (!msg) return;

  await supabase
    .from("chats")
    .insert([{
      sender_id: currentUser.id,
      message: msg
    }]);

  document.getElementById("chatMsg").value = "";

  loadChats();
}

async function loadChats() {

  const { data } = await supabase
    .from("chats")
    .select("*")
    .order("created_at", {
      ascending: true
    });

  document.getElementById("chatBox").innerHTML =
    data.map(c => `
      <p>
        <b>User ${c.sender_id}:</b>
        ${c.message}
      </p>
    `).join('');
}

loadChats();

/* SUPPORT */
async function sendTicket() {

  const msg =
    document.getElementById("ticketMsg").value;

  if (!msg) return;

  await supabase
    .from("tickets")
    .insert([{
      user_id: currentUser.id,
      message: msg,
      status: "open"
    }]);

  alert("Message Sent To Admin");

  document.getElementById("ticketMsg").value = "";
}
