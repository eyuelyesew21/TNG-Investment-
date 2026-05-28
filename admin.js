const supabase = window.supabase.createClient(
  "https://dknksfcesarrvyfufdti.supabase.co",
  "YOUR_ANON_KEY"
);

/* =========================
   ADMIN LOGIN
========================= */
async function adminLogin() {

  const email =
    document.getElementById("adminEmail").value;

  const password =
    document.getElementById("adminPassword").value;

  const { data, error } =
    await supabase.auth.signInWithPassword({
      email,
      password
    });

  if (error) {

    alert(error.message);

    return;
  }

  const { data: admin } =
    await supabase
      .from("admins")
      .select("*")
      .eq("email", email)
      .single();

  if (!admin) {

    alert("Access Denied");

    await supabase.auth.signOut();

    return;
  }

  document.getElementById("adminPanel")
    .style.display = "block";

  loadDeposits();

  loadWithdrawals();

  loadTickets();

  loadNews();
}

/* =========================
   AUTO SESSION
========================= */
async function checkAdminSession() {

  const {
    data: { session }
  } = await supabase.auth.getSession();

  if (!session) return;

  const email =
    session.user.email;

  const { data: admin } =
    await supabase
      .from("admins")
      .select("*")
      .eq("email", email)
      .single();

  if (admin) {

    document.getElementById("adminPanel")
      .style.display = "block";

    loadDeposits();

    loadWithdrawals();

    loadTickets();

    loadNews();
  }
}

checkAdminSession();

/* =========================
   LOGOUT
========================= */
async function logoutAdmin() {

  await supabase.auth.signOut();

  location.reload();
}

/* =========================
   LOAD DEPOSITS
========================= */
async function loadDeposits() {

  const { data } = await supabase
    .from("deposits")
    .select("*")
    .eq("status", "pending");

  document.getElementById("depositList").innerHTML =
    data.map(d => `
      <div class="item">

        <p>User ID: ${d.user_id}</p>

        <p>Amount: ${d.amount}</p>

        <p>Method: ${d.method}</p>

        <p>Transaction: ${d.transaction_id}</p>

        <button onclick="
          approveDeposit(
            ${d.id},
            ${d.user_id},
            ${d.amount}
          )
        ">
          Approve
        </button>

        <button onclick="
          rejectDeposit(${d.id})
        ">
          Reject
        </button>

      </div>
    `).join('');
}

/* =========================
   APPROVE DEPOSIT
========================= */
async function approveDeposit(
  depositId,
  userId,
  amount
) {

  await supabase
    .from("deposits")
    .update({
      status: "approved"
    })
    .eq("id", depositId);

  await supabase.rpc(
    "add_user_balance",
    {
      target_user_id: userId,
      amount: amount
    }
  );

  alert("Deposit Approved");

  loadDeposits();
}

/* =========================
   REJECT DEPOSIT
========================= */
async function rejectDeposit(id) {

  await supabase
    .from("deposits")
    .update({
      status: "rejected"
    })
    .eq("id", id);

  alert("Deposit Rejected");

  loadDeposits();
}

/* =========================
   LOAD WITHDRAWALS
========================= */
async function loadWithdrawals() {

  const { data } = await supabase
    .from("withdrawals")
    .select(`
      *,
      users (
        phone,
        bank_name,
        bank_account
      )
    `)
    .eq("status", "pending");

  document.getElementById("withdrawList").innerHTML =
    data.map(w => `
      <div class="item">

        <p>Phone: ${w.users.phone}</p>

        <p>Bank: ${w.users.bank_name}</p>

        <p>Account: ${w.users.bank_account}</p>

        <p>Amount: ${w.amount}</p>

        <p>Net Amount: ${w.net_amount}</p>

        <button onclick="
          approveWithdraw(
            ${w.id},
            ${w.user_id},
            ${w.net_amount}
          )
        ">
          Approve
        </button>

        <button onclick="
          rejectWithdraw(${w.id})
        ">
          Reject
        </button>

      </div>
    `).join('');
}

/* =========================
   APPROVE WITHDRAW
========================= */
async function approveWithdraw(
  id,
  userId,
  amount
) {

  await supabase
    .from("withdrawals")
    .update({
      status: "approved"
    })
    .eq("id", id);

  await supabase.rpc(
    "remove_user_balance",
    {
      target_user_id: userId,
      amount: amount
    }
  );

  alert("Withdrawal Approved");

  loadWithdrawals();
}

/* =========================
   REJECT WITHDRAW
========================= */
async function rejectWithdraw(id) {

  await supabase
    .from("withdrawals")
    .update({
      status: "rejected"
    })
    .eq("id", id);

  alert("Withdrawal Rejected");

  loadWithdrawals();
}

/* =========================
   EXPORT CSV
========================= */
async function exportWithdrawals() {

  const { data } = await supabase
    .from("withdrawals")
    .select(`
      *,
      users (
        phone,
        bank_name,
        bank_account
      )
    `)
    .eq("status", "pending");

  let csv =
    "Phone,Bank,Account,Amount,Net Amount\n";

  data.forEach(w => {

    csv += `${w.users.phone},`;

    csv += `${w.users.bank_name},`;

    csv += `${w.users.bank_account},`;

    csv += `${w.amount},`;

    csv += `${w.net_amount}\n`;

  });

  const blob =
    new Blob([csv], {
      type: "text/csv"
    });

  const a =
    document.createElement("a");

  a.href =
    URL.createObjectURL(blob);

  a.download =
    "withdrawals.csv";

  a.click();
}

/* =========================
   POST NEWS
========================= */
async function postNews() {

  const title =
    document.getElementById("newsTitle").value;

  const content =
    document.getElementById("newsContent").value;

  await supabase
    .from("news")
    .insert([{
      title,
      content
    }]);

  alert("News Published");

  loadNews();
}

/* =========================
   LOAD NEWS
========================= */
async function loadNews() {

  const { data } = await supabase
    .from("news")
    .select("*")
    .order("created_at", {
      ascending: false
    });

  console.log(data);
}

/* =========================
   LOAD SUPPORT TICKETS
========================= */
async function loadTickets() {

  const { data } = await supabase
    .from("tickets")
    .select("*")
    .order("created_at", {
      ascending: false
    });

  document.getElementById("ticketList").innerHTML =
    data.map(t => `
      <div class="item">

        <p>User ID: ${t.user_id}</p>

        <p>${t.message}</p>

      </div>
    `).join('');
}

/* =========================
   ADD BALANCE
========================= */
async function addBalance() {

  const userId =
    document.getElementById("targetUserId").value;

  const amount =
    Number(
      document.getElementById("balanceAmount").value
    );

  await supabase.rpc(
    "add_user_balance",
    {
      target_user_id: userId,
      amount: amount
    }
  );

  alert("Balance Added");
}

/* =========================
   REMOVE BALANCE
========================= */
async function removeBalance() {

  const userId =
    document.getElementById("targetUserId").value;

  const amount =
    Number(
      document.getElementById("balanceAmount").value
    );

  await supabase.rpc(
    "remove_user_balance",
    {
      target_user_id: userId,
      amount: amount
    }
  );

  alert("Balance Removed");
}

/* =========================
   UPDATE VIP PRICE
========================= */
async function updateVipPrice() {

  const vip =
    document.getElementById("vipName").value;

  const price =
    document.getElementById("vipPrice").value;

  await supabase
    .from("vip_plans")
    .update({
      price: price
    })
    .eq("name", vip);

  alert("VIP Price Updated");
}
