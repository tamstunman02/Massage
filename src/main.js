import 'bootstrap/dist/css/bootstrap.min.css'
import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import AppIcon from './components/AppIcon.vue'

const app = createApp(App)
app.component('AppIcon', AppIcon)
app.mount('#app')
