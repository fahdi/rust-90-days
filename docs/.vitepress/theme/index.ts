import DefaultTheme from 'vitepress/theme'
import './custom.css'
import ProgressTracker from './ProgressTracker.vue'
import Layout from './Layout.vue'

export default {
  extends: DefaultTheme,
  Layout,
  enhanceApp({ app }) {
    app.component('ProgressTracker', ProgressTracker)
  }
}