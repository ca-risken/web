<template>
  <v-row dense>
    <v-col cols="12">
      <v-card>
        <v-divider></v-divider>
        <v-card-text class="pa-0">
          <v-data-table-server
            :headers="headers"
            :items-length="tableData.total"
            :items="tableData.items"
            :loading="loading"
            :sort-by="tableData.options.sortBy"
            :page="tableData.options.page"
            :items-per-page="tableData.options.itemsPerPage"
            :items-per-page-options="tableData.footer.itemsPerPageOptions"
            :items-per-page-text="tableData.footer.itemsPerPageText"
            :show-current-page="tableData.footer.showCurrentPage"
            locale="ja-jp"
            loading-text="Loading..."
            no-data-text="No data."
            class="elevation-1"
            :item-key="itemKey"
            @update:options="updateOptions"
          >
            <template
              v-for="(_, slot) in $slots"
              v-slot:[slot]="scope"
              :key="slot"
            >
              <slot :name="slot" v-bind="scope" />
            </template>

            <!-- Default updated_at slot if not overridden -->
            <template
              v-if="!$slots['item.updated_at']"
              v-slot:[`item.updated_at`]="{ item }"
            >
              <v-chip>{{ formatTime(item.value.updated_at) }}</v-chip>
            </template>

            <!-- Default action slot if not overridden -->
            <template
              v-if="!$slots['item.action'] && actions.length > 0"
              v-slot:[`item.action`]="{ item }"
            >
              <v-menu>
                <template v-slot:activator="{ props }">
                  <v-icon v-bind="props" icon="mdi-dots-vertical"></v-icon>
                </template>
                <v-list class="pa-0" dense>
                  <v-list-item
                    v-for="action in actions"
                    :key="action.text"
                    @click="action.click(item.value)"
                    :prepend-icon="action.icon"
                  >
                    <v-list-item-title>{{
                      $t(`action['` + action.text + `']`)
                    }}</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>
            </template>
          </v-data-table-server>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
import Util from '@/util'
import { VDataTableServer } from 'vuetify/labs/VDataTable'
export default {
  name: 'DataTable',
  components: {
    VDataTableServer,
  },
  props: {
    tableData: {
      type: Object,
      required: true,
      default: () => ({
        items: [],
        total: 0,
        options: { page: 1, itemsPerPage: 10, sortBy: [] },
        footer: {
          itemsPerPageText: 'Rows/Page',
          itemsPerPageOptions: [{ value: 10, title: '10' }],
          showCurrentPage: true,
        },
      }),
    },
    loading: {
      type: Boolean,
      default: false,
    },
    headers: {
      type: Array,
      required: true,
    },
    actions: {
      type: Array,
      default: () => [],
    },
    itemKey: {
      type: String,
      default: 'id',
    },
    idFieldType: {
      type: String,
      default: 'project', // 'project' or 'organization'
    },
    enableDefaultFormatting: {
      type: Boolean,
      default: true,
    },
  },
  emits: ['update-options'],
  methods: {
    updateOptions(options) {
      this.$emit('update-options', options)
    },
    formatTime(time) {
      return Util.formatDate(new Date(time * 1000), 'yyyy/MM/dd HH:mm:ss')
    },
  },
}
</script>

<style scoped></style>
