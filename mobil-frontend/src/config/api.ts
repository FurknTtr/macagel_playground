import { Platform } from 'react-native';

/**
 * Merkezi API Yapılandırma Dosyası
 * Uygulama canlıya çıktığında tüm istekler tek bir yerden yönetilecek.
 */

// Not: Railway adresimiz
let BASE_URL = 'https://macagel-backend-production.up.railway.app'; 

export const API_BASE_URL = BASE_URL;

export default {
  API_BASE_URL
};