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
  
  // CRITICAL: Track ALL processed member IDs across ALL groups
  const globallyProcessedMembers = new Set<number>();
  globallyProcessedMembers.add(currentMemberId);
  
  // Process DIRECT relationships first
  const directRelations = new Map<number, string>();
  
  edges
    .filter((e) => e.from === currentMemberId)
    .forEach((edge) => {
      // Skip if already processed
      if (globallyProcessedMembers.has(edge.to)) return;
      
      const targetNode = nodeMap.get(edge.to);
      if (!targetNode) return;
      
      // Mark as processed IMMEDIATELY to prevent duplicates
      globallyProcessedMembers.add(edge.to);
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
      
      const label = edge.label.toLowerCase();
      
      // Categorize (each member ONLY goes in ONE group)
      if (['father', 'mother'].includes(label)) {
        groups.parents.push(relation);
      } 
      else if (['grandfather', 'grandmother'].includes(label)) {
        groups.grandparents.push(relation);
      } 
      else if (['husband', 'wife'].includes(label)) {
        groups.spouse.push(relation);
      } 
      else if (['son', 'daughter'].includes(label)) {
        groups.children.push(relation);
      } 
      else if (['grandson', 'granddaughter'].includes(label)) {
        groups.grandchildren.push(relation);
      } 
      else if (['brother', 'sister'].includes(label)) {
        groups.siblings.push(relation);
      } 
      else if (['nephew', 'niece'].includes(label)) {
        groups.nephewsNieces.push(relation);
      } 
      else if (['uncle', 'aunt'].includes(label)) {
        groups.extended.push(relation);
      } 
      else {
        groups.extended.push(relation);
      }
    });
  
  // Process INDIRECT (translated) relationships
  directRelations.forEach((connectorLabel, connectorId) => {
    const connectorNode = nodeMap.get(connectorId);
    if (!connectorNode) return;
    
    edges
      .filter((e) => e.from === connectorId && e.to !== currentMemberId)
      .forEach((edge) => {
        // CRITICAL: Skip if member already processed anywhere
        if (globallyProcessedMembers.has(edge.to)) return;
        
        const targetNode = nodeMap.get(edge.to);
        if (!targetNode) return;
        
        const targetGender = targetNode.gender || 'Male';
        const translatedLabel = translateRelation(
          connectorLabel,
          edge.label.toLowerCase(),
          targetGender
        );
        
        if (!translatedLabel) return;
        
        // Mark as processed globally
        globallyProcessedMembers.add(edge.to);
        
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
        
        // Categorize translated label
        if (translatedLabel.includes('in-law')) {
          groups.inLaws.push(relation);
        }
        else if (['nephew', 'niece'].includes(translatedLabel)) {
          groups.nephewsNieces.push(relation);
        }
        else if (['grandson', 'granddaughter'].includes(translatedLabel)) {
          groups.grandchildren.push(relation);
        }
        else if (['grandfather', 'grandmother'].includes(translatedLabel)) {
          groups.grandparents.push(relation);
        }
        else if (['uncle', 'aunt'].includes(translatedLabel)) {
          groups.extended.push(relation);
        }
        else if (translatedLabel.startsWith('cousin')) {
          groups.extended.push(relation);
        }
        else if (['brother', 'sister'].includes(translatedLabel)) {
          groups.siblings.push(relation);
        }
        else if (['father', 'mother'].includes(translatedLabel)) {
          groups.parents.push(relation);
        }
        else {
          groups.extended.push(relation);
        }
      });
  });
  
  return groups;
}
