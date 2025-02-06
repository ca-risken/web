<template>
  <v-dialog v-model="internalDialog" max-width="60%">
    <v-card>
      <v-container>
        <v-row>
          <v-col cols="9">
            <v-card-title class="text-h5">
              <span class="mx-4">
                {{ $t(`item['Recommendation']`) }}
              </span>
            </v-card-title>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="4">
            <v-list-item prepend-icon="mdi-identifier">
              <v-list-item-title>
                {{ recommendModel.recommend_id }}
              </v-list-item-title>
              <v-list-item-subtitle>
                {{ $t(`item['Recommend ID']`) }}
              </v-list-item-subtitle>
            </v-list-item>
          </v-col>
          <v-col cols="4">
            <v-list-item prepend-icon="mdi-identifier">
              <v-list-item-title>
                {{ recommendModel.finding_id }}
              </v-list-item-title>
              <v-list-item-subtitle>
                {{ $t(`item['Finding ID']`) }}
              </v-list-item-subtitle>
            </v-list-item>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="6">
            <v-list-item prepend-icon="mdi-tag-multiple">
              <v-list-item-title>
                {{ recommendModel.type }}
              </v-list-item-title>
              <v-list-item-subtitle>
                {{ $t(`item['Type']`) }}
              </v-list-item-subtitle>
            </v-list-item>
          </v-col>
          <v-col cols="6">
            <v-list-item
              :prepend-icon="getDataSourceIcon(recommendModel.data_source)"
            >
              <v-list-item-title>
                {{ recommendModel.data_source }}
              </v-list-item-title>
              <v-list-item-subtitle>{{
                $t(`item['Data Source']`)
              }}</v-list-item-subtitle>
            </v-list-item>
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="12">
            <v-list-item prepend-icon="mdi-comment-alert-outline">
              <v-list-item class="pa-0 ma-0 wrap">
                <auto-link :text="recommendModel.risk" />
              </v-list-item>
              <v-list-item-subtitle>{{
                $t(`item['Risk']`)
              }}</v-list-item-subtitle>
            </v-list-item>
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="12">
            <v-alert
              type="info"
              icon="mdi-run"
              color="purple-lighten-2"
              prominent
              variant="outlined"
              border="start"
              border-color="purple-lighten-2"
              class="mb-4 mt-4 pa-6 font-weight-medium wrap"
            >
              <auto-link :text="recommendModel.recommendation" />
            </v-alert>
          </v-col>
        </v-row>
      </v-container>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn text variant="outlined" color="grey-darken-1" @click="close">
          {{ $t(`btn['CANCEL']`) }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import mixin from '@/mixin'
import AutoLink from '@/component/text/AutoLink.vue'

export default {
  name: 'RecommendDialog',
  components: {
    AutoLink,
  },
  mixins: [mixin],
  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
    recommendModel: {
      type: Object,
      default: () => ({
        recommend_id: '',
        finding_id: '',
        data_source: '',
        type: '',
        risk: '',
        recommendation: '',
      }),
    },
  },
  computed: {
    internalDialog: {
      get() {
        return this.modelValue
      },
      set(val) {
        this.$emit('update:modelValue', val)
      },
    },
  },
  methods: {
    close() {
      this.internalDialog = false
    },
  },
}
</script>

<style scoped>
.wrap {
  word-wrap: break-word;
  white-space: pre-wrap;
}
</style>
