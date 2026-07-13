import { defineConfig } from 'vitepress'

// Course structure data
const weeks = [
  {
    week: 1,
    title: "Foundation",
    days: [
      { day: 1, title: "Hello Rust" },
      { day: 2, title: "Variables & Mutability" },
      { day: 3, title: "Data Types" },
      { day: 4, title: "Strings vs &str" },
      { day: 5, title: "Tuples & Arrays" },
      { day: 6, title: "Functions" },
      { day: 7, title: "Control Flow" }
    ]
  },
  {
    week: 2,
    title: "Control Flow & Organization",
    days: [
      { day: 8, title: "Loops" },
      { day: 9, title: "Pattern Matching" },
      { day: 10, title: "Comments & Docs" },
      { day: 11, title: "Project: Temperature Converter" },
      { day: 12, title: "Modules Basics" },
      { day: 13, title: "Cargo Fundamentals" },
      { day: 14, title: "Project: CLI Calculator" }
    ]
  },
  {
    week: 3,
    title: "Ownership I",
    days: [
      { day: 15, title: "What is Ownership?" },
      { day: 16, title: "Stack vs Heap" },
      { day: 17, title: "Ownership Rules" },
      { day: 18, title: "Move Semantics" },
      { day: 19, title: "Clone & Copy Traits" },
      { day: 20, title: "References & Borrowing" },
      { day: 21, title: "Mutable References" }
    ]
  },
  {
    week: 4,
    title: "Ownership II",
    days: [
      { day: 22, title: "Borrowing Rules" },
      { day: 23, title: "Slices" },
      { day: 24, title: "String Slices Deep Dive" },
      { day: 25, title: "Common Ownership Errors" },
      { day: 26, title: "Dangling References" },
      { day: 27, title: "Project: Text Analyzer" },
      { day: 28, title: "Ownership Patterns Review" }
    ]
  },
  {
    week: 5,
    title: "Structs & Enums I",
    days: [
      { day: 29, title: "Defining Structs" },
      { day: 30, title: "Struct Methods" },
      { day: 31, title: "Associated Functions" },
      { day: 32, title: "Tuple Structs" },
      { day: 33, title: "Enums Basics" },
      { day: 34, title: "Option<T>" },
      { day: 35, title: "Result<T, E>" }
    ]
  },
  {
    week: 6,
    title: "Structs & Enums II",
    days: [
      { day: 36, title: "Pattern Matching with Enums" },
      { day: 37, title: "if let & while let" },
      { day: 38, title: "Method Chaining" },
      { day: 39, title: "Builder Pattern" },
      { day: 40, title: "Project: Config Parser" },
      { day: 41, title: "Error Handling Strategies" },
      { day: 42, title: "Project: JSON-like Data Structure" }
    ]
  },
  {
    week: 7,
    title: "Collections & Iterators I",
    days: [
      { day: 43, title: "Vectors" },
      { day: 44, title: "Hash Maps" },
      { day: 45, title: "Iterators Basics" },
      { day: 46, title: "Iterator Adapters: map, filter" },
      { day: 47, title: "Consuming Adapters" },
      { day: 48, title: "Custom Iterators" },
      { day: 49, title: "Closures Introduction" }
    ]
  },
  {
    week: 8,
    title: "Collections & Iterators II",
    days: [
      { day: 50, title: "Closure Syntax Variations" },
      { day: 51, title: "move Closures" },
      { day: 52, title: "Fn, FnMut, FnOnce Traits" },
      { day: 53, title: "Iterator Performance" },
      { day: 54, title: "Common Iterator Patterns" },
      { day: 55, title: "Project: Word Frequency Counter" },
      { day: 56, title: "Collection Performance Tips" }
    ]
  },
  {
    week: 9,
    title: "Traits & Generics I",
    days: [
      { day: 57, title: "Generics Basics" },
      { day: 58, title: "Generic Functions" },
      { day: 59, title: "Generic Structs" },
      { day: 60, title: "Trait Definitions" },
      { day: 61, title: "Implementing Traits" },
      { day: 62, title: "Trait Bounds" },
      { day: 63, title: "Multiple Trait Bounds" }
    ]
  },
  {
    week: 10,
    title: "Traits & Generics II",
    days: [
      { day: 64, title: "Where Clauses" },
      { day: 65, title: "Default Implementations" },
      { day: 66, title: "Trait Objects (dyn)" },
      { day: 67, title: "Static vs Dynamic Dispatch" },
      { day: 68, title: "Associated Types" },
      { day: 69, title: "Project: Generic Data Store" },
      { day: 70, title: "Operator Overloading" }
    ]
  },
  {
    week: 11,
    title: "Lifetimes & Smart Pointers I",
    days: [
      { day: 71, title: "Lifetime Annotations Intro" },
      { day: 72, title: "Lifetime Syntax" },
      { day: 73, title: "Lifetime Elision Rules" },
      { day: 74, title: "Struct Lifetimes" },
      { day: 75, title: "Static Lifetime" },
      { day: 76, title: "Box<T>" },
      { day: 77, title: "Rc<T> & Reference Counting" }
    ]
  },
  {
    week: 12,
    title: "Lifetimes & Smart Pointers II",
    days: [
      { day: 78, title: "RefCell<T> & Interior Mutability" },
      { day: 79, title: "Rc<RefCell<T>> Pattern" },
      { day: 80, title: "Arc<T> for Threading" },
      { day: 81, title: "Weak<T> References" },
      { day: 82, title: "Memory Leaks Prevention" },
      { day: 83, title: "Project: Graph Data Structure" },
      { day: 84, title: "Smart Pointer Patterns" }
    ]
  },
  {
    week: 13,
    title: "Expert Topics",
    days: [
      { day: 85, title: "Async/Await Basics" },
      { day: 86, title: "Tokio Runtime Intro" },
      { day: 87, title: "Macros: macro_rules!" },
      { day: 88, title: "Procedural Macros Overview" },
      { day: 89, title: "Unsafe Rust Intro" },
      { day: 90, title: "Final Project: Micro Web Server" }
    ]
  }
]

