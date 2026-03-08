# 🚀 qortex React Example

This comprehensive example demonstrates the full power of `qortex-query-react` using real API data from [JSONPlaceholder](https://jsonplaceholder.typicode.com/). It showcases various data fetching patterns, caching strategies, and error handling techniques with actual network requests.

## 🌟 Features Demonstrated

### 📊 Live Statistics
- Real-time data fetching with background updates
- Automatic cache invalidation and refetching
- Loading states and error handling

### 👥 User Management
- User list with real data from JSONPlaceholder
- Individual user details with caching
- Manual cache refresh capabilities

### 📝 Posts System
- CRUD operations with optimistic updates
- Real-time post creation and display
- Cache management and invalidation

### 📸 Albums Gallery
- Nested data fetching (albums → photos)
- Dependent queries with proper loading states
- Image gallery with real photos

### ⚠️ Error Handling
- Simulated network failures
- Retry mechanisms with exponential backoff
- Graceful error recovery

### 🗄️ Cache Management
- Manual cache invalidation
- Cache clearing and reset
- User selection with cached data

### ✨ Feature Highlights
- Visual showcase of all qortex capabilities
- Smart caching, background updates, and request deduplication

## 🚀 Quick Start

From the repo root:

```bash
# Install workspace dependencies (links local packages)
pnpm install

# Build packages (optional - workspace linking works without build)
pnpm run build:packages

# Run the example dev server
pnpm --filter qortex-query-react-example run dev
```

Open http://localhost:5173

## 🎯 Key Takeaways

### 1. **Real API Integration**
- Uses JSONPlaceholder for authentic network requests
- Demonstrates proper error handling with real HTTP status codes
- Shows how qortex works with actual REST APIs

### 2. **Advanced Caching Patterns**
- Different stale times for different data types
- Background refetching without loading states
- Previous data preservation during updates

### 3. **Optimistic Updates**
- Instant UI feedback for user actions
- Automatic rollback on errors
- Seamless user experience

### 4. **Error Recovery**
- Graceful handling of network failures
- Retry mechanisms with user feedback
- Fallback data and placeholder states

### 5. **Performance Optimization**
- Request deduplication across components
- Intelligent cache invalidation
- Minimal re-renders with shallow equality

## 🛠️ Technical Implementation

### API Integration
```typescript
// Real API calls to JSONPlaceholder
const api = {
  baseUrl: "https://jsonplaceholder.typicode.com",
  getUsers: async ({ signal }) => {
    const response = await fetch(`${api.baseUrl}/users`, { signal });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  }
};
```

### Fetcher Registration
```typescript
// Register with different caching strategies
registerFetcher(["users"], {
  fetcher: api.getUsers,
  staleTime: 5 * 60 * 1000, // 5 minutes
  cacheTime: 10 * 60 * 1000, // 10 minutes
  placeholderData: []
});
```

### React Integration
```typescript
// Simple hook usage with full TypeScript support
const { data: users, isLoading, isSuccess, isError, error, refetch } = useQuery(["users"]);
```

## 📱 Demo Sections

1. **Live Statistics** - Real-time data with background updates
2. **Users List** - Basic data fetching with caching
3. **Posts System** - CRUD operations with optimistic updates
4. **Albums Gallery** - Nested queries and image loading
5. **Error Handling** - Network failure simulation and recovery
6. **Cache Management** - Manual cache control and user selection
7. **Feature Highlights** - Visual showcase of capabilities

## 🔧 Development Notes

- The example depends on `qortex-query-react` via the workspace protocol
- Local packages are automatically linked by pnpm
- Changes to packages require rebuilding: `pnpm -w -r run build`
- Vite + workspace linking works during development

## 🌐 API Endpoints Used

- **Users**: `GET /users` - User profiles and details
- **Posts**: `GET /posts` - Blog posts and content
- **Comments**: `GET /comments` - Post comments for statistics
- **Albums**: `GET /albums` - Photo albums
- **Photos**: `GET /albums/{id}/photos` - Album photos

This example provides a complete showcase of qortex's capabilities in a real-world scenario with actual network requests and data management patterns.