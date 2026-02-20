import './assets/main.css'

import { createApp } from 'vue'
import store from './stores'
import App from './App.vue'
import router from './router'

import PrimeVue from 'primevue/config'
import Aura from '@primevue/themes/aura'
import 'primeicons/primeicons.css'

import Menubar from 'primevue/menubar'
import Button from 'primevue/button'

const app = createApp(App)

app.use(store)
app.use(router)

app.use(PrimeVue, {
    ripple: true,
    theme: {
        preset: Aura
    }
})

app.component('Menubar', Menubar)
app.component('Button', Button)

app.mount('#app')
