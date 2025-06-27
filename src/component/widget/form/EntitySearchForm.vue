<template>
  <v-form ref="searchForm">
    <v-row dense justify="center" align-content="center">
      <!-- ID Field -->
      <v-col v-if="showIdField" cols="4" sm="3" md="3">
        <v-combobox
          variant="outlined"
          density="compact"
          clearable
          bg-color="white"
          :label="$t(`item['` + searchForm.idField.label + `']`)"
          :placeholder="searchForm.idField.placeholder"
          :items="idFieldItems"
          v-model="searchModel[idFieldKey]"
        />
      </v-col>
      
      <!-- Name Field -->
      <v-col :cols="showIdField ? 8 : 8" :sm="showIdField ? 4 : 4" :md="showIdField ? 4 : 4">
        <v-combobox
          variant="outlined"
          density="compact"
          clearable
          bg-color="white"
          :label="$t(`item['` + searchForm.nameField.label + `']`)"
          :placeholder="searchForm.nameField.placeholder"
          :items="nameFieldItems"
          v-model="searchModel[nameFieldKey]"
        />
      </v-col>
      
      <v-spacer />
      
      <!-- Search Button -->
      <v-btn
        class="mt-3 mr-4"
        :size="buttonSize"
        density="compact"
        :loading="loading"
        @click="handleSearch"
        icon="mdi-magnify"
      />
      
      <!-- New/Create Button -->
      <v-btn
        v-if="showCreateButton"
        class="mt-3 mr-4"
        color="primary-darken-3"
        :size="buttonSize"
        density="compact"
        @click="handleCreate"
        :icon="createButtonIcon"
      />
    </v-row>
  </v-form>
</template>

<script>
export default {
  name: 'EntitySearchForm',
  props: {
    // Search model (v-model support)
    modelValue: {
      type: Object,
      required: true,
    },
    // Loading state
    loading: {
      type: Boolean,
      default: false,
    },
    // Items for combobox
    idFieldItems: {
      type: Array,
      default: () => [],
    },
    nameFieldItems: {
      type: Array,
      default: () => [],
    },
    // Field keys for v-model binding
    idFieldKey: {
      type: String,
      default: 'id', // ID field
    },
    nameFieldKey: {
      type: String,
      default: 'name', // Name field
    },
    // UI Configuration
    showIdField: {
      type: Boolean,
      default: true,
    },
    showCreateButton: {
      type: Boolean,
      default: true,
    },
    buttonSize: {
      type: String,
      default: 'default',
    },
    createButtonIcon: {
      type: String,
      default: 'mdi-new-box',
    },
    // Form configuration
    searchFormConfig: {
      type: Object,
      default: () => ({
        idField: { label: 'ID', placeholder: 'Filter for ID' },
        nameField: { label: 'Name', placeholder: 'Filter for name' },
      }),
    },
  },
  computed: {
    searchModel: {
      get() {
        return this.modelValue
      },
      set(value) {
        this.$emit('update:modelValue', value)
      },
    },
    searchForm() {
      return this.searchFormConfig
    },
  },
  methods: {
    handleSearch() {
      this.$emit('search', this.searchModel)
    },
    handleCreate() {
      this.$emit('create')
    },
  },
}
</script>

<style scoped>
/* Add any specific styling if needed */
</style> 