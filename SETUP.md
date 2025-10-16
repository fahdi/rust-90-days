# 🚀 Deploy to GitHub Pages

## Quick Setup Commands

```bash
# 1. Create a new repository on GitHub (recommended name: rust-90-days)
# Go to: https://github.com/new

# 2. Add remote origin (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/rust-90-days.git

# 3. Push to GitHub
git branch -M main
git push -u origin main

# 4. Enable GitHub Pages
# Go to: Settings > Pages > Source: GitHub Actions
```

## 🔧 Development Workflow

```bash
# Install dependencies
npm install

# Start development server
npm run docs:dev

# Build for production
npm run docs:build

# Regenerate lessons (if you modify course structure)
npm run generate
```

## 📋 Repository Settings

**Recommended GitHub repository settings:**
- **Name:** `rust-90-days`
- **Description:** "Master Rust programming with daily 10-minute lessons over 90 days"
- **Visibility:** Public
- **Include README:** No (we already have one)
- **Add .gitignore:** No (already included)
- **Choose a license:** MIT (already specified in package.json)

## 🌐 GitHub Pages Setup

After pushing, enable GitHub Pages:

1. Go to your repository settings
2. Navigate to "Pages" in the sidebar
3. Under "Source", select "GitHub Actions"
4. The deployment workflow will run automatically on push
5. Your site will be available at: `https://YOUR_USERNAME.github.io/rust-90-days/`

## 📝 Customization

**To customize for your needs:**

1. **Update repository URLs** in:
   - `docs/.vitepress/config.ts` (social links, edit links)
   - `README.md` (demo links)
   - `.github/workflows/deploy.yml` (if needed)

2. **Modify course content:**
   - Edit lesson templates in `scripts/generate-lessons.js`
   - Run `npm run generate` to regenerate all lessons
   - Manually edit individual lesson files in `docs/week-XX/`

3. **Customize theme:**
   - Modify colors in `docs/.vitepress/theme/custom.css`
   - Update logo in `docs/public/logo.svg`
   - Adjust layout in theme components

## 🤝 Contributing

The project is set up for community contributions:
- Clear file structure for easy navigation
- Automated lesson generation for consistency
- Contributing guidelines in `CONTRIBUTING.md`
- Issues and discussions enabled by default

## 🎯 What's Next

1. **Content Development:** Fill in actual lesson content
2. **Community Building:** Share with Rust learning communities
3. **Features:** Add more interactive elements
4. **Translations:** Support multiple languages
5. **Mobile App:** Consider PWA features

---

**Ready to launch your Rust learning platform!** 🦀