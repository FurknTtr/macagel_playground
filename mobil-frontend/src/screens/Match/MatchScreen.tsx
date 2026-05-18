import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Dimensions, ActivityIndicator, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { Feather, FontAwesome5 } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { getFormationData6v6, getFormationData7v7, getFormationData8v8 } from '../../utils/formations';
import axios from 'axios';
import { API_BASE_URL } from '../../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function MatchScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  // State'ler
  const [loading, setLoading] = useState(true);
  const [matchData, setMatchData] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [matchOwner, setMatchOwner] = useState<string | null>(null);

  // Modal State'leri
  const [positionModalVisible, setPositionModalVisible] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<any>(null);
  const [modalType, setModalType] = useState<'join' | 'leave' | 'profile'>('join');

  // Formasyon & Format State'leri (Artık backend formatına göre esneyebilir)
  const [matchFormat, setMatchFormat] = useState('7 vs 7');
  const [teamAFormation, setTeamAFormation] = useState('1-2-2-2');
  const [teamBFormation, setTeamBFormation] = useState('1-2-2-2');

  // Kodu kopyala
  const copyMatchCode = async () => {
    if (matchData?.inviteCode) {
      await Clipboard.setStringAsync(matchData.inviteCode);
      Alert.alert('Başarılı', 'Maç kodu panoya kopyalandı.');
    }
  };

  // Sayfa yüklendiğinde verileri çek
  useFocusEffect(
    useCallback(() => {
      fetchMatchDetails();
    }, [id])
  );

  const fetchMatchDetails = async () => {
    try {
      setLoading(true);
      const userStr = await AsyncStorage.getItem("user");
      const userObj = userStr ? JSON.parse(userStr) : null;
      setCurrentUser(userObj);

      const response = await axios.get(`${API_BASE_URL}/maca-gel/getMatch/${id}`);
      const data = response.data;
      setMatchData(data);

      const ownerId = typeof data.owner === 'object' ? data.owner._id : data.owner;
      setMatchOwner(ownerId);

      // Backend'den gelen formata göre initial match formatını belirle (Örn: "6v6", "7v7", "8v8")
      if (data.format) {
        // Backend'den "7v7" gibi geliyorsa "7 vs 7" yapıyoruz
        const formattedFmt = data.format.replace('v', ' vs ');
        setMatchFormat(formattedFmt);
        handleFormatChange(formattedFmt);
      }

    } catch (error) {
      console.error("Match yükleme hatası:", error);
      Alert.alert("Hata", "Maç verisi yüklenirken sorun oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const isOwner = currentUser?.id === matchOwner;

  // Pozisyona Tıklama
  const handlePositionClick = async (positionId: number, posInfo: any) => {
    if (!currentUser) {
      Alert.alert("Hata", "Lütfen önce giriş yapın.");
      return;
    }
    
    if (posInfo.user === 'Boş') {
      setModalType('join');
      setSelectedPosition(posInfo);
      setPositionModalVisible(true);
    } else if (posInfo.isCurrentUser) {
      // Kişi kendi olduğu pozisyona bastıysa ayrılma modalı aç
      setModalType('leave');
      setSelectedPosition(posInfo);
      setPositionModalVisible(true);
    } else {
      // Başka bir oyuncunun profiline bakma / kickleme ekranı
      setModalType('profile');
      setSelectedPosition(posInfo);
      setPositionModalVisible(true);
    }
  };

  // Pozisyona Katıl (Boş Pozisyon Modalı İçindeki İşlem)
  const handleJoinPosition = async () => {
    try {
      if (!currentUser) {
        Alert.alert("Hata", "Lütfen önce giriş yapın.");
        return;
      }

      // Kullanıcının sahanın başka bir yerinde zaten olup olmadığını kontrol et
      const userAlreadyInPosition = positions.find(
        (p) => p.userId === currentUser.id
      );

      if (userAlreadyInPosition) {
        Alert.alert("Oops!", "Zaten bir pozisyondasın 👋");
        setPositionModalVisible(false);
        return;
      }

      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert("Hata", "Geçersiz oturum. Lütfen tekrar giriş yapın.");
        return;
      }

      const response = await axios.post(
        `${API_BASE_URL}/maca-gel/joinPosition`,
        {
          matchId: id,
          positionId: selectedPosition?.id,
          position: selectedPosition?.role
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data) {
        // Modal'ı kapatıp sahadaki verileri yeniden çek
        setPositionModalVisible(false);
        fetchMatchDetails(); 
      }

    } catch (error: any) {
      console.error("Pozisyona katılırken hata:", error);
      Alert.alert("Hata", error.response?.data?.message || "İşlem gerçekleştirilemedi.");
    }
  };

  // Pozisyondan Ayrıl (Ayrılma Modalı İçindeki İşlem)
  const handleLeavePosition = async () => {
    try {
      if (!currentUser) return;

      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      const response = await axios.delete(
        `${API_BASE_URL}/maca-gel/leave/${currentUser.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          },
          data: {
            matchId: id
          }
        }
      );

      if (response.status === 200 || response.data) {
        setPositionModalVisible(false);
        fetchMatchDetails(); 
      }

    } catch (error: any) {
      console.error("Pozisyondan ayrılırken hata:", error);
      Alert.alert("Hata", error.response?.data?.message || "İşlem gerçekleştirilemedi.");
    }
  };

  // Yönetici Tarafından Oyuncuyu Atma (Kick)
  const handleKickPlayer = async () => {
    try {
      if (!currentUser || !selectedPosition) return;

      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      const response = await axios.delete(
        `${API_BASE_URL}/maca-gel/leave/${selectedPosition.userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          },
          data: {
            matchId: id,
            operationType: "kick",
            requesterId: currentUser.id
          }
        }
      );

      if (response.status === 200 || response.data) {
        setPositionModalVisible(false);
        fetchMatchDetails(); 
      }

    } catch (error: any) {
      console.error("Oyuncu atılırken hata:", error);
      Alert.alert("Hata", error.response?.data?.message || "İşlem gerçekleştirilemedi.");
    }
  };

  // Arkadaş Ekleme İşlemi
  const handleAddFriend = async () => {
    try {
      if (!currentUser || !selectedPosition) {
        Alert.alert("Hata", "Gerekli bilgiler bulunamadı.");
        return;
      }

      if (currentUser.id === selectedPosition.userId) {
        Alert.alert("Hata", "Kendinizi arkadaş olarak ekleyemezsiniz.");
        return;
      }

      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      const response = await axios.post(
        `${API_BASE_URL}/maca-gel/addFriend`,
        {
          friendId: selectedPosition.userId
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.status === 200 || response.status === 201) {
        Alert.alert("Başarılı", "Arkadaşlık isteği gönderildi!");
        setPositionModalVisible(false);
      }
    } catch (error: any) {
      console.error("Arkadaş eklenirken hata:", error);
      Alert.alert("Hata", error.response?.data?.message || "Arkadaş eklenemedi.");
    }
  };

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
    let teamAData: any[] = [];
    let teamBData: any[] = [];
    let finalPositions: any[] = [];

    // 1. Formasyon verilerini şablon olarak ayarlıyoruz
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

    // 2. Mock verileri, veritabanından gelen API verileriyle (matchData.players) eziyoruz/eşliyoruz
    if (matchData && matchData.players) {
      matchData.players.forEach((player: any) => {
        const pId = player.positionId;
        const totalPos = matchFormat === '6 vs 6' ? 12 : matchFormat === '7 vs 7' ? 14 : 16;
        
        if (pId > 0 && pId <= totalPos) {
          const username = player.user?.username || "Bilinmiyor";
          // Giriş yapmış kullanıcıyla aynıysa "(Sen)" ibaresi ekle
          const isCurrentUser = currentUser?.id === player.user?._id;
          const displayName = isCurrentUser ? `${username} (Sen)` : username;

          finalPositions[pId - 1] = {
            ...finalPositions[pId - 1],
            user: displayName,
            userId: player.user?._id,
            stats: player.user?.stats || {},
            isCurrentUser
          };
        }
      });
    }

    return finalPositions;
  }, [matchFormat, teamAFormation, teamBFormation, matchData, currentUser]);


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

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-[#0B1121] justify-center items-center">
        <ActivityIndicator size="large" color="#10B981" />
        <Text className="text-white mt-4 font-bold tracking-widest text-xs">MAÇ BİLGİLERİ YÜKLENİYOR...</Text>
      </SafeAreaView>
    );
  }

  // Sahadaki boş/dolu istatistikleri
  const totalSpots = matchFormat === '6 vs 6' ? 12 : matchFormat === '7 vs 7' ? 14 : 16;
  const occupiedSpots = positions.filter(p => p.user !== 'Boş').length;
  const emptySpots = totalSpots - occupiedSpots;
    const isPastMatch = matchData?.date ? new Date(matchData.date) < new Date() : false;
    const canEditFormation = isOwner && !isPastMatch;
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
            <Text className="text-white text-3xl font-black italic tracking-wide">{matchData?.name || 'İSİMSİZ MAÇ'}</Text>
            <View className="flex-row items-center mt-2">
              <Text className="text-slate-400 text-xs font-bold tracking-widest uppercase truncate">
                {matchData?.location || 'Adres Yok'} - {matchData?.date ? new Date(matchData.date).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) : '00:00'}
              </Text>
            </View>
          </View>
          
          <TouchableOpacity 
            className="bg-[#052e16] px-3 py-1.5 rounded-lg border border-[#166534] flex-row items-center"
            onPress={copyMatchCode}
          >
            <Text className="text-[#4ade80] text-[10px] font-black tracking-widest mr-1">KOD:</Text>
            <Text className="text-white text-xs font-black tracking-widest">{matchData?.inviteCode || '---'}</Text>
          </TouchableOpacity>
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
              onPress={() => handlePositionClick(pos.id, pos)}
              className="absolute items-center justify-start flex-col"
              style={{
                top: `${parseFloat(pos.top)}%`,
                left: `${parseFloat(pos.left)}%`,
                width: 100, // Sabit genişlik ki isim uzadıkça kaymasın
                transform: [{ translateX: -50 }, { translateY: -18 }], // -50 ile x ekseninde ortala, -18 ile tam dairenin ortasını y eksenine oturt
                zIndex: pos.user !== 'Boş' ? 10 : 1
              }}
            >
              <View className={`w-9 h-9 rounded-full items-center justify-center border-[3px] shadow-lg ${getPlayerStyle(pos)} ${pos.isCurrentUser ? 'border-amber-400' : ''}`}>
                <Text className={`font-black text-[13px] ${getPlayerTextStyle(pos)}`}>{pos.id}</Text>
              </View>
              <View className={`px-2 py-0.5 rounded-md mt-1 border shadow-md w-full justify-center ${pos.user !== 'Boş' ? 'bg-[#0f172a] border-white/20' : 'bg-[#111827]/80 border-transparent'} `}>
                {pos.user === 'Boş' ? (
                  <>
                    <Text className="text-slate-400 text-[8px] font-black uppercase text-center" numberOfLines={1}>{pos.user}</Text>
                    <Text className={`${pos.team === 'A' ? 'text-red-900/60' : 'text-blue-900/60'} text-[6px] font-bold text-center uppercase tracking-widest`}>
                      {pos.role}
                    </Text>
                  </>
                ) : (
                  <>
                    <Text className={`text-[8px] font-black uppercase text-center ${pos.isCurrentUser ? 'text-amber-400' : 'text-white'}`} numberOfLines={1} adjustsFontSizeToFit>{pos.user}</Text>
                    <Text className={`${pos.team === 'A' ? 'text-red-400' : 'text-blue-400'} text-[6px] font-bold text-center uppercase tracking-widest`}>
                      {pos.role}
                    </Text>
                  </>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* ---------------- 2. YÖNETİM (SETTINGS) ALANI ---------------- */}
        
        {/* Dizilim Formatı */}
        <View className="bg-[#1E293B] rounded-2xl p-4 border border-slate-700 mb-4 opacity-75">
          <Text className="text-slate-400 text-[10px] font-black tracking-widest text-center mb-3">DİZİLİM FORMATI (SABİT)</Text>
          <View className="flex-row items-center justify-between bg-[#0F172A] rounded-xl p-1">
            {['6 vs 6', '7 vs 7', '8 vs 8'].map((fmt) => (
              <TouchableOpacity 
                key={fmt} 
                disabled={true}
                className={`flex-1 items-center py-2.5 rounded-lg ${matchFormat === fmt ? 'bg-[#10B981]' : 'bg-transparent'}`}
              >
                <Text className={`font-black text-xs ${matchFormat === fmt ? 'text-white' : 'text-slate-500'}`}>{fmt}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* A Takımı Formasyonu */}
        <View className={`bg-[#1E293B] rounded-2xl p-4 border border-red-900/40 mb-4 relative overflow-hidden ${!canEditFormation ? 'opacity-70' : ''}`}>
          <View className="absolute top-0 left-0 w-1 h-full bg-red-600" />
          <View className="flex-row items-center justify-between mb-4 pl-2">
            <View className="flex-row items-center">
              <View className="w-2.5 h-2.5 rounded-full bg-red-600 mr-2 shadow-[0_0_8px_rgba(220,38,38,0.8)]" />
              <Text className="text-red-400 text-xs font-black tracking-widest uppercase">A TAKIMI - FORMASYON SEÇ</Text>
            </View>
            {!canEditFormation && <Feather name="lock" size={14} color="#f87171" />}
          </View>
          
          <View className="flex-row flex-wrap justify-between gap-y-2">
            {availableFormations.map((form) => (
              <TouchableOpacity
                key={`A-${form}`}
                disabled={!canEditFormation}
                onPress={() => setTeamAFormation(form)}
                className={`w-[48%] rounded-xl p-3 border ${teamAFormation === form ? 'bg-red-600/20 border-red-600' : 'bg-[#0F172A] border-slate-800'}`}
              >
                <Text className={`text-center font-black text-sm mb-1 ${teamAFormation === form ? 'text-white' : 'text-slate-400'}`}>{form}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* B Takımı Formasyonu */}
        <View className={`bg-[#1E293B] rounded-2xl p-4 border border-blue-900/40 mb-6 relative overflow-hidden ${!canEditFormation ? 'opacity-70' : ''}`}>
          <View className="absolute top-0 left-0 w-1 h-full bg-blue-600" />
          <View className="flex-row items-center justify-between mb-4 pl-2">
             <View className="flex-row items-center">
              <View className="w-2.5 h-2.5 rounded-full bg-blue-600 mr-2 shadow-[0_0_8px_rgba(37,99,235,0.8)]" />
              <Text className="text-blue-400 text-xs font-black tracking-widest uppercase">B TAKIMI - FORMASYON SEÇ</Text>
             </View>
             {!canEditFormation && <Feather name="lock" size={14} color="#60a5fa" />}
          </View>
          
          <View className="flex-row flex-wrap justify-between gap-y-2">
            {availableFormations.map((form) => (
              <TouchableOpacity
                key={`B-${form}`}
                disabled={!canEditFormation}
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
            <Text className="text-white font-black text-sm">{totalSpots} Kişi</Text>
          </View>
          <View className="flex-row justify-between items-center py-3 border-b border-slate-800">
            <Text className="text-slate-400 font-bold text-xs tracking-widest">BOŞ YER</Text>
            <Text className="text-[#10b981] font-black text-sm">{emptySpots} Mevki</Text>
          </View>
          <View className="flex-row justify-between items-center py-3">
            <View>
              <Text className="text-slate-400 font-bold text-xs tracking-widest">SAHA ÜCRETİ (KİŞİ BAŞI)</Text>
              <Text className="text-slate-600 font-medium text-[9px] mt-0.5">Ödemeler halı sahada elden yapılır.</Text>
            </View>
            <Text className="text-amber-400 font-black text-sm">{matchData?.price || 150} TL</Text>
          </View>
        </View>

      </ScrollView>

      {/* Sabit Alt Buton */}
      <View className="absolute bottom-0 left-0 right-0 bg-[#0B1121] px-6 py-4 border-t border-slate-800">
        <TouchableOpacity className="bg-[#10b981] rounded-2xl py-4 flex-row justify-center items-center shadow-lg shadow-emerald-900/20">
          <Text className="text-white font-black tracking-[0.2em] text-sm">KADROYU ONAYLA</Text>
        </TouchableOpacity>
      </View>

      {/* Pozisyona Katılma / Ayrılma Modalı */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={positionModalVisible}
        onRequestClose={() => setPositionModalVisible(false)}
      >
        <TouchableOpacity 
          activeOpacity={1} 
          onPress={() => setPositionModalVisible(false)} 
          className="flex-1 justify-center items-center bg-black/60 px-6"
        >
          <TouchableOpacity 
            activeOpacity={1} 
            className="w-full bg-[#1E293B] rounded-3xl p-6 items-center border border-slate-700 shadow-2xl"
          >
            {modalType === 'join' ? (
              <>
                <View className="w-24 h-24 rounded-full border-4 border-dashed border-slate-500/50 items-center justify-center mb-6">
                  <Feather name="plus" size={32} color="#f8fafc" />
                </View>
                <Text className="text-white text-xl font-black mb-1 uppercase tracking-wider">BOŞ POZİSYON</Text>
                <Text className="text-slate-400 text-xs font-bold uppercase tracking-[0.3em] mb-8">{selectedPosition?.role}</Text>
                
                <TouchableOpacity 
                  onPress={handleJoinPosition}
                  className="w-full bg-[#10b981] py-4 rounded-2xl flex-row justify-center items-center shadow-lg shadow-emerald-900/40"
                >
                  <Feather name="plus" size={18} color="white" style={{ marginRight: 8 }} />
                  <Text className="text-white font-black tracking-widest text-sm">POZİSYONA KATIL</Text>
                </TouchableOpacity>
              </>
            ) : modalType === 'leave' ? (
              <>
                <View className="w-24 h-24 rounded-full border-4 border-dashed border-red-500/30 items-center justify-center mb-6 bg-red-900/10">
                   <Text className="text-4xl">👋</Text>
                </View>
                <Text className="text-white text-xl font-black mb-1 uppercase tracking-wider">KADRODAN ÇIK</Text>
                <Text className="text-slate-400 text-xs font-bold uppercase tracking-[0.3em] mb-8">{selectedPosition?.role}</Text>
                
                <TouchableOpacity 
                  onPress={handleLeavePosition}
                  className="w-full bg-[#ef4444] py-4 rounded-2xl flex-row justify-center items-center shadow-lg shadow-red-900/40"
                >
                  <Feather name="log-out" size={18} color="white" style={{ marginRight: 8 }} />
                  <Text className="text-white font-black tracking-widest text-sm">POZİSYONU TERK ET</Text>
                </TouchableOpacity>
              </>
            ) : (
              <View className="w-full">
                {/* Profil Başlığı */}
                <View className="flex-row items-center mb-6">
                  <View className="w-16 h-16 rounded-full bg-teal-600/20 items-center justify-center mr-4 border-2 border-teal-500">
                    <Text className="text-teal-400 text-2xl font-black uppercase tracking-widest">
                      {selectedPosition?.user?.substring(0, 2) || 'XX'}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-white font-black text-lg uppercase tracking-wide" numberOfLines={1}>{selectedPosition?.user}</Text>
                    <Text className="text-[#10b981] font-bold text-xs uppercase tracking-[0.2em] mt-1">{selectedPosition?.role}</Text>
                  </View>
                </View>

                {/* İstatistik Kartı */}
                <View className="bg-[#0f172a] rounded-xl py-3 px-4 flex-row items-center justify-start border border-slate-700/50 mb-6">
                  <Text className="text-slate-400 text-[10px] font-bold mr-2 uppercase tracking-widest">MAÇ</Text>
                  <Text className="text-white text-base font-black mr-6">{selectedPosition?.stats?.matchesPlayed || 0}</Text>
                  
                  <View className="w-[1px] h-6 bg-slate-700 mx-2 mr-6" />

                  <Text className="text-slate-400 text-[10px] font-bold mr-2 uppercase tracking-widest">PUAN</Text>
                  <Text className="text-amber-400 text-base font-black">
                    {selectedPosition?.stats?.rating?.toFixed(1) || '0.0'}
                    <Text className="text-[10px]">⭐</Text>
                  </Text>
                </View>

                {/* Aksiyon Butonları */}
                <View className="flex-row justify-between space-x-2">
                  <TouchableOpacity 
                    onPress={handleAddFriend}
                    className="flex-1 bg-slate-700/50 flex-row items-center justify-center py-3 rounded-xl border border-slate-600 mr-2"
                  >
                    <Feather name="users" size={14} color="#94a3b8" />
                    <Text className="text-slate-300 font-black ml-2 text-[11px] tracking-wider">EKLE</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    onPress={() => {
                      setPositionModalVisible(false);
                      router.push({
                        pathname: '/player-profile',
                        params: { id: selectedPosition?.userId }
                      });
                    }}
                    className="flex-1 bg-[#0891b2] flex-row items-center justify-center py-3 rounded-xl shadow-lg shadow-cyan-900/40 mr-1"
                  >
                    <Feather name="user" size={14} color="white" />
                    <Text className="text-white font-black ml-2 text-[11px] tracking-wider">PROFİLİ</Text>
                  </TouchableOpacity>

                  {isOwner && (
                    <TouchableOpacity 
                      onPress={handleKickPlayer}
                      className="flex-1 bg-[#b45309] flex-row items-center justify-center py-3 rounded-xl border border-orange-700/50 shadow-lg shadow-orange-900/40 ml-1"
                    >
                      <Feather name="minus-circle" size={14} color="white" />
                      <Text className="text-white font-black ml-2 text-[11px] tracking-wider">KICK</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}