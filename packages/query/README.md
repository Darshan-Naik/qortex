# 🎯 qortex-query

> **Framework-agnostic query cache. Set and read data from anywhere! 🧠**

[![npm version](https://badge.fury.io/js/qortex-query.svg)](https://badge.fury.io/js/qortex-query)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/qortex-query)](https://bundlephobia.com/package/qortex-query)
[![Bundle Size](https://img.shields.io/badge/gzipped-2.1KB-brightgreen)](https://bundlephobia.com/package/qortex-query)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

## ✨ What makes this special?

**qortex-query** lets you **set and read data from anywhere** - not just within a specific framework! Perfect for:

- 🔐 **App core data** - Authentication, user profiles accessible from anywhere
- 🎯 **Cross-framework** - Share data between React, Vue, vanilla JS, Node.js
- ⚡ **Real-time apps** - Push changes from anywhere, see them everywhere instantly

```bash
npm install qortex-query
```

## 🔋 Persistence

**qortex-query** provides the `Persister` interface but no longer bundles a default implementation. This keeps the package extremely lean and framework-agnostic.

For persistence (localStorage, IndexedDB, etc.), we recommend using **[qortex-db/query](../db)**:

```ts
import { createDB } from "qortex-db";
import { createQueryPersister } from "qortex-db/query";
import { setDefaultConfig } from "qortex-query";

const db = createDB({ name: "myapp", driver: "indexedDB" });
setDefaultConfig({ 
  persister: createQueryPersister(db) 
});
```

## 📚 Documentation

**Complete documentation, examples, and API reference available at:**

### 🌐 [qortex.darshannaik.com](https://qortex.darshannaik.com)

## 📄 License

LGPL-3.0 License - see [LICENSE](../../LICENSE) file for details.

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
