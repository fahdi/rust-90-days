import DefaultTheme from 'vitepress/theme'
import './custom.css'
import ProgressTracker from './ProgressTracker.vue'
import HeroCtas from './HeroCtas.vue'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('ProgressTracker', ProgressTracker)
    app.component('HeroCtas', HeroCtas)
  }
}
