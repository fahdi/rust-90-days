# Rust in 90 Days 🦀

Master Rust programming with daily 10-minute lessons over 90 days.

![Rust Logo](docs/public/logo.svg)

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Generate all lesson files
npm run generate

# Start development server
npm run docs:dev

# Build for production
npm run docs:build

# Preview production build
npm run docs:preview
```

## 📚 Course Structure

- **90 daily lessons**, each under 10 minutes
- **13 weeks** of progressive learning
- **7 milestone projects** to build
- **Progress tracking** with localStorage
- From absolute beginner to Rust expert

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

## ✨ Features

- 📖 **Comprehensive Content** - 90 carefully crafted lessons
- 🎯 **Structured Learning** - Progressive difficulty curve
- 💻 **Code Examples** - Runnable code in every lesson
- 📊 **Progress Tracking** - Track your learning journey
- 🎨 **Beautiful UI** - Clean, modern VitePress theme
- 📱 **Responsive** - Works on all devices
- 🔍 **Searchable** - Full-text search powered by VitePress
- 🚀 **Fast** - Lightning-fast page loads

## 🛠️ Development

### Project Structure

```
rust-learning/
├── docs/                    # Documentation source
│   ├── .vitepress/         # VitePress config
│   │   ├── config.ts       # Main config
│   │   └── theme/          # Custom theme
│   ├── week-XX/            # Weekly lessons
│   └── public/             # Static assets
├── scripts/                 # Build scripts
│   └── generate-lessons.js # Lesson generator
└── package.json            # Dependencies
```

### Adding Content

1. Lessons are in `docs/week-XX/day-XX.md`
2. Edit the markdown files directly
3. Use the `<ProgressTracker />` component in lessons
4. Follow the established template structure

### Regenerating Lessons

If you modify the course structure:

```bash
npm run generate
```

This will regenerate all lesson files based on `scripts/generate-lessons.js`.

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Fix typos or errors** - Submit a PR
2. **Improve explanations** - Make concepts clearer
3. **Add examples** - More code examples are always good
4. **Translate** - Help make this accessible to more people

Please read our [Contributing Guidelines](CONTRIBUTING.md) before submitting PRs.

## 📄 License

MIT License - feel free to use this for learning!

## 🙏 Acknowledgments

- Inspired by [The Rust Book](https://doc.rust-lang.org/book/)
- Built with [VitePress](https://vitepress.dev/)
- Rust logo adapted from official Rust branding

## 📞 Support

- 🐛 Found a bug? [Open an issue](https://github.com/fahdi/rust-90-days/issues)
- 💡 Have a suggestion? [Start a discussion](https://github.com/fahdi/rust-90-days/discussions)
- ❓ Questions? Join our [Discord community](https://discord.gg/rust)

---

**Start your Rust journey today!** 🚀

[View Live Site](https://fahdi.github.io/rust-90-days/) | [Read Introduction](docs/introduction.md)