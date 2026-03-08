<template>
  <button
  id="secret-url-email"
  ref="emailButton"
  class="btn btn-secondary email-btn"
  @click="sendEmail"
>
  <img src="/img/Outlook.png" class="outlook-icon">
</button>

<div class="toast-container position-fixed start-50 translate-middle-x p-3" style="top:10%;">
  <div id="emailToast" class="toast align-items-center text-bg-success border-0 shadow-lg" role="alert">
    <div class="d-flex">
      <div class="toast-body">
        El enlace fue enviado correctamente por correo.
      </div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
    </div>
  </div>
</div>

</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { Toast } from 'bootstrap'

export default defineComponent({

  name: 'AppEmailButton',

  computed: {
    customize(): any {
      return window.OTSCustomize || {}
    },
  },

  props: {
    qrContent: {
      required: true,
      type: String,
    },
  },

  methods: {
    sendEmail() {

    const toastElement = document.getElementById('emailToast')
    const toast = new Toast(toastElement)

    toast.show()
}
}
   

})
</script>