import { readFile } from 'fs/promises';
import path from 'path';
import StartForm from '@/components/StartForm';
import Link from 'next/link';

export default async function StartPage() {
  const dataPath = path.join(process.cwd(), 'public', 'data', 'physics_en_COMP.json');
  let subfields: string[] = [];
  // also compute counts for each subfield
  const subfieldCounts: Record<string, number> = {};
  try {
    const raw = await readFile(dataPath, 'utf-8');
    const items = JSON.parse(raw) as Array<{ subfield: string }>;
    const set = new Set<string>();
    for (const it of items) {
      if (it?.subfield) {
        set.add(it.subfield);
        subfieldCounts[it.subfield] = (subfieldCounts[it.subfield] || 0) + 1;
      }
    }
    subfields = Array.from(set).sort((a, b) => a.localeCompare(b));
  } catch (err) {
    // Show minimal error UI on server failure
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-red-400">Error loading subjects: {String(err)}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-6 flex items-baseline justify-between">
          <h1 className="text-3xl font-bold text-black">Physics Trainer</h1>
          <Link href="/" className="text-blue-600 hover:underline">Go to Trainer</Link>
        </div>

        <StartForm subfields={subfields.map((s) => ({ name: s, count: subfieldCounts[s] || 0 }))} />
      </div>
    </div>
  );
}
