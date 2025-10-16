<template>
  <div class="progress-tracker">
    <div class="progress-header">
      <h3>📊 Your Progress</h3>
      <button @click="resetProgress" class="reset-btn" title="Reset Progress">🔄</button>
    </div>
    
    <div class="progress-bar-container">
      <div class="progress-bar" :style="{ width: progressPercentage + '%' }">
        {{ progressPercentage }}%
      </div>
    </div>
    
    <div class="progress-stats">
      <div class="stat-item">
        <span class="stat-value">{{ completedLessons }}</span>
        <span class="stat-label">Completed</span>
      </div>
      <div class="stat-item">
        <span class="stat-value">{{ totalLessons - completedLessons }}</span>
        <span class="stat-label">Remaining</span>
      </div>
      <div class="stat-item">
        <span class="stat-value">{{ currentStreak }}</span>
        <span class="stat-label">Day Streak</span>
      </div>
      <div class="stat-item">
        <span class="stat-value">{{ currentWeek }}</span>
        <span class="stat-label">Current Week</span>
      </div>
    </div>
    
    <button 
      @click="toggleCurrentLesson" 
      :class="['lesson-complete-btn', { completed: isCurrentLessonComplete }]"
    >
      {{ isCurrentLessonComplete ? '✓ Lesson Completed' : 'Mark as Complete' }}
    </button>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vitepress'

const route = useRoute()
const totalLessons = 90
const completedLessons = ref(0)
const completedSet = ref(new Set())
const lastCompletionDate = ref(null)
const currentStreak = ref(0)

// Load progress from localStorage
onMounted(() => {
  loadProgress()
})

function loadProgress() {
  try {
    const saved = localStorage.getItem('rust90days-progress')
    if (saved) {
      const data = JSON.parse(saved)
      completedSet.value = new Set(data.completed || [])
      completedLessons.value = completedSet.value.size
      lastCompletionDate.value = data.lastCompletionDate
      currentStreak.value = data.streak || 0
      
      // Update streak
      updateStreak()
    }
  } catch (e) {
    console.error('Failed to load progress:', e)
  }
}

function saveProgress() {
  try {
    const data = {
      completed: Array.from(completedSet.value),
      lastCompletionDate: lastCompletionDate.value,
      streak: currentStreak.value,
      updatedAt: new Date().toISOString()
    }
    localStorage.setItem('rust90days-progress', JSON.stringify(data))
  } catch (e) {
    console.error('Failed to save progress:', e)
  }
}

function updateStreak() {
  const today = new Date().toDateString()
  const yesterday = new Date(Date.now() - 86400000).toDateString()
  
  if (lastCompletionDate.value === today) {
    // Already completed today, no change
    return
  } else if (lastCompletionDate.value === yesterday) {
    // Consecutive day
    currentStreak.value++
  } else if (lastCompletionDate.value !== today) {
    // Streak broken
    currentStreak.value = 1
  }
  
  lastCompletionDate.value = today
}

const progressPercentage = computed(() => {
  return Math.round((completedLessons.value / totalLessons) * 100)
})

const currentWeek = computed(() => {
  // Extract week from current route
  const match = route.path.match(/week-(\d+)/)
  return match ? parseInt(match[1]) : 1
})

const currentLessonId = computed(() => {
  // Extract day from current route
  const match = route.path.match(/day-(\d+)/)
  return match ? `day-${match[1]}` : null
})

const isCurrentLessonComplete = computed(() => {
  return currentLessonId.value && completedSet.value.has(currentLessonId.value)
})

function toggleCurrentLesson() {
  if (!currentLessonId.value) return
  
  if (completedSet.value.has(currentLessonId.value)) {
    completedSet.value.delete(currentLessonId.value)
    completedLessons.value--
  } else {
    completedSet.value.add(currentLessonId.value)
    completedLessons.value++
    updateStreak()
  }
  
  saveProgress()
}

function resetProgress() {
  if (confirm('Are you sure you want to reset all progress? This cannot be undone.')) {
    completedSet.value.clear()
    completedLessons.value = 0
    currentStreak.value = 0
    lastCompletionDate.value = null
    saveProgress()
  }
}
</script>

<style scoped>
.reset-btn {
  background: transparent;
  border: 1px solid var(--vp-c-divider);
  padding: 0.25rem 0.75rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1.2rem;
  transition: all 0.2s;
}

.reset-btn:hover {
  background: var(--vp-c-bg);
  border-color: var(--vp-c-brand);
}
</style>