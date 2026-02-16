<script>
import CustomersList from '@/components/CustomersList.vue';

export default {
  name: "CustomersView",
  
  components: {
    CustomersList,
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
    <CustomersList :customer-data="customerData" />
  </main>
</template>
