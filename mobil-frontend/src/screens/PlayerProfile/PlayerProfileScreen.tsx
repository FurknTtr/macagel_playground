import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, TextInput, Modal, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, FontAwesome } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_BASE_URL } from '../../config/api';

export default function PlayerProfileScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [loading, setLoading] = useState(true);

  const [player, setPlayer] = useState({
    userId: null,
    name: "",
    matchesPlayed: 0,
    rating: 0,
    roles: [],
    comments: [] as Array<{ id: string, reviewerName: string, comment: string, rating: number, isOwnComment: boolean }>
  });

  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchPlayerProfile();
    }
  }, [id]);

  const fetchPlayerProfile = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/maca-gel/playerPreview/${id}`);
      const data = response.data;
      
      const userStr = await AsyncStorage.getItem("user");
      const currentUser = userStr ? JSON.parse(userStr) : {};

      const formattedComments = data.reviews.map((r: any) => ({
        id: r._id,
        reviewerName: r.reviewer?.username || "Bilinmeyen Kullanıcı",
        comment: r.comment,
        rating: r.rating,
        isOwnComment: r.reviewer?._id === currentUser.id
      }));

      const calculatedRating = formattedComments.length > 0 
        ? (formattedComments.reduce((sum: number, c: any) => sum + c.rating, 0) / formattedComments.length).toFixed(1)
        : 0;

      setPlayer(prev => ({
        ...prev,
        userId: data.player._id,
        name: data.player.username,
        matchesPlayed: data.player.stats?.totalMatches || 0,
        rating: parseFloat(calculatedRating as string),
        comments: formattedComments
      }));

    } catch (err) {
      console.error("Profil alınamadı", err);
      Alert.alert("Hata", "Oyuncu profili alınırken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const handleRateSubmit = async () => {
    if (!newComment.trim()) {
      Alert.alert("Uyarı", "Yorum yazmalısın!");
      return;
    }

    try {
      const userStr = await AsyncStorage.getItem("user");
      const currentUser = userStr ? JSON.parse(userStr) : {};
      const token = await AsyncStorage.getItem("token");

      if (!currentUser.id || !token) {
        Alert.alert("Uyarı", "Giriş yapmalısın!");
        return;
      }

      if (editingCommentId) {
        const response = await axios.put(`${API_BASE_URL}/maca-gel/rating/${editingCommentId}`, {
          rating: newRating,
          comment: newComment
        }, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (response.status === 200) {
          setPlayer(prev => {
            const updatedComments = prev.comments.map(c => 
              c.id === editingCommentId ? { ...c, rating: newRating, comment: newComment } : c
            );
            const newRatingAvg = updatedComments.length > 0 
              ? (updatedComments.reduce((sum, c) => sum + c.rating, 0) / updatedComments.length).toFixed(1)
              : 0;
            return {
              ...prev,
              comments: updatedComments,
              rating: parseFloat(newRatingAvg as string)
            };
          });
          Alert.alert("Başarılı", "Değerlendirme başarıyla güncellendi!");
        }
      } else {
        const response = await axios.post(`${API_BASE_URL}/maca-gel/rating/${id}`, {
          rating: newRating,
          comment: newComment
        }, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (response.status === 201 || response.status === 200) {
          const userStr = await AsyncStorage.getItem("user");
          const currentUser = userStr ? JSON.parse(userStr) : { username: 'Ben' };
          
          const ratingData = response.data.rating || response.data;

          setPlayer(prev => {
            const newComments = [{ id: ratingData._id, reviewerName: currentUser.username, rating: newRating, comment: newComment, isOwnComment: true }, ...prev.comments];
            const newRatingAvg = newComments.length > 0 
              ? (newComments.reduce((sum, c) => sum + c.rating, 0) / newComments.length).toFixed(1)
              : 0;
            return {
              ...prev,
              comments: newComments,
              rating: parseFloat(newRatingAvg as string)
            };
          });
          Alert.alert("Başarılı", "Değerlendirme başarıyla eklendi!");
        }
      }
    } catch (err: any) {
      console.error("Rating hatası:", err);
      Alert.alert("Hata", `Değerlendirme işleminde hata: ${err.response?.data?.message || err.message}`);
    }
    
    setIsRatingModalOpen(false);
    setNewComment("");
    setNewRating(5);
    setEditingCommentId(null);
  };

  const openNewRatingModal = () => {
    setEditingCommentId(null);
    setNewRating(5);
    setNewComment("");
    setIsRatingModalOpen(true);
  };

  const handleEditCommentClick = (comment: any) => {
    setEditingCommentId(comment.id);
    setNewRating(comment.rating);
    setNewComment(comment.comment);
    setIsRatingModalOpen(true);
  };

  const handleDeleteCommentClick = (commentId: string) => {
    Alert.alert(
      "Değerlendirmeyi Sil",
      "Bu değerlendirmeyi silmek istediğinize emin misiniz?",
      [
        { text: "İptal", style: "cancel" },
        { 
          text: "Sil", 
          style: "destructive",
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem("token");
              if (!token) {
                Alert.alert("Uyarı", "Giriş yapmalısınız!");
                return;
              }
              const response = await axios.delete(`${API_BASE_URL}/maca-gel/rating/${commentId}`, {
                headers: {
                  Authorization: `Bearer ${token}`
                }
              });
              if (response.status === 200) {
                setPlayer(prev => {
                  const updatedComments = prev.comments.filter(c => c.id !== commentId);
                  const newRatingAvg = updatedComments.length > 0 
                    ? (updatedComments.reduce((sum, c) => sum + c.rating, 0) / updatedComments.length).toFixed(1)
                    : 0;
                  return {
                    ...prev,
                    comments: updatedComments,
                    rating: parseFloat(newRatingAvg as string)
                  };
                });
                Alert.alert("Başarılı", "Değerlendirme başarıyla silindi!");
              }
            } catch (err) {
              console.error(err);
              Alert.alert("Hata", "Değerlendirme silinemedi.");
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-[#F1F5F9] justify-center items-center">
        <ActivityIndicator size="large" color="#2563EB" />
        <Text className="text-slate-500 font-medium mt-4">Profil yükleniyor...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#F1F5F9]">
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 pt-4 pb-4 border-b border-slate-200 bg-white">
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
          <Feather name="arrow-left" size={24} color="#334155" />
        </TouchableOpacity>
        <Text className="text-lg font-black text-slate-800 tracking-wider uppercase">OYUNCU PROFİLİ</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
        {/* Üst Kart (Profil) */}
        <View className="bg-[#FAFAF9] rounded-[32px] p-6 mb-6 shadow-sm border border-slate-100">
          <View className="flex-row items-center">
            {/* Avatar */}
            <View className="w-24 h-24 rounded-full bg-[#23358B] items-center justify-center mr-5 shadow-sm">
              <Text className="text-white text-4xl font-medium">
                {player.name.substring(0, 2).toUpperCase()}
              </Text>
            </View>

            {/* Bilgiler */}
            <View className="flex-1">
              <Text className="text-[28px] font-black text-[#0F172A] uppercase mb-3 tracking-tight">
                {player.name}
              </Text>
              
              <View className="flex-row items-center">
                <View className="items-center">
                  <Text className="text-2xl font-black text-[#0F172A]">{player.matchesPlayed}</Text>
                  <Text className="text-[10px] font-bold text-slate-400 tracking-widest mt-1">MAÇ</Text>
                </View>
                
                <View className="w-[1px] h-10 bg-slate-200 mx-5" />
                
                <View className="items-center">
                  <View className="flex-row items-center">
                    <Text className="text-2xl font-black text-[#F59E0B] mr-1">{player.rating}</Text>
                    <FontAwesome name="star" size={16} color="#F59E0B" />
                  </View>
                  <Text className="text-[10px] font-bold text-slate-400 tracking-widest mt-1">YILDIZ PUANI</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Aksiyon Butonu */}
          <TouchableOpacity 
            onPress={openNewRatingModal}
            className="bg-[#2563EB] rounded-full py-4 mt-8 flex-row items-center justify-center shadow-sm">
            <FontAwesome name="star" size={16} color="white" className="mr-2" />
            <Text className="text-white font-bold tracking-wider ml-2">OYUNCUYU DEĞERLENDİR</Text>
          </TouchableOpacity>
        </View>

        {/* Alt Kart (Yorumlar) */}
        <View className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-100">
          <Text className="text-xs font-black text-slate-800 tracking-[0.2em] mb-6 border-b border-slate-100 pb-4">
            HAKKINDAKİ YORUMLAR
          </Text>

          {player.comments.map((review) => (
            <View key={review.id} className="bg-[#F8FAFC] rounded-2xl p-5 mb-4 border border-slate-100">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="font-extrabold text-slate-800 tracking-wide text-sm">{review.reviewerName}</Text>
                
                <View className="flex-row items-center">
                  {review.isOwnComment && (
                    <View className="flex-row mr-2">
                       <TouchableOpacity onPress={() => handleEditCommentClick(review)} className="mr-3">
                         <Feather name="edit-2" size={16} color="#3b82f6" />
                       </TouchableOpacity>
                       <TouchableOpacity onPress={() => handleDeleteCommentClick(review.id)}>
                         <Feather name="trash-2" size={16} color="#ef4444" />
                       </TouchableOpacity>
                    </View>
                  )}
                  <View className="bg-white px-3 py-1.5 rounded-lg border border-slate-200 flex-row items-center shadow-sm">
                    <FontAwesome name="star" size={12} color="#F59E0B" />
                    <Text className="font-bold text-slate-700 ml-1.5 text-xs">{review.rating}</Text>
                  </View>
                </View>
              </View>
              
              <Text className="text-slate-600 font-semibold text-[13px] leading-5">
                {review.comment}
              </Text>
            </View>
          ))}
          
          {player.comments.length === 0 && (
            <Text className="text-center text-slate-400 py-4 font-medium">Henüz değerlendirme yapılmamış.</Text>
          )}
        </View>
        
        {/* Alt boşluk */}
        <View className="h-10" />
      </ScrollView>

      {/* Değerlendirme Modalı */}
      <Modal visible={isRatingModalOpen} transparent animationType="slide">
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl p-6 h-[80%]">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-bold text-slate-800">
                {editingCommentId ? "Değerlendirmeyi Düzenle" : "Oyuncuyu Değerlendir"}
              </Text>
              <TouchableOpacity onPress={() => setIsRatingModalOpen(false)}>
                <Feather name="x" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

            {/* Yıldız Seçimi */}
            <View className="flex-row justify-center mb-8 gap-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setNewRating(star)} className="p-2">
                  <FontAwesome 
                    name="star" 
                    size={36} 
                    color={star <= newRating ? "#F59E0B" : "#E2E8F0"} 
                  />
                </TouchableOpacity>
              ))}
            </View>

            {/* Yorum Alanı */}
            <Text className="text-sm font-bold text-slate-700 mb-2">Yorumunuz</Text>
            <TextInput
              className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-slate-700 h-32"
              multiline
              textAlignVertical="top"
              placeholder="Oyuncu hakkında düşüncelerini yaz..."
              value={newComment}
              onChangeText={setNewComment}
            />

            <TouchableOpacity 
              onPress={handleRateSubmit}
              className="bg-[#2563EB] rounded-2xl py-4 mt-8 flex-row justify-center items-center">
              <Text className="text-white font-bold text-base">
                {editingCommentId ? "GÜNCELLE" : "GÖNDER"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
