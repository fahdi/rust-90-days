# How to Use This Course

This guide will help you get the most out of your 90-day Rust learning journey.

## Daily Learning Routine

### ⏰ The 10-Minute Structure

Each lesson is designed to fit into exactly 10 minutes:

| Time | Activity | Purpose |
|------|----------|---------|
| **1 min** | 🎯 Review the day's goal | Set clear expectations |
| **3 min** | 📚 Read the concept explanation | Understand the theory |
| **4 min** | 💻 Work through code examples | Apply knowledge hands-on |
| **1 min** | 🎓 Review key takeaways | Reinforce learning |
| **1 min** | ✅ Complete the quick challenge | Test understanding |

### 📱 Progress Tracking

The built-in progress tracker helps you stay motivated:

- **Mark lessons complete** by clicking the completion button
- **Track your daily streak** to build a consistent habit
- **Monitor overall progress** across all 90 days
- **Reset if needed** using the reset button (⚠️ permanent action)

Your progress is saved in your browser's local storage and persists between sessions.

## Navigation Guide

### 🧭 Finding Your Way

**Sidebar Navigation:**
- Use the collapsible sidebar to jump between weeks
- Week sections expand to show all daily lessons
- Current page is highlighted for easy orientation

**Lesson Navigation:**
- Previous/Next buttons at the bottom of each lesson
- Week overview pages link to all days in that week
- Breadcrumb navigation shows your current location

**Quick Access:**
- Home page shows all week overviews
- Search functionality helps find specific topics
- Mobile-friendly design works on all devices

### 📚 Course Structure

```
📖 Getting Started
├── Introduction
└── How to Use This Course

📅 Week 1: Foundation (Days 1-7)
├── Week Overview
├── Day 1: Hello Rust
├── Day 2: Variables & Mutability
└── ... (continue through Day 7)

📅 Week 2: Control Flow & Organization (Days 8-14)
└── ... (similar structure)

... (continues through Week 13)
```

## Study Strategies

### 🎯 For Beginners

**Week 1-2 (Foundation):**
- Take your time with basic concepts
- Set up your development environment properly
- Don't worry about mastering everything immediately
- Focus on getting code to compile and run

**Week 3-4 (Ownership):**
- This is the hardest part - be patient with yourself
- Re-read lessons if ownership concepts aren't clicking
- Practice with the compiler until error messages make sense
- Don't skip these weeks - they're crucial

### 🚀 For Experienced Programmers

**Accelerated Approach:**
- You may move faster through basic syntax (Week 1-2)
- Still spend full time on ownership concepts (Week 3-4)
- Pay special attention to borrowing rules and lifetimes
- Focus on how Rust differs from languages you know

**Language Comparison:**
- C/C++ developers: Pay attention to RAII and smart pointers
- Java/C# developers: Understand stack vs heap allocation
- Python/JS developers: Learn about compile-time guarantees
- Go developers: Compare concurrency models

### 📈 Progressive Difficulty

**Difficulty Levels:**
- ⭐ **Beginner** - New concepts, basic syntax
- ⭐⭐ **Intermediate** - Combining concepts, problem-solving
- ⭐⭐⭐ **Advanced** - Complex patterns, performance considerations
- ⭐⭐⭐⭐ **Expert** - Unsafe code, advanced macros, deep internals

## Coding Best Practices

### 💻 Setting Up Your Environment

**Recommended Folder Structure:**
```
rust-90-days/
├── day-01/
│   └── src/
│       └── main.rs
├── day-02/
│   └── src/
│       └── main.rs
└── projects/
    ├── temperature-converter/
    ├── cli-calculator/
    └── ... (other projects)
```

**Create a new project for each lesson:**
```bash
# For daily lessons
cargo new day-01
cd day-01

# For projects
cargo new temperature-converter
cd temperature-converter
```

### 🔧 Development Workflow

**Daily Routine:**
1. **Read the lesson** thoroughly before coding
2. **Type out examples** - don't copy/paste
3. **Experiment** with variations of the code
4. **Read error messages** carefully and understand them
5. **Complete the challenge** before moving on

