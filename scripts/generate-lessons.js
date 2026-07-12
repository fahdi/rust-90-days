import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Course structure
const courseStructure = [
  {
    week: 1,
    title: "Foundation",
    description: "Learn the basics: syntax, variables, functions, and control flow.",
    days: [
      { day: 1, title: "Hello Rust", difficulty: "Beginner", time: 8 },
      { day: 2, title: "Variables & Mutability", difficulty: "Beginner", time: 9 },
      { day: 3, title: "Data Types", difficulty: "Beginner", time: 10 },
      { day: 4, title: "Strings vs &str", difficulty: "Intermediate", time: 10 },
      { day: 5, title: "Tuples & Arrays", difficulty: "Beginner", time: 9 },
      { day: 6, title: "Functions", difficulty: "Beginner", time: 10 },
      { day: 7, title: "Control Flow", difficulty: "Beginner", time: 10 }
    ]
  },
  {
    week: 2,
    title: "Control Flow & Organization",
    description: "Master loops, pattern matching, and project organization.",
    days: [
      { day: 8, title: "Loops", difficulty: "Beginner", time: 10 },
      { day: 9, title: "Pattern Matching", difficulty: "Intermediate", time: 10 },
      { day: 10, title: "Comments & Docs", difficulty: "Beginner", time: 8 },
      { day: 11, title: "Project: Temperature Converter", difficulty: "Intermediate", time: 10 },
      { day: 12, title: "Modules Basics", difficulty: "Intermediate", time: 10 },
      { day: 13, title: "Cargo Fundamentals", difficulty: "Beginner", time: 9 },
      { day: 14, title: "Project: CLI Calculator", difficulty: "Intermediate", time: 10 }
    ]
  },
  {
    week: 3,
    title: "Ownership I",
    description: "Understand Rust's unique ownership system.",
    days: [
      { day: 15, title: "What is Ownership?", difficulty: "Intermediate", time: 10 },
      { day: 16, title: "Stack vs Heap", difficulty: "Intermediate", time: 10 },
      { day: 17, title: "Ownership Rules", difficulty: "Intermediate", time: 10 },
      { day: 18, title: "Move Semantics", difficulty: "Intermediate", time: 10 },
      { day: 19, title: "Clone & Copy Traits", difficulty: "Intermediate", time: 10 },
      { day: 20, title: "References & Borrowing", difficulty: "Intermediate", time: 10 },
      { day: 21, title: "Mutable References", difficulty: "Intermediate", time: 10 }
    ]
  },
  {
    week: 4,
    title: "Ownership II",
    description: "Deep dive into borrowing, slices, and ownership patterns.",
    days: [
      { day: 22, title: "Borrowing Rules", difficulty: "Intermediate", time: 10 },
      { day: 23, title: "Slices", difficulty: "Intermediate", time: 10 },
      { day: 24, title: "String Slices Deep Dive", difficulty: "Intermediate", time: 10 },
      { day: 25, title: "Common Ownership Errors", difficulty: "Intermediate", time: 10 },
      { day: 26, title: "Dangling References", difficulty: "Intermediate", time: 9 },
      { day: 27, title: "Project: Text Analyzer", difficulty: "Intermediate", time: 10 },
      { day: 28, title: "Ownership Patterns Review", difficulty: "Intermediate", time: 10 }
    ]
  },
  {
    week: 5,
    title: "Structs & Enums I",
    description: "Build complex data structures and handle different states.",
    days: [
      { day: 29, title: "Defining Structs", difficulty: "Intermediate", time: 10 },
      { day: 30, title: "Struct Methods", difficulty: "Intermediate", time: 10 },
      { day: 31, title: "Associated Functions", difficulty: "Intermediate", time: 9 },
      { day: 32, title: "Tuple Structs", difficulty: "Intermediate", time: 9 },
      { day: 33, title: "Enums Basics", difficulty: "Intermediate", time: 10 },
      { day: 34, title: "Option<T>", difficulty: "Intermediate", time: 10 },
      { day: 35, title: "Result<T, E>", difficulty: "Intermediate", time: 10 }
    ]
  },
  {
    week: 6,
    title: "Structs & Enums II",
    description: "Advanced patterns and error handling strategies.",
    days: [
      { day: 36, title: "Pattern Matching with Enums", difficulty: "Intermediate", time: 10 },
      { day: 37, title: "if let & while let", difficulty: "Intermediate", time: 9 },
      { day: 38, title: "Method Chaining", difficulty: "Intermediate", time: 9 },
      { day: 39, title: "Builder Pattern", difficulty: "Advanced", time: 10 },
      { day: 40, title: "Project: Config Parser", difficulty: "Intermediate", time: 10 },
      { day: 41, title: "Error Handling Strategies", difficulty: "Intermediate", time: 10 },
      { day: 42, title: "Project: JSON-like Data Structure", difficulty: "Advanced", time: 10 }
    ]
  },
  {
    week: 7,
    title: "Collections & Iterators I",
    description: "Work with vectors, hashmaps, and powerful iterators.",
    days: [
      { day: 43, title: "Vectors", difficulty: "Intermediate", time: 10 },
      { day: 44, title: "Hash Maps", difficulty: "Intermediate", time: 10 },
      { day: 45, title: "Iterators Basics", difficulty: "Intermediate", time: 10 },
      { day: 46, title: "Iterator Adapters: map, filter", difficulty: "Intermediate", time: 10 },
      { day: 47, title: "Consuming Adapters", difficulty: "Intermediate", time: 10 },
      { day: 48, title: "Custom Iterators", difficulty: "Advanced", time: 10 },
      { day: 49, title: "Closures Introduction", difficulty: "Intermediate", time: 10 }
    ]
  },
  {
    week: 8,
    title: "Collections & Iterators II",
    description: "Master closures and iterator performance patterns.",
    days: [
      { day: 50, title: "Closure Syntax Variations", difficulty: "Intermediate", time: 9 },
      { day: 51, title: "move Closures", difficulty: "Intermediate", time: 9 },
      { day: 52, title: "Fn, FnMut, FnOnce Traits", difficulty: "Advanced", time: 10 },
      { day: 53, title: "Iterator Performance", difficulty: "Intermediate", time: 10 },
      { day: 54, title: "Common Iterator Patterns", difficulty: "Intermediate", time: 10 },
      { day: 55, title: "Project: Word Frequency Counter", difficulty: "Intermediate", time: 10 },
      { day: 56, title: "Collection Performance Tips", difficulty: "Intermediate", time: 10 }
    ]
  },
  {
    week: 9,
    title: "Traits & Generics I",
    description: "Write flexible, reusable code with traits and generics.",
    days: [
      { day: 57, title: "Generics Basics", difficulty: "Intermediate", time: 10 },
      { day: 58, title: "Generic Functions", difficulty: "Intermediate", time: 10 },
      { day: 59, title: "Generic Structs", difficulty: "Intermediate", time: 10 },
      { day: 60, title: "Trait Definitions", difficulty: "Intermediate", time: 10 },
      { day: 61, title: "Implementing Traits", difficulty: "Intermediate", time: 10 },
      { day: 62, title: "Trait Bounds", difficulty: "Advanced", time: 10 },
      { day: 63, title: "Multiple Trait Bounds", difficulty: "Advanced", time: 10 }
    ]
  },
  {
    week: 10,
    title: "Traits & Generics II",
    description: "Advanced trait patterns and polymorphism.",
    days: [
      { day: 64, title: "Where Clauses", difficulty: "Advanced", time: 10 },
      { day: 65, title: "Default Implementations", difficulty: "Intermediate", time: 9 },
      { day: 66, title: "Trait Objects (dyn)", difficulty: "Advanced", time: 10 },
      { day: 67, title: "Static vs Dynamic Dispatch", difficulty: "Advanced", time: 10 },
      { day: 68, title: "Associated Types", difficulty: "Advanced", time: 10 },
      { day: 69, title: "Project: Generic Data Store", difficulty: "Advanced", time: 10 },
      { day: 70, title: "Operator Overloading", difficulty: "Advanced", time: 10 }
    ]
  },
  {
    week: 11,
    title: "Lifetimes & Smart Pointers I",
    description: "Deep dive into advanced memory management.",
    days: [
      { day: 71, title: "Lifetime Annotations Intro", difficulty: "Advanced", time: 10 },
      { day: 72, title: "Lifetime Syntax", difficulty: "Advanced", time: 10 },
      { day: 73, title: "Lifetime Elision Rules", difficulty: "Advanced", time: 10 },
      { day: 74, title: "Struct Lifetimes", difficulty: "Advanced", time: 10 },
      { day: 75, title: "Static Lifetime", difficulty: "Advanced", time: 9 },
      { day: 76, title: "Box<T>", difficulty: "Advanced", time: 10 },
      { day: 77, title: "Rc<T> & Reference Counting", difficulty: "Advanced", time: 10 }
    ]
  },
  {
    week: 12,
    title: "Lifetimes & Smart Pointers II",
    description: "Interior mutability and advanced smart pointer patterns.",
    days: [
      { day: 78, title: "RefCell<T> & Interior Mutability", difficulty: "Advanced", time: 10 },
      { day: 79, title: "Rc<RefCell<T>> Pattern", difficulty: "Advanced", time: 10 },
      { day: 80, title: "Arc<T> for Threading", difficulty: "Advanced", time: 10 },
      { day: 81, title: "Weak<T> References", difficulty: "Advanced", time: 10 },
      { day: 82, title: "Memory Leaks Prevention", difficulty: "Advanced", time: 10 },
      { day: 83, title: "Project: Graph Data Structure", difficulty: "Advanced", time: 10 },
      { day: 84, title: "Smart Pointer Patterns", difficulty: "Advanced", time: 10 }
    ]
  },
  {
    week: 13,
    title: "Expert Topics",
    description: "Explore async/await, macros, and unsafe Rust.",
    days: [
      { day: 85, title: "Async/Await Basics", difficulty: "Advanced", time: 10 },
      { day: 86, title: "Tokio Runtime Intro", difficulty: "Advanced", time: 10 },
      { day: 87, title: "Macros: macro_rules!", difficulty: "Advanced", time: 10 },
      { day: 88, title: "Procedural Macros Overview", difficulty: "Expert", time: 10 },
      { day: 89, title: "Unsafe Rust Intro", difficulty: "Expert", time: 10 },
      { day: 90, title: "Final Project: Micro Web Server", difficulty: "Expert", time: 10 }
    ]
  }
];

