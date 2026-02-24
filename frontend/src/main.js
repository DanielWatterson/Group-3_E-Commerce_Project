import './assets/main.css'

import { createApp } from 'vue'
import store from './stores'
import App from './App.vue'
import router from './router'

import PrimeVue from 'primevue/config'
import Aura from '@primevue/themes/aura'
import 'primeicons/primeicons.css'
import ToastService from 'primevue/toastservice'

// Import all PrimeVue components used in the app
import Menubar from 'primevue/menubar'
import Button from 'primevue/button'
import Card from 'primevue/card'
import InputText from 'primevue/inputtext'
import Dropdown from 'primevue/dropdown'
import Dialog from 'primevue/dialog'
import InputNumber from 'primevue/inputnumber'
import Tag from 'primevue/tag'
import Toast from 'primevue/toast'
import Badge from 'primevue/badge'
import Drawer from 'primevue/drawer'
import RadioButton from 'primevue/radiobutton'
import Checkbox from 'primevue/checkbox'

const app = createApp(App)

app.use(store)
app.use(router)
app.use(PrimeVue, {
    ripple: true,
    theme: {
        preset: Aura,
         options: {
        darkModeSelector: false || 'none',
    }
    }
})
app.use(ToastService)

// Register all components
app.component('Menubar', Menubar)
app.component('Button', Button)
app.component('Card', Card)
app.component('InputText', InputText)
app.component('Dropdown', Dropdown)
app.component('Dialog', Dialog)
app.component('InputNumber', InputNumber)
app.component('Tag', Tag)
app.component('Toast', Toast)
app.component('Badge', Badge)
app.component('Drawer', Drawer)
app.component('RadioButton', RadioButton)
app.component('Checkbox', Checkbox)

app.mount('#app')