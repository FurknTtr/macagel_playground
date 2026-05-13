import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Modal, FlatList, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, FontAwesome5 } from '@expo/vector-icons';
import axios from 'axios';
import { API_BASE_URL } from '../../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useIsFocused } from '@react-navigation/native';

// Basit şehir listesi (normalde Sehirler.js'den geliyordu, mobilde böyle bir array kullanabiliriz)
const CITIES = ["Adana", "Adıyaman", "Afyonkarahisar", "Ağrı", "Amasya", "Ankara", "Antalya", "Artvin", "Aydın", "Balıkesir", "Bilecik", "Bingöl", "Bitlis", "Bolu", "Burdur", "Bursa", "Çanakkale", "Çankırı", "Çorum", "Denizli", "Diyarbakır", "Edirne", "Elazığ", "Erzincan", "Erzurum", "Eskişehir", "Gaziantep", "Giresun", "Gümüşhane", "Hakkari", "Hatay", "Isparta", "Mersin", "İstanbul", "İzmir", "Kars", "Kastamonu", "Kayseri", "Kırklareli", "Kırşehir", "Kocaeli", "Konya", "Kütahya", "Malatya", "Manisa", "Kahramanmaraş", "Mardin", "Muğla", "Muş", "Nevşehir", "Niğde", "Ordu", "Rize", "Sakarya", "Samsun", "Siirt", "Sinop", "Sivas", "Tekirdağ", "Tokat", "Trabzon", "Tunceli", "Şanlıurfa", "Uşak", "Van", "Yozgat", "Zonguldak", "Aksaray", "Bayburt", "Karaman", "Kırıkkale", "Batman", "Şırnak", "Bartın", "Ardahan", "Iğdır", "Yalova", "Karabük", "Kilis", "Osmaniye", "Düzce"];

