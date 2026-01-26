const ALPHABET = "abcdefghijklmnopqrstuvwxyz0123456789";

export function createShareSlug(length = 10) {
  const size = Math.min(12, Math.max(8, length));
  const bytes = crypto.getRandomValues(new Uint8Array(size));
  let slug = "";
  for (let i = 0; i < size; i += 1) {
    slug += ALPHABET[bytes[i] % ALPHABET.length];
  }
  return slug;
}

export async function createUniqueShareSlug(options: {
  length?: number;
  maxRetries?: number;
  exists: (slug: string) => boolean | Promise<boolean>;
}) {
  const { exists, length = 10, maxRetries = 6 } = options;
  for (let attempt = 0; attempt < maxRetries; attempt += 1) {
    const slug = createShareSlug(length);
    const taken = await Promise.resolve(exists(slug));
    if (!taken) return slug;
  }
  throw new Error("shareSlug 생성 재시도 한도 초과");
}

export async function insertWithSlugRetry<T>(args: {
  supabase: any;
  table: string;
  payload: T;
  slugKey: keyof T;
  maxRetries?: number;
  length?: number;
}) {
  const { supabase, table, payload, slugKey, maxRetries = 6, length } = args;
  for (let attempt = 0; attempt < maxRetries; attempt += 1) {
    const slug = createShareSlug(length ?? 10);
    const nextPayload = { ...payload, [slugKey]: slug } as T;
    const { data, error } = await supabase
      .from(table)
      .insert(nextPayload)
      .select()
      .single();

    if (!error) return data;
    if (error.code === "23505") continue;
    throw error;
  }
  throw new Error("shareSlug 생성 재시도 한도 초과");
}
