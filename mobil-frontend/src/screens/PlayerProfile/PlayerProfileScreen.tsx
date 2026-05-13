import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function PlayerProfileScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-[#F8FAFC]">
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 pt-4 pb-4 border-b border-slate-200 bg-white">
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
          <Feather name="arrow-left" size={24} color="#334155" />
        </TouchableOpacity>
        <Text className="text-lg font-black text-slate-800 tracking-wider uppercase">OYUNCU PROFİLİ</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* İçerik Gövdesi */}
      <View className="flex-1 items-center justify-center p-6">
        <Feather name="user" size={64} color="#CBD5E1" className="mb-4" />
        <Text className="text-slate-500 font-bold text-center text-lg">
          Oyuncu Profili Sayfası
        </Text>
        <Text className="text-slate-400 text-center text-sm mt-2">
          İleride burada oyuncunun maç geçmişini ve istatistiklerini göstereceğiz.
        </Text>
      </View>
    </SafeAreaView>
  );
}
