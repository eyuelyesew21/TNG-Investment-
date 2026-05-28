const supabase = window.supabase.createClient(
  "https://dknksfcesarrvyfufdti.supabase.co",
  "YOUR_ANON_KEY"
);

/* ADMIN LOGIN */
function adminLogin() {

  const password =
    document.getElementById("adminPassword").value;

  if (password === "123456") {

    document.getElementById("adminPanel")
      .style.display = "block";

    loadDeposits();

    loadWithdrawals();

    loadTickets();

  } else {

    alert("Wrong Password");
  }
}

/* LOAD DEPOSITS */
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

        <p>TX ID: ${d.transaction_id}</p>

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

/* APPROVE DEPOSIT */
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

  const { data: user } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();

  await supabase
    .from("users")
    .update({
      balance:
        Number(user.balance) + Number(amount)
    })
    .eq("id", userId);

  alert("Deposit Approved");

  loadDeposits();
}

/* REJECT DEPOSIT */
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

/* LOAD WITHDRAWALS */
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

/* APPROVE WITHDRAW */
async function approveWithdraw(
  id,
  userId,
  net
) {

  await supabase
    .from("withdrawals")
    .update({
      status: "approved"
    })
    .eq("id", id);

  const { data: user } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();

  await supabase
    .from("users")
    .update({
      balance:
        Number(user.balance) - Number(net)
    })
    .eq("id", userId);

  alert("Withdrawal Approved");

  loadWithdrawals();
}

/* REJECT WITHDRAW */
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

/* EXPORT CSV */
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

/* POST NEWS */
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
}

/* LOAD TICKETS */
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

/* ADD BALANCE */
async function addBalance() {

  const userId =
    document.getElementById("targetUserId").value;

  const amount =
    Number(
      document.getElementById("balanceAmount").value
    );

  const { data: user } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();

  await supabase
    .from("users")
    .update({
      balance:
        Number(user.balance) + amount
    })
    .eq("id", userId);

  alert("Balance Added");
}

/* REMOVE BALANCE */
async function removeBalance() {

  const userId =
    document.getElementById("targetUserId").value;

  const amount =
    Number(
      document.getElementById("balanceAmount").value
    );

  const { data: user } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();

  await supabase
    .from("users")
    .update({
      balance:
        Number(user.balance) - amount
    })
    .eq("id", userId);

  alert("Balance Removed");
}

/* UPDATE VIP PRICE */
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
