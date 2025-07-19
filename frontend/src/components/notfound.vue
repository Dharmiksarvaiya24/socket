<template>
  <div class="notfound-container">
    <h1>404 - Page Not Found</h1>
    <img src="../assets/404.png" alt="App Logo" class="logo" />
    <router-link to="/" class="home-link">Go back to Home</router-link>
  </div>
</template>

<script setup>
// No script logic needed here
</script>

<style scoped>
.notfound-container {
  text-align: center;
  padding: 80px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

h1 {
  font-size: 32px;
  color: #e53e3e;
  margin-bottom: 20px;
  text-align: center;
}

.logo {
  width: 50%;
  max-width: 250px;
  margin-bottom: px;
  position: relative;
}

.home-link {
  display: inline-block;
  margin-top: 24px;
  margin-right: 20px; ;
  font-size: 16px;
  color: white;
  background-color: #48bb78; 
  padding: 10px 24px;
  border-radius: 8px;
  text-decoration: none;
  transition: background-color 0.3s ease;
}

.home-link:hover {
  background-color: #48bb70;
}
</style>
