# 🚀 qortex

> **A minimal, performant data fetching library and browser database. Built for simplicity, efficiency, and developer happiness! 🎉**

[![npm version](https://badge.fury.io/js/qortex-query.svg)](https://badge.fury.io/js/qortex-query)
[![npm version](https://badge.fury.io/js/qortex-query-react.svg)](https://badge.fury.io/js/qortex-query-react)
[![npm version](https://badge.fury.io/js/qortex-db.svg)](https://badge.fury.io/js/qortex-db)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![Bundle Size](https://img.shields.io/badge/tiny-bundle-brightgreen)](https://qortex.darshannaik.com)

## ✨ Why qortex?

Tired of complex data fetching libraries that make simple tasks complicated? **qortex** is here to save the day! 🦸‍♂️

- 🎯 **Dead simple** - Get started in 30 seconds
- ⚡ **Lightning fast** - Minimal bundle size, maximum performance
- 🧠 **Smart caching** - Automatic deduplication and background updates
- 💾 **Browser Database** - Unified async key-value store (localStorage, IndexedDB)
- 🎭 **Framework agnostic** - Works with React, Vue, Svelte, or vanilla JS
- 🛡️ **TypeScript first** - Full type safety out of the box
- 🎪 **Fun to use** - Because coding should be enjoyable!

## 📦 Packages

| Package            | Description                                      | Size (gzip) |
| ------------------ | ------------------------------------------------ | ----------- |
| **`qortex-query`**  | Framework Agnostic Query Cache & Fetch Registry  | ~1.9KB      |
| **`qortex-query-react`** | React Hooks for Data Fetching (includes core)    | ~2.6KB      |
| **`qortex-db`**     | Browser-only Redis-like Key-Value Database       | ~1.5KB      |
| **`qortex-store`**  | Lightweight Framework-agnostic State Management  | ~0.8KB      |
| **`qortex-store-react`** | React Bindings for qortex-store with Selectors | ~1.2KB      |

## 🚀 Quick Start

### For React Applications (Recommended)

```bash
npm install qortex-query-react
```

### For Framework Agnostic / Vanilla JS

```bash
npm install qortex-query
```

## 📚 Documentation

**Complete documentation, examples, and API reference available at:**

### 🌐 [qortex.darshannaik.com](https://qortex.darshannaik.com)

## 🎯 Features

### Data Fetching (Core & React)
- **🎪 Automatic caching** with configurable stale time
- **🔄 Background refetching** with smart invalidation and throttling
- **💾 Previous data preservation** during refetches
- **⚡ Shallow equality** to prevent unnecessary re-renders
- **⚡ Smart throttling** - prevents duplicate fetches

### Database (DB)
- **💾 Unified API** for localStorage, sessionStorage, and IndexedDB
- **🔄 Async interface** for all drivers
- **🔍 Pattern matching** for key scanning
- **📦 Zero dependencies** and tiny footprint

## 📄 License

LGPL-3.0 License - see [LICENSE](LICENSE) file for details.

## 🎯 Support

Need help? Have questions? Want to chat about data fetching strategies?

- 📚 **Documentation**: [qortex.darshannaik.com](https://qortex.darshannaik.com)
- 📧 **Email**: [darshannaik.com](https://darshannaik.com)
- 🐛 **Issues**: [GitHub Issues](https://github.com/Darshan-Naik/qortex/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/Darshan-Naik/qortex/discussions)
- 🌟 **Repository**: [https://github.com/Darshan-Naik/qortex](https://github.com/Darshan-Naik/qortex)

---

<div align="center">
  <p>Made with ❤️ by <a href="https://darshannaik.com">Darshan</a></p>
  <p>⭐ Star this repo if you found it helpful!</p>
</div>
