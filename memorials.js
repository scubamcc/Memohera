
const supabase = supabase.createClient(
  "https://qiwebjkxdazthitzdvhm.supabase.co",
  "public"
);

const searchBox = document.getElementById("searchBox");
const list = document.getElementById("memorialList");

searchBox.addEventListener("input", loadMemorials);

async function loadMemorials() {
  const search = searchBox.value.toLowerCase();

  const { data, error } = await supabase
    .from("memorials")
    .select("*")
    .eq("approved", true)
    .order("created_at", { ascending: false });

  list.innerHTML = "";

  if (error) {
    list.innerHTML = "<li>Error loading memorials.</li>";
    return;
  }

  const filtered = data.filter(mem =>
    mem.full_name.toLowerCase().includes(search) ||
    mem.country.toLowerCase().includes(search)
  );

  if (filtered.length === 0) {
    list.innerHTML = "<li>No results found.</li>";
    return;
  }

  filtered.forEach(mem => {
    const li = document.createElement("li");
    li.innerHTML = `
      <strong>${mem.full_name}</strong> (${mem.country})<br>
      <em>${mem.dob} – ${mem.dod}</em><br>
      <p>${mem.story}</p>
      ${mem.image_url ? `<img src="${mem.image_url}" /><br>` : ""}
      <hr>
    `;
    list.appendChild(li);
  });
}

loadMemorials();
