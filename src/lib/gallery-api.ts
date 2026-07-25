import { api } from './api';

export interface Album {
  photo_album_id: number;
  album_uuid: string;
  folder_name: string;
  photo_album_year: string;
  photo_album_name: string;
  added_by: string;
  added_on: string;
  photo_count?: number;
}

export interface Photo {
  photo_id: number;
  photo_uuid: string;
  photo_album_id: number;
  photo_url: string;
  thumb_url: string;
  is_processed: number;
  added_on: string;
}

export const galleryApi = {
  getAlbums: async (): Promise<Album[]> => {
    const { data } = await api.get('/api/albums');
    return data.data || [];
  },
  
  getPhotos: async (albumUuid: string): Promise<Photo[]> => {
    const { data } = await api.get(`/api/photos/${albumUuid}`);
    return data.data || [];
  },
  
  createAlbum: async (formData: FormData) => {
    const { data } = await api.post('/api/albums', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return data;
  },
  
  uploadPhotos: async (albumUuid: string, formData: FormData) => {
    const { data } = await api.post(`/api/photos/${albumUuid}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return data;
  },
  
  deleteAlbum: async (uuid: string) => {
    const { data } = await api.delete(`/api/albums/${uuid}`);
    return data;
  }
};
