<script>
import TheWelcome from "@/components/TheWelcome.vue";

export default {
  name: "AttendanceView",

  components: {
    TheWelcome,
  },

  computed: {
    productsData() {
      return this.$store.state.products;
    },
  },

  mounted() {
    this.$store.dispatch("getProducts");
  },
};
</script>

<template>
  <main>
    <TheWelcome :products-data="productsData" />
  </main>
</template>
