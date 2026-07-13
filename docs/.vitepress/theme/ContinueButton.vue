<template>
  <div class="continue-cta-row">
    <div v-if="firstAction" class="action">
      <VPButton
        tag="a"
        size="medium"
        :theme="firstAction.theme || 'brand'"
        :text="firstAction.text"
        :href="firstAction.link"
      />
    </div>
    <div class="action">
      <VPButton tag="a" size="medium" theme="alt" :text="label" :href="link" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useData } from 'vitepress'
import { VPButton } from 'vitepress/theme'

const TOTAL_LESSONS = 90
const { frontmatter } = useData()

const firstAction = computed(() => {
  const actions = frontmatter.value.hero && frontmatter.value.hero.actions
  return actions && actions[0]
})

const label = ref('View Weeks')
const link = ref('/week-01/')

function pad(n) {
  return String(n).padStart(2, '0')
}

function weekForDay(day) {
  return day <= 84 ? Math.ceil(day / 7) : 13
}

function findNextIncompleteDay(completed) {
  for (let day = 1; day <= TOTAL_LESSONS; day++) {
    if (!completed.has(`day-${pad(day)}`)) return day
  }
  return null
}

onMounted(() => {
  const actions = frontmatter.value.hero && frontmatter.value.hero.actions
  if (actions && actions[1]) {
    label.value = actions[1].text
    link.value = actions[1].link
  }

  let saved
  try {
    saved = localStorage.getItem('rust90days-progress')
  } catch (e) {
    return
  }
  if (!saved) return

  let data
  try {
    data = JSON.parse(saved)
  } catch (e) {
    return
  }

  const completed = new Set(data.completed || [])
  if (completed.size === 0) return

  const nextDay = findNextIncompleteDay(completed)

  if (nextDay === null) {
    label.value = 'Review Any Lesson'
    link.value = '/week-01/'
    return
  }

  const week = weekForDay(nextDay)
  label.value = `Continue Day ${nextDay} →`
  link.value = `/week-${pad(week)}/day-${pad(nextDay)}`
})
</script>