export default function MatchListScreen() {
  const router = useRouter();
  const isFocused = useIsFocused();

  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [joinCode, setJoinCode] = useState("");

  const [allMatches, setAllMatches] = useState<any[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [loading, setLoading] = useState(true);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalMatchesData, setTotalMatchesData] = useState(0);

  // Filter States
  const [selectedCity, setSelectedCity] = useState("Tüm Şehirler");
  const [selectedCapacity, setSelectedCapacity] = useState(""); // boş, "6", "7", "8"
  const [selectedDate, setSelectedDate] = useState("");

  const handleDateChange = (text: string) => {
    // Sadece rakamları al
    const cleaned = text.replace(/[^0-9]/g, '');
    let formatted = cleaned;
    
    // GGG.AA.YYYY formatı
    if (cleaned.length > 2) {
      formatted = `${cleaned.slice(0, 2)}.${cleaned.slice(2)}`;
    }
    if (cleaned.length > 4) {
      formatted = `${cleaned.slice(0, 2)}.${cleaned.slice(2, 4)}.${cleaned.slice(4, 8)}`;
    }
    
    setSelectedDate(formatted);
  };

  useEffect(() => {
    if (isFocused) {
      if (isSearching) {
        fetchSearchResults(searchQuery, currentPage);
      } else {
        fetchDiscoverMatches(currentPage);
      }
    }
  }, [isFocused]);

  const formatMatchData = (matchesArray: any[]) => {
    return matchesArray
      .filter((m: any) => m.owner !== null)
      .map((m: any) => ({
        id: m._id,
        title: m.name,
        admin: m.owner?.username || 'Bilinmiyor',
        location: m.location,
        date: new Date(m.date).toLocaleDateString('tr-TR'),
        time: new Date(m.date).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
        currentPlayers: m.players.length,
        maxPlayers: m.capacity,
        price: '150₺'
      }));
  };

  const fetchDiscoverMatches = async (page = 1) => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/maca-gel/getAllMatches?page=${page}&limit=10`);
      
      const mappedMatches = formatMatchData(response.data.matches);
      
      setAllMatches(mappedMatches);
      setCurrentPage(response.data.pagination.currentPage);
      setTotalPages(response.data.pagination.totalPages);
      setTotalMatchesData(response.data.pagination.totalMatches);
      setIsSearching(false);
    } catch (error) {
      console.error("fetchDiscoverMatches Hata:", error);
      Alert.alert("Hata", "Maçlar çekilemedi.");
    } finally {
      setLoading(false);
    }
  };

  const fetchSearchResults = async (query: string, page = 1) => {
    try {
      setLoading(true);
      let queryParams = `q=${encodeURIComponent(query || "")}&page=${page}&limit=10`;
      
      if (selectedCity && selectedCity !== "Tüm Şehirler") {
        queryParams += `&city=${encodeURIComponent(selectedCity)}`;
      }
      if (selectedCapacity) {
        // Kapasite arka planda ikiyle çarpılarak atılıyor webe göre 6vs6 = 12 vb.
        const actualCapacity = parseInt(selectedCapacity) * 2;
        queryParams += `&capacity=${actualCapacity}`;
      }
      if (selectedDate) {
        // GG.AA.YYYY -> YYYY-MM-DD backend dönüştürmesi
        if (selectedDate.length === 10) {
          const [day, month, year] = selectedDate.split('.');
          queryParams += `&matchDate=${year}-${month}-${day}`;
        } else {
           // Eksik girilirse normal halini yolla, sunucu handle eder ya da boş döner
           queryParams += `&matchDate=${selectedDate}`;
        }
      }

      const response = await axios.get(`${API_BASE_URL}/maca-gel/searchMatch?${queryParams}`);
      const mappedMatches = formatMatchData(response.data.matches);
      
      setSearchResults(mappedMatches);
      setCurrentPage(response.data.pagination.currentPage);
      setTotalPages(response.data.pagination.totalPages);
      setTotalMatchesData(response.data.pagination.totalMatches);
      setIsSearching(true);
    } catch (error) {
      console.error("fetchSearchResults Hata:", error);
      Alert.alert("Hata", "Arama başarısız oldu.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchClick = () => {
    setIsFilterVisible(false); // Modal varsa kapat

    const hasSearchTerm = searchQuery.trim();
    const hasCity = selectedCity && selectedCity !== "Tüm Şehirler";
    const hasCapacity = selectedCapacity;
    const hasDate = selectedDate;

    if (hasSearchTerm || hasCity || hasCapacity || hasDate) {
      fetchSearchResults(searchQuery, 1);
    } else {
      fetchDiscoverMatches(1); // Filtreler temizlendiyse normal tüm sayfalara dön
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setSelectedCity("Tüm Şehirler");
    setSelectedCapacity("");
    setSelectedDate("");
    setIsSearching(false);
    fetchDiscoverMatches(1);
  };

  const handleJoinByCode = async () => {
    if (joinCode.length < 4) {
      Alert.alert("Hata", "Lütfen geçerli bir davet kodu girin");
      return;
    }

    try {
      const userStr = await AsyncStorage.getItem("user");
      if (!userStr) {
        Alert.alert("Uyarı", "Lütfen önce giriş yapın");
        return;
      }
      const user = JSON.parse(userStr);

      const response = await axios.put(`${API_BASE_URL}/maca-gel/inviteCode`, {
        code: joinCode,
        userId: user.id
      });

      if (response.status === 200) {
        Alert.alert("Başarılı", "Maça başarıyla katıldınız!");
        setJoinCode("");
        // Maç detayına gidilebilir (İleride router.push ayarlarsın)
        // router.push(`/match/${response.data.match._id}`);
      }
    } catch (error: any) {
      console.error("Kodla katılma hatası:", error);
      Alert.alert("Hata", error.response?.data?.message || "Maça katılma başarısız oldu.");
    }
  };

  const handlePageChange = (direction: "prev" | "next") => {
    const newPage = direction === "next" ? currentPage + 1 : currentPage - 1;
    if (isSearching) {
      fetchSearchResults(searchQuery, newPage);
    } else {
      fetchDiscoverMatches(newPage);
    }
  };

  const displayMatches = isSearching ? searchResults : allMatches;

  const renderMatchCard = ({ item }: { item: any }) => (
    <View className="bg-white rounded-3xl p-5 mx-6 mb-5 shadow-sm border border-slate-100">
      {/* Top Section */}
      <View className="flex-row justify-between items-start mb-6">
        <View className="flex-1">
          <Text className="text-[22px] font-black italic text-slate-800 tracking-tight">{item.title}</Text>
          <Text className="text-xs text-slate-500 font-medium mt-1">Yönetici: {item.admin}</Text>
        </View>
        <View className="items-end pl-2">
          <View className="flex-row items-center">
            <Feather name="map-pin" size={12} color="#dc2626" />
            <Text className="text-xs font-bold text-[#16a34a] ml-1.5">{item.location}</Text>
          </View>
          <View className="flex-row items-center mt-2">
            <Feather name="calendar" size={12} color="#64748b" />
            <Text className="text-xs font-bold text-slate-500 ml-1.5 italic">{item.date}</Text>
          </View>
        </View>
      </View>

      {/* Bottom Section */}
      <View className="flex-row items-end justify-between">
        <View>
          <View className="flex-row items-center mb-2">
            <Text className="text-xs font-bold text-slate-400 tracking-widest w-[43px]">SEANS:</Text>
            <Text className="text-sm font-black text-slate-800">{item.time}</Text>
          </View>
          <View className="flex-row items-center mb-2">
            <Text className="text-xs font-bold text-slate-400 tracking-widest w-[43px]">KADRO:</Text>
            <View className="bg-green-100 px-2 py-0.5 rounded-lg border border-green-200">
              <Text className="text-xs font-bold text-green-700">{item.currentPlayers}/{item.maxPlayers}</Text>
            </View>
          </View>
          <View className="flex-row items-center">
            <Text className="text-xs font-bold text-slate-400 tracking-widest w-[43px]">ÜCRET:</Text>
            <Text className="text-sm font-black italic text-slate-800">{item.price}</Text>
          </View>
        </View>

        <TouchableOpacity 
          onPress={() => router.push(`/match/${item.id}` as any)}
          className="bg-[#10b981] flex-row items-center py-3.5 px-5 rounded-full shadow-sm">
          <FontAwesome5 name="futbol" size={14} color="white" solid />
          <Text className="text-white font-extrabold ml-2 text-xs tracking-wider">KADROYA GİR</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-[#F8FAFC]" edges={['top', 'left', 'right']}>
      {/* 
        Mobilde alan dar olduğu için arama çubuğu ve kod ile katılma
        bölümlerini alt alta konumlandırdık.
      */}
      <View className="px-6 pt-4 pb-2 z-10 zIndex-10">
        <View className="flex-row items-center mb-3">
          {/* Arama Alanı */}
          <View className="flex-1 flex-row items-center bg-slate-100 rounded-full px-4 border border-slate-200 h-14 mr-3">
            <Feather name="search" size={20} color="#64748b" />
            <TextInput 
              placeholder="Maç adı ile ara..." 
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearchClick}
              className="flex-1 ml-2 text-slate-700 font-medium" 
              placeholderTextColor="#94a3b8"
            />
            <TouchableOpacity onPress={handleSearchClick} className="bg-[#86efac] px-4 py-2 rounded-full ml-2">
              <Text className="text-white font-extrabold text-xs">ARA</Text>
            </TouchableOpacity>
          </View>

          {/* Filtre İkonu */}
          <TouchableOpacity 
            onPress={() => setIsFilterVisible(true)}
            className="w-14 h-14 bg-slate-100 rounded-full items-center justify-center border border-slate-200">
            <Feather name="filter" size={20} color="#64748b" />
          </TouchableOpacity>
        </View>

        {/* Kod ile Katılma Alanı */}
        <View className="flex-row items-center bg-slate-100 rounded-full pl-5 pr-2 border border-slate-200 h-14 w-full">
          <Text className="font-bold text-slate-400 mr-2">KOD:</Text>
          <TextInput 
            placeholder="X7B9" 
            value={joinCode}
            onChangeText={setJoinCode}
            autoCapitalize="characters"
            maxLength={6}
            className="flex-1 text-slate-800 font-bold" 
            placeholderTextColor="#94a3b8"
          />
          <TouchableOpacity onPress={handleJoinByCode} className="bg-black px-6 py-2.5 rounded-full">
            <Text className="text-white font-extrabold text-xs tracking-wider">KATIL</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Sayfa Başlığı */}
      <View className="px-6 py-4 mb-2 flex-row justify-between items-center">
        <View>
          <Text className="text-[32px] font-black text-[#0F172A] tracking-tighter uppercase">
            {isSearching ? "SONUÇLAR" : "SAHA BUL"}
          </Text>
          <Text className="text-[10px] font-extrabold text-slate-400 tracking-[0.15em] mt-1.5">
            {isSearching ? `"${searchQuery}" İÇİN ${totalMatchesData} SONUÇ` : "ETRAFINDAKİ AKTİF MAÇLARI KEŞFET VE KADROYA GİR"}
          </Text>
        </View>
        {isSearching && (
           <TouchableOpacity onPress={handleClearSearch} className="bg-slate-200 px-3 py-1.5 rounded-lg">
              <Text className="text-[10px] font-black text-slate-600">TEMİZLE</Text>
           </TouchableOpacity>
        )}
      </View>

      {/* Maç Listesi */}
      {loading ? (
        <View className="flex-1 justify-center items-center">
           <ActivityIndicator size="large" color="#10b981" />
           <Text className="text-slate-400 font-bold mt-4 tracking-widest text-xs">MAÇLAR YÜKLENİYOR...</Text>
        </View>
      ) : displayMatches.length === 0 ? (
        <View className="flex-1 justify-center items-center">
           <Feather name="frown" size={48} color="#cbd5e1" />
           <Text className="text-slate-400 font-bold mt-4 tracking-widest text-xs">MAÇ BULUNAMADI.</Text>
        </View>
      ) : (
        <FlatList
          className="flex-1"
          data={displayMatches}
          keyExtractor={item => item.id}
          renderItem={renderMatchCard}
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Sayfalama (Pagination) */}
      <View className="flex-row items-center justify-between px-6 py-4 bg-white border-t border-slate-100">
        <TouchableOpacity 
          onPress={() => handlePageChange("prev")}
          disabled={currentPage === 1}
          className={`flex-row items-center px-4 py-3 rounded-2xl ${currentPage === 1 ? 'bg-slate-200' : 'bg-[#10b981] shadow-sm'}`}
        >
          <Feather name="arrow-left" size={16} color={currentPage === 1 ? '#94a3b8' : 'white'} />
          <Text className={`font-extrabold ml-1.5 text-xs ${currentPage === 1 ? 'text-slate-400' : 'text-white'}`}>ÖNCEKİ</Text>
        </TouchableOpacity>

        <View className="items-center">
          <Text className="text-sm font-black text-slate-800">SAYFA {currentPage} / {totalPages}</Text>
          <Text className="text-[10px] font-bold text-slate-500 mt-0.5">Toplam {totalMatchesData} maç</Text>
        </View>

        <TouchableOpacity 
          onPress={() => handlePageChange("next")}
          disabled={currentPage === totalPages || totalPages === 0}
          className={`flex-row items-center px-4 py-3 rounded-2xl ${currentPage === totalPages || totalPages === 0 ? 'bg-slate-200' : 'bg-[#10b981] shadow-sm'}`}
        >
          <Text className={`font-extrabold mr-1.5 text-xs ${currentPage === totalPages || totalPages === 0 ? 'text-slate-400' : 'text-white'}`}>SONRAKİ</Text>
          <Feather name="arrow-right" size={16} color={currentPage === totalPages || totalPages === 0 ? '#94a3b8' : 'white'} />
        </TouchableOpacity>
      </View>

      {/* Filtre Modalı */}
      <Modal visible={isFilterVisible} transparent animationType="slide">
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl p-6 h-[75%]">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-black text-slate-800 tracking-tight">FİLTRELE</Text>
              <TouchableOpacity onPress={() => setIsFilterVisible(false)} className="bg-slate-100 p-2 rounded-full">
                <Feather name="x" size={20} color="#64748b" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Şehir Seç */}
              <Text className="text-xs font-black text-slate-400 tracking-[0.2em] mb-4 mt-2">ŞEHİR SEÇ</Text>
              <ScrollView className="max-h-40 mb-2">
                {["Tüm Şehirler", ...CITIES].map(city => (
                  <TouchableOpacity 
                    key={city}
                    onPress={() => setSelectedCity(city)}
                    className={`px-4 py-3 rounded-2xl mb-1 ${selectedCity === city ? 'bg-[#F0FDF4] border border-green-200' : ''}`}
                  >
                    <Text className={`font-bold ${selectedCity === city ? 'text-green-700' : 'text-slate-700'}`}>
                      {city}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Kapasite Seç */}
              <Text className="text-xs font-black text-slate-400 tracking-[0.2em] mb-4 mt-4">KAPASİTE SEÇ</Text>
              <View className="flex-row gap-3">
                {["6", "7", "8"].map(cap => (
                  <TouchableOpacity 
                    key={cap}
                    onPress={() => setSelectedCapacity(selectedCapacity === cap ? "" : cap)}
                    className={`flex-1 border rounded-2xl py-3 items-center ${selectedCapacity === cap ? 'bg-[#F0FDF4] border-green-200' : 'bg-white border-slate-200'}`}
                  >
                    <Text className={`font-bold ${selectedCapacity === cap ? 'text-green-700' : 'text-slate-700'}`}>
                      {cap}vs{cap}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Tarih Seç */}
              <Text className="text-xs font-black text-slate-400 tracking-[0.2em] mb-4 mt-8">TARİH SEÇ</Text>
              <View className="bg-white border border-slate-200 rounded-2xl p-4 flex-row items-center">
                <Feather name="calendar" size={18} color="#64748b" className="mr-3" />
                <TextInput 
                  placeholder="GG.AA.YYYY"
                  value={selectedDate}
                  onChangeText={handleDateChange}
                  keyboardType="number-pad"
                  maxLength={10}
                  className="flex-1 font-bold text-slate-700" 
                />
              </View>
              
              <View className="h-10" />
            </ScrollView>
            
            <TouchableOpacity 
              onPress={handleSearchClick}
              className="bg-[#10b981] rounded-2xl py-4 flex-row justify-center items-center mt-2 shadow-sm">
              <Text className="text-white font-black tracking-wider text-sm">SONUÇLARI GÖSTER</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}