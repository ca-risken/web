<template>
  <v-card max-width="600" class="mx-auto">
    <v-list-item>
      <v-list-item-title class="text-h5">
        {{ $t(`submenu['Profile']`) }}
      </v-list-item-title>
    </v-list-item>
    <v-img
      class="bg-surface-variant d-flex align-center"
      height="150px"
      cover
      src="/static/backimg/profile.jpg"
    >
      <v-layout class="d-flex justify-center">
        <v-avatar class="ma-0" image="/static/avatar/default.png" size="10%">
        </v-avatar>
      </v-layout>
      <v-card-text class="text-h6"> Edit your profile... </v-card-text>
    </v-img>
    <v-card-text>
      <v-form v-model="userForm.validator.valid" ref="form">
        <v-text-field
          v-model="userForm.data.id"
          label="ID"
          disabled
        ></v-text-field>
        <v-text-field
          v-model="userForm.data.sub"
          label="Sub"
          disabled
        ></v-text-field>
        <v-text-field
          v-model="userForm.data.name"
          :counter="64"
          :rules="userForm.validator.name"
          label="Name"
          variant="outlined"
          required
        ></v-text-field>
        <v-text-field
          :model-value="formatTime(userForm.data.updated_at)"
          label="Updated"
          @input="(value) => (userForm.data.updated_at = value)"
          disabled
        >
        </v-text-field>
        <v-divider class="mt-3 mb-3"></v-divider>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="outlined" color="green-darken-1" @click="handleSubmit"
            >Edit</v-btn
          >
        </v-card-actions>
      </v-form>
    </v-card-text>
    <bottom-snack-bar ref="snackbar" />
  </v-card>
</template>

<script>
import store from '@/store'
import mixin from '@/mixin'
import iam from '@/mixin/api/iam'
import BottomSnackBar from '@/component/widget/snackbar/BottomSnackBar.vue'
export default {
  name: 'UserProfile',
  mixins: [mixin, iam],
  components: {
    BottomSnackBar,
  },
  data() {
    return {
      userForm: {
        validator: {
          valid: false,
          name: [
            (v) => !!v || 'Name is required',
            (v) =>
              !v || v.length <= 64 || 'Name must be less than 64 characters',
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
  methods: {
    async getUser() {
      let userID = ''
      if (store.state.user.user_id) {
        userID = store.state.user.user_id
      } else {
        userID = await this.signin().catch((err) => {
          return Promise.reject(err)
        })
      }
      const user = await this.getUserAPI(userID).catch((err) => {
        return Promise.reject(err)
      })
      if (!user) {
        return false
      }
      this.userForm.data = {
        id: user.user_id,
        sub: user.sub,
        name: user.name,
        updated_at: user.updated_at,
      }
    },
    async putUser() {
      const user = await this.putUserAPI(this.userForm.data.name).catch(
        (err) => {
          this.$refs.snackbar.notifyError(err.response.data)
          return Promise.reject(err)
        }
      )
      store.commit('storeUser', user)
      this.getUser()
      this.$refs.snackbar.notifySuccess('Success: Your profile updated.')
    },
    handleSubmit() {
      if (!this.$refs.form.validate()) {
        return
      }
      this.putUser()
    },
  },
}
</script>
