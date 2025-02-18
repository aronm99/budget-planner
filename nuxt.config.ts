import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'
export default defineNuxtConfig({
  css: [
    'vuetify/lib/styles/main.sass',
    '@mdi/font/css/materialdesignicons.min.css'
  ],

  build: {
    transpile: ['vuetify'],
  },

  modules: [
    (_options, nuxt) => {
      nuxt.hooks.hook('vite:extendConfig', (config) => {
        // @ts-expect-error
        config.plugins.push(vuetify({ autoImport: true }))
      })
    },
    //...
  ],

  vite: {
    vue: {
      template: {
        transformAssetUrls,
      },
    },
  },

  runtimeConfig: {
    googleClientId: "",
    googleClientSecret: "",
    googleRedirectUri: "",
    openAiApiKey: "",
    jinaAiApiKey: "",
    tavilyApiKey: "",
    reasonModel: "",
    genModel: "",
  },

  devtools: { enabled: true },
  compatibilityDate: '2025-01-12',
})