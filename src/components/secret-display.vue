<template> 
  <div class="card border-primary-subtle mb-3">
    <div class="card-header bg-primary-subtle">
      {{ $t('title-reading-secret') }}
    </div>
    <div class="card-body">
      <template v-if="!secret && files.length === 0">
        <p>{{ $t('text-pre-reveal-hint') }}</p>

         <div class="mb-3">
            <label class="form-label">
              Ingrese el username AD para desbloquear
            </label>
            <input
              v-model="usernameInput"
              type="text"
              class="form-control"
              maxlength="50"
              placeholder="Username obligatorio"
              />
            </div>

            <button
              class="btn btn-success"
              :disabled="secretLoading"
              @click="requestSecret"
            >

          <template v-if="!secretLoading">
            {{ $t('btn-reveal-secret') }}
          </template>
          <template v-else>
            <i class="fa-solid fa-spinner fa-spin-pulse" />
            {{ $t('btn-reveal-secret-processing') }}
          </template>
        </button>
      </template>
      <template v-else>
        <div
          v-if="secret"
          class="input-group mb-3"
        >
          <grow-area
            class="form-control"
            readonly
            :value="secret"
            :rows="4"
          />
          <div class="d-flex align-items-start p-0">
            <div
              class="btn-group-vertical"
              role="group"
            >
              <app-clipboard-button
                :content="secret"
                :title="$t('tooltip-copy-to-clipboard')"
              />
              <a
                class="btn btn-secondary"
                :href="secretContentBlobURL || ''"
                download
                :title="$t('tooltip-download-as-file')"
              >
                <i class="fas fa-fw fa-download" />
              </a>
              <app-qr-button :qr-content="secret" />
            </div>
          </div>
        </div>
        <template v-if="files.length > 0">
          <p>{{ $t('text-attached-files') }}</p>
          <FilesDisplay :files="files" />
        </template>
        <p>{{ $t('text-hint-burned') }}</p>
      </template>
    </div>
  </div>
</template>

<script lang="ts">
import appClipboardButton from './clipboard-button.vue'
import appCrypto from '../crypto.ts'
import appQrButton from './qr-button.vue'
import { defineComponent } from 'vue'
import FilesDisplay from './fileDisplay.vue'
import GrowArea from './growarea.vue'
import OTSMeta from '../ots-meta'

export default defineComponent({
  components: { FilesDisplay, GrowArea, appClipboardButton, appQrButton },

  data() {
    return {
      files: [],
      popover: null,
      secret: null,
      usernameInput: '',
      encryptedSecret: null,
      secretContentBlobURL: null,
      secretLoading: false,
    }
  },

  emits: ['error'],
methods: {

  requestSecret(): void {

    if (this.securePassword && !this.usernameInput) {
      alert('Debe ingresar el username AD')
      return
    }

    this.secretLoading = true
    window.history.replaceState({}, '', window.location.href.split('#')[0])

    if (this.encryptedSecret) {
      this.tryDecrypt(this.encryptedSecret)
      return
    }

    fetch(`api/get/${this.secretId}`)
      .then(resp => {

        if (resp.status === 404) {
          this.secretLoading = false
          this.$emit('error', this.$t('alert-secret-not-found'))
          return
        }

        if (resp.status !== 200) {
          this.secretLoading = false
          this.$emit('error', this.$t('alert-something-went-wrong'))
          return
        }

        return resp.json()
      })
      .then(data => {
        if (!data) return

        const secret = data.secret
        this.encryptedSecret = secret

        if (!this.securePassword) {
          this.secret = secret
          this.secretLoading = false
          return
        }

        this.tryDecrypt(secret)
      })
      .catch(() => {
        this.secretLoading = false
        this.$emit('error', this.$t('alert-something-went-wrong'))
      })
  },

  tryDecrypt(secret: string): void {

    const finalKey = this.securePassword + this.usernameInput

    appCrypto.dec(secret, finalKey)
      .then(secret => {
        const meta = new OTSMeta(secret)
        this.secret = meta.secret

        meta.files.forEach(file => {
          file.arrayBuffer().then(ab => {
            const blobURL = window.URL.createObjectURL(
              new Blob([ab], { type: file.type })
            )

            this.files.push({
              id: window.crypto.randomUUID(),
              name: file.name,
              size: ab.byteLength,
              type: file.type,
              url: blobURL,
            })
          })
        })

        this.secretLoading = false
      })
      .catch(() => {
        this.secretLoading = false
        alert('Username AD incorrecto')
      })
  }

},

  name: 'AppSecretDisplay',
  props: {
    secretId: {
      required: true,
      type: String,
    },

    securePassword: {
      default: null,
      required: false,
      type: String,
    },
  },

  watch: {
    secret(to) {
      if (this.secretContentBlobURL) {
        window.URL.revokeObjectURL(this.secretContentBlobURL)
      }
      this.secretContentBlobURL = window.URL.createObjectURL(new Blob([to], { type: 'text/plain' }))
    },
  },
})
</script>
