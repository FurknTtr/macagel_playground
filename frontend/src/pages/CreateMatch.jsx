import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { SEHIRLER } from "../components/Sehirler";

function CreateMatch() {
  const navigate = useNavigate();
  
  // Türkiye şehirleri
  const cities = ["Adana", "Adıyaman", "Afyonkarahisar", "Ağrı", "Aksaray", "Amasya", "Ankara", "Antalya", "Ardahan", "Artvin", "Aydın", "Balıkesir", "Bartın", "Batman", "Bayburt", "Bingöl", "Bitlis", "Bolu", "Burdur", "Bursa", "Çanakkale", "Çankırı", "Çorum", "Denizli", "Diyarbakır", "Düzce", "Edirne", "Elazığ", "Erzincan", "Erzurum", "Eskişehir", "Gaziantep", "Giresun", "Gümüşhane", "Hakkari", "Hatay", "Iğdır", "Isparta", "İstanbul", "İzmir", "Kahramanmaraş", "Karabük", "Karaman", "Kars", "Kastamonu", "Kayseri", "Kilis", "Kırıkkale", "Kırklareli", "Kırşehir", "Kocaeli", "Konya", "Kütahya", "Lâhij", "Malatya", "Manisa", "Mardin", "Muğla", "Muş", "Nevşehir", "Niğde", "Ordu", "Orhaneli", "Orhaniye", "Ormana", "Osmancık", "Osmangazi", "Osmania", "Osman Gazi", "Osmanlı", "Osmanniye", "Ordu", "Orhaneli", "Orhaniye", "Ormana", "Osmancık", "Osmangazi", "Osmania", "Osman Gazi", "Osmanlı", "Osmanniye", "Ordu", "Orhaneli", "Orhaniye", "Ormana", "Osmancık", "Osmangazi", "Osmania", "Osman Gazi", "Osmanlı", "Osmanniye", "Ordu", "Orhaneli", "Orhaniye", "Ormana", "Osmancık", "Osmangazi", "Osmania", "Osman Gazi", "Osmanlı", "Osmanniye", "Ordu", "Orhaneli", "Orhaniye", "Ormana", "Osmancık", "Osmangazi", "Osmania", "Osman Gazi", "Osmanlı", "Osmanniye", "Ordu", "Orhaneli", "Orhaniye", "Ormana", "Osmancık", "Osmangazi", "Osmania", "Osman Gazi", "Osmanlı", "Osmanniye", "Ordu", "Orhaneli", "Orhaniye", "Ormana", "Osmancık", "Osmangazi", "Osmania", "Osman Gazi", "Osmanlı", "Osmanniye", "Ordu", "Orhaneli", "Orhaniye", "Ormana", "Osmancık", "Osmangazi", "Osmania", "Osman Gazi", "Osmanlı", "Osmanniye", "Ordu", "Orhaneli", "Orhaniye", "Ormana", "Osmancık", "Osmangazi", "Osmania", "Osman Gazi", "Osmanlı", "Osmanniye"];

  const [form, setForm] = useState({
    title: "",
    date: "",
    time: "",
    location: "",
    capacity: "",
    price: "",
  });

  const [selectedCity, setSelectedCity] = useState("Isparta");
  const [locationQuery, setLocationQuery] = useState("");
  const [mapUrl, setMapUrl] = useState("https://www.google.com/maps?q=Isparta&output=embed");
  const [locationMessage, setLocationMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearchLocation = () => {
    const query = locationQuery.trim();
    if (!query) return;
    const fullQuery = `${selectedCity} ${query}`;
    setMapUrl(`https://www.google.com/maps?q=${encodeURIComponent(fullQuery)}&output=embed`);
    setLocationMessage(`Haritada "${fullQuery}" gösteriliyor.`);
  };

  const handleUseLocation = () => {
    if (!locationQuery.trim()) return;
    const finalLocation = `${selectedCity} / ${locationQuery.trim()}`;
    setForm((prev) => ({ ...prev, location: finalLocation }));
    setLocationMessage(`✓ Konum: "${finalLocation}"`);
  };

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (!user.id) {
        alert("Lütfen önce giriş yapın");
        return;
      }

      // Tarih ve saati birleştirip tek bir tarih objesi (Date objesi için string format) yapalım
      const matchDateStr = `${form.date}T${form.time}:00`;
      
      const payload = {
        name: form.title,
        date: matchDateStr,
        location: form.location || locationQuery || "Bilinmeyen Konum",
        capacity: parseInt(form.capacity.split("/")[1] || form.capacity || 14),
        owner: user.id
        // Modelde price olmadığı için şimdilik eklemiyoruz
      };

      const response = await fetch("http://localhost:3000/maca-gel/createMatch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();

      if (response.ok) {
        alert("Maç başarıyla oluşturuldu.");
        navigate("/menu");
      } else {
        alert(data.message || "Maç oluşturulamadı.");
      }
    } catch (error) {
      alert("Hata oluştu. Sunucuya bağlanılamıyor.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 lg:p-12 font-sans">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-xl border border-gray-200 p-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-black text-gray-900 uppercase">Maç Oluştur</h1>
          <button
            type="button"
            onClick={() => navigate("/menu")}
            className="text-xs font-black uppercase bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg transition"
          >
            Vazgeç
          </button>
        </div>
        <p className="text-xs text-gray-500 mb-6">Yönetici formunu doldurun ve maçı kaydedin.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-black uppercase text-gray-500 mb-1">Maç Adı</label>
            <input name="title" type="text" value={form.title} onChange={handleChange} required className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black uppercase text-gray-500 mb-1">Tarih</label>
              <input name="date" type="date" value={form.date} onChange={handleChange} required className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
            <div>
              <label className="block text-xs font-black uppercase text-gray-500 mb-1">Saat</label>
              <input name="time" type="time" value={form.time} onChange={handleChange} required className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black uppercase text-gray-500 mb-1">İl Seç</label>
            <select 
              value={selectedCity} 
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 mb-4 font-bold"
            >
              {SEHIRLER.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-black uppercase text-gray-500 mb-1">Konum Arama (Haritada göster)</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
                placeholder="Örn: Süleyman Demirel Halı Saha"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <button
                type="button"
                onClick={handleSearchLocation}
                className="bg-blue-600 text-white px-4 py-3 rounded-xl font-bold hover:bg-blue-700 transition"
              >
                Ara
              </button>
            </div>
            <button
              type="button"
              onClick={handleUseLocation}
              disabled={!locationQuery.trim()}
              className="mb-2 w-full bg-green-600 text-white py-3 rounded-xl font-black uppercase tracking-wider hover:bg-green-700 transition disabled:bg-gray-400"
            >
              Konumu Form'a Ekle
            </button>
            {locationMessage && <p className="text-xs text-gray-500 mb-3">{locationMessage}</p>}
            <iframe
              title="Konum Haritası"
              className="w-full h-48 rounded-xl border border-gray-300"
              src={mapUrl}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase text-gray-500 mb-1">Kadro Sayısı</label>
            <input name="capacity" type="text" value={form.capacity} onChange={handleChange} placeholder="Örnek: 12/14" required className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>

          <div>
            <label className="block text-xs font-black uppercase text-gray-500 mb-1">Ücret</label>
            <input name="price" type="text" value={form.price} onChange={handleChange} placeholder="Örnek: 150 TL" required className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>

          <button type="submit" disabled={isLoading} className={`w-full ${isLoading ? 'bg-green-400' : 'bg-green-600 hover:bg-green-700'} text-white py-3 rounded-xl font-black uppercase tracking-wider transition`}>
            {isLoading ? "Oluşturuluyor..." : "Maçı Oluştur"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreateMatch;
