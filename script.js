let accessToken = "";

function handleGoogleLogin(response) {
  const jwt = response.credential;
  const payload = JSON.parse(atob(jwt.split('.')[1]));
  const userName = payload.name;
  const userEmail = payload.email;

  console.log("User logged in:", userName, userEmail);

  const loginSection = document.getElementById("login-section");
  loginSection.innerHTML = `<p>Welcome, ${userName}!</p>`;

  document.getElementById("upload-section").style.display = "block";
  document.getElementById("song-list").style.display = "block";

  gapi.load("client:auth2", () => {
    gapi.auth2.init({
      client_id: "365525528200-srh7vjvn3mu9o3l3crhei3euvnmodauj.apps.googleusercontent.com",
      scope: "https://www.googleapis.com/auth/drive.file"
    }).then(() => {
      const authInstance = gapi.auth2.getAuthInstance();
      authInstance.signIn().then(googleUser => {
        accessToken = googleUser.getAuthResponse().access_token;
        console.log("🚀 Got Drive Access Token:", accessToken);
        listFiles();
      }).catch(error => {
        console.error("❌ Google Sign-In failed:", error);
      });
    });
  });
}

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
      listFiles();
    })
    .catch(err => {
      console.error("❌ Upload error:", err);
      alert("Upload failed. See console for details.");
    });
}

function listFiles() {
  fetch("https://www.googleapis.com/drive/v3/files?q=mimeType='audio/mpeg'&fields=files(id,name)", {
    method: "GET",
    headers: new Headers({ Authorization: "Bearer " + accessToken })
  })
    .then(res => res.json())
    .then(data => {
      const songList = document.getElementById("song-list");
      songList.innerHTML = "";

      if (data.files.length === 0) {
        songList.innerHTML = "<p>No songs found in your Drive.</p>";
        return;
      }

      data.files.forEach(file => {
        const fileURL = `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`;

        const audio = document.createElement("audio");
        audio.controls = true;
        audio.src = fileURL;

        const label = document.createElement("p");
        label.textContent = `🎵 ${file.name}`;

        songList.appendChild(label);
        songList.appendChild(audio);
      });
    })
    .catch(err => {
      console.error("❌ Error listing files:", err);
      alert("Failed to list files. Check console.");
    });
}

document.addEventListener("DOMContentLoaded", () => {
  const uploadBtn = document.getElementById("upload-btn");
  if (uploadBtn) {
    uploadBtn.addEventListener("click", uploadFile);
  }
});
