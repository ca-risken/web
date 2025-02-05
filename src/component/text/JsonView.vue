<template>
  <div>
    <v-card dark color="grey-darken-3" class="ma-4">
      <v-card-text class="title font-weight-bold" density="comfortable">
        <json-viewer
          :value="parsedJson"
          :expand-depth="5"
          :sort="false"
          :copyable="true"
          :show-array-index="false"
          :preview-mode="false"
          theme="finding-json-theme"
        ></json-viewer>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
import JsonViewer from 'vue-json-viewer'

export default {
  name: 'jsonView',
  components: {
    JsonViewer,
  },
  props: {
    jsonData: {
      type: String,
      default: '',
    },
  },
  computed: {
    parsedJson() {
      try {
        return this.jsonData ? JSON.parse(this.jsonData) : {}
      } catch (e) {
        console.error('JSON parse error:', e)
        return {}
      }
    },
    prettyJson() {
      try {
        return this.jsonData
          ? JSON.stringify(JSON.parse(this.jsonData), null, 2)
          : ''
      } catch (e) {
        return this.jsonData
      }
    },
  },
}
</script>

<style>
.finding-json-theme {
  background: #424242;
  white-space: nowrap;
  color: #eee;
  font-size: 18px;

  .jv-ellipsis {
    color: #eee;
    background-color: #424242;
    display: inline-block;
    line-height: 0.9;
    font-size: 0.9em;
    padding: 0px 4px 2px 4px;
    border-radius: 3px;
    vertical-align: 2px;
    cursor: pointer;
    user-select: none;
  }

  .jv-button {
    color: #49b3ff;
  }

  .jv-key {
    color: rgb(181, 216, 55);
  }

  .jv-link {
    color: #068cca;
  }

  .jv-item {
    &.jv-array {
      color: #eee;
    }

    &.jv-boolean {
      color: #b3e5fc;
    }

    &.jv-function {
      color: #068cca;
    }

    &.jv-number {
      color: #42b983;
    }

    &.jv-number-float {
      color: #42b983;
    }

    &.jv-number-integer {
      color: #42b983;
    }

    &.jv-object {
      color: #eee;
    }

    &.jv-undefined {
      color: #e08331;
    }

    &.jv-string {
      color: #eee;
      word-break: break-word;
      white-space: normal;
    }
  }

  .jv-code {
    padding: 1px;
    line-height: 2rem;

    .jv-toggle {
      &:before {
        padding: 0px 2px;
        border-radius: 2px;
      }

      &:hover {
        &:before {
          background: #eee;
        }
      }
    }
  }
}
</style>
