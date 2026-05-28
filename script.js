const supabase = window.supabase.createClient(
  "https://dknksfcesarrvyfufdti.supabase.co",
  "YOUR_ANON_KEY"
);

/* =========================
   LOAD DASHBOARD
========================= */
async function loadDashboard() {

  const userId =
    localStorage.getItem("userId");

  if (!userId) {

    location.href = "index.html";

    return;
  }

  /* USER INFO */
  const { data: user } =
    await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

  document.getElementById("balance")
    .innerText =
      user.balance || 0;

  document.getElementById("referralCode")
    .innerText =
      user.referral_code || "";

  /* ACTIVE VIP */
  const { data: vip } =
    await supabase
      .from("user_vip")
      .select(`
        *,
        vip_plans (
          name,
          price,
          daily_rate
        )
      `)
      .eq("user_id", userId)
      .eq("status", "active")
      .single();

  if (vip) {

    document.getElementById("currentVip")
      .innerText =
        vip.vip_plans.name;

    document.getElementById("vipExpire")
      .innerText =
        new Date(
          vip.expires_at
        ).toLocaleDateString();

  } else {

    document.getElementById("currentVip")
      .innerText = "No VIP";

    document.getElementById("vipExpire")
      .innerText = "-";
  }

  loadVipPlans();

  loadNews();

  loadChats();

  loadTickets();

  loadIncomeHistory();
}

/* =========================
   LOAD VIP PLANS
========================= */
async function loadVipPlans() {

  const { data } =
    await supabase
      .from("vip_plans")
      .select("*")
      .order("price", {
        ascending: true
      });

  document.getElementById("vipPlans")
    .innerHTML =
      data.map(v => `
        <div class="vip-card">

          <h3>${v.name}</h3>

          <p>Price: ${v.price} ETB</p>

          <p>Daily Return:
            ${v.daily_rate}%
          </p>

          <p>Duration:
            365 Days
          </p>

          <button onclick="
            buyVip(${v.id})
          ">
            Buy VIP
          </button>

        </div>
      `).join('');
}

/* =========================
   SECURE BUY VIP
========================= */
async function buyVip(vipId) {

  const userId =
    localStorage.getItem("userId");

  if (!userId) {

    alert("Login Required");

    return;
  }

  const confirmed =
    confirm(
      "Are you sure you want to purchase this VIP?"
    );

  if (!confirmed) return;

  const { error } =
    await supabase.rpc(
      "secure_buy_vip",
      {
        p_user_id: userId,
        p_vip_id: vipId
      }
    );

  if (error) {

    alert(error.message);

    return;
  }

  alert("VIP Purchased Successfully");

  loadDashboard();
}

/* =========================
   SECURE DAILY CLAIM
========================= */
async function claimDailyIncome() {

  const userId =
    localStorage.getItem("userId");

  const { error } =
    await supabase.rpc(
      "claim_daily_income",
      {
        p_user_id: userId
      }
    );

  if (error) {

    alert(error.message);

    return;
  }

  alert("Daily Income Claimed");

  loadDashboard();
}

/* =========================
   LOAD INCOME HISTORY
========================= */
async function loadIncomeHistory() {

  const userId =
    localStorage.getItem("userId");

  const { data } =
    await supabase
      .from("vip_income_history")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", {
        ascending: false
      });

  document.getElementById("incomeHistory")
    .innerHTML =
      data.map(i => `
        <div class="income-item">

          <p>
            Income:
            ${i.amount} ETB
          </p>

          <p>
            ${new Date(
              i.created_at
            ).toLocaleString()}
          </p>

        </div>
      `).join('');
}

/* =========================
   LOAD NEWS
========================= */
async function loadNews() {

  const { data } =
    await supabase
      .from("news")
      .select("*")
      .order("created_at", {
        ascending: false
      });

  document.getElementById("newsList")
    .innerHTML =
      data.map(n => `
        <div class="news-item">

          <h3>${n.title}</h3>

          <p>${n.content}</p>

        </div>
      `).join('');
}

/* =========================
   LOAD CHATS
========================= */
async function loadChats() {

  const { data } =
    await supabase
      .from("chats")
      .select("*")
      .order("created_at", {
        ascending: false
      });

  document.getElementById("chatList")
    .innerHTML =
      data.map(c => `
        <div class="chat-item">

          <p>${c.message}</p>

        </div>
      `).join('');
}

/* =========================
   SEND CHAT
========================= */
async function sendChat() {

  const userId =
    localStorage.getItem("userId");

  const message =
    document.getElementById("chatMessage").value;

  if (!message) return;

  await supabase
    .from("chats")
    .insert([{
      user_id: userId,
      message: message
    }]);

  document.getElementById("chatMessage").value =
    "";

  loadChats();
}

/* =========================
   SUBMIT SUPPORT TICKET
========================= */
async function submitTicket() {

  const userId =
    localStorage.getItem("userId");

  const message =
    document.getElementById("ticketMessage").value;

  if (!message) {

    alert("Enter Message");

    return;
  }

  await supabase
    .from("tickets")
    .insert([{
      user_id: userId,
      message: message
    }]);

  alert("Ticket Submitted");

  document.getElementById("ticketMessage").value =
    "";

  loadTickets();
}

/* =========================
   LOAD TICKETS
========================= */
async function loadTickets() {

  const userId =
    localStorage.getItem("userId");

  const { data } =
    await supabase
      .from("tickets")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", {
        ascending: false
      });

  document.getElementById("ticketList")
    .innerHTML =
      data.map(t => `
        <div class="ticket-item">

          <p>${t.message}</p>

          <p>
            Status:
            ${t.status || 'Pending'}
          </p>

        </div>
      `).join('');
}

/* =========================
   LOGOUT
========================= */
function logout() {

  localStorage.removeItem("userId");

  location.href = "index.html";
}

/* =========================
   AUTO LOAD
========================= */
loadDashboard();
