<script type="module">
  import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const client = window.supabase.createClient(
  "https://qiwebjkxdazthitzdvhm.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFpd2Viamt4ZGF6dGhpdHpkdmhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIxMjM0NDUsImV4cCI6MjA2NzY5OTQ0NX0.mRAuy-WvmsejPr_SlBGm9AOvmuW8us7NB3KnjTuSOkw"
);



  // ✅ Ensure the user is authenticated anonymously
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

  if (!sessionData.session) {
    const { error: signInError } = await supabase.auth.signInAnonymously();
    if (signInError) {
      alert("Anonymous auth failed: " + signInError.message);
      throw signInError;
    }
  }

  document.getElementById("memorialForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const fullName = document.getElementById("full_name").value;
    const dob = document.getElementById("dob").value;
    const dod = document.getElementById("dod").value;
    const story = document.getElementById("story").value;
    const country = document.getElementById("country").value;
    const imageFile = document.getElementById("image").files[0];

    if (!imageFile) return alert("Please select an image.");

    const filePath = `memorial-${Date.now()}-${imageFile.name}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("memorial-photos")
      .upload(filePath, imageFile);

    if (uploadError) {
      alert("Image upload failed: " + uploadError.message);
      return;
    }

    const imageUrl = `https://qiwebjkxdazthitzdvhm.supabase.co/storage/v1/object/public/memorial-photos/${filePath}`;

    const { error: insertError } = await supabase
      .from("memorials")
      .insert([{ full_name: fullName, dob, dod, story, image_url: imageUrl, country }]);

    if (insertError) {
      alert("Data insert failed: " + insertError.message);
    } else {
      alert("Memorial submitted successfully.");
      document.getElementById("memorialForm").reset();
    }
  });
</script>
