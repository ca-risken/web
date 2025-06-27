<template>
  <div class="action-buttons">
    <!-- Search Button -->
    <v-btn
      class="mt-3 mr-4"
      :size="buttonSize"
      density="compact"
      :loading="loading"
      @click="handleSearch"
      icon="mdi-magnify"
    />
    
    <!-- Create/Action Button -->
    <v-btn
      v-if="showActionButton"
      class="mt-3 mr-4"
      :color="actionButtonColor"
      :size="buttonSize"
      density="compact"
      @click="handleAction"
      :icon="actionButtonIcon"
    />
  </div>
</template>

<script>
export default {
  name: 'ActionButtons',
  props: {
    // Loading state
    loading: {
      type: Boolean,
      default: false,
    },
    // Button configuration
    buttonSize: {
      type: String,
      default: 'large',
    },
    // Action button configuration
    showActionButton: {
      type: Boolean,
      default: true,
    },
    actionButtonColor: {
      type: String,
      default: 'primary-darken-3',
    },
    actionButtonIcon: {
      type: String,
      default: 'mdi-new-box',
    },
  },
  emits: ['search', 'action'],
  methods: {
    handleSearch() {
      this.$emit('search')
    },
    handleAction() {
      this.$emit('action')
    },
  },
}
</script>

<style scoped>
</style>