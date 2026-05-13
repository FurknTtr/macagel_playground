import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Feather, FontAwesome5 } from '@expo/vector-icons';
import { getFormationData6v6, getFormationData7v7, getFormationData8v8 } from '../../utils/formations';

export default function MatchScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  // Yalnızca görsel (UI) için test stateleri
  const [matchFormat, setMatchFormat] = useState('7 vs 7');
  const [teamAFormation, setTeamAFormation] = useState('1-2-2-2');
  const [teamBFormation, setTeamBFormation] = useState('1-2-2-2');

  // Her maç formatı için ilgili formasyon seçeneklerini getir
  const availableFormations = useMemo(() => {
    switch (matchFormat) {
      case '6 vs 6': return ['1-2-2-1', '1-1-3-1', '1-1-2-2', '1-2-1-2'];
      case '7 vs 7': return ['1-3-2-1', '1-2-3-1', '1-2-2-2', '1-1-4-1'];
      case '8 vs 8': return ['1-3-3-1', '1-3-2-2', '1-2-3-2', '1-2-2-3'];
      default: return ['1-2-2-2', '1-3-2-1']; // fallback
    }
  }, [matchFormat]);

  // Format değiştiğinde aktif formasyonları da o formatın varsayılanına çek
  const handleFormatChange = (fmt: string) => {
    setMatchFormat(fmt);
    if (fmt === '6 vs 6') {
      setTeamAFormation('1-2-2-1');
      setTeamBFormation('1-2-2-1');
    } else if (fmt === '7 vs 7') {
      setTeamAFormation('1-2-2-2');
      setTeamBFormation('1-2-2-2');
    } else if (fmt === '8 vs 8') {
      setTeamAFormation('1-3-3-1');
      setTeamBFormation('1-3-3-1');
    }
  };

  // Aktif Saha Pozisyonlarını Hesapla
  const positions = useMemo(() => {
    let teamAData, teamBData;
    let finalPositions = [];

    // Formasyon verilerini ayıkla ve birleştir
    if (matchFormat === '6 vs 6') {
      teamAData = getFormationData6v6(teamAFormation) || getFormationData6v6('1-2-2-1');
      teamBData = getFormationData6v6(teamBFormation) || getFormationData6v6('1-2-2-1');
      finalPositions = [...teamAData.slice(0, 6), ...teamBData.slice(6, 12)];
    } else if (matchFormat === '7 vs 7') {
      teamAData = getFormationData7v7(teamAFormation) || getFormationData7v7('1-2-2-2');
      teamBData = getFormationData7v7(teamBFormation) || getFormationData7v7('1-2-2-2');
      finalPositions = [...teamAData.slice(0, 7), ...teamBData.slice(7, 14)];
    } else if (matchFormat === '8 vs 8') {
      teamAData = getFormationData8v8(teamAFormation) || getFormationData8v8('1-3-3-1');
      teamBData = getFormationData8v8(teamBFormation) || getFormationData8v8('1-3-3-1');
      finalPositions = [...teamAData.slice(0, 8), ...teamBData.slice(8, 16)];
    }
    return finalPositions;
  }, [matchFormat, teamAFormation, teamBFormation]);

  // Forma Rengi (A: Kırmızı, B: Mavi, Boş: Gri/Siyah)
  const getPlayerStyle = (pos: any) => {
    if (pos.user !== 'Boş' && pos.user !== 'Boş') { // İleride gerçek kullanıcı doluysa yeşil falan olabilir
       return pos.team === 'A' ? 'bg-red-600 border-red-400' : 'bg-blue-600 border-blue-400';
    }
    return 'bg-slate-800/80 border-slate-700'; // Boş durum
  };

  const getPlayerTextStyle = (pos: any) => {
    if (pos.user !== 'Boş') return 'text-white';
    return 'text-slate-400';
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0B1121]" edges={['top', 'left', 'right']}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Koyu Temalı Mini Header */}
      <View className="flex-row items-center justify-between px-6 pt-2 pb-4">
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2 rounded-full bg-slate-800/50">
          <Feather name="arrow-left" size={20} color="#f8fafc" />
        </TouchableOpacity>
        <TouchableOpacity className="p-2 rounded-full bg-slate-800/50">
          <Feather name="share-2" size={18} color="#f8fafc" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        
        {/* Maç Bilgileri & Kod Alanı */}
        <View className="flex-row justify-between items-start mb-6 mt-2 px-2">
          <View className="flex-1">
            <Text className="text-white text-3xl font-black italic tracking-wide">MOBİL İLK</Text>
            <View className="flex-row items-center mt-2">
              <Text className="text-slate-400 text-xs font-bold tracking-widest uppercase">ISPARTA - BİZİM YURT - 08:35</Text>
            </View>
          </View>
          
          <View className="bg-[#052e16] px-3 py-1.5 rounded-lg border border-[#166534] flex-row items-center">
            <Text className="text-[#4ade80] text-[10px] font-black tracking-widest mr-1">KOD:</Text>
            <Text className="text-white text-xs font-black tracking-widest">HNT035</Text>
          </View>
        </View>

        {/* ---------------- 1. SAHA (PITCH) ALANI ---------------- */}
        {/* Aspect ratio ile sahayı mobil ekrana sığacak şekilde dikdörtgen renderlıyoruz */}
        <View className="w-full aspect-[3/4] bg-[#0E8A33] rounded-3xl border-4 border-[#14532d] overflow-hidden mb-8 relative shadow-lg">
          
          {/* Sahanın Çizgileri */}
          {/* Orta Çizgi */}
          <View className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/20" />
          {/* Orta Yuvarlak */}
          <View className="absolute top-1/2 left-1/2 -mt-12 -ml-12 w-24 h-24 rounded-full border-2 border-white/20" />
          {/* Üst Ceza Sahası */}
          <View className="absolute top-0 left-1/2 -ml-20 w-40 h-16 border-b-2 border-x-2 border-white/20" />
          {/* Alt Ceza Sahası */}
          <View className="absolute bottom-0 left-1/2 -ml-20 w-40 h-16 border-t-2 border-x-2 border-white/20" />

          {/* Dinamik Oyuncu Dizilimi */}
          {positions.map((pos) => (
            <TouchableOpacity 
              key={pos.id}
              className="absolute items-center justify-center p-2"
              // Web'deki yüzdelik oranların (-translate özelliği için margin ile) mobil uyarlaması:
              style={{
                top: `${parseFloat(pos.top)}%`,
                left: `${parseFloat(pos.left)}%`,
                marginLeft: -25, // Ortalamak için
                marginTop: -25   // Ortalamak için
              }}
            >
              <View className={`w-9 h-9 rounded-full items-center justify-center border-[3px] shadow-lg ${getPlayerStyle(pos)}`}>
                <Text className={`font-black text-[13px] ${getPlayerTextStyle(pos)}`}>{pos.id}</Text>
              </View>
              <View className="bg-[#111827]/90 px-2 py-0.5 rounded-md mt-1 border border-white/5">
                <Text className="text-white text-[8px] font-black uppercase text-center">{pos.user}</Text>
                <Text className={`${pos.team === 'A' ? 'text-red-400' : 'text-blue-400'} text-[6px] font-bold text-center uppercase tracking-widest`}>
                  {pos.role}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* ---------------- 2. YÖNETİM (SETTINGS) ALANI ---------------- */}
        
        {/* Dizilim Formatı */}
        <View className="bg-[#1E293B] rounded-2xl p-4 border border-slate-700 mb-4">
          <Text className="text-slate-400 text-[10px] font-black tracking-widest text-center mb-3">DİZİLİM FORMATI (SADECE YÖNETİCİ)</Text>
          <View className="flex-row items-center justify-between bg-[#0F172A] rounded-xl p-1">
            {['6 vs 6', '7 vs 7', '8 vs 8'].map((fmt) => (
              <TouchableOpacity 
                key={fmt} 
                onPress={() => handleFormatChange(fmt)}
                className={`flex-1 items-center py-2.5 rounded-lg ${matchFormat === fmt ? 'bg-[#10B981]' : 'bg-transparent'}`}
              >
                <Text className={`font-black text-xs ${matchFormat === fmt ? 'text-white' : 'text-slate-500'}`}>{fmt}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* A Takımı Formasyonu */}
        <View className="bg-[#1E293B] rounded-2xl p-4 border border-red-900/40 mb-4 relative overflow-hidden">
          <View className="absolute top-0 left-0 w-1 h-full bg-red-600" />
          <View className="flex-row items-center mb-4 pl-2">
            <View className="w-2.5 h-2.5 rounded-full bg-red-600 mr-2 shadow-[0_0_8px_rgba(220,38,38,0.8)]" />
            <Text className="text-red-400 text-xs font-black tracking-widest uppercase">A TAKIMI - FORMASYON SEÇ</Text>
          </View>
          
          <View className="flex-row flex-wrap justify-between gap-y-2">
            {availableFormations.map((form) => (
              <TouchableOpacity
                key={`A-${form}`}
                onPress={() => setTeamAFormation(form)}
                className={`w-[48%] rounded-xl p-3 border ${teamAFormation === form ? 'bg-red-600/20 border-red-600' : 'bg-[#0F172A] border-slate-800'}`}
              >
                <Text className={`text-center font-black text-sm mb-1 ${teamAFormation === form ? 'text-white' : 'text-slate-400'}`}>{form}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* B Takımı Formasyonu */}
        <View className="bg-[#1E293B] rounded-2xl p-4 border border-blue-900/40 mb-6 relative overflow-hidden">
          <View className="absolute top-0 left-0 w-1 h-full bg-blue-600" />
          <View className="flex-row items-center mb-4 pl-2">
            <View className="w-2.5 h-2.5 rounded-full bg-blue-600 mr-2 shadow-[0_0_8px_rgba(37,99,235,0.8)]" />
            <Text className="text-blue-400 text-xs font-black tracking-widest uppercase">B TAKIMI - FORMASYON SEÇ</Text>
          </View>
          
          <View className="flex-row flex-wrap justify-between gap-y-2">
            {availableFormations.map((form) => (
              <TouchableOpacity
                key={`B-${form}`}
                onPress={() => setTeamBFormation(form)}
                className={`w-[48%] rounded-xl p-3 border ${teamBFormation === form ? 'bg-blue-600/20 border-blue-600' : 'bg-[#0F172A] border-slate-800'}`}
              >
                <Text className={`text-center font-black text-sm mb-1 ${teamBFormation === form ? 'text-white' : 'text-slate-400'}`}>{form}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Özet Bilgiler */}
        <View className="mb-2">
          <View className="flex-row justify-between items-center py-3 border-b border-slate-800">
            <Text className="text-slate-400 font-bold text-xs tracking-widest">TOPLAM KADRO</Text>
            <Text className="text-white font-black text-sm">14 Kişi</Text>
          </View>
          <View className="flex-row justify-between items-center py-3 border-b border-slate-800">
            <Text className="text-slate-400 font-bold text-xs tracking-widest">BOŞ YER</Text>
            <Text className="text-[#10b981] font-black text-sm">13 Mevki</Text>
          </View>
          <View className="flex-row justify-between items-center py-3">
            <View>
              <Text className="text-slate-400 font-bold text-xs tracking-widest">SAHA ÜCRETİ (KİŞİ BAŞI)</Text>
              <Text className="text-slate-600 font-medium text-[9px] mt-0.5">Ödemeler halı sahada elden yapılır.</Text>
            </View>
            <Text className="text-amber-400 font-black text-sm">150 TL</Text>
          </View>
        </View>

      </ScrollView>

      {/* Sabit Alt Buton */}
      <View className="absolute bottom-0 left-0 right-0 bg-[#0B1121] px-6 py-4 border-t border-slate-800">
        <TouchableOpacity className="bg-[#10b981] rounded-2xl py-4 flex-row justify-center items-center shadow-lg shadow-emerald-900/20">
          <Text className="text-white font-black tracking-[0.2em] text-sm">KADROYU ONAYLA</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}