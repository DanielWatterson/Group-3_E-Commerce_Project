<script>
export default {
  name: "LoginSignupView",
  data() {
    return {
      login: false,
      newCustomer: {
        customer_name: "",
        email: "",
        password: "",
      },
      loginCustomer: {
        email: "",
        password: "",
      }
    };
  },
  methods: {
    postCustomer() {
      this.$store.dispatch("postCustomer", this.newCustomer);
    },
    loginMethod() {
      this.$store.dispatch("login", this.loginCustomer);
    },
  },
};
</script>

<template>
  <button @click="login = !login">{{ login ? "Signup" : "Login" }}</button>
  <section v-if="login">
    <h1>Login</h1>
    <form @submit.prevent="">
      <label> Email:<input type="email" v-model="loginCustomer.email" /> </label>
      <br />
      <br />
      <label>
        Password:<input type="password" v-model="loginCustomer.password" />
      </label>
      <br />
      <br />
      <button @click="loginMethod()">Login</button>
    </form>
  </section>
  <section v-else>
    <h1>Signup</h1>
    <form @submit.prevent="">
      <label>
        Name:<input type="text" v-model="newCustomer.customer_name" />
      </label>
      <br />
      <br />
      <label> Email:<input type="email" v-model="newCustomer.email" /> </label>
      <br />
      <br />
      <label>
        Password:<input type="password" v-model="newCustomer.password" />
      </label>
      <br />
      <br />
      <button @click="postCustomer()">Register</button>
    </form>
  </section>
</template>

<style scoped></style>
