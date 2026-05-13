import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, KeyboardAvoidingView, Platform, Modal, FlatList, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_BASE_URL } from '../../config/api';

const TURKEY_CITIES = [
  "Adana", "Adıyaman", "Afyonkarahisar", "Ağrı", "Aksaray", "Amasya", "Ankara", "Antalya", "Ardahan", "Artvin", "Aydın", "Balıkesir", "Bartın", "Batman", "Bayburt", "Bingöl", "Bitlis", "Bolu", "Burdur", "Bursa", "Çanakkale", "Çankırı", "Çorum", "Denizli", "Diyarbakır", "Düzce", "Edirne", "Elazığ", "Erzincan", "Erzurum", "Eskişehir", "Gaziantep", "Giresun", "Gümüşhane", "Hakkari", "Hatay", "Iğdır", "Isparta", "İstanbul", "İzmir", "Kahramanmaraş", "Karabük", "Karaman", "Kars", "Kastamonu", "Kayseri", "Kilis", "Kırıkkale", "Kırklareli", "Kırşehir", "Kocaeli", "Konya", "Kütahya", "Malatya", "Manisa", "Mardin", "Muğla", "Muş", "Nevşehir", "Niğde", "Ordu", "Osmaniye", "Rize", "Sakarya", "Samsun", "Şanlıurfa", "Siirt", "Sinop", "Şırnak", "Sivas", "Tekirdağ", "Tokat", "Trabzon", "Tunceli", "Uşak", "Van", "Yalova", "Yozgat", "Zonguldak"
];

