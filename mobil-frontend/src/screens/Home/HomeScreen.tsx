import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Modal, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useRouter, useFocusEffect } from 'expo-router';
import { API_BASE_URL } from '../../config/api';

type TabType = 'upcoming' | 'past';

export default function HomeScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('upcoming');
  const [matches, setMatches] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string>('');

  // Yönet (Edit) Modal State'leri
  const [editingMatch, setEditingMatch] = useState<any>(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);

  // useFocusEffect ile ekrana her dönüldüğünde (mesela maç oluşturup geri gelince) tetiklenmesini sağlıyoruz
  useFocusEffect(
    useCallback(() => {
      fetchMatches(activeTab);
    }, [activeTab])
  );

  const fetchMatches = async (tab: TabType) => {
    setIsLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const userStr = await AsyncStorage.getItem('user');
      
      if (!token || !userStr) return;
      
      const user = JSON.parse(userStr);
      setUserId(user.id || user._id);

      const endpoint = tab === 'upcoming' 
        ? `${API_BASE_URL}/maca-gel/upcomingMatch` 
        : `${API_BASE_URL}/maca-gel/pastMatch`;

      const response = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.status === 200) {
        const matchesData = response.data;
        const mappedData = matchesData.map((m: any) => {
          const ownerId = typeof m.owner === 'object' ? m.owner._id : m.owner;
          const matchDate = new Date(m.date);
          
          return {
            id: m._id,
            title: m.name,
            date: matchDate.toLocaleDateString('tr-TR'),
            time: matchDate.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
            location: m.location,
            capacity: `${m.players?.length || 0}/${m.capacity}`,
            isOwner: ownerId === (user.id || user._id),
            type: tab,
            score: "Bilinmiyor", // Bilinmiyor veya gerçek puan
            inviteCode: m.inviteCode
          };
        });
        
        setMatches(mappedData);
      }
    } catch (err) {
      console.log(`${tab} maçları çekilemedi:`, err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveMatch = (matchId: string) => {
    Alert.alert(
      "Emin misin?",
      "Bu maçı kaldırmak istediğine emin misin?",
      [
        { text: "İptal", style: "cancel" },
        { 
          text: "Maçı Kaldır", 
          style: "destructive", 
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem("token");
              if (!token) return;

              const response = await axios.delete(`${API_BASE_URL}/maca-gel/deleteMatch`, {
                headers: { Authorization: `Bearer ${token}` },
                data: { matchId: matchId } // Axios delete data goes here
              });

              if (response.status === 200) {
                Alert.alert("Başarılı", "Maç kaldırıldı");
                fetchMatches(activeTab); // Listeyi tazelemek için
              }
            } catch (err: any) {
              console.log(err);
              Alert.alert("Hata", err.response?.data?.message || "Maç silinemedi!");
            }
          }
        }
      ]
    );
  };

  const openManageModal = (match: any) => {
    setEditingMatch({ ...match }); // Referansı kopar ki iptal diyince vazgeçsin
    setIsEditModalVisible(true);
  };

  const handleSaveEdit = async () => {
    if (!editingMatch) return;

    let dateObj;
    try {
      let dParts = editingMatch.date.split(/[./-]/);
      if(dParts.length === 3) {
        let day = dParts[0].padStart(2, '0');
        let month = dParts[1].padStart(2, '0');
        let year = dParts[2].length === 2 ? `20${dParts[2]}` : dParts[2];
        let isoStr = `${year}-${month}-${day}T${editingMatch.time}:00`;
        dateObj = new Date(isoStr);
      }
    } catch(err) {
      console.log("Tarih dönüştürülemedi:", err);
    }

    const payload: any = {
      matchId: editingMatch.id,
      name: editingMatch.title,
      location: editingMatch.location,
    };

    if (dateObj && !isNaN(dateObj.getTime())) {
      payload.date = dateObj.toISOString();
    }

    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) return;

      const response = await axios.put(`${API_BASE_URL}/maca-gel/updateMatch`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.status === 200) {
        Alert.alert("Başarılı", "Maç güncellendi!");
        setIsEditModalVisible(false);
        fetchMatches(activeTab);
      }
    } catch (err: any) {
      Alert.alert("Hata", err.response?.data?.message || "Maç güncellenemedi.");
    }
  };

  const renderUpcomingCard = (match: any) => (
    <View key={match.id} className="bg-white rounded-3xl p-5 mb-5 shadow-sm border border-slate-100">
      
      {/* Üst Kısım: Başlık ve Tarih/Konum */}
      <View className="flex-row justify-between items-start mb-6">
        <Text className="text-[22px] font-black text-slate-900 uppercase flex-1 mr-4 tracking-tight">
          {match.title}
        </Text>
        <View className="items-end">
          <View className="flex-row items-center mb-1.5">
            <Feather name="map-pin" size={12} color="#EF4444" />
            <Text className="text-slate-500 text-xs ml-1">{match.location}</Text>
          </View>
          <View className="flex-row items-center">
            <Feather name="calendar" size={12} color="#64748B" />
            <Text className="text-slate-500 text-xs ml-1 font-bold">{match.date}</Text>
          </View>
        </View>
      </View>

      {/* Alt Kısım: Saat, Kadro ve Butonlar */}
      <View className="flex-row justify-between items-end mt-2">
        <View className="flex-col">
          <View className="flex-row items-center mb-2 gap-2">
            <Text className="text-slate-400 text-[11px] font-black uppercase">SAAT:</Text>
            <Text className="text-slate-800 text-[13px] font-black">{match.time}</Text>
          </View>
          <View className="flex-row items-center gap-2">
            <Text className="text-slate-400 text-[11px] font-black uppercase">KADRO:</Text>
            <View className="bg-green-100 px-3 py-1 rounded-full">
              <Text className="text-green-700 text-[11px] font-black">{match.capacity}</Text>
            </View>
          </View>
        </View>

        {/* Butonlar */}
        <View className="flex-row items-center justify-end flex-wrap gap-1.5 flex-1 pl-2">
          {match.isOwner && (
            <TouchableOpacity 
              onPress={() => handleRemoveMatch(match.id)}
              className="bg-red-600 rounded-full w-9 h-9 items-center justify-center shadow-sm"
              style={{ padding: 0 }}
            >
              <Feather name="trash-2" size={14} color="#fff" />
            </TouchableOpacity>
          )}

          <TouchableOpacity 
            className="bg-slate-100 rounded-full px-3 py-2.5 flex-row items-center border border-slate-200"
          >
            <Feather name="map" size={11} color="#334155" />
            <Text className="text-slate-700 text-[9px] font-black ml-1">HARİTA</Text>
          </TouchableOpacity>

          {match.isOwner && (
            <TouchableOpacity 
              onPress={() => openManageModal(match)}
              className="bg-blue-600 rounded-full px-3 py-2.5 flex-row items-center shadow-sm"
            >
              <Feather name="settings" size={11} color="#fff" />
              <Text className="text-white text-[9px] font-black ml-1">YÖNET</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity 
            onPress={() => { /* Maç Detayına Yönlendirilecek */ }}
            className="bg-green-600 rounded-full px-3 py-2.5 flex-row items-center shadow-sm"
          >
            <Feather name="clipboard" size={11} color="#fff" />
            <Text className="text-white text-[9px] font-black ml-1">DETAY</Text>
          </TouchableOpacity>
        </View>
      </View>

    </View>
  );

  const renderPastCard = (match: any) => (
    <View key={match.id} className="bg-white rounded-3xl p-5 mb-5 shadow-sm border border-slate-100">
      
      {/* Üst Kısım: Başlık ve Tarih/Konum */}
      <View className="flex-row justify-between items-start mb-6">
        <Text className="text-[20px] font-black text-slate-900 uppercase flex-1 mr-4 tracking-tight">
          {match.title}
        </Text>
        <View className="items-end">
          <View className="flex-row items-center mb-1.5">
            <Feather name="map-pin" size={12} color="#EF4444" />
            <Text className="text-slate-500 text-xs ml-1">{match.location}</Text>
          </View>
          <View className="flex-row items-center">
            <Feather name="calendar" size={12} color="#64748B" />
            <Text className="text-slate-500 text-xs ml-1 font-bold">{match.date}</Text>
          </View>
        </View>
      </View>

      {/* Alt Kısım: Skor ve Puan Ver Butonu */}
      <View className="flex-row justify-between items-center">
        <View className="flex-row items-center">
          <Text className="text-3xl font-black italic text-slate-800">MS:</Text>
          {/* Skor verisi yoksa veya henüz belirlenmemişse bu kısım boş bırakılır */}
        </View>

        <TouchableOpacity 
          className="bg-green-600 rounded-full px-5 py-2.5 flex-row items-center shadow-sm"
          onPress={() => console.log("Puan Ver modal/screen will be opened")}
        >
          <Feather name="star" size={14} color="#FFF200" />
          <Text className="text-white text-xs font-black ml-1.5">PUAN VER</Text>
        </TouchableOpacity>
      </View>

    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-[#F8FAFC]">
      {/* Tabs */}
      <View className="flex-row border-b border-slate-200 px-6 pt-4 bg-white shadow-sm z-10">
        <TouchableOpacity 
          className={`mr-8 pb-3 border-b-4 ${activeTab === 'upcoming' ? 'border-green-600' : 'border-transparent'}`}
          onPress={() => setActiveTab('upcoming')}
        >
          <Text className={`text-sm font-black tracking-widest ${activeTab === 'upcoming' ? 'text-green-700' : 'text-slate-400'}`}>
            YAKLAŞANLAR
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          className={`mr-8 pb-3 border-b-4 ${activeTab === 'past' ? 'border-green-600' : 'border-transparent'}`}
          onPress={() => setActiveTab('past')}
        >
          <Text className={`text-sm font-black tracking-widest ${activeTab === 'past' ? 'text-green-700' : 'text-slate-400'}`}>
            GEÇMİŞ MAÇLARIM
          </Text>
        </TouchableOpacity>
      </View>

      {/* İçerik */}
      <ScrollView 
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <View className="flex-1 justify-center items-center mt-20">
            <ActivityIndicator size="large" color="#16A34A" />
            <Text className="text-slate-400 mt-4 font-bold">Maçlar yükleniyor...</Text>
          </View>
        ) : matches.length === 0 ? (
          <View className="flex-1 justify-center items-center mt-20">
            <Feather name="calendar" size={48} color="#CBD5E1" />
            <Text className="text-slate-400 mt-4 text-center font-bold">
              Bu sekmede henüz maç bulunmuyor.
            </Text>
          </View>
        ) : (
          matches.map(match => 
            activeTab === 'upcoming' ? renderUpcomingCard(match) : renderPastCard(match)
          )
        )}
      </ScrollView>

      {/* Maç Oluştur Butonu (Floating Action Button) */}
      <TouchableOpacity 
        className="absolute bottom-6 right-6 bg-blue-600 w-14 h-14 rounded-full items-center justify-center shadow-lg shadow-blue-600/30"
        onPress={() => router.push('/create-match')}
        style={{ elevation: 5 }}
      >
        <Feather name="plus" size={24} color="#fff" />
      </TouchableOpacity>

      {/* MAÇI DÜZENLE MODALI */}
      <Modal
        visible={isEditModalVisible}
        transparent={true}
        animationType="fade"
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1 justify-center items-center bg-black/50 px-4"
        >
          <View className="bg-white w-full rounded-[30px] p-6 shadow-xl relative">
            <Text className="text-[22px] font-black text-[#1E293B] mb-6">MAÇI DÜZENLE</Text>

            {/* Form Alanları */}
            <View className="mb-4">
              <Text className="text-[#64748B] text-[10px] font-black mb-1.5 uppercase tracking-wider">Maç Adı</Text>
              <TextInput 
                className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl px-4 py-3 text-slate-800 font-bold"
                value={editingMatch?.title}
                onChangeText={(text) => setEditingMatch((prev: any) => ({...prev, title: text}))}
              />
            </View>

            <View className="mb-4">
              <Text className="text-[#64748B] text-[10px] font-black mb-1.5 uppercase tracking-wider">Konum</Text>
              <TextInput 
                className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl px-4 py-3 text-slate-800 font-bold"
                value={editingMatch?.location}
                onChangeText={(text) => setEditingMatch((prev: any) => ({...prev, location: text}))}
              />
            </View>

            <View className="flex-row gap-4 mb-8">
              <View className="flex-1">
                <Text className="text-[#64748B] text-[10px] font-black mb-1.5 uppercase tracking-wider">Tarih</Text>
                <TextInput 
                  className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl px-4 py-3 text-slate-800 font-bold"
                  value={editingMatch?.date}
                  onChangeText={(text) => setEditingMatch((prev: any) => ({...prev, date: text}))}
                  keyboardType="numeric"
                />
              </View>
              <View className="flex-1 ml-2">
                <Text className="text-[#64748B] text-[10px] font-black mb-1.5 uppercase tracking-wider">Saat</Text>
                <TextInput 
                  className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl px-4 py-3 text-slate-800 font-bold"
                  value={editingMatch?.time}
                  onChangeText={(text) => setEditingMatch((prev: any) => ({...prev, time: text}))}
                  keyboardType="numeric"
                />
              </View>
            </View>

            {/* Modaldaki Butonlar */}
            <View className="flex-row justify-center space-x-3 gap-3">
              <TouchableOpacity 
                className="bg-[#F8FAFC] px-8 py-3.5 rounded-full"
                onPress={() => setIsEditModalVisible(false)}
              >
                <Text className="text-[#64748B] text-[12px] font-black uppercase tracking-widest pl-1">İPTAL</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                className="bg-[#2563EB] px-8 py-3.5 rounded-full shadow-sm"
                onPress={handleSaveEdit}
              >
                <Text className="text-white text-[12px] font-black uppercase tracking-widest pl-1">KAYDET</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

    </SafeAreaView>
  );
}