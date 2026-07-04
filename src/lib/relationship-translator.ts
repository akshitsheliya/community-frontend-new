/**
 * Translates indirect relationships to current user's perspective
 * Now considers TARGET member's gender for accurate labels
 */

type Gender = 'Male' | 'Female' | 'Other' | string;

// Format: [connectorLabel][targetLabel] → { male: label, female: label }
const TRANSLATION_MATRIX: Record<string, Record<string, {
  male: string;
  female: string;
  neutral?: string;
}>> = {
  // My BROTHER's ...
  brother: {
    wife: { male: 'sister-in-law', female: 'sister-in-law' },
    husband: { male: 'brother-in-law', female: 'brother-in-law' },
    son: { male: 'nephew', female: 'nephew' },
    daughter: { male: 'niece', female: 'niece' },
    brother: { male: 'brother', female: 'brother' },
    sister: { male: 'sister', female: 'sister' },
    father: { male: 'father', female: 'father' },
    mother: { male: 'mother', female: 'mother' },
  },
  // My SISTER's ...
  sister: {
    husband: { male: 'brother-in-law', female: 'brother-in-law' },
    wife: { male: 'sister-in-law', female: 'sister-in-law' },
    son: { male: 'nephew', female: 'nephew' },
    daughter: { male: 'niece', female: 'niece' },
    brother: { male: 'brother', female: 'brother' },
    sister: { male: 'sister', female: 'sister' },
    father: { male: 'father', female: 'father' },
    mother: { male: 'mother', female: 'mother' },
  },
  // My SON's ...
  son: {
    wife: { male: 'daughter-in-law', female: 'daughter-in-law' },
    husband: { male: 'son-in-law', female: 'son-in-law' },
    son: { male: 'grandson', female: 'grandson' },
    daughter: { male: 'granddaughter', female: 'granddaughter' },
    // 'father', 'mother' of my son are ME and MY WIFE - skip these
  },
  // My DAUGHTER's ...
  daughter: {
    husband: { male: 'son-in-law', female: 'son-in-law' },
    wife: { male: 'daughter-in-law', female: 'daughter-in-law' },
    son: { male: 'grandson', female: 'grandson' },
    daughter: { male: 'granddaughter', female: 'granddaughter' },
  },
  // My HUSBAND's ...
  husband: {
    brother: { male: 'brother-in-law', female: 'brother-in-law' },
    sister: { male: 'sister-in-law', female: 'sister-in-law' },
    father: { male: 'father-in-law', female: 'father-in-law' },
    mother: { male: 'mother-in-law', female: 'mother-in-law' },
  },
  // My WIFE's ...
  wife: {
    brother: { male: 'brother-in-law', female: 'brother-in-law' },
    sister: { male: 'sister-in-law', female: 'sister-in-law' },
    father: { male: 'father-in-law', female: 'father-in-law' },
    mother: { male: 'mother-in-law', female: 'mother-in-law' },
  },
  // My FATHER's ...
  father: {
    brother: { male: 'uncle', female: 'uncle' },
    sister: { male: 'aunt', female: 'aunt' },
    father: { male: 'grandfather', female: 'grandfather' },
    mother: { male: 'grandmother', female: 'grandmother' },
    // wife of my father = my mother (already exists usually)
    son: { male: 'brother', female: 'brother' },
    daughter: { male: 'sister', female: 'sister' },
  },
  // My MOTHER's ...
  mother: {
    brother: { male: 'uncle', female: 'uncle' },
    sister: { male: 'aunt', female: 'aunt' },
    father: { male: 'grandfather', female: 'grandfather' },
    mother: { male: 'grandmother', female: 'grandmother' },
    son: { male: 'brother', female: 'brother' },
    daughter: { male: 'sister', female: 'sister' },
  },
  // My UNCLE's ...
  uncle: {
    wife: { male: 'aunt', female: 'aunt' },
    son: { male: 'cousin', female: 'cousin' },
    daughter: { male: 'cousin', female: 'cousin' },
  },
  // My AUNT's ...
  aunt: {
    husband: { male: 'uncle', female: 'uncle' },
    son: { male: 'cousin', female: 'cousin' },
    daughter: { male: 'cousin', female: 'cousin' },
  },
  // My GRANDFATHER's ...
  grandfather: {
    wife: { male: 'grandmother', female: 'grandmother' },
  },
  // My GRANDMOTHER's ...
  grandmother: {
    husband: { male: 'grandfather', female: 'grandfather' },
  },
};

/**
 * Get inverse label based on target's gender
 * Example: If someone is my son's "wife" (target=female) → "daughter-in-law"
 */
export function getGenderAwareInverse(label: string, targetGender: string): string {
  const gender = targetGender?.toLowerCase();
  
  const genderMap: Record<string, { male: string; female: string }> = {
    father: { male: 'father', female: 'father' },
    mother: { male: 'mother', female: 'mother' },
    parent: { 
      male: 'father', 
      female: 'mother' 
    },
    son: { male: 'son', female: 'daughter' },
    daughter: { male: 'son', female: 'daughter' },
    child: { 
      male: 'son', 
      female: 'daughter' 
    },
    brother: { male: 'brother', female: 'sister' },
    sister: { male: 'brother', female: 'sister' },
    sibling: { 
      male: 'brother', 
      female: 'sister' 
    },
    husband: { male: 'husband', female: 'wife' },
    wife: { male: 'husband', female: 'wife' },
    spouse: { 
      male: 'husband', 
      female: 'wife' 
    },
  };
  
  const mapping = genderMap[label];
  if (!mapping) return label;
  
  return gender === 'female' ? mapping.female : mapping.male;
}

/**
 * Translate an indirect relationship considering target's gender
 */
export function translateRelation(
  connectorLabel: string, 
  targetLabel: string,
  targetGender?: string
): string | null {
  const normalizedConnector = connectorLabel.toLowerCase();
  const normalizedTarget = targetLabel.toLowerCase();
  const gender = (targetGender || 'male').toLowerCase();
  
  const translations = TRANSLATION_MATRIX[normalizedConnector];
  if (!translations) return null;
  
  const translationObj = translations[normalizedTarget];
  if (!translationObj) return null;
  
  const translated = gender === 'female' 
    ? translationObj.female 
    : translationObj.male;
    
  if (!translated) return null;
  
  return translated;
}

/**
 * Format label for display
 */
export function formatLabel(label: string): string {
  if (!label) return '';
  return label
    .split('_')[0]
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join('-');
}
