---
layout: home

hero:
  name: "Rust in 90 Days"
  text: "Master Rust Programming"
  tagline: "10-minute daily lessons to go from beginner to expert"
  image:
    src: /logo.svg
    alt: Rust logo
  actions:
    - theme: brand
      text: Start Learning
      link: /introduction
    - theme: alt
      text: View Weeks
      link: /week-01/

features:
  - icon: 🦀
    title: Learn Rust Fundamentals
    details: Master memory safety, ownership, and zero-cost abstractions through practical examples
  - icon: ⚡
    title: Just 10 Minutes Daily
    details: Bite-sized lessons designed to fit into your busy schedule with maximum learning impact
  - icon: 🎯
    title: Structured Learning Path
    details: 13 weeks of carefully crafted progression from beginner concepts to expert topics
  - icon: 📊
    title: Track Your Progress
    details: Built-in progress tracking to maintain your learning streak and celebrate milestones
  - icon: 💻
    title: Hands-On Practice
    details: Every lesson includes practical code examples and challenges to reinforce learning
  - icon: 🏗️
    title: Real Projects
    details: Build 7 progressively complex projects throughout your 90-day journey
---

<div class="journey-grid">

<div>

## 🌟 Week 1-2: Foundation
**Days 1-14**

Start your Rust journey with the basics: variables, functions, control flow, and project organization. Build your first CLI tools.

**Projects:** Temperature Converter, CLI Calculator

</div>

<div>

## 🔐 Week 3-4: Ownership
**Days 15-28**

Master Rust's unique ownership system - the key to memory safety without garbage collection.

**Projects:** Text Analyzer

</div>

<div>

## 🏗️ Week 5-6: Structs & Enums
**Days 29-42**

Build complex data structures and handle different program states with confidence.

**Projects:** Config Parser, JSON-like Data Structure

</div>

<div>

## 📚 Week 7-8: Collections
**Days 43-56**

Work with vectors, hashmaps, and powerful iterators. Master functional programming with closures.

**Projects:** Word Frequency Counter

</div>

<div>

## 🎨 Week 9-10: Traits & Generics
**Days 57-70**

Write flexible, reusable code with traits and generics. Understand polymorphism the Rust way.

**Projects:** Generic Data Store

</div>

<div>

## 🧠 Week 11-12: Advanced Topics
**Days 71-84**

Dive deep into lifetimes and smart pointers for sophisticated memory management patterns.

**Projects:** Graph Data Structure

</div>

<div>

## 🚀 Week 13: Expert Level
**Days 85-90**

Explore async/await, macros, and unsafe Rust for production-ready applications.

**Projects:** Micro Web Server

</div>

</div>

## Why Rust in 90 Days?

**🎯 Proven Learning Method**  
Based on the science of spaced repetition and progressive complexity

**⏰ Fits Your Schedule**  
Only 10 minutes per day - sustainable for working professionals

**🛠️ Practical Focus**  
Learn by building real projects, not just reading theory

**📈 Measurable Progress**  
Track your daily streak and see your skills improve week by week

**🌍 Modern Curriculum**  
Covers the latest Rust features and best practices

---

<style>
.VPButton {
  display: inline-block;
  border: 1px solid transparent;
  text-align: center;
  font-weight: 600;
  white-space: nowrap;
  transition: color 0.25s, border-color 0.25s, background-color 0.25s;
  border-radius: 20px;
  padding: 0 20px;
  line-height: 38px;
  font-size: 14px;
}

.VPButton.brand {
  border-color: var(--vp-button-brand-border);
  color: var(--vp-button-brand-text);
  background-color: var(--vp-button-brand-bg);
}

.VPButton.brand:hover {
  border-color: var(--vp-button-brand-hover-border);
  color: var(--vp-button-brand-hover-text);
  background-color: var(--vp-button-brand-hover-bg);
}

@media (min-width: 640px) {
  .VPButton {
    padding: 0 24px;
    line-height: 44px;
    font-size: 16px;
  }
}
</style>