**Compiler Error Strategy:**
1. **Don't panic** - errors are learning opportunities
2. **Read the full error message** including suggestions
3. **Focus on the first error** - later ones may be cascading
4. **Use `cargo check`** for faster error checking
5. **Google specific error codes** if needed

### 🛠️ Useful Commands

**Essential Cargo Commands:**
```bash
cargo new project-name      # Create new project
cargo build                 # Compile the project
cargo run                   # Compile and run
cargo check                 # Check for errors (fast)
cargo test                  # Run tests
cargo doc --open           # Generate and open documentation
```

**Helpful Development Tools:**
```bash
cargo install cargo-watch  # Auto-rebuild on file changes
cargo watch -x run         # Watch and run
rustup component add clippy # Install linter
cargo clippy               # Run linter
cargo fmt                  # Format code
```

## Overcoming Common Challenges

### 😤 When the Borrow Checker Fights You

**Normal Reactions:**
- Frustration is completely normal
- Everyone struggles with this initially
- Even experienced developers find it challenging

**Strategies:**
1. **Simplify your code** - complex ownership patterns can wait
2. **Use `.clone()` temporarily** while learning (optimize later)
3. **Draw ownership diagrams** on paper
4. **Break complex functions** into smaller pieces
5. **Ask for help** in Rust communities

### 🔄 When You Miss a Day

**Getting Back on Track:**
- **Don't give up** - consistency matters more than perfection
- **Review the previous lesson** briefly before continuing
- **Don't try to catch up multiple days** at once
- **Restart your streak** and keep moving forward

### 🤔 When Concepts Don't Click

**Learning Strategies:**
- **Re-read the lesson** - concepts often click on second reading
- **Look up additional resources** linked in each lesson
- **Try explaining the concept** to someone else (or a rubber duck)
- **Skip ahead temporarily** and come back later
- **Ask questions** in Rust forums or Discord

## Additional Resources

### 📖 Supplementary Reading
- [The Rust Book](https://doc.rust-lang.org/book/) - Official comprehensive guide
- [Rust by Example](https://doc.rust-lang.org/rust-by-example/) - Learn by examples
- [Rustlings](https://github.com/rust-lang/rustlings) - Interactive exercises
- [Rust Cookbook](https://rust-lang-nursery.github.io/rust-cookbook/) - Common tasks

### 💬 Community Support
- [Rust Discord](https://discord.gg/rust-lang) - Active community chat
- [r/rust](https://reddit.com/r/rust) - Reddit community
- [Rust Users Forum](https://users.rust-lang.org/) - Q&A and discussions
- [Stack Overflow](https://stackoverflow.com/questions/tagged/rust) - Technical questions

### 🔧 Tools and Extensions
- **VS Code**: rust-analyzer, CodeLLDB debugger
- **IntelliJ**: Rust plugin for IntelliJ IDEA/CLion
- **Vim/Neovim**: rust.vim, coc-rust-analyzer
- **Online**: [Rust Playground](https://play.rust-lang.org/) for quick testing

## Success Metrics

### 📊 How to Measure Progress

**Daily Success:**
- ✅ Completed the lesson within 10 minutes
- ✅ Understood the core concept
- ✅ Got the code examples to compile and run
- ✅ Completed the quick challenge

**Weekly Success:**
- ✅ Completed all 7 lessons in the week
- ✅ Successfully built the week's project (if applicable)
- ✅ Can explain the week's main concepts to someone else

**Course Success:**
- ✅ Maintained a learning streak of at least 75 days
- ✅ Completed all major projects
- ✅ Can write Rust code confidently without constant documentation lookup
- ✅ Understand ownership and borrowing intuitively

---

**Ready to begin your journey?**

**[Start with the Introduction →](/introduction)** or **[Jump to Day 1 →](/week-01/day-01)**

*Remember: The goal isn't perfection, it's progress. Every day you code in Rust, you're building invaluable skills that will serve you throughout your programming career.*