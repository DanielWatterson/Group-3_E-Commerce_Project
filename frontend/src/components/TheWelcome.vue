<script>
export default {
  name: "TheWelcome",
  props: {
    customerData: Array,
  }
}
</script>

<template>
<p>{{ customerData }}</p>
</template>
