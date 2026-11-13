export const TEST_AVATAR_BY_USER_ID: Record<string, string> = {
  '01258287-49a3-49ed-a9e0-31467b283664': 'https://randomuser.me/api/portraits/men/32.jpg',
  '844c76b1-bf8f-40ee-b5a0-4cae771889c4': 'https://randomuser.me/api/portraits/men/45.jpg',
  '98e3b806-7a3f-4fd9-89d6-8476504fe800': 'https://randomuser.me/api/portraits/men/22.jpg',
  '1d6d874a-0cb0-4c64-a3c8-0e2ac0bed653': 'https://randomuser.me/api/portraits/men/29.jpg',
  'e75da8d4-4505-4087-bd7d-9c637e6fa608': 'https://randomuser.me/api/portraits/men/54.jpg',
};

export function resolveAvatarUrl(
  userId: string | null | undefined,
  dbAvatarUrl?: string | null
): string | null {
  if (dbAvatarUrl) return dbAvatarUrl;
  if (!userId) return null;
  return TEST_AVATAR_BY_USER_ID[userId] ?? null;
}
