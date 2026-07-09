/**
 * Get proper relationship prefix based on gender
 * s/o = son of (male)
 * d/o = daughter of (female)
 * w/o = wife of (used for married women referencing husband)
 */
export function getParentPrefix(gender?: string | null): string {
  if (!gender) return 's/o';
  const g = gender.toLowerCase();
  if (g === 'female') return 'd/o';
  return 's/o';
}

/**
 * Format member with proper prefix
 */
export function formatMemberDescription(
  fatherName?: string | null, 
  gender?: string | null
): string | null {
  if (!fatherName) return null;
  return `${getParentPrefix(gender)} ${fatherName}`;
}
