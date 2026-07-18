import React from "react";
import { z } from "zod";
import { createResourceHooks } from "qortex-resource-react";

// 1. Define Zod schema for nested profile data validation
const UserSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(5, "Phone number must be at least 5 digits"),
  website: z.string().url("Website must be a valid URL").or(z.literal("")),
  company: z.object({
    name: z.string().min(2, "Company name must be at least 2 characters"),
    catchPhrase: z.string().optional()
  })
});

type UserData = z.infer<typeof UserSchema>;

// 2. Custom validation resolver helper translating Zod errors to Record<string, string>
const zodResolver = (schema: z.ZodSchema) => (data: any) => {
  const result = schema.safeParse(data);
  if (result.success) return null;

  const errors: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const path = issue.path.join(".");
    errors[path] = issue.message;
  }
  return errors;
};

// 3. Initialize resource hooks pre-bound to source query (fetch) & Zod schema validation
const { useResource, useField } = createResourceHooks<UserData>({
  validate: {
    resolver: zodResolver(UserSchema)
  },
  source: {
    fetch: async () => {
      const res = await fetch("https://jsonplaceholder.typicode.com/users/1");
      if (!res.ok) throw new Error("Server failed to fetch user profile");
      const user = await res.json();
      return {
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        website: user.website ? `https://${user.website}` : "",
        company: {
          name: user.company?.name || "",
          catchPhrase: user.company?.catchPhrase || ""
        }
      };
    },
    save: async (draft) => {
      const res = await fetch("https://jsonplaceholder.typicode.com/users/1", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft)
      });
      if (!res.ok) throw new Error("Server failed to update user profile");
      return res.json();
    },
  },
});

const ApiFormField = ({ path, label, type = "text" }: { path: string; label: string; type?: string }) => {
  const { value, error, isChanged, isTouched, onChange, onBlur } = useField(path);

  return (
    <div style={{ marginBottom: "16px", padding: "12px", border: "1px solid #334155", borderRadius: "6px", background: "rgba(30, 41, 59, 0.3)" }}>
      <label style={{ display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: "600" }}>
        {label}
      </label>
      <input
        type={type}
        className="store-input"
        style={{ borderColor: error ? "var(--danger)" : undefined }}
        value={(value as string) ?? ""}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
      />
      {error && <p style={{ color: "var(--danger)", fontSize: "12px", margin: "4px 0 0" }}>⚠️ {error}</p>}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginTop: "8px", fontSize: "11px", color: "var(--text-muted)" }}>
        <span>Changed: <strong style={{ color: isChanged ? "var(--primary)" : undefined }}>{isChanged ? "Yes" : "No"}</strong></span>
        <span>•</span>
        <span>Touched: <strong style={{ color: isTouched ? "var(--primary)" : undefined }}>{isTouched ? "Yes" : "No"}</strong></span>
      </div>
    </div>
  );
};

export default function ApiDemoSection() {
  const { draft, isChanged, isSaving, isError, error, isLoading, isFetching, save, resetDraft, refetch } = useResource();

  if (isLoading && !draft) {
    return (
      <div className="section-card">
        <h2><span>⚡</span> API User Profile</h2>
        <p>Loading user profile from JSONPlaceholder...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="section-card">
        <h2><span>⚡</span> API User Profile</h2>
        <p style={{ color: "var(--danger)" }}>Error loading data: {String(error)}</p>
        <button className="btn" onClick={() => refetch()}>Retry Fetch</button>
      </div>
    );
  }

  return (
    <div className="section-card">
      <div className="package-info">qortex-resource + source.fetch + zod</div>
      <h2>
        <span>⚡</span> API User Profile & Zod
      </h2>
      <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>
        Fetches live profile from JSONPlaceholder via <code>source.fetch</code>, validates forms against a Zod schema resolver, and performs a simulated PUT mutation.
      </p>

      {isFetching && <p style={{ fontSize: "12px", color: "var(--primary)", margin: "5px 0" }}>⏳ Syncing with remote API...</p>}

      <div style={{ marginTop: "20px" }}>
        <ApiFormField path="name" label="Full Name" />
        <ApiFormField path="email" label="Email Address" />
        <ApiFormField path="phone" label="Phone Number" />
        <ApiFormField path="website" label="Website URL" />
        <ApiFormField path="company.name" label="Company Name" />
      </div>

      <div className="controls">
        <button
          className="btn"
          disabled={isSaving || !isChanged}
          onClick={async () => {
            const res = await save();
            if (res.success) {
              alert("Saved and mutated successfully on JSONPlaceholder!");
            } else {
              alert("Save failed: " + ((res.error as any)?.message || String(res.error)));
            }
          }}
        >
          {isSaving ? "⏳ Mutating..." : "💾 Mutate Profile"}
        </button>
        <button
          className="btn btn-outline"
          disabled={isSaving || !isChanged}
          onClick={() => resetDraft()}
        >
          Reset Form
        </button>
        <button className="btn btn-outline" onClick={() => refetch()}>
          🔄 Refetch Remote Data
        </button>
      </div>

      <div style={{ marginTop: "20px", padding: "10px", background: "rgba(0,0,0,0.2)", borderRadius: "6px" }}>
        <pre style={{ fontSize: "11px", margin: 0 }}>
          {JSON.stringify({
            isChanged,
            isSaving,
            draft
          }, null, 2)}
        </pre>
      </div>
    </div>
  );
}
