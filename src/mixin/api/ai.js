import axios from 'axios'
const longAxios = axios.create({
  baseURL: '/api/v1',
  timeout: 120000,
})

const ai = {
  data: () => {
    return {
      RoleUser: 1,
      RoleAI: 2,
    }
  },
  methods: {
    // ChatAI API
    async chatAI(question, chat_history) {
      const param = {
        question: question,
      }
      if (chat_history) {
        param.chat_history = chat_history
      }
      const res = await longAxios.post('/ai/chat-ai', param).catch((err) => {
        return Promise.reject(err)
      })
      if (!res.data.data.answer) {
        return ''
      }
      return res.data.data.answer
    },

    // Generate Report API
    async generateReport(prompt, name) {
      const param = {
        project_id: this.getCurrentProjectID(),
        prompt: prompt,
        name: name,
      }
      const res = await longAxios
        .post('/ai/generate-report/', param)
        .catch((err) => {
          return Promise.reject(err)
        })
      if (!res.data.data) {
        return {}
      }
      return res.data.data
    },
  },
}

export default ai
