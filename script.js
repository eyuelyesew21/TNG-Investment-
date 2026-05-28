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

  loadIncomeHistory();

  loadWithdrawals();

  loadDeposits();

  loadNews();

  loadChats();

  loadTickets();
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

          <p>VIP Life:
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
   BUY VIP
========================= */
async function buyVip(vipId) {

  const userId =
    localStorage.getItem("userId");

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

  alert("VIP Purchased");

  loadDashboard();
}

/* =========================
   CLAIM DAILY INCOME
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

  alert("Income Claimed");

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
   SUBMIT DEPOSIT
========================= */
async function submitDeposit() {

  const userId =
    localStorage.getItem("userId");

  const amount =
    document.getElementById(
      "depositAmount"
    ).value;

  const method =
    document.getElementById(
      "depositMethod"
    ).value;

  const transactionId =
    document.getElementById(
      "transactionId"
    ).value;

  const receipt =
    document.getElementById(
      "receipt"
    ).value;

  const { error } =
    await supabase
      .from("deposits")
      .insert([{
        user_id: userId,
        amount,
        method,
        transaction_id: transactionId,
        receipt,
        status: 'pending'
      }]);

  if (error) {

    alert(error.message);

    return;
  }

  alert(
    "Deposit Submitted Successfully"
  );

  loadDeposits();
}

/* =========================
   LOAD DEPOSITS
========================= */
async function loadDeposits() {

  const userId =
    localStorage.getItem("userId");

  const { data } =
    await supabase
      .from("deposits")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", {
        ascending: false
      });

  document.getElementById("depositHistory")
    .innerHTML =
      data.map(dep => `
        <div class="deposit-item">

          <p>
            Amount:
            ${dep.amount}
          </p>

          <p>
            Status:
            ${dep.status}
          </p>

        </div>
      `).join('');
}

/* =========================
   SUBMIT WITHDRAWAL
========================= */
async function submitWithdrawal() {

  const userId =
    localStorage.getItem("userId");

  const amount =
    Number(
      document.getElementById(
        "withdrawAmount"
      ).value
    );

  const account =
    document.getElementById(
      "withdrawAccount"
    ).value;

  if (!amount || !account) {

    alert("Fill all fields");

    return;
  }

  const { error } =
    await supabase.rpc(
      "secure_withdraw",
      {
        p_user_id: userId,
        p_amount: amount,
        p_account: account
      }
    );

  if (error) {

    alert(error.message);

    return;
  }

  alert(
    "Withdrawal Request Submitted"
  );

  loadDashboard();
}

/* =========================
   LOAD WITHDRAWALS
========================= */
async function loadWithdrawals() {

  const userId =
    localStorage.getItem("userId");

  const { data } =
    await supabase
      .from("withdrawals")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", {
        ascending: false
      });

  document.getElementById("withdrawHistory")
    .innerHTML =
      data.map(w => `
        <div class="withdraw-item">

          <p>
            Amount:
            ${w.amount}
          </p>

          <p>
            Fee:
            ${w.fee}
          </p>

          <p>
            Final:
            ${w.final_amount}
          </p>

          <p>
            Status:
            ${w.status}
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
    document.getElementById(
      "chatMessage"
    ).value;

  if (!message) return;

  await supabase
    .from("chats")
    .insert([{
      user_id: userId,
      message
    }]);

  document.getElementById(
    "chatMessage"
  ).value = "";

  loadChats();
}

/* =========================
   SUBMIT SUPPORT TICKET
========================= */
async function submitTicket() {

  const userId =
    localStorage.getItem("userId");

  const message =
    document.getElementById(
      "ticketMessage"
    ).value;

  if (!message) {

    alert("Enter Message");

    return;
  }


/* =========================
   PASSWORD RESET REQUEST
========================= */

async function submitPasswordReset() {

  const userId =
    localStorage.getItem("userId");

  const phone =
    document.getElementById(
      "resetPhone"
    ).value;

  const reason =
    document.getElementById(
      "resetReason"
    ).value;

  if (!phone || !reason) {

    alert("Fill all fields");

    return;
  }

  const { error } =
    await supabase
      .from("tickets")
      .insert([{

        user_id: userId,

        category:
          'password_reset',

        message:
          `
Phone:
${phone}

Problem:
${reason}
          `,

        status:
          'pending'

      }]);

  if (error) {

    alert(error.message);

    return;
  }

  alert(
    "Password reset request sent"
  );

  document.getElementById(
    "resetPhone"
  ).value = "";

  document.getElementById(
    "resetReason"
  ).value = "";

  loadTickets();
}
  await supabase
    .from("tickets")
    .insert([{
      user_id: userId,
      message,
      status: 'pending'
    }]);

  alert("Ticket Submitted");

  document.getElementById(
    "ticketMessage"
  ).value = "";

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

/* =========================
   LOAD NOTIFICATIONS
========================= */

async function loadNotifications() {

  const userId =
    localStorage.getItem("userId");

  const { data } =
    await supabase
      .from("tickets")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "answered")
      .eq("is_read", false)
      .order("replied_at", {
        ascending: false
      });

  document.getElementById(
    "notifications"
  ).innerHTML =
    data.map(n => `
      <div class="notification-box">

        <h4>
          Admin Reply
        </h4>

        <p>
          ${n.admin_reply}
        </p>

        <button onclick="
          markNotificationRead(
            ${n.id}
          )
        ">
          Mark as Read
        </button>

      </div>
    `).join('');
}

/* =========================
   MARK AS READ
========================= */

async function markNotificationRead(
  id
) {

  await supabase
    .from("tickets")
    .update({
      is_read: true
    })
    .eq("id", id);

  loadNotifications();
}

  document.getElementById("ticketList")
    .innerHTML =
      data.map(t => `
        <div class="ticket-item">

          <p>${t.message}</p>

          <p>Status:
            ${t.status}
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
   START
========================= */
loadDashboard();

/* =========================
   AUTO LOGOUT SECURITY
========================= */

let inactivityTimer;

/* RESET TIMER */
function resetInactivityTimer() {

  clearTimeout(inactivityTimer);

  inactivityTimer =
    setTimeout(() => {

      alert(
        "Session expired due to inactivity"
      );

      logout();

    }, 15 * 60 * 1000);

}

/* USER ACTIVITY EVENTS */
document.addEventListener(
  "mousemove",
  resetInactivityTimer
);

document.addEventListener(
  "keydown",
  resetInactivityTimer
);

document.addEventListener(
  "click",
  resetInactivityTimer
);

document.addEventListener(
  "touchstart",
  resetInactivityTimer
);

/* START TIMER */
resetInactivityTimer();
