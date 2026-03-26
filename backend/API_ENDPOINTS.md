# Maca Gel - API Endpoints Haritası

## Maç Yönetimi Endpoints

### 1. Maç Listeleme ve Arama

#### `GET /getAllMatches?page=1&limit=10`
**Amaç:** Tüm aktif maçları sayfalı şekilde getir  
**Frontend:** MatchList.jsx (Keşfet sayfası)  
**Response:**
```json
{
  "matches": [
    {
      "_id": "...",
      "name": "Pazar Maçı",
      "location": "Ulus",
      "date": "2026-03-29",
      "capacity": 14,
      "owner": { "_id", "username", "email" },
      "players": [
        { "user": {...}, "positionId": 1, "position": "Kurucu" }
      ]
    }
  ],
  "pagination": {
    "currentPage": 1,
    "pageSize": 10,
    "totalMatches": 50,
    "totalPages": 5
  }
}
```

#### `GET /searchMatch?q=Ulus`
**Amaç:** Maçları isim ve lokasyona göre ara  
**Response:** Eşleşen maçlar dizisi

---

### 2. Maça Katılma

#### `PUT /inviteCode`
**Amaç:** Kod (inviteCode veya code) ile maça katıl  
**Body:**
```json
{
  "code": "ABC123",
  "userId": "user_id",
  "positionId": 5,
  "position": "Forvet"
}
```
**Response:** `{ "message": "Maça başarıyla katılındı", "match": {...} }`

---

### 3. Maç Yönetimi (CRUD)

#### `POST /createMatch`
**Amaç:** Yeni maç oluştur  
**Body:**
```json
{
  "name": "Pazar Maçı",
  "location": "Ulus",
  "date": "2026-03-29",
  "capacity": 14,
  "owner": "user_id"
}
```
**Response:** `{ "message": "...", "match": {...} }`  
**NOT:** Kurucuya otomatik positionId: 1 atanır

#### `PUT /updateMatch?matchId=xxx`
**Amaç:** Maç bilgilerini güncelle (ad, lokasyon, tarih, kapasite)  
**Body:** Güncellenecek fieldler  
**Response:** Güncellenmiş maç

#### `DELETE /deleteMatch`
**Amaç:** Maç iptal et (Soft-Delete: isActive = false)  
**Body:**
```json
{
  "matchId": "xxx"
}
```

---

### 4. Maç Detayları

#### `GET /getMatch/:matchId`
**Amaç:** Maçın tüm detaylarını al (oyuncular + positionId)  
**Frontend:** Match.jsx (Maç detay sayfası)  
**Response:**
```json
{
  "_id": "...",
  "name": "Pazar Maçı",
  "location": "Ulus",
  "date": "2026-03-29",
  "capacity": 14,
  "owner": { "_id", "username", "email" },
  "inviteCode": "ABC123",
  "code": "XYZ789",
  "players": [
    {
      "_id": "player_doc_id",
      "user": { "_id", "username", "email", "stats" },
      "positionId": 1,
      "position": "Kurucu"
    }
  ]
}
```

#### `GET /upcomingMatch/:userId`
**Amaç:** Kullanıcının yaklaşan maçlarını al (bugün ve sonrası)  
**Frontend:** Menu.jsx (Yaklaşan Maçlar tab)  
**Response:** Maç dizisi

#### `GET /matchHistory/:userId`
**Amaç:** Kullanıcının geçmiş maçlarını al (bitmiş maçlar)  
**Frontend:** Menu.jsx (Geçmiş Maçlar tab)  
**Response:** Maç dizisi

---

## Maç Aksiyonları (matchActionController)

### 1. Oyuncu Yönetimi

#### `DELETE /leave/:userId`
**Amaç:** Oyuncu maçtan ayrıl VEYA yönetici oyuncuyu at  
**Body:**
```json
{
  "matchId": "xxx"
}
```
**Frontend:** 
- Oyuncu kendi pozisyonuna basıp "Kadrodan Çık" tıklaması
- Yönetici bir oyuncuya basıp "Oyuncuyu At" tıklaması

#### `POST /joinPosition`
**Amaç:** Oyuncu maçta bir pozisyona katıl VEYA pozisyonunu değiştir  
**Body:**
```json
{
  "matchId": "xxx",
  "userId": "user_id",
  "positionId": 5,
  "position": "Forvet"
}
```
**Logic:**
- Oyuncu yeniyse: players dizisine eklenir
- Oyuncu zaten varsa: positionId ve position güncellenir

---

## Frontend Akışı

### Menu.jsx
```
1. Yaklaşan Maçlar Tab
   └─ GET /upcomingMatch/:userId
      └─ Maç kartlarına map et

2. Geçmiş Maçlar Tab
   └─ GET /matchHistory/:userId
      └─ Maç kartlarına map et
```

### MatchList.jsx (Keşfet)
```
1. Sayfa yükle
   └─ GET /getAllMatches?page=1&limit=10
   
2. Arama yapılırsa
   └─ GET /searchMatch?q=...
   
3. Maç kartında "Katıl" tıklanırsa
   └─ Code modali açılır
   └─ PUT /inviteCode (kod ve userId gönder)
```

### Match.jsx (Detay Sayfası)
```
1. Sayfa yükle
   └─ GET /getMatch/:matchId
   └─ players array'ı positionId'ye göre saha layout'una yerleştir

2. Oyuncu pozisyona tıklayıp katılırsa
   └─ POST /joinPosition (matchId, userId, positionId)

3. Oyuncu "Kadrodan Çık" tıklanırsa
   └─ DELETE /leave/:userId (matchId body'de)

4. Yönetici oyuncuya tıklayıp atarsa
   └─ DELETE /leave/:userId (matchId body'de)
```

### CreateMatch.jsx (Yeni Maç)
```
1. Form doldur ve "Maç Oluştur" tıkla
   └─ POST /createMatch
   └─ Response'daki match id'si kullanarak Match.jsx'e yönlendir
```

---

## Model İlişkiler

### Match Document
```javascript
{
  _id: ObjectId,
  name: String,
  location: String,
  date: Date,
  capacity: Number,
  inviteCode: String (unique),
  code: String (unique),
  owner: ObjectId (ref: User),
  players: [
    {
      _id: ObjectId (nested doc),
      user: ObjectId (ref: User),
      positionId: Number (1-16),
      position: String
    }
  ],
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Oyuncu Slot Yapısı
- **6v6:** positionId 1-12 (her takım 6 oyuncu)
- **7v7:** positionId 1-14 (her takım 7 oyuncu)
- **8v8:** positionId 1-16 (her takım 8 oyuncu)

---

## Validation Kuralları

### joinMatchWithCode
- ✅ Maç var mı? (inviteCode OR code ile)
- ✅ Maç aktif mi? (isActive: true)
- ✅ Kapasite dolu mu?
- ✅ Oyuncu zaten katılmış mı?

### joinPosition
- ✅ Maç var mı?
- ✅ Kapasite dolu mu?

### leaveOrKickPlayer
- ✅ Maç var mı?
- ✅ Oyuncu katılmış mı?

---

## Hata Kodları

| Kod | Durum | İleti |
|-----|-------|-------|
| 200 | OK | Sukses |
| 201 | Created | Maç oluşturuldu |
| 400 | Bad Request | Kapasitesi dolu, zaten katılmış, vb. |
| 404 | Not Found | Maç/Oyuncu bulunamadı |
| 500 | Server Error | Sunucu hatası |
