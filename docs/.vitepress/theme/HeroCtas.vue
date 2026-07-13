<template>
  <div class="rd-hero-ctas">
    <a class="rd-btn rd-btn-solid" :href="withBase('/introduction')">Start Learning</a>
    <a class="rd-btn rd-btn-outline" :href="withBase(link)">{{ label }}</a>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { withBase } from 'vitepress'

const TOTAL_LESSONS = 90

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
