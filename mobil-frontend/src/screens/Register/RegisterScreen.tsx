import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

export default function RegisterScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-slate-100 justify-center items-center px-4">
      <View className="bg-white p-6 rounded-3xl shadow-sm w-full items-center">
        <Text className="text-3xl font-extrabold text-slate-900 mb-4">Kayıt Ol</Text>
        <Text className="text-slate-500 text-center mb-8">
          Bu sayfa yapım aşamasındadır. (Grup arkadaşınız burayı doldurabilir)
        </Text>
        
        <TouchableOpacity
          className="bg-green-600 rounded-xl py-3 px-8"
          onPress={() => router.back()}
        >
          <Text className="text-white font-bold">Geriye Dön</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
