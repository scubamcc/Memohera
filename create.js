const client = window.supabase.createClient(
  "https://qiwebjkxdazthitzdvhm.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFpd2Viamt4ZGF6dGhpdHpkdmhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIxMjM0NDUsImV4cCI6MjA2NzY5OTQ0NX0.mRAuy-WvmsejPr_SlBGm9AOvmuW8us7NB3KnjTuSOkw"
);

async function ensureAuth() {
  const {
    data: { session },
    error
  } = await client.auth.getSession();

  if (!session) {
    const { error: authError } = await client.auth.signInAnonymously();
    if (authError) {
      console.error("Auth failed:", authError.message);
      alert("Auth failed: " + authError.message);
    } else {
      console.log("Anonymous auth successful");
    }
  }
}

ensureAuth();

const form = document.getElementById("memorialForm");
const status = document.getElementById("statusMessage");
const imageInput = document.getElementById("imageUpload");
const thumbnail = document.getElementById("thumbnail");
const countrySelect = document.getElementById("countrySelect");

const countries = [
  "Afghanistan","Albania","Algeria","Andorra","Angola","Argentina","Armenia","Australia","Austria","Azerbaijan",
  "Bahamas","Bahrain","Bangladesh","Barbados","Belarus","Belgium","Belize","Benin","Bhutan","Bolivia",
  "Bosnia and Herzegovina","Botswana","Brazil","Brunei","Bulgaria","Burkina Faso","Burundi","Cabo Verde",
  "Cambodia","Cameroon","Canada","Central African Republic","Chad","Chile","China","Colombia","Comoros","Congo",
  "Costa Rica","Croatia","Cuba","Cyprus","Czech Republic","Denmark","Djibouti","Dominica","Dominican Republic",
  "Ecuador","Egypt","El Salvador","Equatorial Guinea","Eritrea","Estonia","Eswatini","Ethiopia","Fiji","Finland",
  "France","Gabon","Gambia","Georgia","Germany","Ghana","Greece","Grenada","Guatemala","Guinea","Guyana","Haiti",
  "Honduras","Hungary","Iceland","India","Indonesia","Iran","Iraq","Ireland","Israel","Italy","Ivory Coast",
  "Jamaica","Japan","Jordan","Kazakhstan","Kenya","Kiribati","Kuwait","Kyrgyzstan","Laos","Latvia","Lebanon",
  "Lesotho","Liberia","Libya","Liechtenstein","Lithuania","Luxembourg","Madagascar","Malawi","Malaysia","Maldives",
  "Mali","Malta","Mauritania","Mauritius","Mexico","Moldova","Monaco","Mongolia","Montenegro","Morocco","Mozambique",
  "Myanmar","Namibia","Nepal","Netherlands","New Zealand","Nicaragua","Niger","Nigeria","North Korea","North Macedonia",
  "Norway","Oman","Pakistan","Palau","Palestine","Panama","Papua New Guinea","Paraguay","Peru","Philippines","Poland",
  "Portugal","Qatar","Romania","Russia","Rwanda","Saint Kitts and Nevis","Saint Lucia","Samoa","San Marino",
  "Saudi Arabia","Senegal","Serbia","Seychelles","Sierra Leone","Singapore","Slovakia","Slovenia","Solomon Islands",
  "Somalia","South Africa","South Korea","South Sudan","Spain","Sri Lanka","Sudan","Suriname","Sweden","Switzerland",
  "Syria","Taiwan","Tajikistan","Tanzania","Thailand","Timor-Leste","Togo","Tonga","Trinidad and Tobago","Tunisia",
  "Turkey","Turkmenistan","Tuvalu","Uganda","Ukraine","United Arab Emirates","United Kingdom","United States","Uruguay",
  "Uzbekistan","Vanuatu","Venezuela","Vietnam","Yemen","Zambia","Zimbabwe"
];

countries.forEach(c => {
  const option = document.createElement("option");
  option.value = c;
  option.textContent = c;
  countrySelect.appendChild(option);
});

imageInput.addEventListener("change", () => {
  const file = imageInput.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = e => {
      thumbnail.src = e.target.result;
      thumbnail.style.display = "block";
    };
    reader.readAsDataURL(file);
  }
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  status.textContent = "Submitting...";

  const formData = new FormData(form);
  const full_name = formData.get("full_name");
  const dob = formData.get("dob");
  const dod = formData.get("dod");
  const story = formData.get("story");
  const country = formData.get("country");

  if (new Date(dod) > new Date()) {
    status.textContent = "Date of death cannot be in the future.";
    return;
  }

  let image_url = "";
  const file = imageInput.files[0];
  if (file) {
    const { data, error } = await client.storage.from("memorial-photos")
      .upload(`images/${Date.now()}_${file.name}`, file);

    if (error) {
      console.error("Image upload error:", error.message);
      status.textContent = "Image upload failed: " + error.message;
      return;
    }

    const { data: publicUrl } = client.storage.from("memorial-photos")
      .getPublicUrl(data.path);
    image_url = publicUrl.publicUrl;
  }

  const { error: insertError } = await client
    .from("memorials")
    .insert([{ full_name, dob, dod, story, image_url, country, approved: false }]);

  if (insertError) {
    console.error("Insert error:", insertError.message);
    status.textContent = "Submission failed: " + insertError.message;
  } else {
    alert("Memorial submitted successfully and is pending review.");
    status.textContent = "Submission successful.";
    thumbnail.style.display = "none";
    form.reset();
  }
});
