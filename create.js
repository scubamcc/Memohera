
const supabase = supabase.createClient(
  "https://qiwebjkxdazthitzdvhm.supabase.co",
  "public"
);

const form = document.getElementById("memorialForm");
const status = document.getElementById("statusMessage");
const imageInput = document.getElementById("imageUpload");

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
    const { data, error } = await supabase.storage.from("memorial-photos")
      .upload(`images/${Date.now()}_${file.name}`, file, {
        cacheControl: "3600",
        upsert: false
      });

    if (error) {
      status.textContent = "Image upload failed.";
      return;
    }
    const { data: publicUrl } = supabase.storage.from("memorial-photos")
      .getPublicUrl(data.path);
    image_url = publicUrl.publicUrl;
  }

  const { error: insertError } = await supabase
    .from("memorials")
    .insert([{ full_name, dob, dod, story, image_url, country, approved: false }]);

  if (insertError) {
    status.textContent = "Submission failed. Please try again.";
  } else {
    status.textContent = "Memorial submitted successfully and is pending review.";
    form.reset();
  }
});
