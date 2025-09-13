import React, { useState } from "react";
import { queryManager, useQuery } from "dquery-react";
import "./App.css";

// Real API functions using JSONPlaceholder
const api = {
  baseUrl: "https://jsonplaceholder.typicode.com",
  
  // Users API
  getUsers: async ({ signal }: { signal?: AbortSignal }) => {
    const response = await fetch(`${api.baseUrl}/users`, { signal });
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    const users = await response.json();
    return users.map((user: any) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.name.charAt(0).toUpperCase(),
      username: user.username,
      phone: user.phone,
      website: user.website,
      company: user.company.name,
      address: `${user.address.street}, ${user.address.city}`
    }));
  },

  getUser: async ({ signal }: { signal?: AbortSignal }, userId: string) => {
    const response = await fetch(`${api.baseUrl}/users/${userId}`, { signal });
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    const user = await response.json();
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.name.charAt(0).toUpperCase(),
      username: user.username,
      phone: user.phone,
      website: user.website,
      company: user.company.name,
      address: `${user.address.street}, ${user.address.city}`
    };
  },

  // Posts API
  getPosts: async ({ signal }: { signal?: AbortSignal }) => {
    const response = await fetch(`${api.baseUrl}/posts?_limit=10`, { signal });
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    const posts = await response.json();
    return posts.map((post: any) => ({
      id: post.id,
      title: post.title,
      content: post.body,
      authorId: post.userId,
      likes: Math.floor(Math.random() * 100),
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
    }));
  },

  createPost: async (post: { title: string; content: string; authorId: number }) => {
    const response = await fetch(`${api.baseUrl}/posts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: post.title,
        body: post.content,
        userId: post.authorId
      })
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    const createdPost = await response.json();
    return {
      id: createdPost.id,
      title: createdPost.title,
      content: createdPost.body,
      authorId: createdPost.userId,
      likes: 0,
      createdAt: new Date().toISOString()
    };
  },

  // Live Stats API (combines real data with simulated real-time updates)
  getLiveStats: async ({ signal }: { signal?: AbortSignal }) => {
    const [usersResponse, postsResponse, commentsResponse] = await Promise.all([
      fetch(`${api.baseUrl}/users`, { signal }),
      fetch(`${api.baseUrl}/posts`, { signal }),
      fetch(`${api.baseUrl}/comments`, { signal })
    ]);

    if (!usersResponse.ok || !postsResponse.ok || !commentsResponse.ok) {
      throw new Error("Failed to fetch live stats");
    }

    const [users, posts, comments] = await Promise.all([
      usersResponse.json(),
      postsResponse.json(),
      commentsResponse.json()
    ]);

    return {
      onlineUsers: users.length + Math.floor(Math.random() * 50),
      totalPosts: posts.length,
      totalComments: comments.length,
      activeSessions: Math.floor(Math.random() * 100) + 50,
      lastUpdated: new Date().toISOString()
    };
  },

  // Error-prone API for testing error handling
  getRiskyData: async ({ signal }: { signal?: AbortSignal }) => {
    // Simulate random failures
    if (Math.random() > 0.6) {
      throw new Error("Network error - please try again!");
    }
    
    const response = await fetch(`${api.baseUrl}/posts/1`, { signal });
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    const post = await response.json();
    
    return { 
      message: "Risky data loaded successfully!", 
      data: post.title,
      timestamp: new Date().toISOString() 
    };
  },

  // Albums API for additional demo content
  getAlbums: async ({ signal }: { signal?: AbortSignal }) => {
    const response = await fetch(`${api.baseUrl}/albums?_limit=6`, { signal });
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    return await response.json();
  },

  // Photos API
  getPhotos: async ({ signal }: { signal?: AbortSignal }, albumId: number) => {
    const response = await fetch(`${api.baseUrl}/albums/${albumId}/photos?_limit=4`, { signal });
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    return await response.json();
  }
};

// Register fetchers
queryManager.registerFetcher(["users"], {
  fetcher: api.getUsers,
  staleTime: 5 * 60 * 1000, // 5 minutes
  cacheTime: 10 * 60 * 1000, // 10 minutes
  placeholderData: []
});

queryManager.registerFetcher(["user"], {
  fetcher: ({ signal }, userId: string) => api.getUser({ signal }, userId),
  staleTime: 2 * 60 * 1000, // 2 minutes
  cacheTime: 5 * 60 * 1000, // 5 minutes
});

queryManager.registerFetcher(["posts"], {
  fetcher: api.getPosts,
  staleTime: 1 * 60 * 1000, // 1 minute
  cacheTime: 5 * 60 * 1000, // 5 minutes
  placeholderData: []
});

queryManager.registerFetcher(["live-stats"], {
  fetcher: api.getLiveStats,
  staleTime: 0, // Always stale for real-time feel
  cacheTime: 30 * 1000, // 30 seconds
});

queryManager.registerFetcher(["risky-data"], {
  fetcher: api.getRiskyData,
  staleTime: 0,
  cacheTime: 60 * 1000, // 1 minute
  placeholderData: { message: "Loading risky data...", timestamp: "" },
  usePlaceholderOnError: true,
  usePreviousDataOnError: true
});

queryManager.registerFetcher(["albums"], {
  fetcher: api.getAlbums,
  staleTime: 3 * 60 * 1000, // 3 minutes
  cacheTime: 10 * 60 * 1000, // 10 minutes
  placeholderData: []
});

queryManager.registerFetcher(["photos"], {
  fetcher: ({ signal }, albumId: number) => api.getPhotos({ signal }, albumId),
  staleTime: 2 * 60 * 1000, // 2 minutes
  cacheTime: 5 * 60 * 1000, // 5 minutes
  placeholderData: []
});

// Components
function Header() {
  return (
    <header className="header">
      <div className="container">
        <h1>🚀 d-query Demo</h1>
        <p>A comprehensive showcase of d-query features with real API data from JSONPlaceholder</p>
      </div>
    </header>
  );
}

function LiveStats() {
  const { data: stats, isFetching, error } = useQuery(["live-stats"], {
    refetchOnSubscribe: "stale"
  });

  return (
    <div className="card">
      <h3>📊 Live Statistics</h3>
      <div className="stats-grid">
        <div className="stat">
          <div className="stat-value">{stats?.onlineUsers || "..."}</div>
          <div className="stat-label">Online Users</div>
        </div>
        <div className="stat">
          <div className="stat-value">{stats?.totalPosts || "..."}</div>
          <div className="stat-label">Total Posts</div>
        </div>
        <div className="stat">
          <div className="stat-value">{stats?.totalComments || "..."}</div>
          <div className="stat-label">Total Comments</div>
        </div>
        <div className="stat">
          <div className="stat-value">{stats?.activeSessions || "..."}</div>
          <div className="stat-label">Active Sessions</div>
        </div>
      </div>
      {isFetching && <div className="loading-indicator">🔄 Updating...</div>}
      {error && <div className="error">❌ {error.message}</div>}
      <div className="last-updated">
        Last updated: {stats?.lastUpdated ? new Date(stats.lastUpdated).toLocaleTimeString() : "Never"}
      </div>
    </div>
  );
}

function UsersList() {
  const { data: users, isLoading, error, refetch } = useQuery(["users"]);

  return (
    <div className="card">
      <div className="card-header">
        <h3>👥 Users</h3>
        <button onClick={() => refetch()} className="btn btn-secondary">
          🔄 Refresh
        </button>
      </div>
      
      {isLoading && <div className="loading">Loading users...</div>}
      {error && <div className="error">❌ {error.message}</div>}
      
      <div className="users-grid">
        {users?.map(user => (
          <div key={user.id} className="user-card">
            <div className="user-avatar">{user.avatar}</div>
            <div className="user-info">
              <div className="user-name">{user.name}</div>
              <div className="user-email">{user.email}</div>
              <div className="user-company">{user.company}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PostsList() {
  const { data: posts, isLoading, error, refetch } = useQuery(["posts"]);
  const [newPost, setNewPost] = useState({ title: "", content: "" });

  const handleCreatePost = async () => {
    if (!newPost.title || !newPost.content) return;
    
    try {
      const createdPost = await api.createPost({
        ...newPost,
        authorId: 1 // Simulate current user
      });
      
      // Optimistic update
      queryManager.setQueryData(["posts"], (oldPosts) => [
        ...(oldPosts || []),
        createdPost
      ]);
      
      setNewPost({ title: "", content: "" });
    } catch (error) {
      console.error("Failed to create post:", error);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3>📝 Posts</h3>
        <button onClick={() => refetch()} className="btn btn-secondary">
          🔄 Refresh
        </button>
      </div>

      {/* Create Post Form */}
      <div className="create-post">
        <h4>Create New Post</h4>
        <input
          type="text"
          placeholder="Post title..."
          value={newPost.title}
          onChange={(e) => setNewPost(prev => ({ ...prev, title: e.target.value }))}
          className="input"
        />
        <textarea
          placeholder="Post content..."
          value={newPost.content}
          onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
          className="textarea"
        />
        <button onClick={handleCreatePost} className="btn btn-primary">
          ➕ Create Post
        </button>
      </div>

      {isLoading && <div className="loading">Loading posts...</div>}
      {error && <div className="error">❌ {error.message}</div>}

      <div className="posts-list">
        {posts?.map(post => (
          <div key={post.id} className="post-card">
            <h4>{post.title}</h4>
            <p>{post.content}</p>
            <div className="post-meta">
              <span>👍 {post.likes} likes</span>
              <span>📅 {new Date(post.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AlbumsGallery() {
  const { data: albums, isLoading, error } = useQuery(["albums"]);

  return (
    <div className="card">
      <h3>📸 Albums Gallery</h3>
      {isLoading && <div className="loading">Loading albums...</div>}
      {error && <div className="error">❌ {error.message}</div>}
      
      <div className="albums-grid">
        {albums?.map(album => (
          <AlbumCard key={album.id} album={album} />
        ))}
      </div>
    </div>
  );
}

function AlbumCard({ album }: { album: any }) {
  const { data: photos, isLoading } = useQuery(["photos", album.id], {
    enabled: !!album.id
  });

  return (
    <div className="album-card">
      <h4>{album.title}</h4>
      {isLoading ? (
        <div className="photos-loading">Loading photos...</div>
      ) : (
        <div className="photos-grid">
          {photos?.map((photo: any) => (
            <img 
              key={photo.id} 
              src={photo.thumbnailUrl} 
              alt={photo.title}
              className="photo-thumbnail"
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ErrorHandlingDemo() {
  const { data, isLoading, error, refetch } = useQuery(["risky-data"]);
  const [retryCount, setRetryCount] = useState(0);

  const handleRetry = async () => {
    setRetryCount(prev => prev + 1);
    await refetch();
  };

  return (
    <div className="card">
      <h3>⚠️ Error Handling Demo</h3>
      <p>This demo simulates network errors and shows how d-query handles them gracefully.</p>
      
      <div className="error-demo">
        {isLoading && <div className="loading">Loading risky data...</div>}
        
        {error && (
          <div className="error-section">
            <div className="error">❌ {error.message}</div>
            <div className="retry-info">
              <p>Retry attempts: {retryCount}/3</p>
              {retryCount < 3 && (
                <button onClick={handleRetry} className="btn btn-warning">
                  🔄 Try Again
                </button>
              )}
            </div>
          </div>
        )}
        
        {data && (
          <div className="success">
            <div className="success-message">✅ {data.message}</div>
            <div className="data-preview">Data: {data.data}</div>
            <div className="timestamp">Loaded at: {new Date(data.timestamp).toLocaleTimeString()}</div>
          </div>
        )}
      </div>
    </div>
  );
}

function CacheManagementDemo() {
  const [selectedUserId, setSelectedUserId] = useState<string>("1");
  const { data: user, isLoading, error } = useQuery(["user", selectedUserId], {
    enabled: !!selectedUserId
  });

  const handleInvalidateCache = () => {
    queryManager.invalidateQuery(["users"]);
    queryManager.invalidateQuery(["posts"]);
    queryManager.invalidateQuery(["live-stats"]);
    queryManager.invalidateQuery(["albums"]);
  };

  const handleClearCache = () => {
    queryManager.setQueryData(["users"], { data: undefined });
    queryManager.setQueryData(["posts"], { data: undefined });
    queryManager.setQueryData(["albums"], { data: undefined });
  };

  return (
    <div className="card">
      <h3>🗄️ Cache Management</h3>
      <p>Demonstrates cache invalidation and manual cache management.</p>
      
      <div className="cache-controls">
        <button onClick={handleInvalidateCache} className="btn btn-warning">
          🔄 Invalidate All Caches
        </button>
        <button onClick={handleClearCache} className="btn btn-danger">
          🗑️ Clear Cache
        </button>
      </div>

      <div className="user-selector">
        <label>Select User to Load:</label>
        <select 
          value={selectedUserId} 
          onChange={(e) => setSelectedUserId(e.target.value)}
          className="select"
        >
          <option value="1">Leanne Graham</option>
          <option value="2">Ervin Howell</option>
          <option value="3">Clementine Bauch</option>
          <option value="4">Patricia Lebsack</option>
          <option value="5">Chelsey Dietrich</option>
        </select>
      </div>

      {isLoading && <div className="loading">Loading user...</div>}
      {error && <div className="error">❌ {error.message}</div>}
      
      {user && (
        <div className="user-detail">
          <div className="user-avatar-large">{user.avatar}</div>
          <div className="user-details">
            <h4>{user.name}</h4>
            <p>@{user.username}</p>
            <p>{user.email}</p>
            <p>📞 {user.phone}</p>
            <p>🌐 {user.website}</p>
            <p>🏢 {user.company}</p>
            <p>📍 {user.address}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function FeatureHighlights() {
  return (
    <div className="card">
      <h3>✨ d-query Features Showcased</h3>
      <div className="features-grid">
        <div className="feature">
          <div className="feature-icon">🎪</div>
          <div className="feature-title">Smart Caching</div>
          <div className="feature-desc">Automatic caching with configurable stale times</div>
        </div>
        <div className="feature">
          <div className="feature-icon">🔄</div>
          <div className="feature-title">Background Updates</div>
          <div className="feature-desc">Data refreshes without loading states</div>
        </div>
        <div className="feature">
          <div className="feature-icon">💾</div>
          <div className="feature-title">Previous Data</div>
          <div className="feature-desc">No loading flickers during refetches</div>
        </div>
        <div className="feature">
          <div className="feature-icon">⚡</div>
          <div className="feature-title">Request Deduplication</div>
          <div className="feature-desc">Multiple requests for same data are merged</div>
        </div>
        <div className="feature">
          <div className="feature-icon">🛑</div>
          <div className="feature-title">Request Cancellation</div>
          <div className="feature-desc">Automatic cleanup on component unmount</div>
        </div>
        <div className="feature">
          <div className="feature-icon">🎯</div>
          <div className="feature-title">Optimistic Updates</div>
          <div className="feature-desc">Instant UI updates with rollback on error</div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <div className="app">
      <Header />
      <main className="main">
        <div className="container">
          <div className="demo-grid">
            <div className="demo-section">
              <LiveStats />
              <UsersList />
            </div>
            <div className="demo-section">
              <PostsList />
              <AlbumsGallery />
            </div>
            <div className="demo-section">
              <ErrorHandlingDemo />
              <CacheManagementDemo />
            </div>
            <div className="demo-section">
              <FeatureHighlights />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}