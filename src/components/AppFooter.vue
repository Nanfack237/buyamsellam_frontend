<template>
  <v-footer app class="text-left py-5">
    <v-container fluid class="pa-0">
      <div>
        <b>{{ new Date().getFullYear() }}-<span style="color: rgb(13, 71, 161, 1);">Buyam</span><span style="color: rgba(100, 200, 150, 0.6);">Sellam</span></b>
      </div>
    </v-container>
  </v-footer>
</template>

<script setup>
// No script logic needed for basic footer positioning
</script>

<style scoped>
/* Optional: If you need more specific control not covered by Vuetify classes */
.v-footer {
  width: 100%; /* Ensures the footer spans the full width */
}
</style>