"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

interface SubfieldItem {
  name: string;
  count: number;
}

interface StartFormProps {
  subfields: SubfieldItem[];
}

export default function StartForm({ subfields }: StartFormProps) {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);
  const [scramble, setScramble] = useState<boolean>(false);
  const [query, setQuery] = useState<string>('');

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return subfields;
    return subfields.filter((s) => s.name.toLowerCase().includes(q));
  }, [subfields, query]);

  const allSelected = selected.length === subfields.length && subfields.length > 0;

  const toggleAll = () => {
    if (allSelected) setSelected([]);
    else setSelected(subfields.map((s) => s.name));
  };

  const toggleOne = (name: string) => {
    setSelected((prev) =>
      prev.includes(name) ? prev.filter((x) => x !== name) : [...prev, name]
    );
  };

  const start = () => {
    const params = new URLSearchParams();
    params.set("q", "0");
    if (selected.length > 0) {
      // encode each subject so commas/spaces are preserved
      params.set("subjects", selected.map((s) => encodeURIComponent(s)).join(","));
    }
    if (scramble) {
      params.set("scramble", "1");
      const seed = Math.floor(Math.random() * 1_000_000_000);
      params.set("seed", String(seed));
    }
    router.push(`/?${params.toString()}`);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow text-black">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Choose subjects</h1>
          <p className="text-sm text-gray-600 mt-1">Pick one or more topics to practice. If none are selected, all subjects will be used.</p>
        </div>
        <div className="text-sm text-gray-500">
          <div className="font-medium">{selected.length} selected</div>
          <div className="text-xs">{subfields.length} available</div>
        </div>
      </div>

      <div className="mt-4 flex gap-3 items-center">
        <input
          role="searchbox"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter subjects..."
          className="flex-1 px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-300"
        />
        <button
          type="button"
          onClick={toggleAll}
          className="px-3 py-2 rounded-lg border bg-gray-50 text-sm"
        >
          {allSelected ? 'Unselect all' : 'Select all'}
        </button>
      </div>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {visible.map((it) => {
          const active = selected.includes(it.name);
          return (
            <button
              key={it.name}
              type="button"
              onClick={() => toggleOne(it.name)}
              className={`text-left group cursor-pointer rounded-lg p-3 border transition-shadow flex items-center justify-between ${active ? 'bg-blue-50 border-blue-300 shadow-sm' : 'hover:shadow-sm bg-white'}`}
            >
              <div>
                <div className="font-medium text-sm text-black">{it.name}</div>
                <div className="text-xs text-gray-500 mt-0.5">{it.count} questions</div>
              </div>
              <div className="ml-4">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ${active ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}>
                  {active ? '✓' : ''}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-6 flex items-center justify-between">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            className="h-4 w-4"
            checked={scramble}
            onChange={(e) => setScramble(e.target.checked)}
          />
          <span>Scramble questions (random order)</span>
        </label>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={start}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg"
          >
            Start Training
          </button>
          <button
            type="button"
            onClick={() => router.push("/?q=0")}
            className="px-4 py-2 rounded-lg border"
          >
            Skip to Trainer
          </button>
        </div>
      </div>
    </div>
  );
}
