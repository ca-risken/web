<template>
  <v-dialog max-width="64%" v-model="dialog" @click:outside="handleClose">
    <v-card>
      <v-card-title>
        <v-row>
          <v-col cols="auto">
            <span class="mx-2">{{ entityTitle }}</span>
          </v-col>
          <v-col>
            <v-text-field
              variant="outlined"
              clearable
              density="compact"
              prepend-icon="mdi-magnify"
              placeholder="Type something..."
              v-model="searchText"
              hide-details
              class="hidden-sm-and-down"
            />
          </v-col>
        </v-row>
      </v-card-title>
      <v-divider />
      <v-card-text class="pa-0">
        <v-data-table
          :search="searchText"
          :headers="headers"
          :items="items"
          :item-key="itemKey"
          :items-per-page="options.itemsPerPage"
          :page="options.page"
          :loading="loading"
          :items-per-page-options="footer.itemsPerPageOptions"
          :show-current-page="footer.showCurrentPage"
          locale="ja-jp"
          loading-text="Loading..."
          no-data-text="No data."
          class="elevation-1"
          hide-default-footer
          :custom-filter="customFilter"
          @click:row="handleItemClick"
        >
          <!-- Project specific slots -->
          <template
            v-if="entityType === 'project'"
            v-slot:[`item.tag`]="{ item }"
          >
            <v-chip
              v-for="t in item.value.tag"
              :key="t.tag"
              :color="t.color"
              variant="flat"
              class="ma-1 text-white"
              link
            >
              {{ t.tag }}
            </v-chip>
          </template>

          <!-- Organization specific slots -->
          <template
            v-if="entityType === 'organization'"
            v-slot:[`item.description`]="{ item }"
          >
            <span class="text-truncate d-inline-block" style="max-width: 200px">
              {{ item.value.description }}
            </span>
          </template>
        </v-data-table>
      </v-card-text>
      <v-card-actions>
        <v-btn
          variant="outlined"
          color="info"
          v-if="currentEntityId"
          @click="handleEdit"
        >
          {{ editButtonText }}
        </v-btn>
        <v-spacer />
        <v-btn variant="outlined" color="grey-en-1" @click="handleClose">
          {{ $t(`btn['CANCEL']`) }}
        </v-btn>
        <v-btn variant="outlined" color="success" @click="handleNew">
          {{ createButtonText }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { VDataTable } from 'vuetify/labs/VDataTable'

export default {
  name: 'EntitySelectDialog',
  components: {
    VDataTable,
  },
  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
    entityType: {
      type: String,
      required: true,
      validator: (value) => ['project', 'organization'].includes(value),
    },
    items: {
      type: Array,
      default: () => [],
    },
    loading: {
      type: Boolean,
      default: false,
    },
    currentEntityId: {
      type: String,
      default: null,
    },
    customFilter: {
      type: Function,
      default: null,
    },
  },
  data() {
    return {
      searchText: '',
      options: {
        itemsPerPage: 10,
        page: 1,
      },
      footer: {
        itemsPerPageOptions: [{ value: 10, title: '10' }],
        showCurrentPage: true,
      },
    }
  },
  computed: {
    dialog: {
      get() {
        return this.modelValue
      },
      set(value) {
        this.$emit('update:modelValue', value)
      },
    },
    entityTitle() {
      return this.entityType === 'project' ? 'Project' : 'Organization'
    },
    itemKey() {
      return this.entityType === 'project' ? 'project_id' : 'organization_id'
    },
    headers() {
      if (this.entityType === 'project') {
        return [
          {
            title: this.$i18n.t('item["ID"]'),
            align: 'start',
            width: '5%',
            sortable: true,
            key: 'project_id',
          },
          {
            title: this.$i18n.t('item["Name"]'),
            align: 'start',
            width: '25%',
            sortable: true,
            key: 'name',
          },
          {
            title: this.$i18n.t('item["Tag"]'),
            align: 'start',
            width: '70%',
            sortable: true,
            key: 'tag',
          },
        ]
      } else {
        return [
          {
            title: this.$i18n.t('item["ID"]'),
            align: 'start',
            width: '5%',
            sortable: true,
            key: 'organization_id',
          },
          {
            title: this.$i18n.t('item["Name"]'),
            align: 'start',
            width: '25%',
            sortable: true,
            key: 'name',
          },
          {
            title: this.$i18n.t('item["Description"]'),
            align: 'start',
            width: '70%',
            sortable: true,
            key: 'description',
          },
        ]
      }
    },
    editButtonText() {
      return this.entityType === 'project'
        ? this.$t(`btn['EDIT PROJECT']`)
        : this.$t(`btn['EDIT ORGANIZATION']`)
    },
    createButtonText() {
      return this.entityType === 'project'
        ? this.$t(`btn['CREATE NEW PROJECT']`)
        : this.$t(`btn['CREATE NEW ORGANIZATION']`)
    },
  },
  methods: {
    handleClose() {
      this.dialog = false
      this.searchText = ''
    },
    handleItemClick(event, item) {
      this.$emit('item-selected', item.item.value)
      this.handleClose()
    },
    handleEdit() {
      this.$emit('edit-entity')
      this.handleClose()
    },
    handleNew() {
      this.$emit('create-entity')
      this.handleClose()
    },
  },
}
</script>

<style scoped></style>