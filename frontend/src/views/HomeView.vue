<script>
import TheWelcome from "@/components/TheWelcome.vue";

export default {
  name: "AttendanceView",

  components: {
    TheWelcome,
  },

  computed: {
    customerData() {
      return this.$store.state.customer;
    },
  },

  mounted() {
    this.$store.dispatch("getCustomer");
  },
};
</script>

<template>
  <main>
    <TheWelcome :customer-data="customerData" />
  </main>
</template>
