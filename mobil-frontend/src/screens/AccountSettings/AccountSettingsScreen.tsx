import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AccountSettingsScreen() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      // Çerezleri / Storage'ı temizle
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      
      // Login sayfasına yönlendir
      router.replace('/login');
    } catch (error) {
      console.log('Çıkış yaparken hata oluştu:', error);
    }
  };

  return (
    <View className="flex-1 items-center justify-center bg-black">
      <Text className="text-white text-2xl font-bold mb-8">Hesap Ayarları</Text>
      {/* BURAYA HESAP AYARLARI EKRANI YAZILACAK */}

      <TouchableOpacity 
        className="bg-red-600 px-6 py-3 rounded-xl mt-10"
        onPress={handleLogout}
      >
        <Text className="text-white font-bold text-lg">Çıkış Yap</Text>
      </TouchableOpacity>
    </View>
  );
}