import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import axios from 'axios';
import { API_BASE_URL } from '../../config/api';

export default function AccountSettingsScreen() {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);

  // Kullanıcı bilgileri state'i
  const [userInfo, setUserInfo] = useState({
    username: '',
    email: '',
    phone: '',
    friendCode: ''
  });

  // Şifre değiştirme state'i
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const userStr = await AsyncStorage.getItem('user');

      if (!token || !userStr) {
        router.replace('/login');
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/maca-gel/users/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.status === 200) {
        const data = response.data;
        setUserInfo({
          username: data.username || '',
          email: data.email || '',
          phone: data.phone || '',
          friendCode: data.friendCode || ''
        });
      }
    } catch (err: any) {
      console.log('Profil yüklenemedi:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      const response = await axios.put(`${API_BASE_URL}/maca-gel/updateProfile`, userInfo, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });

      if (response.status === 200) {
        Alert.alert("Başarılı", "Profil başarıyla güncellendi!");
        // Update user storage
        await AsyncStorage.setItem('user', JSON.stringify({
          id: response.data.user._id,
          username: response.data.user.username,
          email: response.data.user.email,
          phone: response.data.user.phone,
          friendCode: response.data.user.friendCode
        }));
      }
    } catch (err: any) {
      console.log("Güncelleme hatası", err);
      Alert.alert("Hata", err.response?.data?.message || "Profil güncellenemedi.");
    }
  };

  const handleUpdatePassword = async () => {
    if (passwords.newPassword !== passwords.confirmPassword) {
      Alert.alert("Hata", "Yeni şifreler uyuşmuyor!");
      return;
    }

    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) return;

      const response = await axios.put(`${API_BASE_URL}/maca-gel/passwordChange`, {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword
      }, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      });

      if (response.status === 200) {
        Alert.alert("Başarılı", "Şifre başarıyla değiştirildi!");
        setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (err: any) {
      console.log("Şifre değiştirme hatası", err);
      Alert.alert("Hata", err.response?.data?.message || "Şifre değiştirilemedi.");
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      router.replace('/login');
    } catch (error) {
      console.log('Çıkış yaparken hata oluştu:', error);
    }
  };

  const handleCopyCode = async () => {
    await Clipboard.setStringAsync(userInfo.friendCode);
    Alert.alert("Başarılı", "Arkadaş kodu kopyalandı!");
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Emin misin?",
      "Hesabını silmek istediğine emin misin? Bu işlem geri alınamaz!",
      [
        { text: "İptal", style: "cancel" },
        { 
          text: "Sil", 
          style: "destructive", 
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('token');
              if (!token) return;

              const response = await axios.delete(`${API_BASE_URL}/maca-gel/deleteAccount`, {
                headers: { Authorization: `Bearer ${token}` }
              });

              if (response.status === 200) {
                Alert.alert("Başarılı", "Hesabın silindi. Yollarımız ayrıldı :(");
                await AsyncStorage.removeItem('token');
                await AsyncStorage.removeItem('user');
                router.replace('/login');
              }
            } catch (err: any) {
              Alert.alert("Hata", err.response?.data?.message || "Hesap silinemedi.");
            }
          } 
        }
      ]
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-[#0F172A] justify-center items-center">
        <ActivityIndicator size="large" color="#A3E635" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#0F172A]">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView 
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
        >
          
          {/* Arkadaş Kodu Kartı */}
          <View className="bg-[#3F6212] rounded-2xl p-5 mb-6 border border-[#4D7C0F]">
            <View className="flex-row items-center mb-3">
              <Feather name="link" size={20} color="#fff" />
              <Text className="text-white text-xl font-bold ml-2">Arkadaş Kodu</Text>
            </View>
            <Text className="text-lime-100 text-sm mb-5 leading-5">
              Arkadaşlarınızı kullanıcı kodunuzu paylaşarak ekleyebilirsiniz. Koda tıklayarak kopyalayabilirsiniz.
            </Text>
            <TouchableOpacity 
              className="bg-[#65A30D] rounded-xl py-4 flex-row justify-center items-center shadow-sm"
              onPress={handleCopyCode}
            >
              <Feather name="link" size={18} color="#fff" />
              <Text className="text-white font-extrabold text-lg ml-2 tracking-widest">
                {userInfo.friendCode || 'YÜKLENİYOR...'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Profil Bilgileri Kartı */}
          <View className="bg-[#1E293B] rounded-2xl p-5 mb-6 border border-[#334155]">
            <View className="flex-row items-center mb-5">
              <Feather name="user" size={20} color="#A3E635" />
              <Text className="text-[#A3E635] text-xl font-bold ml-2">Profil Bilgileri</Text>
            </View>

            <View className="mb-4">
              <Text className="text-slate-400 text-sm mb-1.5 ml-1">Kullanıcı Adı</Text>
              <TextInput 
                className="w-full bg-[#334155] rounded-xl px-4 py-3.5 text-white"
                value={userInfo.username}
                onChangeText={(text) => setUserInfo(prev => ({ ...prev, username: text }))}
                placeholderTextColor="#94a3b8"
              />
            </View>

            <View className="mb-4">
              <Text className="text-slate-400 text-sm mb-1.5 ml-1">E-posta Adresi</Text>
              <TextInput 
                className="w-full bg-[#334155] rounded-xl px-4 py-3.5 text-white"
                value={userInfo.email}
                onChangeText={(text) => setUserInfo(prev => ({ ...prev, email: text }))}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor="#94a3b8"
              />
            </View>

            <View className="mb-5">
              <Text className="text-slate-400 text-sm mb-1.5 ml-1">Telefon Numarası</Text>
              <TextInput 
                className="w-full bg-[#334155] rounded-xl px-4 py-3.5 text-white"
                value={userInfo.phone}
                onChangeText={(text) => setUserInfo(prev => ({ ...prev, phone: text }))}
                keyboardType="phone-pad"
                placeholderTextColor="#94a3b8"
              />
            </View>

            <TouchableOpacity 
              className="bg-[#84CC16] rounded-xl py-3.5 px-6 self-start"
              onPress={handleUpdateProfile}
            >
              <Text className="text-slate-900 font-bold text-base">Düzenle (Kaydet)</Text>
            </TouchableOpacity>
          </View>

          {/* Şifre Değiştir Kartı */}
          <View className="bg-[#1E293B] rounded-2xl p-5 mb-6 border border-[#334155]">
            <View className="flex-row items-center mb-5">
              <Feather name="lock" size={20} color="#A3E635" />
              <Text className="text-[#A3E635] text-xl font-bold ml-2">Şifre Değiştir</Text>
            </View>

            <View className="mb-4">
              <Text className="text-slate-400 text-sm mb-1.5 ml-1">Mevcut Şifre</Text>
              <TextInput 
                className="w-full bg-[#334155] rounded-xl px-4 py-3.5 text-white"
                value={passwords.currentPassword}
                onChangeText={(text) => setPasswords(prev => ({ ...prev, currentPassword: text }))}
                secureTextEntry
                placeholderTextColor="#94a3b8"
              />
            </View>

            <View className="mb-4">
              <Text className="text-slate-400 text-sm mb-1.5 ml-1">Yeni Şifre</Text>
              <TextInput 
                className="w-full bg-[#334155] rounded-xl px-4 py-3.5 text-white"
                value={passwords.newPassword}
                onChangeText={(text) => setPasswords(prev => ({ ...prev, newPassword: text }))}
                secureTextEntry
                placeholderTextColor="#94a3b8"
              />
            </View>

            <View className="mb-5">
              <Text className="text-slate-400 text-sm mb-1.5 ml-1">Yeni Şifre (Tekrar)</Text>
              <TextInput 
                className="w-full bg-[#334155] rounded-xl px-4 py-3.5 text-white"
                value={passwords.confirmPassword}
                onChangeText={(text) => setPasswords(prev => ({ ...prev, confirmPassword: text }))}
                secureTextEntry
                placeholderTextColor="#94a3b8"
              />
            </View>

            <TouchableOpacity 
              className="bg-[#475569] rounded-xl py-3.5 px-6 self-start"
              onPress={handleUpdatePassword}
            >
              <Text className="text-white font-bold text-base">Şifreyi Güncelle</Text>
            </TouchableOpacity>
          </View>

          {/* Oturum Kartı */}
          <View className="bg-[#1E293B] rounded-2xl p-5 mb-6 border border-[#334155]">
            <View className="flex-row items-center mb-3">
              <Feather name="log-out" size={20} color="#A3E635" />
              <Text className="text-[#A3E635] text-xl font-bold ml-2">Oturum</Text>
            </View>
            <Text className="text-slate-400 text-sm mb-5 leading-5">
              Oturumunu kapatmak istersen bu butona tıkla. Tekrar giriş yapmak için şifren gerekecek.
            </Text>
            <TouchableOpacity 
              className="bg-[#F97316] rounded-xl py-3.5 px-6 self-start flex-row items-center"
              onPress={handleLogout}
            >
              <Feather name="log-out" size={18} color="#fff" />
              <Text className="text-white font-bold text-base ml-2">Çıkış Yap</Text>
            </TouchableOpacity>
          </View>

          {/* Tehlikeli Alan Kartı */}
          <View className="bg-[#2A1215] rounded-2xl p-5 mb-6 border border-[#7F1D1D]">
            <View className="flex-row items-center mb-3">
              <Feather name="alert-triangle" size={20} color="#F87171" />
              <Text className="text-[#F87171] text-xl font-bold ml-2">Tehlikeli Alan</Text>
            </View>
            <Text className="text-slate-300 text-sm mb-5 leading-5">
              Hesabını kalıcı olarak silmek istediğinde bu butonu kullanabilirsin. Bu işlem geri döndürülemez ve tüm takım/maç geçmişin silinir.
            </Text>
            <TouchableOpacity 
              className="bg-[#DC2626] rounded-xl py-3.5 px-6 self-start flex-row items-center"
              onPress={handleDeleteAccount}
            >
              <Feather name="trash-2" size={18} color="#fff" />
              <Text className="text-white font-bold text-base ml-2">Hesabımı Kalıcı Olarak Sil</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}