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

          <td>
            <input
              type="number"
              id="balance_${user.id}"
              placeholder="Amount"
            />

            <button onclick="
              addBalance(${user.id})
            ">
              Add
            </button>

            <button onclick="
              deductBalance(${user.id})
            ">
              Deduct
            </button>
          </td>

        </tr>
      `).join('');
}

/* =========================
   ADD BALANCE
========================= */
async function addBalance(userId) {

  const amount =
    Number(
      document.getElementById(
        `balance_${userId}`
      ).value
    );

  if (!amount || amount <= 0) {

    alert("Invalid Amount");

    return;
  }

  const { error } =
    await supabase
      .from("users")
      .update({
        balance:
          amount
      })
      .eq("id", userId);

  if (error) {

    alert(error.message);

    return;
  }

  alert("Balance Updated");

  loadUsers();
}

/* =========================
   DEDUCT BALANCE
========================= */
async function deductBalance(userId) {

  const amount =
    Number(
      document.getElementById(
        `balance_${userId}`
      ).value
    );

  if (!amount || amount <= 0) {

    alert("Invalid Amount");

    return;
  }

  const { data: user } =
    await supabase
      .from("users")
      .select("balance")
      .eq("id", userId)
      .single();

  const newBalance =
    (user.balance || 0) - amount;

  const { error } =
    await supabase
      .from("users")
      .update({
        balance:
          newBalance
      })
      .eq("id", userId);

  if (error) {

    alert(error.message);

    return;
  }

  alert("Balance Deducted");

  loadUsers();
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
              dep.receipt
              ? `
              <a href="${dep.receipt}"
                 target="_blank">
                 View
              </a>
              `
              : '-'
            }

          </td>

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
   SECURE APPROVE DEPOSIT
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
   SECURE REJECT DEPOSIT
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

          <td>${w.account_number || ''}</td>

          <td>${w.status}</td>

          <td>

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

          </td>

        </tr>
      `).join('');
}

/* =========================
   APPROVE WITHDRAWAL
========================= */
async function approveWithdrawal(id) {

  const { error } =
    await supabase
      .from("withdrawals")
      .update({
        status: 'approved'
      })
      .eq("id", id);

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
   LOAD SUPPORT TICKETS
========================= */
async function loadTickets() {

  const { data } =
    await supabase
      .from("tickets")
      .select("*")
      .order("created_at", {
        ascending: false
      });

  document.getElementById("ticketsTable")
    .innerHTML =
      data.map(t => `
        <tr>

          <td>${t.id}</td>

          <td>${t.user_id}</td>

          <td>${t.message}</td>

          <td>${t.status || 'Pending'}</td>

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
   ADD NEWS
========================= */
async function addNews() {

  const title =
    document.getElementById("newsTitle").value;

  const content =
    document.getElementById("newsContent").value;

  if (!title || !content) {

    alert("Fill all fields");

    return;
  }

  const { error } =
    await supabase
      .from("news")
      .insert([{
        title,
        content
      }]);

  if (error) {

    alert(error.message);

    return;
  }

  alert("News Added");

  document.getElementById("newsTitle").value = "";
  document.getElementById("newsContent").value = "";

  loadNews();
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

  document.getElementById("vipPlansTable")
    .innerHTML =
      data.map(v => `
        <tr>

          <td>${v.id}</td>

          <td>${v.name}</td>

          <td>${v.price}</td>

          <td>${v.daily_rate}%</td>

          <td>

            <input
              type="number"
              id="vip_${v.id}"
              placeholder="New Price"
            />

            <button onclick="
              updateVipPrice(${v.id})
            ">
              Update
            </button>

          </td>

        </tr>
      `).join('');
}

/* =========================
   UPDATE VIP PRICE
========================= */
async function updateVipPrice(vipId) {

  const price =
    Number(
      document.getElementById(
        `vip_${vipId}`
      ).value
    );

  if (!price || price <= 0) {

    alert("Invalid Price");

    return;
  }

  const { error } =
    await supabase
      .from("vip_plans")
      .update({
        price
      })
      .eq("id", vipId);

  if (error) {

    alert(error.message);

    return;
  }

  alert("VIP Price Updated");

  loadVipPlans();
}

/* =========================
   EXPORT WITHDRAWALS
========================= */
function exportWithdrawals() {

  const table =
    document.getElementById(
      "withdrawalsTable"
    );

  let csv =
    "ID,User ID,Amount,Account,Status\n";

  for (let row of table.rows) {

    csv += Array.from(row.cells)
      .slice(0, 5)
      .map(cell => cell.innerText)
      .join(",");

    csv += "\n";
  }

  const blob =
    new Blob([csv], {
      type: 'text/csv'
    });

  const url =
    URL.createObjectURL(blob);

  const a =
    document.createElement("a");

  a.href = url;

  a.download =
    "withdrawals.csv";

  a.click();
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