const docsDir = path.join(__dirname, '..', 'docs');

// Escape angle brackets so titles like Option<T> aren't parsed as HTML by Vue
function escapeTitle(title) {
  return title.replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// Create week overview template
function createWeekOverview(weekData) {
  const { week, title, description, days } = weekData;
  const weekNum = week.toString().padStart(2, '0');
  
  return `# Week ${week}: ${title}

${description}

## Learning Objectives

By the end of this week, you'll have mastered key concepts in ${title.toLowerCase()}.

## Daily Breakdown

| Day | Topic | Time | Difficulty |
|-----|-------|------|------------|
${days.map(d => {
  const dayNum = d.day.toString().padStart(2, '0');
  const stars = d.difficulty === 'Beginner' ? '⭐' : d.difficulty === 'Intermediate' ? '⭐⭐' : d.difficulty === 'Advanced' ? '⭐⭐⭐' : '⭐⭐⭐⭐';
  return `| [Day ${d.day}](/week-${weekNum}/day-${dayNum}) | ${escapeTitle(d.title)} | ${d.time} min | ${stars} |`;
}).join('\n')}

## What Makes This Week Important

${week <= 2 ? 'This week establishes the foundation for everything that follows.' : 
  week <= 4 ? 'Understanding ownership is crucial for writing safe Rust code.' :
  week <= 6 ? 'These concepts allow you to build robust, type-safe applications.' :
  week <= 8 ? 'Collections and iterators are fundamental to idiomatic Rust.' :
  week <= 10 ? 'Traits and generics enable powerful abstraction and code reuse.' :
  week <= 12 ? 'Advanced memory management unlocks sophisticated patterns.' :
  'These expert topics prepare you for production Rust development.'}

## Study Tips for This Week

1. **Practice daily** - Consistency is key to mastering these concepts
2. **Experiment freely** - Try variations of the examples
3. **Read error messages** - The compiler is your best teacher
4. **Build something** - Apply concepts in a small project

---

[Start Day ${days[0].day}: ${escapeTitle(days[0].title)} →](/week-${weekNum}/day-${days[0].day.toString().padStart(2, '0')})
`;
}

// Create daily lesson template
function createDayLesson(weekData, dayData, dayIndex) {
  const { week } = weekData;
  const { day, title, difficulty, time } = dayData;
  const weekNum = week.toString().padStart(2, '0');
  const dayNum = day.toString().padStart(2, '0');
  
  const prevDay = dayIndex > 0 ? weekData.days[dayIndex - 1] : null;
  const nextDay = dayIndex < weekData.days.length - 1 ? weekData.days[dayIndex + 1] : null;
  
  let prevLink = '';
  let nextLink = '';
  
  if (prevDay) {
    const prevDayNum = prevDay.day.toString().padStart(2, '0');
    prevLink = `<a href="/week-${weekNum}/day-${prevDayNum}">← Day ${prevDay.day}: ${prevDay.title.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</a>`;
  } else if (week > 1) {
    prevLink = `<a href="/week-${weekNum}/">← Week ${week} Overview</a>`;
  }
  
  if (nextDay) {
    const nextDayNum = nextDay.day.toString().padStart(2, '0');
    nextLink = `<a href="/week-${weekNum}/day-${nextDayNum}">Day ${nextDay.day}: ${nextDay.title.replace(/</g, '&lt;').replace(/>/g, '&gt;')} →</a>`;
  } else if (week < 13) {
    const nextWeekNum = (week + 1).toString().padStart(2, '0');
    nextLink = `<a href="/week-${nextWeekNum}/">Week ${week + 1} Overview →</a>`;
  }
  
  return `---
title: "Day ${day} - ${title.replace(/</g, ' ').replace(/>/g, ' ')}"
description: "Learn about ${title.toLowerCase().replace(/</g, ' ').replace(/>/g, ' ')} in Rust"
---

# Day ${day}: ${escapeTitle(title)}

<div class="lesson-meta">
  <span class="time">⏱️ ${time} minutes</span>
  <span class="difficulty">📊 ${difficulty}</span>
  <span class="week">📅 Week ${week}</span>
</div>

## 🎯 Today's Goal

[Learning objective for ${escapeTitle(title)}]

## 📚 The Concept (3 min)

[Conceptual explanation goes here]

::: tip Key Insight
[Important concept to remember]
:::

## 💻 Hands-On Code (4 min)

### Example 1: Basic Usage

\`\`\`rust
// Code example goes here
fn main() {
    println!("Day ${day}: ${title}");
}
\`\`\`

### Example 2: Practical Application

\`\`\`rust
// More advanced example
\`\`\`

::: details Output
\`\`\`
Expected output here
\`\`\`
:::

## 🎓 Key Takeaways (1 min)

<div class="takeaways">

✅ [Key point 1]  
✅ [Key point 2]  
✅ [Key point 3]  
✅ [Key point 4]

</div>

## ⚠️ Common Pitfalls

::: warning Watch Out!
- [Common mistake 1]
- [Common mistake 2]
:::

## ✅ Quick Challenge

[Practice exercise description]

\`\`\`rust
// Starter code
fn main() {
    // Your code here
}
\`\`\`

<details>
<summary>💡 Hint</summary>

[Helpful hint for the challenge]

</details>

<details>
<summary>✅ Solution</summary>

\`\`\`rust
// Solution code
\`\`\`

</details>

## 📖 Additional Resources

- [The Rust Book - Relevant Chapter](https://doc.rust-lang.org/book/)
- [Rust by Example](https://doc.rust-lang.org/rust-by-example/)

---

<ProgressTracker />

<div class="lesson-nav">
  ${prevLink}
  ${nextLink}
</div>
`;
}

// Generate all files
function generateAllLessons() {
  console.log('🦀 Generating Rust 90 Days course structure...\n');
  
  courseStructure.forEach(weekData => {
    const weekNum = weekData.week.toString().padStart(2, '0');
    const weekDir = path.join(docsDir, `week-${weekNum}`);
    
    // Create week directory
    if (!fs.existsSync(weekDir)) {
      fs.mkdirSync(weekDir, { recursive: true });
      console.log(`📁 Created directory: week-${weekNum}/`);
    }
    
    // Create week overview
    const weekOverview = createWeekOverview(weekData);
    fs.writeFileSync(path.join(weekDir, 'index.md'), weekOverview);
    console.log(`  ✅ Created week-${weekNum}/index.md`);
    
    // Create daily lessons
    weekData.days.forEach((dayData, index) => {
      const dayNum = dayData.day.toString().padStart(2, '0');
      const dayLesson = createDayLesson(weekData, dayData, index);
      fs.writeFileSync(path.join(weekDir, `day-${dayNum}.md`), dayLesson);
      console.log(`  ✅ Created week-${weekNum}/day-${dayNum}.md`);
    });
    
    console.log('');
  });
  
  console.log('🎉 All lessons generated successfully!');
  console.log(`📊 Total: ${courseStructure.length} weeks, 90 daily lessons\n`);
}

// Run the generator
generateAllLessons();