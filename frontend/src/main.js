import './assets/main.css'

import { createApp } from 'vue'
import store from './stores'
import App from './App.vue'
import router from './router'

import PrimeVue from 'primevue/config'
import Aura from '@primevue/themes/aura'
import 'primeicons/primeicons.css'

// All Primevue components (add more later)
import Menubar from 'primevue/menubar'
import Button from 'primevue/button'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import InputText from 'primevue/inputtext'
import Dropdown from 'primevue/dropdown'
import Dialog from 'primevue/dialog'
import InputNumber from 'primevue/inputnumber'
import Tag from 'primevue/tag'
import Toast from 'primevue/toast'
import Badge from 'primevue/badge'
import ToastService from 'primevue/toastservice'; 

const app = createApp(App)

app.use(store)
app.use(router)

app.use(PrimeVue, {
    ripple: true,
    theme: {
        preset: Aura
    }
})
app.use(ToastService) // Toast Service useable

// Application Components
app.component('Menubar', Menubar)
app.component('Button', Button)
app.component('DataTable', DataTable)
app.component('Column', Column)
app.component('InputText', InputText)
app.component('Dropdown', Dropdown)
app.component('Dialog', Dialog)
app.component('InputNumber', InputNumber)
app.component('Tag', Tag)
app.component('Toast', Toast)
app.component('Badge', Badge)

app.mount('#app')