import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import axios from 'axios';
import { API_BASE_URL } from '../../config/api';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleForgotPassword = async () => {
    if (!email) {
      Alert.alert('Hata', 'Lütfen e-posta adresinizi girin.');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(`${API_BASE_URL}/maca-gel/forgot-password`, { email });
      if (response.status === 200 || response.data) {
        Alert.alert('Başarılı', 'Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.');
        router.back();
      }
    } catch (error: any) {
      console.error('Şifre sıfırlama hatası:', error);
      Alert.alert('Hata', error.response?.data?.message || 'Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#151a24]">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        className="flex-1"
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 20 }}>
          
          <View className="bg-[#202735] rounded-2xl p-8 shadow-xl">
            {/* Başlık Alanı */}
            <Text className="text-[28px] font-bold text-white mb-2 tracking-tight">
              Hesabını Bul
            </Text>
            <Text className="text-sm text-slate-300 mb-8 font-medium">
              E-posta adresini gir.
            </Text>

            {/* E-Posta Input */}
            <TextInput
              className="bg-[#303847] border border-slate-600/50 rounded-xl px-4 py-4 text-base text-white mb-6"
              placeholder="E-posta adresi"
              placeholderTextColor="#9ca3af"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />

            {/* Bağlantı Gönder Butonu */}
            <TouchableOpacity
              onPress={handleForgotPassword}
              disabled={loading}
              className={`rounded-xl py-4 items-center mb-6 shadow-sm ${loading ? 'bg-[#4b84f3]/70' : 'bg-[#4b84f3]'}`}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text className="text-white font-bold text-base tracking-wide">Bağlantı Gönder</Text>
              )}
            </TouchableOpacity>

            {/* Bilgilendirme Metni */}
            <Text className="text-slate-400 text-[11px] text-center leading-5 mb-8 font-medium px-4">
              Güvenlik ve giriş amaçlarıyla bizden e-posta bildirimleri alabilirsin.
            </Text>

            {/* Geri Dön Linki */}
            <TouchableOpacity onPress={() => router.back()} className="py-2">
              <Text className="text-[#84aafd] font-bold text-center text-[15px]">Geri dön</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}