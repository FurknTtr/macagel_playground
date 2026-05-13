import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, TextInput, Modal, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useFocusEffect, useRouter } from 'expo-router';
import { API_BASE_URL } from '../../config/api';

type TabType = 'friends' | 'requests';

export default function FriendsScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('friends');
  
  const [friends, setFriends] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // O an tıklanmış (açık olan) arkadaşın ID'si
  const [activeFriendId, setActiveFriendId] = useState<string | null>(null);

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [friendCode, setFriendCode] = useState('');

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [activeTab])
  );

  const fetchData = async () => {
    if (activeTab === 'friends') {
      await fetchFriends();
    } else {
      await fetchRequests();
    }
  };

  const fetchFriends = async () => {
    setIsLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      const response = await axios.get(`${API_BASE_URL}/maca-gel/myFriends`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.status === 200) {
        setFriends(response.data);
      }
    } catch (err: any) {
      console.log(err?.response?.data?.message || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      const response = await axios.get(`${API_BASE_URL}/maca-gel/getPendingRequests`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.status === 200) {
        const mappedRequests = response.data.map((r: any) => ({
          name: r.username,
          email: r.email
        }));
        setRequests(mappedRequests);
      }
    } catch (err: any) {
      console.log(err?.response?.data?.message || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveFriend = async (friendId: string) => {
    Alert.alert('Emin misiniz?', 'Bu kişiyi arkadaşlıktan silmek istiyor musunuz?', [
      { text: 'İptal', style: 'cancel' },
      { 
        text: 'Sil', 
        style: 'destructive',
        onPress: async () => {
          setIsActionLoading(true);
          try {
            const token = await AsyncStorage.getItem('token');
            if (!token) return;

            const response = await axios.delete(`${API_BASE_URL}/maca-gel/myFriends?friendId=${friendId}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            if (response.status === 200 || response.status === 204) {
              Alert.alert('Silindi', 'Kişi arkadaşlarınızdan çıkarıldı.');
              setActiveFriendId(null);
              fetchFriends();
            }
          } catch (err: any) {
            Alert.alert('Hata', err?.response?.data?.message || 'Arkadaş silinirken hata oluştu.');
          } finally {
            setIsActionLoading(false);
          }
        }
      }
    ]);
  };

  const handleAddFriend = async () => {
    if (!friendCode.trim()) {
      Alert.alert('Hata', 'Lütfen arkadaş kodunu giriniz.');
      return;
    }

    setIsActionLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      const response = await axios.post(`${API_BASE_URL}/maca-gel/addFriend`, 
        { friendCode: friendCode.trim().toUpperCase() },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 200 || response.status === 201) {
        Alert.alert('Başarılı', 'Arkadaş isteği gönderildi!');
        setFriendCode('');
        setIsAddModalOpen(false);
        fetchData();
      }
    } catch (err: any) {
      Alert.alert('Hata', err?.response?.data?.message || 'İstek gönderilemedi.');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleRequestAction = async (email: string, action: 'accept' | 'reject') => {
    setIsActionLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      const endpoint = action === 'accept' ? 'acceptFriendRequest' : 'rejectFriendRequest';

      const response = await axios.put(`${API_BASE_URL}/maca-gel/${endpoint}`, 
        { friendEmail: email },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 200) {
        Alert.alert('Başarılı', action === 'accept' ? 'İstek kabul edildi.' : 'İstek reddedildi.');
        fetchRequests();
      }
    } catch (err: any) {
      Alert.alert('Hata', err?.response?.data?.message || 'İşlem başarısız.');
    } finally {
      setIsActionLoading(false);
    }
  };

  const renderFriendTab = () => (
    <View className="flex-1 px-6 pt-6">
      {/* 5 Arkadaş Badge ve Refresh İkonu */}
      <View className="flex-row items-center justify-between mb-8">
        <View className="bg-green-50 px-4 py-2 rounded-full flex-row items-center">
          <View className="w-1.5 h-1.5 rounded-full bg-green-500 mr-2" />
          <Text className="text-green-700 text-xs font-black uppercase">{friends.length} ARKADAŞ</Text>
        </View>
        <TouchableOpacity onPress={fetchFriends} disabled={isLoading} className="p-2">
          {isLoading ? <ActivityIndicator size="small" color="#94A3B8" /> : <Feather name="refresh-cw" size={18} color="#94A3B8" />}
        </TouchableOpacity>
      </View>

      {/* Arkadaş Listesi */}
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        {friends.map((friend, index) => {
          const nameStr = friend.username || 'Misafir';
          const randomBg = ['E0F2FE', 'FEE2E2', 'EDE9FE', 'E2E8F0', 'DFD8D0'][index % 5];
          const InitialChars = nameStr.substring(0, 2).toUpperCase();
          const isDropdownOpen = activeFriendId === friend._id;

          return (
            <View key={friend._id || index} className="mb-6">
              <TouchableOpacity
                onPress={() => setActiveFriendId(isDropdownOpen ? null : friend._id)}
                activeOpacity={0.7}
                className="flex-row items-center"
              >
                <View className="relative">
                  <View 
                    style={{ backgroundColor: `#${randomBg}` }} 
                    className="w-14 h-14 rounded-full items-center justify-center border border-slate-50"
                  >
                    <Text className="text-lg font-bold text-slate-800 tracking-tighter">{InitialChars}</Text>
                  </View>
                  <View className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full" />
                </View>
                <Text className="text-slate-800 text-[13px] font-black uppercase tracking-wider ml-4 flex-1">
                  {nameStr}
                </Text>
                
                <Feather 
                  name={isDropdownOpen ? "chevron-up" : "chevron-down"} 
                  size={20} 
                  color="#94a3b8" 
                />
              </TouchableOpacity>

              {/* Açılır Menü */}
              {isDropdownOpen && (
                <View className="ml-16 mt-3 bg-white border border-slate-100 rounded-xl overflow-hidden shadow-sm">
                  <TouchableOpacity 
                    className="px-4 py-3 flex-row items-center border-b border-slate-50"
                    onPress={() => {
                      setActiveFriendId(null);
                      router.push(`/player-profile?id=${friend._id}`);
                    }}
                  >
                    <Feather name="user" size={16} color="#334155" />
                    <Text className="text-slate-700 text-xs font-bold tracking-wider ml-3">
                      PROFİL
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    className="px-4 py-3 flex-row items-center bg-red-50/50"
                    onPress={() => handleRemoveFriend(friend._id)}
                  >
                    <Feather name="trash-2" size={16} color="#ef4444" />
                    <Text className="text-red-500 text-xs font-bold tracking-wider ml-3">
                      SİL
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          );
        })}

        {friends.length === 0 && !isLoading && (
          <Text className="text-slate-400 text-center mt-10 font-bold">Henüz hiç arkadaşın yok.</Text>
        )}
      </ScrollView>

      {/* Yeni Arkadaş Bul Butonu */}
      <TouchableOpacity 
        className="mt-4 mb-8 bg-slate-50 rounded-2xl py-4 flex-row justify-center items-center"
        style={{ borderWidth: 2, borderColor: '#E2E8F0', borderStyle: 'dashed' }}
        onPress={() => setIsAddModalOpen(true)}
      >
        <Text className="text-slate-400 text-[13px] font-black tracking-widest uppercase">+ YENİ ARKADAŞ BUL</Text>
      </TouchableOpacity>
    </View>
  );

  const renderRequestsTab = () => (
    <View className="flex-1 px-6 pt-6">
      <View className="flex-row items-center justify-between mb-8">
        <View className="bg-orange-50 px-4 py-2 rounded-full flex-row items-center">
          <View className="w-1.5 h-1.5 rounded-full bg-orange-500 mr-2" />
          <Text className="text-orange-700 text-xs font-black uppercase">{requests.length} BEKLEYEN İSTEK</Text>
        </View>
        <TouchableOpacity onPress={fetchRequests} disabled={isLoading} className="p-2">
          {isLoading ? <ActivityIndicator size="small" color="#94A3B8" /> : <Feather name="refresh-cw" size={18} color="#94A3B8" />}
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        {requests.map((req, index) => {
          const nameStr = req.name || 'Bilinmeyen';
          const InitialChars = nameStr.substring(0, 2).toUpperCase();

          return (
            <View key={index} className="flex-row items-center justify-between mb-6">
              <View className="flex-row items-center">
                <View className="w-12 h-12 bg-slate-100 rounded-full items-center justify-center">
                  <Text className="text-sm font-bold text-slate-800">{InitialChars}</Text>
                </View>
                <Text className="text-slate-800 text-[13px] font-black uppercase tracking-wider ml-4">
                  {nameStr}
                </Text>
              </View>

              <View className="flex-row gap-2">
                <TouchableOpacity 
                  onPress={() => handleRequestAction(req.email, 'accept')}
                  className="bg-green-600 w-10 h-10 rounded-full items-center justify-center shadow-sm"
                  disabled={isActionLoading}
                >
                  <Feather name="check" size={18} color="#FFF" />
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => handleRequestAction(req.email, 'reject')}
                  className="bg-red-600 w-10 h-10 rounded-full items-center justify-center shadow-sm"
                  disabled={isActionLoading}
                >
                  <Feather name="x" size={18} color="#FFF" />
                </TouchableOpacity>
              </View>
            </View>
          );
        })}

        {requests.length === 0 && !isLoading && (
          <Text className="text-slate-400 text-center mt-10 font-bold">Gelen arkadaşlık isteği yok.</Text>
        )}
      </ScrollView>

      {/* Yeni Arkadaş Bul Butonu (İstekler Tabında da Olsun) */}
      <TouchableOpacity 
        className="mt-4 mb-8 bg-slate-50 rounded-2xl py-4 flex-row justify-center items-center"
        style={{ borderWidth: 2, borderColor: '#E2E8F0', borderStyle: 'dashed' }}
        onPress={() => setIsAddModalOpen(true)}
      >
        <Text className="text-slate-400 text-[13px] font-black tracking-widest uppercase">+ YENİ ARKADAŞ BUL</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header Tabs */}
      <View className="flex-row border-b border-slate-100 px-6 pt-4 bg-white z-10">
        <TouchableOpacity 
          className={`flex-1 items-center pb-4 border-b-2 ${activeTab === 'friends' ? 'border-green-600' : 'border-transparent'}`}
          onPress={() => setActiveTab('friends')}
        >
          <Text className={`text-[11px] font-black tracking-widest uppercase text-center ${activeTab === 'friends' ? 'text-green-600' : 'text-slate-400'}`}>
            ARKADAŞLARIM ({friends.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          className={`flex-1 items-center pb-4 border-b-2 ${activeTab === 'requests' ? 'border-green-600' : 'border-transparent'}`}
          onPress={() => setActiveTab('requests')}
        >
          <Text className={`text-[11px] font-black tracking-widest uppercase text-center ${activeTab === 'requests' ? 'text-green-600' : 'text-slate-400'}`}>
            İSTEKLER {requests.length > 0 ? `(${requests.length})` : ''}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Body */}
      {activeTab === 'friends' ? renderFriendTab() : renderRequestsTab()}

      {/* ARKADAŞ EKLE MODALI */}
      <Modal
        visible={isAddModalOpen}
        transparent={true}
        animationType="fade"
      >
        <View className="flex-1 bg-black/60 items-center justify-center px-6">
          <View className="bg-white w-full rounded-[30px] p-6 shadow-2xl">
            {/* Modal Header */}
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-black text-slate-900 uppercase tracking-widest">
                ARKADAŞ EKLE
              </Text>
              <TouchableOpacity 
                onPress={() => { setIsAddModalOpen(false); setFriendCode(''); }}
                className="p-1"
              >
                <Feather name="x" size={24} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            {/* Modal Input */}
            <View className="mb-8">
              <Text className="text-slate-600 font-bold text-[11px] mb-3 uppercase tracking-widest">
                ARKADAŞINIZIN KODUNU GİRİNİZ
              </Text>
              <View className="border-2 border-green-500 rounded-2xl bg-white focus:bg-green-50">
                <TextInput
                  value={friendCode}
                  onChangeText={(text) => setFriendCode(text.toUpperCase())}
                  placeholder="ÖRN: ABC123"
                  placeholderTextColor="#94A3B8"
                  maxLength={6}
                  className="w-full px-4 py-4 text-center font-black text-slate-800 text-lg tracking-[0.2em] rounded-2xl"
                  autoCapitalize="characters"
                  autoCorrect={false}
                />
              </View>
            </View>

            {/* Modal Buttons */}
            <View className="flex-row gap-3">
              <TouchableOpacity
                className="flex-1 bg-slate-100 rounded-2xl py-4 items-center justify-center"
                onPress={() => { setIsAddModalOpen(false); setFriendCode(''); }}
              >
                <Text className="text-slate-600 font-black text-[12px] uppercase tracking-widest">
                  VAZGEÇ
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`flex-1 rounded-2xl py-4 items-center justify-center shadow-sm ${isActionLoading ? 'bg-green-400' : 'bg-green-600'}`}
                onPress={handleAddFriend}
                disabled={isActionLoading}
              >
                {isActionLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="text-white font-black text-[12px] uppercase tracking-widest">
                    EKLE
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}
