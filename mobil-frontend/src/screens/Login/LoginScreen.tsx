import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, ScrollView, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../../config/api';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setError('');

    if (!email || !password) {
      setError('Lütfen tüm alanları doldurun.');
      return;
    }

    setIsLoading(true);

    try {
      // Merkezi API yapılandırmasından adresi çekiyoruz (Canlı ortamda otomatik değişecek)
      console.log("İstek atılan adres: ", `${API_BASE_URL}/maca-gel/login`);
      
      const response = await axios.post(`${API_BASE_URL}/maca-gel/login`, {
        email,
        password
      }, {
        timeout: 10000, // 10 saniye bekleme süresi eklendi
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (response.status === 200) {
        const { token, user } = response.data;
        // Token ve User'ı React Native telefon hazıfasına kaydediyoruz
        await AsyncStorage.setItem('token', token);
        await AsyncStorage.setItem('user', JSON.stringify(user));
        
        // Başarılı girişte ana ekrana at.
        router.replace('/(tabs)');
      }
    } catch (err: any) {
      console.log("Login Error:", err);
      if (err.response) {
        // Backend'den gelen düzgün hata mesajı (örn: Hatalı şifre)
        setError(err.response.data.message || 'Giriş Başarısız!');
      } else {
        setError('Sunucuya bağlanılamadı. Lütfen internetinizi kontrol edin.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const navToForgotPassword = () => {
    router.push('/forgot-password');
  };

  const navToRegister = () => {
    router.push('/register');
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-100">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView 
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 16 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="bg-white p-6 rounded-3xl shadow-sm">
            
            {/* Başlık ve Alt Başlık */}
          <View className="items-center mb-8 mt-4">
            <Text className="text-4xl font-extrabold text-slate-900 mb-2">Maça Gel</Text>
            <Text className="text-slate-500 text-base">Sahaya çıkmak için giriş yap!</Text>
          </View>

          {/* Hata Mesajı Kutusu */}
          {error ? (
            <View className="bg-red-50 border-l-4 border-red-500 p-3 mb-6 rounded-r-md">
              <Text className="text-red-700 text-sm">{error}</Text>
            </View>
          ) : null}

          {/* E-Posta Alanı */}
          <View className="mb-5">
            <Text className="text-slate-800 font-semibold mb-2">E-Posta</Text>
            <TextInput 
              className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3.5 text-slate-800 focus:border-green-600"
              placeholder="ornek@mail.com"
              placeholderTextColor="#9ca3af"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          {/* Şifre Alanı */}
          <View className="mb-3">
            <Text className="text-slate-800 font-semibold mb-2">Şifre</Text>
            <TextInput 
              className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3.5 text-slate-800 focus:border-green-600"
              placeholder="......"
              placeholderTextColor="#9ca3af"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          {/* Şifreni mi unuttun? */}
          <TouchableOpacity className="items-end mb-8" onPress={navToForgotPassword}>
            <Text className="text-green-600 font-bold text-sm">Şifreni mi unuttun?</Text>
          </TouchableOpacity>

          {/* Giriş Yap Butonu */}
          <TouchableOpacity 
            className={`w-full rounded-2xl py-4 items-center mb-8 shadow-sm transition ${isLoading ? 'bg-green-400' : 'bg-green-600 active:bg-green-700'}`}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white text-lg font-bold">Giriş Yap</Text>
            )}
          </TouchableOpacity>

            {/* Kayıt Ol */}
            <View className="flex-row justify-center mb-4">
              <Text className="text-slate-600">Hesabın yok mu? </Text>
              <TouchableOpacity onPress={navToRegister}>
                <Text className="text-green-600 font-bold">Hemen Kayıt Ol</Text>
              </TouchableOpacity>
            </View>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}