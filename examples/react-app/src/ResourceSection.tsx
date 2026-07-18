import React, { useState } from "react";
import { createResourceHooks } from "qortex-resource-react";

const sampleProfiles = {
  alice: {
    profile: {
      name: "Alice Smith",
      contact: {
        email: "alice@example.com",
        phone: "123-456-7890"
      }
    },
    tags: ["admin", "developer"]
  },
  bob: {
    profile: {
      name: "Bob Jones",
      contact: {
        email: "bob@jones.com",
        phone: "987-654-3210"
      }
    },
    tags: ["support", "writer"]
  }
};

// Create bound hooks at module level - no React Context required!
const { useResource, useField, useFieldArray } = createResourceHooks({
  initialData: sampleProfiles.alice,
  validate: {
    fields: {
      "profile.name": (val) => (!val ? "Name is required" : val.length < 3 ? "Name must be at least 3 characters" : null),
      "profile.contact.email": (val) => (!val ? "Email is required" : !val.includes("@") ? "Invalid email address" : null),
      "profile.contact.phone": (val) => (!val ? "Phone is required" : null),
    }
  },
  source: {
    save: async (draft) => {
      // Simulate network save
      await new Promise((r) => setTimeout(r, 1000));
      return draft;
    }
  }
});

const FormField = ({ path, label, type = "text" }: { path: string; label: string; type?: string }) => {
  // Use the pre-bound hook - no resource prop needed!
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
        value={value ?? ""}
        onChange={(e) => onChange(type === "number" ? Number(e.target.value) : e.target.value)}
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

const TagsField = () => {
  // Use the pre-bound hook - no resource prop needed!
  const { fields, append, remove } = useFieldArray("tags");
  const [newTag, setNewTag] = useState("");

  return (
    <div style={{ marginBottom: "16px", padding: "12px", border: "1px solid #334155", borderRadius: "6px", background: "rgba(30, 41, 59, 0.3)" }}>
      <label style={{ display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: "600" }}>
        User Tags (Array)
      </label>
      
      <div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
        <input
          className="store-input"
          style={{ flex: 1 }}
          placeholder="Add new tag"
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
        />
        <button 
          className="btn" 
          type="button"
          onClick={() => {
            if (newTag.trim()) {
              append(newTag.trim());
              setNewTag("");
            }
          }}
        >
          Add
        </button>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
        {fields.map((field, index) => (
          <div key={field.id} style={{ display: "flex", alignItems: "center", gap: "6px", background: "rgba(56, 189, 248, 0.15)", border: "1px solid var(--primary)", padding: "4px 8px", borderRadius: "4px", fontSize: "12px" }}>
            <span>{field.item}</span>
            <button 
              type="button" 
              style={{ background: "transparent", border: "none", color: "var(--danger)", cursor: "pointer", fontWeight: "bold", padding: 0 }}
              onClick={() => remove(index)}
            >
              ×
            </button>
          </div>
        ))}
        {fields.length === 0 && <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: 0 }}>No tags added.</p>}
      </div>
    </div>
  );
};

export default function ResourceSection() {
  const [profileKey, setProfileKey] = useState<"alice" | "bob">("alice");

  // Use the pre-bound hook - binds to the module singleton instance!
  const { draft, isChanged, isSaving, changedFields, save, resetDraft, syncSource } = useResource();

  const handleProfileSwitch = () => {
    const nextKey = profileKey === "alice" ? "bob" : "alice";
    setProfileKey(nextKey);
    syncSource({ data: sampleProfiles[nextKey] });
  };

  return (
    <div className="section-card">
      <div className="package-info">qortex-resource + qortex-resource-react</div>
      <h2>
        <span>📝</span> Form State & Validation (Complex)
      </h2>
      <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>
        Bound hooks (via <code>createResourceHooks</code>) remove the need to pass <code>resource</code> down as props or use React Context.
      </p>

      <div style={{ marginTop: "15px", marginBottom: "15px" }}>
        <button className="btn btn-outline" onClick={handleProfileSwitch}>
          🔄 Switch Source Profile (Current: {profileKey.toUpperCase()})
        </button>
      </div>

      <div>
        <FormField path="profile.name" label="Name (Nested)" />
        <FormField path="profile.contact.email" label="Email (Nested)" />
        <FormField path="profile.contact.phone" label="Phone (Nested)" />
        <TagsField />
      </div>

      <div className="controls">
        <button 
          className="btn" 
          disabled={isSaving || !isChanged} 
          onClick={async () => {
            const res = await save();
            if (res.success) {
              alert("Saved successfully!");
            } else {
              alert("Save failed: " + ((res.error as any)?.message || String(res.error)));
            }
          }}
        >
          {isSaving ? "⏳ Saving..." : "💾 Save Changes"}
        </button>
        <button 
          className="btn btn-outline" 
          disabled={isSaving || !isChanged} 
          onClick={() => resetDraft()}
        >
          Reset Form
        </button>
      </div>

      <div style={{ marginTop: "20px", padding: "10px", background: "rgba(0,0,0,0.2)", borderRadius: "6px" }}>
        <pre style={{ fontSize: "11px", margin: 0 }}>
          {JSON.stringify({ 
            isChanged, 
            isSaving, 
            changedFields,
            draft 
          }, null, 2)}
        </pre>
      </div>
    </div>
  );
}
