<script>
export default {
  name: "TheWelcome",
  props: {
    productsData: Array,
  }
}
</script>

<template>
<p>{{ productsData }}</p>
</template>
