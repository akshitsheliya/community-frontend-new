import { translateRelation } from './relationship-translator';

export interface GroupedRelation {
  member: {
    id: number;
    uuid: string;
    name: string;
    photo: string | null;
  };
  label: string;
  via?: string;
  viaId?: number;
}

export interface FamilyGroups {
  parents: GroupedRelation[];
  spouse: GroupedRelation[];
  children: GroupedRelation[];
  siblings: GroupedRelation[];
  nephewsNieces: GroupedRelation[];
  grandparents: GroupedRelation[];
  grandchildren: GroupedRelation[];
  inLaws: GroupedRelation[];
  extended: GroupedRelation[];
}

export function groupRelationships(
  currentMemberId: number,
  edges: any[],
  nodes: any[]
): FamilyGroups {
  const groups: FamilyGroups = {
    parents: [],
    spouse: [],
    children: [],
    siblings: [],
    nephewsNieces: [],
    grandparents: [],
    grandchildren: [],
    inLaws: [],
    extended: []
  };
  
  if (!edges || !nodes || !currentMemberId) {
    return groups;
  }
  
  const nodeMap = new Map();
  nodes.forEach((n) => nodeMap.set(n.id, n));
  
  const processedMembers = new Set<number>();
  processedMembers.add(currentMemberId);  // Don't process myself
  
  // ====================================
  // STEP 1: Process DIRECT relationships
  // ====================================
  
  const directRelations = new Map<number, string>();  // memberId → label
  
  edges
    .filter((e) => e.from === currentMemberId)
    .forEach((edge) => {
      if (processedMembers.has(edge.to)) return;
      
      const targetNode = nodeMap.get(edge.to);
      if (!targetNode) return;
      
      processedMembers.add(edge.to);
      directRelations.set(edge.to, edge.label.toLowerCase());
      
      const relation: GroupedRelation = {
        member: {
          id: targetNode.id,
          uuid: targetNode.member_uuid,
          name: targetNode.name || `${targetNode.first_name || ''} ${targetNode.surname || ''}`.trim(),
          photo: targetNode.photo || targetNode.profile_photo || null
        },
        label: edge.label.toLowerCase()
      };
      
      // Strict duplicate check before pushing
      const isDuplicate = (groupArray: GroupedRelation[]) => groupArray.some(r => r.member.id === targetNode.id);
      
      const label = edge.label.toLowerCase();
      
      if (['father', 'mother'].includes(label)) {
        if (!isDuplicate(groups.parents)) groups.parents.push(relation);
      } 
      else if (['grandfather', 'grandmother'].includes(label)) {
        if (!isDuplicate(groups.grandparents)) groups.grandparents.push(relation);
      } 
      else if (['husband', 'wife'].includes(label)) {
        if (!isDuplicate(groups.spouse)) groups.spouse.push(relation);
      } 
      else if (['son', 'daughter'].includes(label)) {
        if (!isDuplicate(groups.children)) groups.children.push(relation);
      } 
      else if (['grandson', 'granddaughter'].includes(label)) {
        if (!isDuplicate(groups.grandchildren)) groups.grandchildren.push(relation);
      } 
      else if (['brother', 'sister'].includes(label)) {
        if (!isDuplicate(groups.siblings)) groups.siblings.push(relation);
      } 
      else if (['nephew', 'niece'].includes(label)) {
        if (!isDuplicate(groups.nephewsNieces)) groups.nephewsNieces.push(relation);
      } 
      else if (['uncle', 'aunt'].includes(label)) {
        if (!isDuplicate(groups.extended)) groups.extended.push(relation);
      } 
      else {
        if (!isDuplicate(groups.extended)) groups.extended.push(relation);
      }
    });
  
  // ====================================
  // STEP 2: Process INDIRECT relationships (via translation)
  // ====================================
  
  // For each direct connection, find THEIR relationships
  directRelations.forEach((connectorLabel, connectorId) => {
    const connectorNode = nodeMap.get(connectorId);
    if (!connectorNode) return;
    
    // Find edges where connector is the source
    edges
      .filter((e) => e.from === connectorId && e.to !== currentMemberId)
      .forEach((edge) => {
        if (processedMembers.has(edge.to)) return;
        
        // Skip if this member is already in a MORE DIRECT group
        const alreadyInDirect = directRelations.has(edge.to);
        if (alreadyInDirect) return;
        
        // Also skip if target IS the current user
        if (edge.to === currentMemberId) return;
        
        const targetNode = nodeMap.get(edge.to);
        if (!targetNode) return;
        
        // Translate the relationship
        const targetLabelFromConnector = edge.label.toLowerCase();
        
        // *** PASS TARGET'S GENDER ***
        const targetGender = targetNode.gender || 'Male';
        
        const translatedLabel = translateRelation(
          connectorLabel, 
          targetLabelFromConnector,
          targetGender
        );
        
        // Skip if translation returns null (like "self")
        if (!translatedLabel) return;
        
        processedMembers.add(edge.to);
        
        const relation: GroupedRelation = {
          member: {
            id: targetNode.id,
            uuid: targetNode.member_uuid,
            name: targetNode.name || `${targetNode.first_name || ''} ${targetNode.surname || ''}`.trim(),
            photo: targetNode.photo || targetNode.profile_photo || null
          },
          label: translatedLabel,
          via: connectorNode.name || `${connectorNode.first_name || ''} ${connectorNode.surname || ''}`.trim(),
          viaId: connectorId
        };
        
        const isDuplicate = (groupArray: GroupedRelation[]) => groupArray.some(r => r.member.id === targetNode.id);
        
        // Categorize the TRANSLATED relationship
        if (translatedLabel.includes('in-law')) {
          if (!isDuplicate(groups.inLaws)) groups.inLaws.push(relation);
        }
        else if (['nephew', 'niece'].includes(translatedLabel)) {
          if (!isDuplicate(groups.nephewsNieces)) groups.nephewsNieces.push(relation);
        }
        else if (['grandson', 'granddaughter'].includes(translatedLabel)) {
          if (!isDuplicate(groups.grandchildren)) groups.grandchildren.push(relation);
        }
        else if (['grandfather', 'grandmother'].includes(translatedLabel)) {
          if (!isDuplicate(groups.grandparents)) groups.grandparents.push(relation);
        }
        else if (['uncle', 'aunt'].includes(translatedLabel)) {
          if (!isDuplicate(groups.extended)) groups.extended.push(relation);
        }
        else if (translatedLabel.startsWith('cousin')) {
          if (!isDuplicate(groups.extended)) groups.extended.push(relation);
        }
        else if (['brother', 'sister'].includes(translatedLabel)) {
          // Shared sibling (via a parent), add to siblings
          if (!isDuplicate(groups.siblings)) groups.siblings.push(relation);
        }
        else if (['father', 'mother'].includes(translatedLabel)) {
          // Shared parent, add to parents
          if (!isDuplicate(groups.parents)) groups.parents.push(relation);
        }
        else {
          if (!isDuplicate(groups.extended)) groups.extended.push(relation);
        }
      });
  });
  
  return groups;
}
