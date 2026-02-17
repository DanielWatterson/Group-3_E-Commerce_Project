<script >
export default {
  computed: {
    token() {
      return localStorage.getItem("token");
    }
  }
}
</script>

<template>
 
  <div>
    <nav>
      <router-link to="/">Home</router-link> |
      <router-link to="/about">About</router-link> |
      <router-link to="/customers">Customers</router-link> |
      <router-link v-if="!token" to="/login">Login</router-link>
    </nav>


  </div>

  <RouterView />
</template>

<style scoped></style>
