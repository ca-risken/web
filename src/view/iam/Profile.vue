<template>
  <v-card max-width="600" class="mx-auto" >
    <v-list-item>
      <v-list-item-content>
        <v-list-item-title class="headline">Profile</v-list-item-title>
      </v-list-item-content>
    </v-list-item>
    <v-img
      class="white--text align-end"
      height="150px"
      src="/static/backimg/profile.jpg"
    >
      <v-layout justify-center>
        <v-avatar class="ma-0" size="35%">
          <img src="/static/avatar/default.png" alt="avatar" align="center" />
        </v-avatar>
      </v-layout>
      <v-card-text class="text-h6">
        Edit your profile...
      </v-card-text>
    </v-img>
    <v-card-text>
      <v-form v-model="userForm.validator.valid" ref="form">
        <v-text-field
          v-model="userForm.data.id"
          label="ID"
          filled disabled
        ></v-text-field>
        <v-text-field
          v-model="userForm.data.sub"
          label="Sub"
          filled disabled
        ></v-text-field>
        <v-text-field
          v-model="userForm.data.name"
          :counter="64"
          :rules="userForm.validator.name"
          label="Name"
          required
        ></v-text-field>
        <v-text-field
          :value="userForm.data.updated_at | formatTime"
          label="Updated"
          @input="value => userForm.data.updated_at = value"
          filled disabled
        >
          <pre>{{ userForm.data.updated_at | formatTime }}</pre>
        </v-text-field>
        <v-divider class="mt-3 mb-3"></v-divider>
        <v-card-actions>
          <v-spacer />
          <v-btn text outlined color="green darken-1" @click="handleSubmit">Edit</v-btn>
        </v-card-actions>
      </v-form>
    </v-card-text>
    <bottom-snack-bar ref="snackbar" />
  </v-card>
</template>

<script>
import store from '@/store'
import Util from '@/util'
import BottomSnackBar from '@/component/widget/snackbar/BottomSnackBar'
export default {
  components: {
    BottomSnackBar,
  },
  data() {
    return {
      userForm: {
        validator:{
          valid: false,
          name: [
            v => !!v || 'Name is required',
            v => v.length <= 64 || 'Name must be less than 64 characters',
          ],
        },
        data: {
          id: '-',
          sub: '-',
          name: '',
          updated_at: '0',
        },
      },
    }
  },
  mounted() {
    this.getUser()
  },
  filters: {
    formatTime: (unix) => {
      if (unix === '0' ) {
        return '-'
      }
      return Util.formatDate(new Date(unix * 1000), 'yyyy/MM/dd HH:mm')
    }
  },
  methods: {
    async getUser() {
      if (store.state.user) {
        const res = await this.$axios.get('/iam/get-user/?user_id=' + store.state.user.user_id).catch((err) =>  {
          return Promise.reject(err)
        })
        if (!res.data.data.user) { return false }
        this.userForm.data = {
          id : res.data.data.user.user_id,
          sub: res.data.data.user.sub,
          name: res.data.data.user.name,
          updated_at: res.data.data.user.updated_at,
        }
      }
    },
    async putUser() {
      const param = {user: {
        name: this.userForm.data.name,
        activated: true,
      }}
      const res = await this.$axios.post('/iam/put-user/', param).catch((err) =>  {
        this.$refs.snackbar.notifyError(err.response.data)
        return Promise.reject(err)
      })
      store.commit('storeUser', res.data.data.user)
      this.getUser()
      this.$refs.snackbar.notifySuccess('Success: Your profile updated.')
    },
    handleSubmit() {
      if (this.$refs.form.validate()) {
        this.putUser()
      }
    },
  }
}
</script>
