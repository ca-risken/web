<template>
  <div>
    <v-container>
      <v-row dense justify="center" align-content="center">
        <v-col cols="12">
          <v-toolbar color="background" flat>
            <v-toolbar-title class="grey--text text--darken-4">
              <v-icon large class="pr-2">{{ config.icon }}</v-icon>
              {{ config.title }}
            </v-toolbar-title>
            <v-spacer />
            <v-btn
              v-if="config.showCancelButton"
              variant="outlined"
              color="grey-darken-1"
              @click="$emit('cancel')"
            >
              {{ $t(`btn['CANCEL']`) }}
            </v-btn>
          </v-toolbar>
        </v-col>
      </v-row>

      <v-row dense justify="center" align-content="center">
        <v-col :cols="config.colSize || 10">
          <v-card>
            <!-- Main Form Section -->
            <v-card-title v-if="config.cardTitle">
              <v-icon large class="pr-2">{{ config.cardIcon }}</v-icon>
              {{ config.cardTitle }}
            </v-card-title>
            <v-divider v-if="config.cardTitle"></v-divider>

            <v-card-text>
              <v-form :model="formValid" ref="form">
                <!-- ID Field (read-only for existing items) -->
                <v-text-field
                  v-if="config.showIdField"
                  :model-value="modelValue.id"
                  :label="$t(`item['ID']`)"
                  placeholder="-"
                  variant="outlined"
                  :density="config.density || 'default'"
                  disabled
                  class="mb-4"
                ></v-text-field>

                <!-- Name Field -->
                <v-text-field
                  :model-value="modelValue.name"
                  @update:model-value="updateField('name', $event)"
                  :label="$t(`item['Name']`) + ' *'"
                  :placeholder="config.namePlaceholder"
                  :counter="64"
                  :rules="config.nameRules"
                  required
                  variant="outlined"
                  :density="config.density || 'default'"
                  class="mb-4"
                ></v-text-field>

                <!-- Description Field (optional) -->
                <v-textarea
                  v-if="config.showDescriptionField"
                  :model-value="modelValue.description"
                  @update:model-value="updateField('description', $event)"
                  :label="$t(`item['Description']`)"
                  :placeholder="config.descriptionPlaceholder"
                  :counter="255"
                  variant="outlined"
                  :density="config.density || 'default'"
                  rows="3"
                  class="mb-4"
                ></v-textarea>
              </v-form>

              <v-card-actions>
                <v-spacer />
                <v-btn
                  v-if="config.showCancelButton"
                  variant="outlined"
                  color="grey-darken-1"
                  @click="$emit('cancel')"
                >
                  {{ $t(`btn['CANCEL']`) }}
                </v-btn>
                <v-btn
                  variant="outlined"
                  color="green-darken-1"
                  :loading="loading"
                  @click="handleSave"
                >
                  {{ $t(`btn['SAVE']`) }}
                </v-btn>
              </v-card-actions>
            </v-card-text>

            <!-- Tags Section (for projects only) -->
            <template v-if="config.showTagsSection">
              <v-divider />
              <v-card-text>
                <v-chip
                  v-for="tag in modelValue.tag"
                  :key="tag.tag"
                  :color="tag.color"
                  class="ma-2 text-white"
                  :closable="true"
                  variant="flat"
                  @click="$emit('edit-tag', tag)"
                  @click:close.stop.prevent="$emit('delete-tag', tag)"
                >
                  {{ tag.tag }}
                </v-chip>
                <v-card-actions>
                  <v-spacer />
                  <v-btn
                    variant="outlined"
                    color="blue-darken-1"
                    :loading="loading"
                    @click="$emit('new-tag')"
                  >
                    {{ $t(`btn['NEW TAG']`) }}
                  </v-btn>
                </v-card-actions>
              </v-card-text>
            </template>

            <!-- Delete Section (for existing items only) -->
            <template v-if="config.showDeleteSection">
              <v-divider />
              <v-card-text>
                <v-card-actions>
                  <v-spacer />
                  <v-btn
                    variant="outlined"
                    color="red-darken-1"
                    :loading="loading"
                    @click="deleteDialog = true"
                  >
                    {{ $t(`btn['DELETE']`) }}
                  </v-btn>
                </v-card-actions>
              </v-card-text>
            </template>

            <bottom-snack-bar ref="snackbar" />
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="deleteDialog" max-width="40%">
      <v-card>
        <v-card-title class="text-h5">
          <span class="mx-4">
            {{ $t(`message['Do you really want to delete this?']`) }}
          </span>
        </v-card-title>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            text
            variant="outlined"
            color="grey-darken-1"
            @click="deleteDialog = false"
          >
            {{ $t(`btn['CANCEL']`) }}
          </v-btn>
          <v-btn
            :loading="loading"
            color="red-darken-1"
            text
            variant="outlined"
            @click="handleDeleteConfirm"
          >
            {{ $t(`btn['DELETE']`) }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import mixin from '@/mixin'
import BottomSnackBar from '@/component/widget/snackbar/BottomSnackBar.vue'

export default {
  name: 'SettingsForm',
  mixins: [mixin],
  components: {
    BottomSnackBar,
  },
  props: {
    config: {
      type: Object,
      required: true,
      default: () => ({
        icon: 'mdi-cog',
        title: 'Settings',
        showCancelButton: false,
        showIdField: false,
        showDescriptionField: false,
        showTagsSection: false,
        showDeleteSection: false,
        namePlaceholder: 'Enter name',
        descriptionPlaceholder: 'Enter description',
        nameRules: [
          (v) => !!v || 'Name is required',
          (v) => !v || v.length <= 64 || 'Name must be less than 64 characters',
        ],
        density: 'default',
        colSize: 10,
      }),
    },
    modelValue: {
      type: Object,
      required: true,
      default: () => ({
        id: '',
        name: '',
        description: '',
        tag: [],
      }),
    },
    loading: {
      type: Boolean,
      default: false,
    },
  },
  emits: [
    'update:modelValue',
    'save',
    'cancel',
    'delete',
    'delete-confirm',
    'new-tag',
    'edit-tag',
    'delete-tag',
  ],
  data() {
    return {
      formValid: false,
      deleteDialog: false,
    }
  },
  methods: {
    updateField(field, value) {
      const updated = { ...this.modelValue, [field]: value }
      this.$emit('update:modelValue', updated)
    },
    handleSave() {
      if (!this.$refs.form.validate()) {
        return
      }
      this.$emit('save')
    },
    handleDeleteConfirm() {
      this.deleteDialog = false
      this.$emit('delete-confirm')
    },
  },
}
</script>
