// ----------------- Login Page Logic -----------------
if(document.getElementById('login-form')){
  const loginForm = document.getElementById('login-form');
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;

    if(username === '' || password === ''){
      alert('Please enter both username and password');
      return;
    }

    const registeredUsers = JSON.parse(localStorage.getItem('users') || '{}');
    if(registeredUsers[username] && registeredUsers[username].password === password){
      if(document.getElementById('rememberMe').checked){
        localStorage.setItem('rememberedUser', username);
      } else {
        localStorage.removeItem('rememberedUser');
      }
      localStorage.setItem('loggedInUser', username);
      window.location.href = 'dashboard.html';
    } else {
      alert('Invalid Credentials');
    }
  });

  // Auto-fill remembered username
  window.onload = () => {
    const rememberedUser = localStorage.getItem('rememberedUser');
    if(rememberedUser) {
      document.getElementById('username').value = rememberedUser;
      document.getElementById('rememberMe').checked = true;
    }
  };
}

// ----------------- Signup Page Logic -----------------
if(document.getElementById('signup-form')){
  const signupForm = document.getElementById('signup-form');
  signupForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const username = document.getElementById('signup-username').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value;
    const passwordConfirm = document.getElementById('signup-password-confirm').value;

    if(password !== passwordConfirm){
      alert("Passwords don't match!");
      return;
    }

    if(!username || !email || !password){
      alert("All fields are required!");
      return;
    }

    let users = JSON.parse(localStorage.getItem('users') || '{}');
    if(users[username]){
      alert('Username already exists, please try another.');
      return;
    }

    users[username] = { email, password };
    localStorage.setItem('users', JSON.stringify(users));
    alert(`User ${username} registered successfully. Please login.`);
    window.location.href = 'index.html';
  });
}

