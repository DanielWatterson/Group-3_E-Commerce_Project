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
</template>
