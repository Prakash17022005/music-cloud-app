let accessToken = ""; // global variable to store Drive token

function handleGoogleLogin(response) {
  const jwt = response.credential;

  // Decode the JWT token to extract user info
  const payload = JSON.parse(atob(jwt.split('.')[1]));
  const userName = payload.name;
  const userEmail = payload.email;

  console.log("User logged in:", userName, userEmail);

  // Show welcome message and reveal upload section
  document.getElementById("login-section").innerHTML = `<p>Welcome, ${userName}!</p>`;
  document.getElementById("upload-section").style.display = "block";
  document.getElementById("song-list").style.display = "block";

  // Store for later use
  //window.userEmail = userEmail;

  // 💡 Now we ask permission for Drive access using Google API Client
  gapi.load("client:auth2", () => {
    gapi.auth2.init({
      client_id: "365525528200-srh7vjvn3mu9o3l3crhei3euvnmodauj.apps.googleusercontent.com",
      scope: "https://www.googleapis.com/auth/drive.file"
    }).then(() => {
      const authInstance = gapi.auth2.getAuthInstance();
      authInstance.signIn().then(googleUser => {
        accessToken = googleUser.getAuthResponse().access_token;
        console.log("🚀 Got Drive Access Token:", accessToken);
      });
    });
  });
}


// 🚀 Upload File Function
function uploadFile() {
  const fileInput = document.getElementById("file-input");
  const file = fileInput.files[0];

  if (!file) {
    alert("Please select a file first.");
    return;
  }

  const metadata = {
    name: file.name,
    mimeType: file.type
  };

  const form = new FormData();
  form.append("metadata", new Blob([JSON.stringify(metadata)], { type: "application/json" }));
  form.append("file", file);

  fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart", {
    method: "POST",
    headers: new Headers({ Authorization: "Bearer " + accessToken }),
    body: form
  })
    .then((res) => res.json())
    .then((data) => {
      console.log("✅ File uploaded:", data);
      alert(`File "${file.name}" uploaded successfully to your Drive!`);
    })
    .catch((err) => {
      console.error("❌ Upload error:", err);
      alert("Upload failed. See console for details.");
    });
}