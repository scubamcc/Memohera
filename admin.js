
const PASSWORD = "memohera2025";

const supabase = supabase.createClient(
  "https://qiwebjkxdazthitzdvhm.supabase.co",
  "public"
);

function login() {
  const input = document.getElementById("adminPassword").value;
  const message = document.getElementById("loginMessage");
  if (input === PASSWORD) {
    document.getElementById("loginPanel").style.display = "none";
    document.getElementById("adminDashboard").style.display = "block";
    loadPending();
  } else {
    message.textContent = "Incorrect password.";
  }
}

async function loadPending() {
  const { data, error } = await supabase
    .from("memorials")
    .select("*")
    .eq("approved", false)
    .order("created_at", { ascending: false });

  const list = document.getElementById("pendingList");
  list.innerHTML = "";

  if (error || !data) {
    list.innerHTML = "<li>Error loading data.</li>";
    return;
  }

  data.forEach(mem => {
    const li = document.createElement("li");
    li.innerHTML = `
      <strong>${mem.full_name}</strong> (${mem.country})<br>
      <em>${mem.dob} – ${mem.dod}</em><br>
      <p>${mem.story}</p>
      ${mem.image_url ? `<img src="${mem.image_url}" width="150"/><br>` : ""}
      <button onclick="approve(${mem.id})">Approve</button>
      <button onclick="remove(${mem.id})">Delete</button>
      <hr>
    `;
    list.appendChild(li);
  });
}

async function approve(id) {
  await supabase.from("memorials").update({ approved: true }).eq("id", id);
  loadPending();
}

async function remove(id) {
  await supabase.from("memorials").delete().eq("id", id);
  loadPending();
}
