# 🗄️ @qortex/db

> **Browser-only Redis-like key-value database. Simple, fast, consistent! 🚀**

[![npm version](https://badge.fury.io/js/@qortex/db.svg)](https://badge.fury.io/js/@qortex/db)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/@qortex/db)](https://bundlephobia.com/package/@qortex/db)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

## ✨ What makes this special?

**@qortex/db** provides a unified async API across browser storage backends:

- 💾 **localStorage** - Persists across sessions (default)
- 🔄 **sessionStorage** - Cleared on tab close
- 📦 **IndexedDB** - Larger storage capacity

```bash
npm install @qortex/db
```

## 🚀 Quick Start

```typescript
import { createDB } from "@qortex/db";

// Simple usage (uses localStorage)
const db = createDB("myapp");

// With options
const db = createDB({ name: "myapp", driver: "indexedDB" });

// Basic operations
await db.set("user:1", { name: "John", age: 30 });
const user = await db.get<User>("user:1");
const exists = await db.has("user:1");
await db.del("user:1");

// Pattern matching
const userKeys = await db.scan("user:*");
const allKeys = await db.scan("*");

// Clear all data
await db.drop();
```

## 📖 API

| Method | Description |
|--------|-------------|
| `get<T>(key)` | Retrieve a value by key |
| `set(key, value)` | Store a value |
| `has(key)` | Check if key exists |
| `del(key)` | Delete a key |
| `scan(pattern)` | Find keys by pattern (`*` wildcard) |
| `drop()` | Delete all data for this database |

## 🔧 Drivers

| Driver | Persistence | Capacity | Use Case |
|--------|-------------|----------|----------|
| `local` | Permanent | ~5MB | Default, most common |
| `session` | Tab session | ~5MB | Temporary data |
| `indexedDB` | Permanent | Large | Large datasets |

## 📚 Documentation

**Complete documentation available at:**

### 🌐 [qortex.darshannaik.com](https://qortex.darshannaik.com)

## 📄 License

LGPL-3.0 License - see [LICENSE](../../LICENSE) file for details.

## 🎯 Support

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
