// `boolean`/`bigint` are accepted so `someReactNode && 'class'` type-checks; only
// truthy values ever reach the output.
type ClassValue = string | number | bigint | boolean | null | undefined | ClassValue[]

// Tiny class-name joiner so components can compose conditional Tailwind classes
// without pulling in another dependency.
export function cn(...values: ClassValue[]): string {
  const out: string[] = []

  for (const value of values) {
    if (!value) continue
    if (Array.isArray(value)) {
      const nested = cn(...value)
      if (nested) out.push(nested)
    } else {
      out.push(String(value))
    }
  }

  return out.join(' ')
}
