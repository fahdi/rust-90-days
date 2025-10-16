import DefaultTheme from 'vitepress/theme'
import './custom.css'
import ProgressTracker from './ProgressTracker.vue'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('ProgressTracker', ProgressTracker)
  }
}