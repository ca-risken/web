<template>
  <v-form ref="searchForm">
    <v-row dense justify="center" align-content="center">
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
      <v-col
        :cols="showIdField ? 8 : 8"
        :sm="showIdField ? 4 : 4"
        :md="showIdField ? 4 : 4"
      >
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

      <!-- Create/Action Button -->
      <v-btn
        v-if="showCreateButton"
        class="mt-3 mr-4"
        :color="createButtonColor"
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
  name: 'SearchToolbar',
  props: {
    modelValue: {
      type: Object,
      required: true,
    },
    loading: {
      type: Boolean,
      default: false,
    },
    idFieldItems: {
      type: Array,
      default: () => [],
    },
    nameFieldItems: {
      type: Array,
      default: () => [],
    },
    idFieldKey: {
      type: String,
      default: 'id',
    },
    nameFieldKey: {
      type: String,
      default: 'name',
    },
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
      default: 'large',
    },
    createButtonIcon: {
      type: String,
      default: 'mdi-new-box',
    },
    createButtonColor: {
      type: String,
      default: 'primary-darken-3',
    },
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
<style scoped></style>
