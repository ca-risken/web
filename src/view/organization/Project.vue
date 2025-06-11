<template>
  <div>
    <v-container>
      <v-row>
        <v-col>
          <v-card>
            <v-card-title class="d-flex align-center pe-2">
              <v-icon icon="mdi-alpha-p-box"></v-icon> &nbsp;
              <span>{{ $t(`submenu['OrganizationProject']`) }}</span>
              <v-spacer></v-spacer>
              <v-text-field
                v-model="table.search"
                density="compact"
                variant="outlined"
                hide-details
                prepend-inner-icon="mdi-magnify"
                single-line
                flat
                :placeholder="$t(`btn['SEARCH']`)"
                style="max-width: 300px"
              ></v-text-field>
            </v-card-title>
            <v-divider></v-divider>
            <v-card-text class="pa-0">
              <v-data-table
                v-model="table.selected"
                :search="table.search"
                :headers="headers"
                :items="table.items"
                :loading="loading"
                :items-per-page="table.options.itemsPerPage"
                :sort-by="table.options.sortBy"
                :page="table.options.page"
                :items-per-page-options="table.footer.itemsPerPageOptions"
                :show-current-page="table.footer.showCurrentPage"
                locale="ja-jp"
                loading-text="Loading..."
                no-data-text="No data."
                class="elevation-1"
                item-key="project_id"
                @click:row="handleRowClick"
              >
                <template v-slot:[`item.tag`]="{ item }">
                  <v-chip
                    v-for="t in item.value.tag"
                    :key="t.tag"
                    :color="t.color"
                    variant="flat"
                    class="ma-1 text-white"
                    size="small"
                  >
                    {{ t.tag }}
                  </v-chip>
                </template>
                <template v-slot:[`item.updated`]="{ item }">
                  {{ formatTime(item.value.updated) }}
                </template>
                <template v-slot:[`item.action`]="{ item }">
                  <v-menu>
                    <template v-slot:activator="{ props }">
                      <v-btn
                        color="grey-darken-2"
                        icon="mdi-dots-vertical"
                        variant="text"
                        v-bind="props"
                      ></v-btn>
                    </template>
                    <v-list class="pa-0" density="compact">
                      <v-list-item
                        v-for="action in table.actions"
                        :key="action.text"
                        @click="action.click(item.value)"
                        :prepend-icon="action.icon"
                      >
                        <v-list-item-title>{{ action.text }}</v-list-item-title>
                      </v-list-item>
                    </v-list>
                  </v-menu>
                </template>
              </v-data-table>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import Util from '@/util'
import mixin from '@/mixin'
import project from '@/mixin/api/project'

export default {
  name: 'OrganizationProject',
  mixins: [mixin, project],
  data() {
    return {
      loading: false,
      table: {
        selected: [],
        search: '',
        options: {
          page: 1,
          itemsPerPage: 10,
          sortBy: [{ key: 'project_id', order: 'asc' }],
        },
        actions: [
          {
            text: this.$i18n.t('action["View Item"]'),
            icon: 'mdi-eye',
            click: this.handleViewProject,
          },
          {
            text: this.$i18n.t('action["Edit Item"]'),
            icon: 'mdi-pencil',
            click: this.handleEditProject,
          },
        ],
        footer: {
          itemsPerPageOptions: [
            { value: 10, title: '10' },
            { value: 25, title: '25' },
            { value: 50, title: '50' },
            { value: 100, title: '100' },
          ],
          showCurrentPage: true,
        },
        items: [],
      },
    }
  },
  computed: {
    headers() {
      return [
        {
          title: this.$i18n.t('item["' + 'Project' + '"]'),
          align: 'start',
          sortable: false,
          key: 'name',
        },
        {
          title: this.$i18n.t('item["' + 'Tags' + '"]'),
          align: 'start',
          sortable: false,
          key: 'tag',
        },
        {
          title: this.$i18n.t('item["' + 'Updated' + '"]'),
          align: 'center',
          sortable: true,
          key: 'updated',
        },
        {
          title: this.$i18n.t('item["' + 'Action' + '"]'),
          align: 'center',
          sortable: false,
          key: 'action',
        },
      ]
    },
  },
  mounted() {
    this.listProjectTag()
  },
  methods: {
    async listProjectTag() {
      this.loading = true
      try {
        const response = await this.listProjectTagAPI().catch((err) => {
          return Promise.reject(err)
        })
        if (!response.data.project_tag) {
          return false
        }
        this.table.items = response.data.project_tag.map((item) => ({
          ...item,
          tag: this.getProjectTagColor(item.tag),
        }))
      } catch (error) {
        this.finishError(error.response.data)
      } finally {
        this.loading = false
      }
    },
    getProjectTagColor(tags) {
      if (!tags || tags.length === 0) return []
      return tags.map((tag) => ({
        tag: tag,
        color: Util.getRandomColor(),
      }))
    },
    handleRowClick(event, row) {
      this.handleViewProject(row.item.value)
    },
    handleViewProject(item) {
      this.$router.push(`/project/setting?project_id=${item.project_id}`)
    },
    handleEditProject(item) {
      this.$router.push(`/project/setting?project_id=${item.project_id}`)
    },
    formatTime(time) {
      return Util.formatDate(new Date(time * 1000), 'yyyy/MM/dd HH:mm:ss')
    },
  },
}
</script>
