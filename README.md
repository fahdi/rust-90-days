# Rust in 90 Days 🦀

Master Rust with daily 10-minute lessons over 90 days, from absolute beginner to expert.

## 📖 Read the Course Online

**The course lives at [fahdi.github.io/rust-90-days](https://fahdi.github.io/rust-90-days/)** with full-text search and progress tracking. No setup needed.

- 🚀 [Start with Day 1: Hello Rust](https://fahdi.github.io/rust-90-days/week-01/day-01)
- 📋 [Read the introduction](https://fahdi.github.io/rust-90-days/introduction) for how the course works

## 📚 What You Get

- **90 daily lessons**, each under 10 minutes
- **13 weeks** of progressive learning
- **7 milestone projects** to build
- **Runnable code examples** in every lesson
- **Progress tracking** in your browser (localStorage, no account needed)

## 🎯 Learning Path

| Weeks | Focus | Topics |
|-------|-------|--------|
| 1-2 | Foundation | Variables, types, functions, control flow |
| 3-4 | Ownership | Memory management, borrowing, slices |
| 5-6 | Structs & Enums | Data structures, error handling |
| 7-8 | Collections | Vectors, hashmaps, iterators, closures |
| 9-10 | Traits & Generics | Abstraction, polymorphism |
| 11-12 | Lifetimes | Advanced memory, smart pointers |
| 13 | Expert Topics | Async, macros, unsafe |

## 🛠️ Run It Locally

Only needed if you want to contribute or read offline. The site is built with [VitePress](https://vitepress.dev/).

```bash
git clone https://github.com/fahdi/rust-90-days.git
cd rust-90-days
npm install

npm run docs:dev      # local dev server with hot reload
npm run docs:build    # production build
npm run docs:preview  # preview the production build
npm test              # validate lesson content
```

### Project Structure

```
rust-90-days/
├── docs/                    # Course content
│   ├── .vitepress/          # VitePress config and custom theme
│   ├── week-XX/             # Weekly lessons (day-XX.md)
│   └── public/              # Static assets
├── scripts/
│   ├── generate-lessons.js  # Scaffolds missing lesson files
│   └── validate-lessons.js  # Checks lessons for completeness
└── package.json
```

### Editing Content

1. Lessons are plain markdown in `docs/week-XX/day-XX.md`; edit them directly
2. Keep each lesson's frontmatter, `<ProgressTracker />`, and navigation footer intact
3. `npm run generate` scaffolds any missing lesson files; it never overwrites existing ones
4. `npm test` verifies every lesson is complete before you push

Deployment is automatic: every push to `main` builds and publishes the site via GitHub Actions.

## 🤝 Contributing

Contributions are welcome: fix errors, improve explanations, add examples, or translate. Please read the [Contributing Guidelines](CONTRIBUTING.md) before submitting a PR.

## 📄 License

MIT License. Feel free to use this for learning.

## 🙏 Acknowledgments

- Inspired by [The Rust Book](https://doc.rust-lang.org/book/)
- Built with [VitePress](https://vitepress.dev/)
- Rust logo adapted from official Rust branding

## 📞 Support

- 🐛 Found a bug? [Open an issue](https://github.com/fahdi/rust-90-days/issues)
- 💡 Have a suggestion? [Start a discussion](https://github.com/fahdi/rust-90-days/discussions)
