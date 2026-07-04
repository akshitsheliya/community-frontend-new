import { api } from './api';

export interface FamilyMember {
  id: number;
  member_uuid: string;
  name: string;
  photo: string | null;
}

export interface FamilyEdge {
  from: number;
  to: number;
  label: string;
}

export interface FamilyTree {
  nodes: FamilyMember[];
  edges: FamilyEdge[];
}

export interface Relationship {
  relationship_id: number;
  relationship_uuid: string;
  from_member_id: number;
  to_member_id: number;
  relationship_label: string;
  inverse_label: string;
  is_verified: number;
  from_first_name?: string;
  from_surname?: string;
  from_photo?: string;
  to_first_name?: string;
  to_surname?: string;
  to_photo?: string;
  added_on: string;
}

export const familyGraphApi = {
  // Get logged-in user's relationships
  getMyRelationships: async (): Promise<Relationship[]> => {
    const { data } = await api.get('/api/family-graph/me');
    return data.data || [];
  },
  
  // Get member's relationships
  getMemberRelationships: async (memberUuid: string): Promise<Relationship[]> => {
    const { data } = await api.get(`/api/family-graph/member/${memberUuid}`);
    return data.data || [];
  },
  
  // Get family tree
  getFamilyTree: async (memberUuid: string, depth: number = 2): Promise<FamilyTree> => {
    const { data } = await api.get(`/api/family-graph/tree/${memberUuid}?depth=${depth}`);
    return data.data;
  },
  
  // Add relationship
  addRelationship: async (toMemberUuid: string, relationshipLabel: string, fromMemberId?: number) => {
    const { data } = await api.post('/api/family-graph/relationship', {
      to_member_uuid: toMemberUuid,
      relationship_label: relationshipLabel.toLowerCase(),
      from_member_id: fromMemberId
    });
    return data;
  },
  
  // Get pending (admin)
  getPending: async (): Promise<Relationship[]> => {
    const { data } = await api.get('/api/family-graph/pending');
    return data.data || [];
  },
  
  // Approve/reject
  approveRelationship: async (uuid: string) => {
    const { data } = await api.put(`/api/family-graph/relationship/${uuid}/approve`);
    return data;
  },
  
  rejectRelationship: async (uuid: string) => {
    const { data } = await api.put(`/api/family-graph/relationship/${uuid}/reject`);
    return data;
  },
  
  deleteRelationship: async (uuid: string) => {
    const { data } = await api.delete(`/api/family-graph/relationship/${uuid}`);
    return data;
  }
};
