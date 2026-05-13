import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import axios from 'axios';
import { API_BASE_URL } from '../../config/api';

export default function RegisterScreen() {
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!username || !email || !phone || !password) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun.');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(`${API_BASE_URL}/maca-gel/register`, {
        username,
        email,
        phone,
        password
      });

      if (response.status === 201 || response.status === 200) {
        Alert.alert('Başarılı', 'Kayıt işlemi başarılı! Şimdi giriş yapabilirsiniz.', [
          { text: 'Tamam', onPress: () => router.push('/login') }
        ]);
      }
    } catch (error: any) {
      console.error('Kayıt hatası:', error);
      Alert.alert('Kayıt Başarısız', error.response?.data?.message || 'Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-100">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        className="flex-1"
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 20 }}>
          
          <View className="bg-white rounded-[32px] p-8 shadow-sm">
            {/* Başlık Alanı */}
            <Text className="text-3xl font-black text-slate-900 text-center mb-2 tracking-wide">
              Aramıza Katıl
            </Text>
            <Text className="text-sm font-medium text-slate-500 text-center mb-8">
              Maça Gel'de yerini ayırtmak için kayıt ol.
            </Text>

            {/* Form Alanı */}
            <View>
              {/* Kullanıcı Adı */}
              <Text className="text-sm font-bold text-slate-700 mb-2">Kullanıcı Adı:</Text>
              <TextInput
                className="border border-slate-300 rounded-xl px-4 py-3 text-base text-slate-900 mb-5"
                placeholder="KralGokhan10"
                placeholderTextColor="#94a3b8"
                autoCapitalize="none"
                value={username}
                onChangeText={setUsername}
              />

              {/* E-Posta */}
              <Text className="text-sm font-bold text-slate-700 mb-2">E-Posta:</Text>
              <TextInput
                className="border border-slate-300 rounded-xl px-4 py-3 text-base text-slate-900 mb-5"
                placeholder="ornek@mail.com"
                placeholderTextColor="#94a3b8"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />

              {/* Telefon Numarası */}
              <Text className="text-sm font-bold text-slate-700 mb-2">Telefon Numarası:</Text>
              <TextInput
                className="border border-slate-300 rounded-xl px-4 py-3 text-base text-slate-900 mb-5"
                placeholder="05XX XXX XX XX"
                placeholderTextColor="#94a3b8"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
              />

              {/* Şifre */}
              <Text className="text-sm font-bold text-slate-700 mb-2">Şifre:</Text>
              <TextInput
                className="border border-slate-300 rounded-xl px-4 py-3 text-base text-slate-900 mb-6"
                placeholder="••••••"
                placeholderTextColor="#94a3b8"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />

              {/* Kayıt Ol Butonu */}
              <TouchableOpacity
                onPress={handleRegister}
                disabled={loading}
                className={`rounded-xl py-4 items-center shadow-sm ${loading ? 'bg-green-700/50' : 'bg-green-600'}`}
              >
                {loading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text className="text-white font-black text-base tracking-wide">Kayıt Ol</Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Zaten Hesabın Var mı */}
            <View className="flex-row justify-center mt-8">
              <Text className="text-slate-600 font-medium">Zaten hesabın var mı? </Text>
              <TouchableOpacity onPress={() => {
                if (router.canGoBack()) {
                  router.back();
                } else {
                  router.replace('/login');
                }
              }}>
                <Text className="text-green-700 font-black">Giriş Yap</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
