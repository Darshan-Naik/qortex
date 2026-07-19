import React, { useState } from "react";
import { useQueryForm } from "qortex-form-react/query";
import { useField, useFieldArray } from "qortex-form-react";

type Profile = {
  profile: {
    name: string;
    contact: {
      email: string;
      phone: string;
    };
  };
  tags: string[];
};

const mockDb: Record<"alice" | "bob", Profile> = {
  alice: {
    profile: {
      name: "Alice Smith",
      contact: {
        email: "alice@example.com",
        phone: "123-456-7890",
      },
    },
    tags: ["admin", "developer"],
  },
  bob: {
    profile: {
      name: "Bob Jones",
      contact: {
        email: "bob@jones.com",
        phone: "987-654-3210",
      },
    },
    tags: ["support", "writer"],
  },
};

async function fetchProfile(id: "alice" | "bob"): Promise<Profile> {
  await new Promise((r) => setTimeout(r, 300));
  return structuredClone(mockDb[id]);
}

async function updateProfile(id: "alice" | "bob", draft: Profile): Promise<Profile> {
  await new Promise((r) => setTimeout(r, 400));
  mockDb[id] = structuredClone(draft);
  return mockDb[id];
}

const FormField = ({ path, label, type = "text" }: { path: string; label: string; type?: string }) => {
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

const TagsField = () => {
  const { fields, append, remove } = useFieldArray("tags");
  const [draft, setDraft] = useState("");

  return (
    <div style={{ marginBottom: "16px" }}>
      <label style={{ display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: "600" }}>Tags</label>
      <ul style={{ listStyle: "none", padding: 0, margin: "0 0 8px" }}>
        {fields.map((f) => (
          <li key={f.id} style={{ display: "flex", gap: "8px", marginBottom: "4px" }}>
            <span className="store-input" style={{ flex: 1 }}>{String(f.item)}</span>
            <button type="button" className="btn" onClick={() => remove(f.index)}>×</button>
          </li>
        ))}
      </ul>
      <div style={{ display: "flex", gap: "8px" }}>
        <input
          className="store-input"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Add tag"
        />
        <button
          type="button"
          className="btn"
          onClick={() => {
            if (!draft.trim()) return;
            append(draft.trim());
            setDraft("");
          }}
        >
          Add
        </button>
      </div>
    </div>
  );
};

function ProfileForm({ who }: { who: "alice" | "bob" }) {
  const {
    Provider,
    isLoading,
    isSaving,
    isChanged,
    save,
    resetDraft,
    error,
  } = useQueryForm({
    key: ["profile", who],
    fetcher: () => fetchProfile(who),
    mutationFn: (draft) => updateProfile(who, draft),
    validate: {
      fields: {
        "profile.name": (val) => (!val ? "Name is required" : val.length < 3 ? "Name must be at least 3 characters" : null),
        "profile.contact.email": (val) => (!val ? "Email is required" : !val.includes("@") ? "Invalid email address" : null),
        "profile.contact.phone": (val) => (!val ? "Phone is required" : null),
      },
    },
  });

  if (isLoading) {
    return <p style={{ color: "var(--text-muted)" }}>Loading profile…</p>;
  }

  return (
    <Provider>
      <FormField path="profile.name" label="Full Name" />
      <FormField path="profile.contact.email" label="Email" type="email" />
      <FormField path="profile.contact.phone" label="Phone" />
      <TagsField />
      {error != null && (
        <p style={{ color: "var(--danger)", fontSize: "13px" }}>{String(error)}</p>
      )}
      <div style={{ display: "flex", gap: "8px", marginTop: "16px" }}>
        <button
          className="btn"
          disabled={!isChanged || isSaving}
          onClick={() => save()}
        >
          {isSaving ? "Saving…" : "Save"}
        </button>
        <button type="button" className="btn" disabled={!isChanged || isSaving} onClick={resetDraft}>
          Reset
        </button>
      </div>
      <p style={{ marginTop: "12px", fontSize: "12px", color: "var(--text-muted)" }}>
        Powered by <code>useQueryForm</code> — save invalidates the query; refetch fills <code>data</code>.
      </p>
    </Provider>
  );
}

export default function FormSection() {
  const [who, setWho] = useState<"alice" | "bob">("alice");

  return (
    <div className="section-card">
      <div className="package-info">qortex-form + qortex-form-react/query</div>
      <h2>
        <span>📝</span> Form Profile
      </h2>
      <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>
        <code>useQueryForm</code> composes query + form + mutate. Fresh data comes from refetch after save.
      </p>

      <div style={{ display: "flex", gap: "8px", margin: "12px 0" }}>
        <button className="btn" onClick={() => setWho("alice")} disabled={who === "alice"}>
          Alice
        </button>
        <button className="btn" onClick={() => setWho("bob")} disabled={who === "bob"}>
          Bob
        </button>
      </div>

      <ProfileForm who={who} />
    </div>
  );
}