// Generate sidebar from course structure
function generateSidebar() {
  const sidebar: any[] = [
    {
      text: 'Getting Started',
      items: [
        { text: 'Introduction', link: '/introduction' },
        { text: 'How to Use This Course', link: '/how-to-use' }
      ]
    }
  ]

  weeks.forEach(({ week, title, days }) => {
    const weekNum = week.toString().padStart(2, '0')
    const items: any[] = [
      { text: 'Overview', link: `/week-${weekNum}/` }
    ]

    days.forEach(({ day, title: dayTitle }) => {
      const dayNum = day.toString().padStart(2, '0')
      items.push({
        text: `Day ${day}: ${dayTitle}`,
        link: `/week-${weekNum}/day-${dayNum}`
      })
    })

    sidebar.push({
      text: `Week ${week}: ${title}`,
      collapsed: week !== 1,
      items
    })
  })

  return sidebar
}

export default defineConfig({
  base: '/rust-90-days/',
  title: 'Rust in 90 Days',
  description: 'Master Rust with 10-minute daily lessons',
  
  head: [
    ['link', { rel: 'icon', href: '/logo.svg' }],
    ['meta', { name: 'theme-color', content: '#ce422b' }],
    ['meta', { name: 'og:type', content: 'website' }],
    ['meta', { name: 'og:title', content: 'Rust in 90 Days' }],
    ['meta', { name: 'og:description', content: 'Master Rust with 10-minute daily lessons' }]
  ],
  
  themeConfig: {
    logo: '/logo.svg',
    
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Start Learning', link: '/introduction' },
      { 
        text: 'Weeks', 
        items: [
          { text: 'Week 1-2: Foundation', link: '/week-01/' },
          { text: 'Week 3-4: Ownership', link: '/week-03/' },
          { text: 'Week 5-6: Structs & Enums', link: '/week-05/' },
          { text: 'Week 7-8: Collections', link: '/week-07/' },
          { text: 'Week 9-10: Traits', link: '/week-09/' },
          { text: 'Week 11-12: Lifetimes', link: '/week-11/' },
          { text: 'Week 13: Expert', link: '/week-13/' }
        ]
      }
    ],

    sidebar: {
      '/': generateSidebar()
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/fahdi/rust-90-days' }
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024-present'
    },

    search: {
      provider: 'local'
    },

    editLink: {
      pattern: 'https://github.com/fahdi/rust-90-days/edit/main/docs/:path',
      text: 'Edit this page on GitHub'
    }
  },

  markdown: {
    theme: {
      light: 'material-theme-lighter',
      dark: 'material-theme-palenight'
    },
    lineNumbers: true
  }
})