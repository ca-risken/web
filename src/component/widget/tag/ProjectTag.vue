<template>
  <v-dialog v-model="tagDialog" max-width="400px" @click:outside="handleCancel">
    <v-card>
      <v-card-title class="headline">
        <v-icon left>mdi-label</v-icon>
        <span class="mx-2">{{ $t(`view.project['Project Tag']`) }}</span>
      </v-card-title>
      <v-card-text>
        <v-form v-model="projectTagForm.valid" ref="tagForm">
          <v-text-field
            v-model="projectTagModel.tag"
            :label="$t(`item['` + projectTagForm.tag.label + `']`) + ' *'"
            :placeholder="projectTagForm.tag.placeholder"
            :counter="512"
            :rules="projectTagForm.tag.validator"
            outlined
          ></v-text-field>
          <v-color-picker
            v-model="projectTagModel.color"
            dot-size="9"
            hide-sliders
            mode="hexa"
            :swatches="projectTagForm.swatches"
            show-swatches
            width="500"
            swatches-max-height="150"
          ></v-color-picker>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn text outlined color="grey darken-1" @click="handleCancel">
          {{ $t(`btn['CANCEL']`) }}
        </v-btn>
        <v-btn
          color="blue darken-1"
          text
          outlined
          :loading="loading"
          @click="handleTagSubmit"
        >
          {{ $t(`btn['TAG']`) }}
        </v-btn>
      </v-card-actions>
      <v-card-actions>
        <v-spacer />
        <v-btn
          text
          color="success darken-1"
          style="text-transform: none"
          @click="handleGoToProject"
        >
          {{ $t(`btn['View registerd project tags']`) }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
// import mixin from '@/mixin'
import project from '@/mixin/api/project'
export default {
  name: 'ProjectTag',
  mixins: [project],
  components: {},
  props: {
    tagDialog: {
      type: Boolean,
    },
    projectTagModel: {
      type: Object,
      default: () => ({
        project_id: '',
        tag: '',
        created_at: '',
        updated_at: '',
        color: {
          types: ['hex', 'hexa', 'rgba', 'hsla', 'hsva'],
          type: 'hex',
          hex: '#FF00FF',
          hexa: '#FF00FFFF',
          rgba: { r: 255, g: 0, b: 255, a: 1 },
          hsla: { h: 300, s: 1, l: 0.5, a: 1 },
          hsva: { h: 300, s: 1, v: 1, a: 1 },
        },
      }),
    },
  },
  data() {
    return {
      loading: false,
      // projectTagModel: this.projectTagModel,
      // projectTagModel: {
      //   project_id: '',
      //   tag: '',
      //   created_at: '',
      //   updated_at: '',
      //   color: {
      //     types: ['hex', 'hexa', 'rgba', 'hsla', 'hsva'],
      //     type: 'hex',
      //     hex: '#FF00FF',
      //     hexa: '#FF00FFFF',
      //     rgba: { r: 255, g: 0, b: 255, a: 1 },
      //     hsla: { h: 300, s: 1, l: 0.5, a: 1 },
      //     hsva: { h: 300, s: 1, v: 1, a: 1 },
      //   },
      // },
      projectTagForm: {
        valid: false,
        tag: {
          label: 'Tag',
          placeholder: 'key:value',
          validator: [
            (v) => !!v || 'Tag is required',
            (v) =>
              !v || v.length <= 512 || 'Tag must be less than 512 characters',
          ],
        },
        swatches: [
          ['#F44336'],
          ['#E91E63'],
          ['#9C27B0'],
          ['#673AB7'],
          ['#3F51B5'],
          ['#2196F3'],
          ['#03A9F4'],
          ['#00BCD4'],
          ['#009688'],
          ['#4CAF50'],
          ['#8BC34A'],
          ['#CDDC39'],
          ['#FFEB3B'],
          ['#FFC107'],
          ['#FF9800'],
          ['#FF5722'],
          ['#795548'],
          ['#9E9E9E'],
        ],
      },
    }
  },
  mounted() {},
  methods: {
    async tagProject() {
      await this.tagProjectAPI(
        this.projectTagModel.tag,
        this.projectTagModel.color.hexa
      ).catch((err) => {
        this.$refs.snackbar.notifyError(err)
        return Promise.reject(err)
      })
    },

    // Handler
    async handleTagSubmit() {
      if (!this.$refs.tagForm.validate()) {
        return
      }
      this.loading = true
      await this.tagProject()
      await new Promise((resolve) => setTimeout(resolve, 1000))
      this.loading = false
      this.handleUpdated('Success: Tag project.')
    },

    handleUpdated(message) {
      this.$emit('projectTagUpdated', message)
    },
    handleCancel() {
      this.$emit('projectTagCancel', false)
    },
    handleGoToProject() {
      if (this.$route.path == '/project/setting/') {
        this.handleCancel()
        return
      }
      this.$router.push({ path: '/project/setting/' })
    },
  },
}
</script>
