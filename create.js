const client = window.supabase.createClient(
  "https://qiwebjkxdazthitzdvhm.supabase.co",
  "public"
);

const form = document.getElementById("memorialForm");
const status = document.getElementById("statusMessage");
const imageInput = document.getElementById("imageUpload");
const thumbnail = document.getElementById("thumbnail");
const countrySelect = document.getElementById("countrySelect");

const countries = ["Cyprus", "Greece", "Italy", "United Kingdom", "United States", "Germany", "France"];
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
      console.error("Image upload error:", error);
      status.textContent = "Image upload failed.";
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
    console.error("Insert error:", insertError);
    status.textContent = "Submission failed. Check console.";
  } else {
    alert("Memorial submitted successfully and is pending review.");
    status.textContent = "Submission successful.";
    thumbnail.style.display = "none";
    form.reset();
  }
});
