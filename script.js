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
  window.userEmail = userEmail;

  // 💡 Now we ask permission for Drive access using Google API Client
  gapi.load("client:auth2", () => {
    gapi.auth2.init({
      client_id: "365525528200-srh7vjvn3mu9o3l3crhei3euvnmodauj.apps.googleusercontent.com", // replace with your actual client ID
      scope: "https://www.googleapis.com/auth/drive.file"
    }).then(() => {
      const authInstance = gapi.auth2.getAuthInstance();

      // Trigger the full OAuth consent dialog
        authInstance.signIn().then(googleUser => {
        accessToken = googleUser.getAuthResponse().access_token;
        console.log("Access Token for Drive:", accessToken);
        }).catch(error => {
        console.error("SignIn Error:", JSON.stringify(error, null, 2));
        });
    });
  });
}
