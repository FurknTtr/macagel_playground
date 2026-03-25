import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function CreateMatch() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    date: "",
    time: "",
    location: "",
    capacity: "",
    price: "",
  });

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
    setMapUrl(`https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`);
    setLocationMessage(`"${query}" adresi haritada gösteriliyor. "Konum" alanına eklemek için alttaki düğmeye basın.`);
  };

  const handleUseLocation = () => {
    if (!locationQuery.trim()) return;
    setForm((prev) => ({ ...prev, location: `Isparta / ${locationQuery.trim()}` }));
    setLocationMessage(`Form konumu "Isparta / ${locationQuery.trim()}" olarak ayarlandı.`);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const storedMatches = JSON.parse(localStorage.getItem("createdMatches") || "[]");
    const newMatch = {
      id: Date.now(),
      ...form,
      isOwner: true,
      type: "upcoming",
      score: "",
    };
    localStorage.setItem("createdMatches", JSON.stringify([newMatch, ...storedMatches]));
    alert("Maç başarıyla oluşturuldu. Yönetim sayfasına yönlendiriliyorsun.");
    navigate("/menu", { state: { newMatch } });
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
            <label className="block text-xs font-black uppercase text-gray-500 mb-1">Konum Arama (Haritada göster)</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
                placeholder="Örn: Isparta Süleyman Demirel Halı Saha"
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

          <button type="submit" className="w-full bg-green-600 text-white py-3 rounded-xl font-black uppercase tracking-wider hover:bg-green-700 transition">Maçı Oluştur</button>
        </form>
      </div>
    </div>
  );
}

export default CreateMatch;
