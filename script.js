let accessToken = ""; // Google Drive access token

function handleGoogleLogin(response) {
  const jwt = response.credential;
  const payload = JSON.parse(atob(jwt.split('.')[1]));
  const userName = payload.name;
  const userEmail = payload.email;

  console.log("User logged in:", userName, userEmail);

  // Safely show welcome message
  const loginSection = document.getElementById("login-section");
  loginSection.innerHTML = "";

  const welcomeMsg = document.createElement("p");
  welcomeMsg.textContent = `Welcome, ${userName}!`;
  loginSection.appendChild(welcomeMsg);

  // Show upload UI
  document.getElementById("upload-section").style.display = "block";
  document.getElementById("song-list").style.display = "block";

  // Ask for Drive access
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

// Upload file to Drive
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
    .then(res => res.json())
    .then(data => {
      console.log("✅ File uploaded:", data);
      alert(`File "${file.name}" uploaded successfully to your Drive!`);
    })
    .catch(err => {
      console.error("❌ Upload error:", err);
      alert("Upload failed. See console for details.");
    });
}

// Attach event listener safely after DOM loads
document.addEventListener("DOMContentLoaded", () => {
  const uploadBtn = document.getElementById("upload-btn");
  if (uploadBtn) {
    uploadBtn.addEventListener("click", uploadFile);
  }
});
