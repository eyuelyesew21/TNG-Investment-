const supabase = window.supabase.createClient(
  "https://dknksfcesarrvyfufdti.supabase.co",
  "YOUR_ANON_KEY"
);

/* =========================
   ADMIN CHECK
========================= */
async function checkAdmin() {

  const adminEmail =
    localStorage.getItem("adminEmail");

  if (!adminEmail) {

    location.href = "index.html";

    return;
  }

  const { data } =
    await supabase
      .from("admins")
      .select("*")
      .eq("email", adminEmail)
      .single();

  if (!data) {

    alert("Access Denied");

    location.href = "index.html";

    return;
  }

  loadDashboard();
}

/* =========================
   LOAD DASHBOARD
========================= */
async function loadDashboard() {

  loadUsers();

  loadDeposits();

  loadWithdrawals();

  loadTickets();

  loadNews();

  loadVipPlans();

loadPasswordResets();
}

/* =========================
   LOAD ANALYTICS
========================= */

async function loadAnalytics() {

  /* TOTAL USERS */

  const {
    count: usersCount
  } =
    await supabase
      .from("users")
      .select(
        "*",
        {
          count: "exact",
          head: true
        }
      );

  document.getElementById(
    "totalUsers"
  ).innerText =
    usersCount || 0;

  /* TOTAL DEPOSITS */

  const {
    data: deposits
  } =
    await supabase
      .from("deposits")
      .select("amount");

  const totalDeposits =
    deposits?.reduce(
      (sum, d) =>
        sum + Number(d.amount),
      0
    ) || 0;

  document.getElementById(
    "totalDeposits"
  ).innerText =
    totalDeposits;

  /* TOTAL WITHDRAWALS */

  const {
    data: withdrawals
  } =
    await supabase
      .from("withdrawals")
      .select("amount");

  const totalWithdrawals =
    withdrawals?.reduce(
      (sum, w) =>
        sum + Number(w.amount),
      0
    ) || 0;

  document.getElementById(
    "totalWithdrawals"
  ).innerText =
    totalWithdrawals;

  /* PENDING DEPOSITS */

  const {
    count: pendingDep
  } =
    await supabase
      .from("deposits")
      .select(
        "*",
        {
          count: "exact",
          head: true
        }
      )
      .eq(
        "status",
        "pending"
      );

  document.getElementById(
    "pendingDeposits"
  ).innerText =
    pendingDep || 0;

  /* PENDING WITHDRAWALS */

  const {
    count: pendingWith
  } =
    await supabase
      .from("withdrawals")
      .select(
        "*",
        {
          count: "exact",
          head: true
        }
      )
      .eq(
        "status",
        "pending"
      );

  document.getElementById(
    "pendingWithdrawals"
  ).innerText =
    pendingWith || 0;
}
/* =========================
   LOAD USERS
========================= */
async function loadUsers() {

  const { data } =
    await supabase
      .from("users")
      .select("*")
      .order("id", {
        ascending: false
      });

  document.getElementById("usersTable")
    .innerHTML =
      data.map(user => `
        <tr>

          <td>${user.id}</td>

          <td>${user.email || ''}</td>

          <td>${user.balance || 0}</td>

        </tr>
      `).join('');
}

/* =========================
   LOAD DEPOSITS
========================= */
async function loadDeposits() {

  const { data } =
    await supabase
      .from("deposits")
      .select("*")
      .order("created_at", {
        ascending: false
      });

  document.getElementById("depositsTable")
    .innerHTML =
      data.map(dep => `
        <tr>

          <td>${dep.id}</td>

          <td>${dep.user_id}</td>

          <td>${dep.amount}</td>

          <td>${dep.method}</td>

          <td>${dep.transaction_id}</td>

          <td>${dep.status}</td>

          <td>

            ${
              dep.status === 'pending'
              ? `
              <button onclick="
                approveDeposit(${dep.id})
              ">
                Approve
              </button>

              <button onclick="
                rejectDeposit(${dep.id})
              ">
                Reject
              </button>
              `
              : dep.status
            }

          </td>

        </tr>
      `).join('');
}

/* =========================
   APPROVE DEPOSIT
========================= */
async function approveDeposit(id) {

  const adminEmail =
    localStorage.getItem("adminEmail");

  const { error } =
    await supabase.rpc(
      "approve_deposit",
      {
        p_deposit_id: id,
        p_admin_email: adminEmail
      }
    );

  if (error) {

    alert(error.message);

    return;
  }

  alert("Deposit Approved");

  loadDeposits();

  loadUsers();
}

/* =========================
   REJECT DEPOSIT
========================= */
async function rejectDeposit(id) {

  const { error } =
    await supabase.rpc(
      "reject_deposit",
      {
        p_deposit_id: id
      }
    );

  if (error) {

    alert(error.message);

    return;
  }

  alert("Deposit Rejected");

  loadDeposits();
}