// ----------------- Dashboard & Explore Logic -----------------
if(document.body.querySelector('.navbar')) {
  const loggedInUser = localStorage.getItem('loggedInUser');
  if(!loggedInUser){
    window.location.href = 'index.html';
  }

  // Elements
  const greetingEl = document.getElementById('greeting-msg');
  const logoutBtn = document.getElementById('logout');
  const themeBtn = document.getElementById('theme-toggle');
  const exploreBtn = document.getElementById('explore-btn');
  const destinationInput = document.getElementById('destination-input');
  const resultsSection = document.getElementById('results-section');

  // Greeting based on time
  const hour = new Date().getHours();
  let greetingText = 'Hello';
  if(hour >= 5 && hour < 12) greetingText = 'Good Morning';
  else if(hour >= 12 && hour < 17) greetingText = 'Good Afternoon';
  else greetingText = 'Good Evening';
  if(greetingEl) greetingEl.textContent = `${greetingText}, ${loggedInUser}!`;

  // Logout
  if(logoutBtn){
    logoutBtn.addEventListener('click', (e)=>{
      e.preventDefault();
      localStorage.removeItem('loggedInUser');
      window.location.href = 'index.html';
    });
  }

  // Dark Mode toggle
  if(themeBtn){
    themeBtn.textContent = document.body.classList.contains('dark-mode') ? 'Light Mode' : 'Dark Mode';
    themeBtn.addEventListener('click', () => {
      document.body.classList.toggle('dark-mode');
      themeBtn.textContent = document.body.classList.contains('dark-mode') ? 'Light Mode' : 'Dark Mode';
    });
  }

  // API Keys
  const UNSPLASH_ACCESS_KEY = 'YOUR_UNSPLASH_API_KEY';
  const OPENWEATHER_API_KEY = '6e079c095ac4cde490adb297ecc4ba6d';

  // Fetch Photo
  async function fetchPhoto(city){
    try {
      const res = await fetch(`https://api.unsplash.com/photos/random?query=${city}&client_id=${UNSPLASH_ACCESS_KEY}&orientation=landscape`);
      const data = await res.json();
      return data.urls?.regular || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80';
    } catch(error) {
      console.error("Error fetching photo:", error);
      return 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80';
    }
  }

 async function fetchWeather(city) {
  try {
    // Make sure you use the variables correctly
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${OPENWEATHER_API_KEY}&units=metric`;

    console.log("Fetching weather from:", url); // Debug

    const response = await fetch(url);
    const data = await response.json();

    console.log("Weather API response:", data); // Debug

    if (!response.ok) {
      console.error("Weather API error:", data.message);
      return null; // API returned error (invalid city or key)
    }

    return data;
  } catch (error) {
    console.error("Error fetching weather:", error);
    return null;
  }
}


  // Create Card
  function createCard(city, weatherData, photoUrl){
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <img src="${photoUrl}" alt="${city} Photo" />
      <div class="card-body">
        <h2 class="city-name">${city}</h2>
        <div class="temperature">${weatherData ? Math.round(weatherData.main.temp) + '°C' : 'N/A'}</div>
        <div class="weather-desc">${weatherData ? weatherData.weather[0].description : '⚠️ Weather unavailable'}</div>
        <a class="more-link" href="https://unsplash.com/s/photos/${city}" target="_blank" rel="noopener">More views & photos</a>
      </div>
    `;
    resultsSection.appendChild(card);
  }

  // Explore Button Click
  if(exploreBtn){
    exploreBtn.addEventListener('click', async () => {
      resultsSection.innerHTML = '';
      const city = destinationInput.value.trim();
      if(!city) return;

      const [photoUrl, weatherData] = await Promise.all([fetchPhoto(city), fetchWeather(city)]);
      createCard(city, weatherData, photoUrl);
    });
  }
}

// ----------------- Profile Page Logic -----------------
if(window.location.pathname.endsWith('profile.html')){
  const loggedInUser = localStorage.getItem('loggedInUser');
  if(!loggedInUser){
    window.location.href = 'index.html';
  }

  const users = JSON.parse(localStorage.getItem('users') || '{}');
  const user = users[loggedInUser];
  if(!user){
    alert('User data not found, please login again.');
    localStorage.removeItem('loggedInUser');
    window.location.href = 'index.html';
  }

  const profileUsername = document.getElementById('profile-username');
  const profileEmail = document.getElementById('profile-email');
  const profileView = document.getElementById('profile-view');
  const profileEdit = document.getElementById('profile-edit');

  const editBtn = document.getElementById('edit-profile');
  const saveBtn = document.getElementById('save-profile');
  const cancelBtn = document.getElementById('cancel-edit');

  const editUsernameInput = document.getElementById('edit-username');
  const editEmailInput = document.getElementById('edit-email');

  profileUsername.textContent = loggedInUser;
  profileEmail.textContent = user.email;

  editBtn.addEventListener('click', () => {
    editUsernameInput.value = loggedInUser;
    editEmailInput.value = user.email;

    profileView.classList.add('hidden');
    profileEdit.classList.remove('hidden');
  });

  cancelBtn.addEventListener('click', () => {
    profileEdit.classList.add('hidden');
    profileView.classList.remove('hidden');
  });

  saveBtn.addEventListener('click', () => {
    const newUsername = editUsernameInput.value.trim();
    const newEmail = editEmailInput.value.trim();
    if(!newUsername || !newEmail){
      alert('Please fill in all fields.');
      return;
    }

    const allUsers = JSON.parse(localStorage.getItem('users') || '{}');
    if(newUsername !== loggedInUser && allUsers[newUsername]){
      alert('Username already taken.');
      return;
    }

    allUsers[newUsername] = { ...allUsers[loggedInUser], email: newEmail };
    if(newUsername !== loggedInUser){
      delete allUsers[loggedInUser];
      localStorage.setItem('loggedInUser', newUsername);
    }
    localStorage.setItem('users', JSON.stringify(allUsers));

    profileUsername.textContent = newUsername;
    profileEmail.textContent = newEmail;

    profileEdit.classList.add('hidden');
    profileView.classList.remove('hidden');

    alert('Profile updated successfully!');
  });

  const themeBtnProfile = document.getElementById('theme-toggle');
  if(themeBtnProfile){
    themeBtnProfile.textContent = document.body.classList.contains('dark-mode') ? 'Light Mode' : 'Dark Mode';
    themeBtnProfile.addEventListener('click', () => {
      document.body.classList.toggle('dark-mode');
      themeBtnProfile.textContent = document.body.classList.contains('dark-mode') ? 'Light Mode' : 'Dark Mode';
    });
  }

  document.getElementById('logout').addEventListener('click', (e) => {
    e.preventDefault();
    localStorage.removeItem('loggedInUser');
    window.location.href = 'index.html';
  });
}