export default function CreateMatchScreen() {
  const router = useRouter();
  
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [capacity, setCapacity] = useState('6v6');
  const [price, setPrice] = useState('');

  // İl Seçimi
  const [city, setCity] = useState('Isparta');
  const [cityModalVisible, setCityModalVisible] = useState(false);

  // Tarih ve Saat Seçimi Tutanaklar (Native Date Object)
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());

  // Picker Görünürlükleri
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  // Formatlayıcılar
  const formatDate = (dateObj: Date) => {
    const d = dateObj.getDate().toString().padStart(2, '0');
    const m = (dateObj.getMonth() + 1).toString().padStart(2, '0');
    const y = dateObj.getFullYear();
    return `${d}.${m}.${y}`;
  };

  const formatTime = (dateObj: Date) => {
    const h = dateObj.getHours().toString().padStart(2, '0');
    const min = dateObj.getMinutes().toString().padStart(2, '0');
    return `${h}:${min}`;
  };

  const onChangeDate = (event: any, selectedDate?: Date) => {
    if (Platform.OS !== 'ios') setShowDatePicker(false);
    if (selectedDate) setDate(selectedDate);
  };

  const onChangeTime = (event: any, selectedDate?: Date) => {
    if (Platform.OS !== 'ios') setShowTimePicker(false);
    if (selectedDate) setTime(selectedDate);
  };

  const getCapacityPersons = () => {
    if (capacity === '6v6') return '12';
    if (capacity === '7v7') return '14';
    if (capacity === '8v8') return '16';
    return '12';
  };

  const handleCreateMatch = async () => {
    if (!title.trim() || !location.trim()) {
      Alert.alert("Eksik Bilgi", "Lütfen maç adını ve konumu girin.");
      return;
    }

    setIsLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert("Hata", "Lütfen önce giriş yapın.");
        setIsLoading(false);
        return;
      }

      // Tarih ve saati backend'in istediği formatta birleştir (YYYY-MM-DDTHH:mm:00)
      const d = date.getFullYear() + "-" + (date.getMonth() + 1).toString().padStart(2, '0') + "-" + date.getDate().toString().padStart(2, '0');
      const t = time.getHours().toString().padStart(2, '0') + ":" + time.getMinutes().toString().padStart(2, '0');
      const matchDateStr = `${d}T${t}:00`;

      const payload = {
        name: title,
        date: matchDateStr,
        location: `${city} - ${location}`,
        capacity: parseInt(getCapacityPersons(), 10)
      };

      const response = await axios.post(`${API_BASE_URL}/maca-gel/createMatch`, payload, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 200 || response.status === 201) {
        Alert.alert("Başarılı", "Maç başarıyla oluşturuldu.");
        router.back();
      }
    } catch (error: any) {
      const errMsg = error.response?.data?.message || "Maç oluşturulamadı. Sunucuya bağlanırken bir hata oluştu.";
      Alert.alert("Hata", errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        {/* Header */}
        <View className="flex-row items-center justify-between px-6 pt-6 pb-2 bg-white z-10">
          <Text className="text-2xl font-black text-slate-800 tracking-wider uppercase">MAÇ OLUŞTUR</Text>
          <TouchableOpacity 
            onPress={() => router.back()} 
            className="bg-slate-100 px-4 py-2 rounded-lg"
          >
            <Text className="text-slate-600 font-black text-[12px]">VAZGEÇ</Text>
          </TouchableOpacity>
        </View>
        <View className="px-6 pb-4 border-b border-slate-100 bg-white">
          <Text className="text-slate-500 text-xs">Yönetici formunu doldurun ve maçı kaydedin.</Text>
        </View>

        {/* Form */}
        <ScrollView 
          className="flex-1 bg-white" 
          contentContainerStyle={{ padding: 24, paddingBottom: 60 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Maç Adı */}
          <View className="mb-6">
            <Text className="text-slate-500 font-black text-[11px] mb-2 uppercase">MAÇ ADI</Text>
            <TextInput 
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3.5 text-slate-800 font-bold"
              value={title}
              onChangeText={setTitle}
            />
          </View>

          {/* Tarih ve Saat (NATIVE PICKER ILE) */}
          <View className="flex-row gap-4 mb-6">
            {/* TARIH */}
            <View className="flex-1">
              <Text className="text-slate-500 font-black text-[11px] mb-2 uppercase">TARİH</Text>
              <TouchableOpacity 
                activeOpacity={0.7}
                onPress={() => setShowDatePicker(true)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 flex-row justify-between items-center"
              >
                <Text className="text-slate-800 font-bold">{formatDate(date)}</Text>
                <Feather name="calendar" size={16} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            {/* SAAT */}
            <View className="flex-1">
              <Text className="text-slate-500 font-black text-[11px] mb-2 uppercase">SAAT</Text>
              <TouchableOpacity 
                activeOpacity={0.7}
                onPress={() => setShowTimePicker(true)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 flex-row justify-between items-center"
              >
                <Text className="text-slate-800 font-bold">{formatTime(time)}</Text>
                <Feather name="clock" size={16} color="#94A3B8" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Native Picker Modalları (iOS için inline render edilir, Android için popup açılır) */}
          {showDatePicker && (
            Platform.OS === 'ios' ? (
              <View className="mb-4 bg-slate-50 rounded-xl overflow-hidden">
                <DateTimePicker
                  value={date}
                  mode="date"
                  display="spinner"
                  onChange={onChangeDate}
                  textColor="#000"
                />
                <TouchableOpacity onPress={() => setShowDatePicker(false)} className="p-3 bg-slate-200 items-center">
                  <Text className="font-bold text-slate-800">Kapat</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <DateTimePicker
                value={date}
                mode="date"
                display="default"
                onChange={onChangeDate}
              />
            )
          )}

          {showTimePicker && (
            Platform.OS === 'ios' ? (
              <View className="mb-4 bg-slate-50 rounded-xl overflow-hidden">
                <DateTimePicker
                  value={time}
                  mode="time"
                  display="spinner"
                  onChange={onChangeTime}
                  textColor="#000"
                />
                <TouchableOpacity onPress={() => setShowTimePicker(false)} className="p-3 bg-slate-200 items-center">
                  <Text className="font-bold text-slate-800">Kapat</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <DateTimePicker
                value={time}
                mode="time"
                display="default"
                is24Hour={true}
                onChange={onChangeTime}
              />
            )
          )}

          {/* İl Seç (Açılır Liste Modal ile) */}
          <View className="mb-6">
            <Text className="text-slate-500 font-black text-[11px] mb-2 uppercase">İL SEÇ</Text>
            <TouchableOpacity 
              activeOpacity={0.7}
              onPress={() => setCityModalVisible(true)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 flex-row justify-between items-center"
            >
              <Text className="text-slate-800 font-bold">{city}</Text>
              <Feather name="chevron-down" size={20} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          {/* Konum Arama (Manuel Giriş) */}
          <View className="mb-6">
            <Text className="text-slate-500 font-black text-[11px] mb-2 uppercase">KONUM (HARİTADA GÖSTER)</Text>
            <TextInput 
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3.5 text-slate-800 font-bold"
              placeholder="Örn: Süleyman Demirel Halı Saha"
              placeholderTextColor="#94A3B8"
              value={location}
              onChangeText={setLocation}
            />
          </View>

          {/* Kadro Sayısı */}
          <View className="mb-6">
            <Text className="text-slate-500 font-black text-[11px] mb-2 uppercase">KADRO SAYISI</Text>
            <View className="flex-row gap-3">
              {['6v6', '7v7', '8v8'].map((type) => {
                const isSelected = capacity === type;
                return (
                  <TouchableOpacity 
                    key={type}
                    onPress={() => setCapacity(type)}
                    className={`flex-1 py-3.5 rounded-xl border ${isSelected ? 'bg-green-600 border-green-600' : 'bg-slate-50 border-slate-200'}`}
                  >
                    <Text className={`text-center font-black text-sm uppercase ${isSelected ? 'text-white' : 'text-slate-600'}`}>
                      {type}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <Text className="text-slate-400 text-[11px] mt-2 font-medium">Seçili kapasite: {getCapacityPersons()} kişi</Text>
          </View>

          {/* Ücret */}
          <View className="mb-8">
            <Text className="text-slate-500 font-black text-[11px] mb-2 uppercase">ÜCRET</Text>
            <TextInput 
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3.5 text-slate-800 font-bold"
              placeholder="Örnek: 150 TL"
              placeholderTextColor="#94A3B8"
              value={price}
              onChangeText={setPrice}
              keyboardType="numeric"
            />
          </View>

          {/* Maçı Oluştur Butonu */}
          <TouchableOpacity 
            className={`w-full ${isLoading ? 'bg-slate-400' : 'bg-green-600'} rounded-xl py-4 items-center justify-center shadow-sm`}
            onPress={handleCreateMatch}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-black text-[15px] tracking-wider uppercase">MAÇI OLUŞTUR</Text>
            )}
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>

      {/* Şehir Seçme Modal'ı */}
      <Modal
        visible={cityModalVisible}
        animationType="slide"
        transparent={true}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl h-[70%]">
            <View className="flex-row justify-between items-center p-4 border-b border-slate-100">
              <Text className="font-bold text-lg text-slate-800">Şehir Seçin</Text>
              <TouchableOpacity onPress={() => setCityModalVisible(false)} className="p-2 border border-slate-200 rounded-full">
                <Feather name="x" size={20} color="#334155" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={TURKEY_CITIES}
              keyExtractor={(item) => item}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  className={`p-4 border-b border-slate-50 flex-row justify-between items-center ${city === item ? 'bg-green-50' : ''}`}
                  onPress={() => {
                    setCity(item);
                    setCityModalVisible(false);
                  }}
                >
                  <Text className={`text-base ${city === item ? 'text-green-700 font-bold' : 'text-slate-700'}`}>{item}</Text>
                  {city === item && <Feather name="check" size={20} color="#15803d" />}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}