/* =========================
   LOAD WITHDRAWALS
========================= */
async function loadWithdrawals() {

  const { data } =
    await supabase
      .from("withdrawals")
      .select("*")
      .order("created_at", {
        ascending: false
      });

  document.getElementById("withdrawalsTable")
    .innerHTML =
      data.map(w => `
        <tr>

          <td>${w.id}</td>

          <td>${w.user_id}</td>

          <td>${w.amount}</td>

          <td>${w.fee}</td>

          <td>${w.final_amount}</td>

          <td>${w.account_number}</td>

          <td>${w.status}</td>

          <td>

            ${
              w.status === 'pending'
              ? `
              <button onclick="
                approveWithdrawal(${w.id})
              ">
                Approve
              </button>

              <button onclick="
                rejectWithdrawal(${w.id})
              ">
                Reject
              </button>
              `
              : w.status
            }

          </td>

        </tr>
      `).join('');
}

/* =========================
   APPROVE WITHDRAWAL
========================= */
async function approveWithdrawal(id) {

  const adminEmail =
    localStorage.getItem("adminEmail");

  const { error } =
    await supabase.rpc(
      "approve_withdrawal",
      {
        p_withdrawal_id: id,
        p_admin_email: adminEmail
      }
    );

  if (error) {

    alert(error.message);

    return;
  }

  alert("Withdrawal Approved");

  loadWithdrawals();
}

/* =========================
   REJECT WITHDRAWAL
========================= */
async function rejectWithdrawal(id) {

  const { error } =
    await supabase
      .from("withdrawals")
      .update({
        status: 'rejected'
      })
      .eq("id", id);

  if (error) {

    alert(error.message);

    return;
  }

  alert("Withdrawal Rejected");

  loadWithdrawals();
}

/* =========================
   LOAD TICKETS
========================= */
async function loadTickets() {

  const { data } =
    await supabase
      .from("tickets")
      .select("*")
      .order("created_at", {
        ascending: false
      });

/* =========================
   LOAD PASSWORD RESETS
========================= */

async function loadPasswordResets() {

  const { data } =
    await supabase
      .from("tickets")
      .select("*")
      .eq(
        "category",
        "password_reset"
      )
      .order(
        "created_at",
        {
          ascending: false
        }
      );

  document.getElementById(
    "passwordResetTable"
  ).innerHTML =
    data.map(t => `
      <tr>

        <td>${t.id}</td>

        <td>${t.user_id}</td>

        <td>${t.message}</td>

        <td>

          <textarea
            id="reply-${t.id}"
            placeholder="Admin reply"
          >${t.admin_reply || ''}</textarea>

        </td>

        <td>

          <button onclick="
            replyPasswordReset(
              ${t.id}
            )
          ">
            Send Reply
          </button>

        </td>

      </tr>
    `).join('');
}

/* =========================
   REPLY PASSWORD RESET
========================= */

async function replyPasswordReset(
  ticketId
) {

  const reply =
    document.getElementById(
      `reply-${ticketId}`
    ).value;

  if (!reply) {

    alert("Enter reply");

    return;
  }

  const { error } =
    await supabase
      .from("tickets")
      .update({

        admin_reply: reply,

        status: 'answered',

        replied_at:
          new Date()

      })
      .eq("id", ticketId);

  if (error) {

    alert(error.message);

    return;
  }

  alert("Reply sent");

  loadPasswordResets();
}

  document.getElementById("ticketsTable")
    .innerHTML =
      data.map(t => `
        <tr>

          <td>${t.id}</td>

          <td>${t.user_id}</td>

          <td>${t.message}</td>

          <td>${t.status}</td>

        </tr>
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

  document.getElementById("newsTable")
    .innerHTML =
      data.map(n => `
        <tr>

          <td>${n.title}</td>

          <td>${n.content}</td>

        </tr>
      `).join('');
}

/* =========================
   LOAD VIP PLANS
========================= */
async function loadVipPlans() {

  const { data } =
    await supabase
      .from("vip_plans")
      .select("*");

  document.getElementById("vipPlansTable")
    .innerHTML =
      data.map(v => `
        <tr>

          <td>${v.id}</td>

          <td>${v.name}</td>

          <td>${v.price}</td>

          <td>${v.daily_rate}%</td>

        </tr>
      `).join('');
}

/* =========================
   LOGOUT
========================= */
function logout() {

  localStorage.removeItem("adminEmail");

  location.href = "index.html";
}

/* =========================
   START
========================= */
checkAdmin();

/* =========================
   ADMIN AUTO LOGOUT
========================= */

let adminInactivityTimer;

function resetAdminTimer() {

  clearTimeout(adminInactivityTimer);

  adminInactivityTimer =
    setTimeout(() => {

      alert(
        "Admin session expired"
      );

      logout();

    }, 15 * 60 * 1000);

}

document.addEventListener(
  "mousemove",
  resetAdminTimer
);

document.addEventListener(
  "keydown",
  resetAdminTimer
);

document.addEventListener(
  "click",
  resetAdminTimer
);

document.addEventListener(
  "touchstart",
  resetAdminTimer
);

resetAdminTimer();
