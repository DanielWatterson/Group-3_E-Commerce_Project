<script>
export default {
  name: "CustomersList",
  props: {
    customerData: Array,
  }
}
</script>

<template>
<p>{{ customerData }}</p>
<Button label="Click Me" icon="pi pi-check" />

</template>

<style scoped>
p {
  color: black;
}
</style>