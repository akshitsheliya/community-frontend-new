import { api } from './api';

export interface Business {
  business_id: number;
  business_uuid: string;
  added_by: number;
  community_id: number;
  business_name: string;
  business_photo: string | null;
  business_logo: string | null;
  city: string | null;
  state: string | null;
  business_type: string | null;
  category: string | null;
  address: string | null;
  contact_number: string | null;
  contact_email: string | null;
  services_products: string | null;
  created_at: string;
  updated_at: string;
  can_edit?: boolean;
  isAdmin_can_edit?: boolean;
  // Joined fields
  owner_first_name?: string;
  owner_surname?: string;
  owner_photo?: string;
}

export interface BusinessCategory {
  name_eng: string;
  name_guj: string;
}

export const businessApi = {
  getAll: async (): Promise<Business[]> => {
    const { data } = await api.get('/api/business');
    return data.data || [];
  },
  
  getById: async (uuid: string): Promise<Business> => {
    const { data } = await api.get(`/api/business/${uuid}`);
    return data.data;
  },
  
  getCategories: async (): Promise<BusinessCategory[]> => {
    const { data } = await api.get('/api/business-categories');
    // Backend returns { data: { english: string[], gujarati: string[] } }
    const english: string[] = data.data?.english || [];
    const gujarati: string[] = data.data?.gujarati || [];
    return english.map((eng, i) => ({
      name_eng: eng,
      name_guj: gujarati[i] || eng,
    }));
  },
  
  create: async (formData: FormData) => {
    const { data } = await api.post('/api/business', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return data;
  },
  
  update: async (uuid: string, formData: FormData) => {
    const { data } = await api.put(`/api/business/${uuid}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return data;
  },
  
  delete: async (uuid: string) => {
    const { data } = await api.delete(`/api/business/${uuid}`);
    return data;
  }
};

// Popular categories with icons for quick access
export const CATEGORY_ICONS: Record<string, string> = {
  'Real Estate': '🏠',
  'Textile': '🧵',
  'Garment': '👕',
  'Manufacturer': '🏭',
  'Lawyer': '⚖️',
  'Service': '🔧',
  'Trading': '📦',
  'Jewellers': '💎',
  'Chartered Accountant': '📊',
  'Handloom': '🧶',
  'Event Management': '🎪',
  'Skin Hair Specialist': '💅',
  'Gynecologist': '👶',
  'Dentist': '🦷',
  'Printing Services': '🖨️',
  'Insurance': '🛡️',
  'Electronics': '📱',
  'Laboratory': '🔬',
  'Medical Chemist': '💊',
  'Food': '🍽️',
  'Food And Sweets': '🍰',
  'Mobile Shop': '📱',
  'Cosmetics': '💄',
  'Beauty Parlor': '💇',
  'Healthcare': '🏥',
  'Architect': '📐',
  'Real-Estate Broker': '🏘️',
  'Furniture': '🪑',
  'Car Dealer': '🚗',
  'Travels': '✈️',
  'Cloth Shop': '🛍️',
  'Software Developer': '💻',
  'Others': '🏢',
  'Saloon': '💈',
  'Lighting': '💡',
  'Construction': '🏗️',
  'Diamonds': '💎',
  'Restaurant': '🍽️',
  'Auto': '🚗',
  'Doctor': '🩺',
  'Retail': '🛒',
  'IT': '💻',
};

export function getCategoryIcon(category: string | null): string {
  if (!category) return '🏢';
  return CATEGORY_ICONS[category] || '🏢';
}

