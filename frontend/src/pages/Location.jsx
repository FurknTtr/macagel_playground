import React, { useState } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";

export default function Location() {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const initialQuery = searchParams.get("q") || "Isparta Halı Saha";
  const selectedMatchId = searchParams.get("matchId") ? Number(searchParams.get("matchId")) : null;

  const [query, setQuery] = useState(initialQuery);
  const [searchExecuted, setSearchExecuted] = useState(false);

  const searchByQuery = () => {
    if (query.trim()) {
      setSearchExecuted(true);
    }
  };

  const selectSearchResult = () => {
    const selectedLocation = `Isparta / ${query}`;
    if (selectedMatchId) {
      navigate("/menu", { state: { matchId: selectedMatchId, selectedLocation } });
    } else {
      navigate("/menu", { state: { selectedLocation } });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-6 lg:p-12 font-sans">
      <div className="max-w-6xl mx-auto bg-white rounded-3xl shadow-xl border border-gray-100">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between px-6 py-4 border-b border-gray-200 gap-4">
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tighter">Halı Saha Harita Seçimi</h1>
            <p className="text-xs text-gray-500 mt-1">{selectedMatchId ? `Maç ID: ${selectedMatchId}` : "Serbest arama modu"}</p>
          </div>
          <Link to="/menu" className="text-xs font-black uppercase tracking-wider text-green-600 hover:text-green-700">← Yönet Sayfasına Dön</Link>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
            <div className="bg-gray-100 p-4 rounded-2xl">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Halı saha ara..."
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <button
                  onClick={searchByQuery}
                  className="px-4 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition"
                >
                  Ara
                </button>
              </div>

              <p className="mt-3 text-xs text-gray-500">Arama yapıldığında harita sorgusu güncellenir.</p>

              {searchExecuted && query.trim() && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm font-bold text-gray-800 mb-3">
                    ✅ <strong>{query}</strong> bulundu.
                  </p>
                  <button
                    onClick={selectSearchResult}
                    className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition"
                  >
                    Bu Sahanın Adını Seç ve Menüye Dön
                  </button>
                </div>
              )}
            </div>

            <div className="bg-black/5 rounded-2xl border border-gray-200 overflow-hidden h-[400px]">
              <iframe
                title="Harita"
                className="w-full h-full"
                src={`https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>

          <div className="mt-4 text-xs text-gray-500">Seçilen bir saha, yönet sayfasına dönüp otomatik konum alanını güncelleyecektir.</div>
        </div>
      </div>
    </div>
  );
}
