# 🤝 Contributing to Reclaim

Thank you for your interest in contributing to Reclaim! This project is built on the belief that **freedom from compulsive behavior should not be restricted by paywalls**.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Making Contributions](#making-contributions)
- [Code Style](#code-style)
- [Commit Messages](#commit-messages)
- [Pull Request Process](#pull-request-process)

## Code of Conduct

By participating in this project, you agree to maintain a respectful, inclusive, and empathetic environment. This project deals with sensitive topics — please be mindful of language and tone in all interactions.

## Getting Started

1. **Fork** the repository
2. **Clone** your fork locally
3. **Create a branch** for your feature or fix
4. **Make your changes** following the guidelines below
5. **Submit a pull request**

## Development Setup

### Prerequisites

- Node.js 18+
- PostgreSQL 14+ (or Docker)

### Local Development

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/Reclaim.git
cd Reclaim

# Copy environment file
cp .env.example .env
# Edit .env with your database credentials

# Install backend dependencies
cd server && npm install && cd ..

# Install frontend dependencies
cd client && npm install && cd ..

# Option A: Start with Docker
docker-compose up -d

# Option B: Start manually
# Terminal 1 — Backend
cd server && npm run dev

# Terminal 2 — Frontend
cd client && npm run dev
```

The app will be available at `http://localhost:5173`.

## Making Contributions

### What We Welcome

- 🐛 **Bug fixes** — Found something broken? Please fix it!
- ✨ **Feature implementations** — Check the Issues tab for feature requests
- 📝 **Documentation improvements** — Typos, clarifications, examples
- ♿ **Accessibility improvements** — Making Reclaim usable for everyone
- 🌐 **Internationalization** — Translations and locale support
- 🧪 **Tests** — Unit tests, integration tests, e2e tests
- 🎨 **UI/UX improvements** — Better design, animations, responsiveness

### What to Avoid

- ❌ Features that track browsing history or user behavior outside the app
- ❌ Third-party analytics or tracking scripts
- ❌ Changes that compromise user privacy
- ❌ Moralistic or judgmental language in UI copy
- ❌ Paywalled features

## Code Style

### JavaScript / React

- Use `const` and `let` (never `var`)
- Use async/await over Promises where possible
- Use meaningful variable names
- Keep components focused — one responsibility per component
- Use CSS classes from the design system (see `index.css`)

### Backend

- Handle all errors with try/catch
- Always validate user input
- Never expose internal error messages in production
- Use parameterized queries (never string concatenation for SQL)
- Add appropriate indexes for new tables

### Database

- Use UUID primary keys
- Include `created_at` and `updated_at` timestamps
- Add CHECK constraints where appropriate
- Create indexes for frequently queried columns

## Commit Messages

We follow conventional commit format:

```
type(scope): short description

Longer description if needed
```

**Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

**Examples:**
```
feat(emergency): add meditation technique
fix(streak): correct auto-advance calculation
docs(readme): update installation instructions
style(dashboard): improve mobile layout
```

## Pull Request Process

1. **Create an issue first** (for non-trivial changes) to discuss the approach
2. **Keep PRs focused** — one feature or fix per PR
3. **Update documentation** if your change affects the API or user-facing behavior
4. **Test your changes** locally before submitting
5. **Describe your changes** clearly in the PR description
6. **Link related issues** using `Closes #123` or `Fixes #123`

### PR Checklist

- [ ] Code follows the project's style guidelines
- [ ] Self-reviewed the code for errors
- [ ] Added/updated comments for complex logic
- [ ] Changes do not introduce privacy concerns
- [ ] Tested on both desktop and mobile viewports
- [ ] Updated README if API endpoints changed

## 🔒 Privacy Guidelines

This project is built on a **privacy-first** philosophy. When contributing, always consider:

1. **Minimal data collection** — Only collect what is absolutely necessary
2. **User consent** — Features should be opt-in, never opt-out
3. **Data stays local** — No phone-home, no external analytics
4. **Transparency** — Users should understand exactly what data is stored

## 🙏 Thank You

Every contribution, no matter how small, helps someone on their journey to self-improvement. Thank you for being part of this mission.

---

*Built with purpose. Made in India. 🇮🇳*
