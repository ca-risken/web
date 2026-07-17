<template>
  <div>
    <v-container>
      <page-header
        icon="mdi-github"
        icon-color="black"
        :title="$t(`submenu['GitHub App']`)"
      />

      <v-row dense>
        <v-col cols="12">
          <p class="text-body-1 text-medium-emphasis mb-6">
            {{ $t(`item['GitHub App Install Page Lead']`) }}
          </p>
        </v-col>
      </v-row>

      <v-row dense>
        <v-col cols="12">
          <v-card rounded="lg" variant="flat" class="github-app-install-card">
            <v-card-text>
              <div class="d-flex align-start mb-4">
                <v-icon
                  color="green-darken-1"
                  icon="mdi-shield-check-outline"
                  size="32"
                  class="mr-4 mt-1"
                />
                <div>
                  <div class="text-h5 font-weight-bold mb-2">
                    {{ $t(`item['GitHub App Install Section Title']`) }}
                  </div>
                  <div class="text-body-1 text-medium-emphasis">
                    {{ $t(`item['GitHub App Install Section Lead']`) }}
                  </div>
                </div>
              </div>

              <v-alert
                class="github-app-install-owner-notice mb-5"
                density="comfortable"
                type="info"
                variant="tonal"
              >
                <div>
                  {{ $t(`item['GitHub App Install Owner Notice Primary']`) }}
                </div>
                <div>
                  {{ $t(`item['GitHub App Install Owner Notice Secondary']`) }}
                </div>
              </v-alert>

              <v-list class="github-app-install-list mb-6" density="compact">
                <v-list-item
                  v-for="item in checklist"
                  :key="item"
                  prepend-icon="mdi-check-circle-outline"
                >
                  <template v-slot:title>
                    <span v-if="item === 'GitHub App Install Checklist After'">
                      {{
                        $t(
                          `item['GitHub App Install Checklist After Before Link']`
                        )
                      }}
                      <router-link :to="githubSettingListTo">
                        {{
                          $t(
                            `item['GitHub App Install Checklist After Link Text']`
                          )
                        }}
                      </router-link>
                      {{
                        $t(
                          `item['GitHub App Install Checklist After After Link']`
                        )
                      }}
                    </span>
                    <span v-else>
                      {{ $t(`item['` + item + `']`) }}
                    </span>
                  </template>
                </v-list-item>
              </v-list>

              <div class="text-body-2 text-medium-emphasis mb-3">
                {{ $t(`item['GitHub App Install Before Open Note']`) }}
              </div>

              <v-btn
                color="deep-purple-lighten-1"
                size="large"
                :href="installURL"
                target="_blank"
                rel="noopener noreferrer"
                append-icon="mdi-open-in-new"
                :loading="loadingInstallURL"
                :disabled="!installURL"
              >
                {{ $t(`btn['OPEN INSTALL PAGE']`) }}
              </v-btn>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import PageHeader from '@/component/widget/toolbar/PageHeader.vue'
import mixin from '@/mixin'
import code from '@/mixin/api/code'

export default {
  name: 'GitHubAppInstall',
  mixins: [mixin, code],
  components: {
    PageHeader,
  },
  data() {
    return {
      installURL: '',
      loadingInstallURL: true,
      checklist: [
        'GitHub App Install Checklist Owner',
        'GitHub App Install Checklist Target',
        'GitHub App Install Checklist After',
      ],
    }
  },
  async mounted() {
    const installURL = await this.getGitHubAppInstallURLAPI().catch(() => '')
    if (this.isAllowedGitHubAppInstallURL(installURL)) {
      this.installURL = installURL
    }
    this.loadingInstallURL = false
  },
  computed: {
    githubSettingListTo() {
      const query = {}
      if (this.$route.query.project_id) {
        query.project_id = this.$route.query.project_id
      }
      return {
        path: '/code/github',
        query,
      }
    },
  },
  methods: {
    isAllowedGitHubAppInstallURL(rawURL) {
      try {
        const url = new URL(rawURL)
        return (
          url.protocol === 'https:' &&
          url.hostname === 'github.com' &&
          /^\/apps\/[a-z0-9-]+\/installations\/select_target$/.test(
            url.pathname
          )
        )
      } catch {
        return false
      }
    },
  },
}
</script>

<style scoped>
.github-app-install-card {
  border: 1px solid rgb(var(--v-theme-outline-variant));
}

.github-app-install-list {
  border: 1px solid rgb(var(--v-theme-outline-variant));
  border-radius: 8px;
}

.github-app-install-owner-notice {
  color: #0d47a1;
}
</style>
