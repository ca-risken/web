<template>
  <v-dialog
    max-width="60%"
    :model-value="projectDialog"
    @click:outside="handleCancel"
  >
    <v-card>
      <v-card-title>
        <v-row justify="center" align="center">
          <v-col cols="4">
            <v-text-field
              density="compact"
              variant="outlined"
              clearable
              :label="searchForm.projectID.label"
              :placeholder="searchForm.projectID.placeholder"
              :rules="searchForm.projectID.validator"
              v-model="searchModel.projectID"
            />
          </v-col>
          <v-col cols="6">
            <v-text-field
              density="compact"
              variant="outlined"
              clearable
              :label="searchForm.projectName.label"
              :placeholder="searchForm.projectName.placeholder"
              v-model="searchModel.projectName"
              @update:modelValue="handleSearch"
            />
          </v-col>
          <v-spacer></v-spacer>
          <v-col>
            <v-btn
              :loading="loading"
              @click="handleSearch"
              icon="mdi-magnify"
            />
          </v-col>
        </v-row>
        <v-spacer />
      </v-card-title>
      <v-divider></v-divider>
      <v-card-text class="pa-0">
        <v-data-table-server
          :headers="headers"
          :items="table.items"
          :items-length="table.total"
          :loading="loading"
          :items-per-page-options="table.footer.itemsPerPageOptions"
          :items-per-page="table.options.itemsPerPage"
          :sort-by="sortBy"
          :showCurrentPage="table.footer.showCurrentPage"
          locale="ja-jp"
          loading-text="Loading..."
          no-data-text="No data."
          class="elevation-1"
          item-key="project_id"
          @click:row="handleSelectItem"
          @update:options="updateOptions"
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
        </v-data-table-server>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn text outlined color="grey-darken-1" @click="handleCancel">
          {{ $t(`btn['CANCEL']`) }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import Util from '@/util'
import mixin from '@/mixin'
import project from '@/mixin/api/project'
import { VDataTableServer } from 'vuetify/labs/VDataTable'
export default {
  mixins: [mixin, project],
  components: {
    VDataTableServer,
  },
  name: 'ProjectList',
  props: {
    projectDialog: Boolean,
  },
  data() {
    return {
      loading: false,
      searchModel: {
        projectName: null,
      },
      searchForm: {
        projectID: {
          label: 'Project ID',
          placeholder: 'Filter for project id',
          validator: [
            (v) => !v || Util.isNumber(v) || 'ProjectID must be a number',
          ],
        },
        projectName: {
          label: 'Project Name',
          placeholder: 'Filter for project name',
        },
      },
      table: {
        options: { page: 1, itemsPerPage: 20 },
        total: 0,
        footer: {
          itemsPerPageOptions: [{ value: 20, title: '20' }],
          showCurrentPage: true,
        },
        items: [],
      },
      projects: [],
    }
  },
  computed: {
    headers() {
      return [
        {
          title: this.$i18n.t('item["ID"]'),
          align: 'start',
          sortable: false,
          key: 'project_id',
        },
        {
          title: this.$i18n.t('item["Name"]'),
          align: 'start',
          sortable: false,
          key: 'name',
        },
        {
          title: this.$i18n.t('item.Tags'),
          align: 'start',
          sortable: false,
          key: 'tag',
        },
      ]
    },
  },
  mounted() {
    this.refleshList('')
  },
  methods: {
    async refleshList(name) {
      this.loading = true
      try {
        const projects = await this.listProjectAPI(name).catch((err) => {
          console.error('ProjectList: API error:', err)
          return Promise.reject(err)
        })
        if (!projects || projects.length === 0) {
          this.table.items = []
          this.table.total = 0
          this.loading = false
          return
        }
        const projectsWithTags = projects.map((project) => {
          console.log('ProjectList: Processing project:', project)
          return {
            ...project,
            tag: this.getProjectTagColor(project.tag || []),
          }
        })
        console.log('ProjectList: Projects with tags:', projectsWithTags)
        this.table.total = projectsWithTags.length
        this.projects = projectsWithTags
        const from =
          (this.table.options.page - 1) * this.table.options.itemsPerPage
        const to = from + this.table.options.itemsPerPage
        this.table.items = projectsWithTags.slice(from, to)
        console.log('ProjectList: Final table items:', this.table.items)
      } catch (err) {
        this.table.items = []
        this.table.total = 0
      } finally {
        this.loading = false
      }
    },
    getProjectTagColor(tags) {
      if (!tags || tags.length === 0) return []
      return tags.map((tag) => ({
        tag: tag,
        color: this.getRandomColor(),
      }))
    },
    getRandomColor() {
      const colors = [
        'red',
        'pink',
        'purple',
        'deep-purple',
        'indigo',
        'blue',
        'light-blue',
        'cyan',
        'teal',
        'green',
        'light-green',
        'lime',
        'yellow',
        'amber',
        'orange',
        'deep-orange',
        'brown',
        'blue-grey',
      ]
      return colors[Math.floor(Math.random() * colors.length)]
    },
    handleSelectItem(event, { item }) {
      this.$emit('handleProjectDialogResponse', item.value)
    },
    handleSearch() {
      this.refleshList('&name=' + this.searchModel.projectName)
    },
    handleCancel() {
      this.$emit('handleProjectDialogResponse', { project_id: '', name: '' })
    },
    updateOptions(options) {
      this.table.options.page = options.page
      this.table.options.itemsPerPage = options.itemsPerPage
      this.refleshList('')
    },
  },
}
</script>
