import Util from '@/util'

const list = {
  data: () => {
    return {
      searchModel: { name: null },
      loading: false,
      nameList: [],
      entities: [],
      editDialog: false,
      table: {
        options: { page: 1, itemsPerPage: 10 },
        total: 0,
        footer: {
          itemsPerPageText: 'Rows/Page',
          itemsPerPageOptions: [{ value: 10, title: '10' }],
          showCurrentPage: true,
        },
        items: [],
      },
    }
  },
  methods: {
    async refleshList(name) {
        let searchCond = ''
        if (name) {
          searchCond += '&name=' + name
        }
        const entities = await this.listItem(searchCond).catch(
          (err) => {
            this.clearList()
            return Promise.reject(err)
          }
        )
        if (entities.length == 0) {
          this.clearList()
          return
        }
        this.entities = entities
        this.loadList()
    },
    async loadList() {
      this.loading = true
      let items = []
      let names = []
      const from =
        (this.table.options.page - 1) * this.table.options.itemsPerPage
      const to = from + this.table.options.itemsPerPage
      const ids = this.entities.slice(from, to)
      items = await Promise.all(
        ids.map(async (id) => {
          return await this.getItem(id)
        })
      )
      items.forEach((item) => {
        names.push(item.name)
      })
      this.table.items = items
      this.table.total = items.length
      this.nameList = [...new Set(names)]
      this.loading = false
    },
    clearList() {
      this.entities = []
      this.table.total = 0
      this.table.items = []
      this.nameList = []
    },
    handleSearch() {
        this.refleshList(this.searchModel.name)
    },
    updateOptions(options) {
        this.table.options.page = options.page
        this.table.options.itemsPerPage = options.itemsPerPage
        this.loadList()
    },
    formatTime(time) {
      return Util.formatDate(new Date(time * 1000), 'yyyy/MM/dd HH:mm:ss')
    },
    getColorByCount(count) {
      if (count === 0) return 'grey'
      if (count <= 2) return 'green'
      if (count <= 5) return 'orange'
      return 'red'
    },
  },
}

export default list