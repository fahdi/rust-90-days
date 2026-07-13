<script setup>
import DefaultTheme from 'vitepress/theme'
import ContinueButton from './ContinueButton.vue'

const { Layout } = DefaultTheme
</script>

<template>
  <Layout>
    <template #home-hero-actions-after>
      <ContinueButton />
    </template>
  </Layout>
</template>
