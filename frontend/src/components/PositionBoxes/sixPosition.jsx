import React from "react";

// Formasyon Tanımları
export const formationDefinitions = {
  "1-2-2-1": {
    name: "1-2-2-1 (Dengeli)",
    description: "Kaleci-2 Defans-2 Orta-1 Forvet"
  },
  "1-1-3-1": {
    name: "1-1-3-1 (Orta-ağırlıklı)",
    description: "Kaleci-1 Defans-3 Orta-1 Forvet"
  },
  "1-1-2-2": {
    name: "1-1-2-2 (Ofansif)",
    description: "Kaleci-1 Defans-2 Orta-2 Forvet"
  },
  "1-2-1-2": {
    name: "1-2-1-2 (Defansif)",
    description: "Kaleci-2 Defans-1 Orta-2 Forvet"
  }
};

// 1-2-2-1 Formasyonu (Standart)
export const formation_1_2_2_1 = [
  { id: 1, team: "A", role: "Kaleci", user: "Boş", top: "8%", left: "50%" },
  { id: 2, team: "A", role: "Defans", user: "Boş", top: "18%", left: "30%" },
  { id: 3, team: "A", role: "Defans", user: "Boş", top: "18%", left: "70%" },
  { id: 4, team: "A", role: "Orta", user: "Boş", top: "28%", left: "35%" },
  { id: 5, team: "A", role: "Orta", user: "Boş", top: "28%", left: "65%" },
  { id: 6, team: "A", role: "Forvet", user: "Boş", top: "40%", left: "50%" },
  
  { id: 7, team: "B", role: "Forvet", user: "Boş", top: "60%", left: "50%" },
  { id: 8, team: "B", role: "Orta", user: "Boş", top: "72%", left: "35%" },
  { id: 9, team: "B", role: "Orta", user: "Boş", top: "72%", left: "65%" },
  { id: 10, team: "B", role: "Defans", user: "Boş", top: "82%", left: "30%" },
  { id: 11, team: "B", role: "Defans", user: "Boş", top: "82%", left: "70%" },
  { id: 12, team: "B", role: "Kaleci", user: "Boş", top: "92%", left: "50%" }
];

// 1-1-3-1 Formasyonu
export const formation_1_1_3_1 = [
  { id: 1, team: "A", role: "Kaleci", user: "Boş", top: "8%", left: "50%" },
  { id: 2, team: "A", role: "Defans", user: "Boş", top: "18%", left: "50%" },
  { id: 3, team: "A", role: "Orta", user: "Boş", top: "28%", left: "25%" },
  { id: 4, team: "A", role: "Orta", user: "Boş", top: "28%", left: "50%" },
  { id: 5, team: "A", role: "Orta", user: "Boş", top: "28%", left: "75%" },
  { id: 6, team: "A", role: "Forvet", user: "Boş", top: "40%", left: "50%" },
  
  { id: 7, team: "B", role: "Forvet", user: "Boş", top: "60%", left: "50%" },
  { id: 8, team: "B", role: "Orta", user: "Boş", top: "72%", left: "25%" },
  { id: 9, team: "B", role: "Orta", user: "Boş", top: "72%", left: "50%" },
  { id: 10, team: "B", role: "Orta", user: "Boş", top: "72%", left: "75%" },
  { id: 11, team: "B", role: "Defans", user: "Boş", top: "82%", left: "50%" },
  { id: 12, team: "B", role: "Kaleci", user: "Boş", top: "92%", left: "50%" }
];

// 1-1-2-2 Formasyonu (Ofansif)
export const formation_1_1_2_2 = [
  { id: 1, team: "A", role: "Kaleci", user: "Boş", top: "8%", left: "50%" },
  { id: 2, team: "A", role: "Defans", user: "Boş", top: "18%", left: "50%" },
  { id: 3, team: "A", role: "Orta", user: "Boş", top: "28%", left: "35%" },
  { id: 4, team: "A", role: "Orta", user: "Boş", top: "28%", left: "65%" },
  { id: 5, team: "A", role: "Forvet", user: "Boş", top: "35%", left: "35%" },
  { id: 6, team: "A", role: "Forvet", user: "Boş", top: "35%", left: "65%" },
  
  { id: 7, team: "B", role: "Forvet", user: "Boş", top: "65%", left: "35%" },
  { id: 8, team: "B", role: "Forvet", user: "Boş", top: "65%", left: "65%" },
  { id: 9, team: "B", role: "Orta", user: "Boş", top: "72%", left: "35%" },
  { id: 10, team: "B", role: "Orta", user: "Boş", top: "72%", left: "65%" },
  { id: 11, team: "B", role: "Defans", user: "Boş", top: "82%", left: "50%" },
  { id: 12, team: "B", role: "Kaleci", user: "Boş", top: "92%", left: "50%" }
];

// 1-2-1-2 Formasyonu (Defansif)
export const formation_1_2_1_2 = [
  { id: 1, team: "A", role: "Kaleci", user: "Boş", top: "8%", left: "50%" },
  { id: 2, team: "A", role: "Defans", user: "Boş", top: "18%", left: "30%" },
  { id: 3, team: "A", role: "Defans", user: "Boş", top: "18%", left: "70%" },
  { id: 4, team: "A", role: "Orta", user: "Boş", top: "28%", left: "50%" },
  { id: 5, team: "A", role: "Forvet", user: "Boş", top: "35%", left: "35%" },
  { id: 6, team: "A", role: "Forvet", user: "Boş", top: "35%", left: "65%" },
  
  { id: 7, team: "B", role: "Forvet", user: "Boş", top: "65%", left: "35%" },
  { id: 8, team: "B", role: "Forvet", user: "Boş", top: "65%", left: "65%" },
  { id: 9, team: "B", role: "Orta", user: "Boş", top: "72%", left: "50%" },
  { id: 10, team: "B", role: "Defans", user: "Boş", top: "82%", left: "30%" },
  { id: 11, team: "B", role: "Defans", user: "Boş", top: "82%", left: "70%" },
  { id: 12, team: "B", role: "Kaleci", user: "Boş", top: "92%", left: "50%" }
];

// Standart olarak 1-2-2-1 kullan
export const initialSixPositions = formation_1_2_2_1;

export default function SixPosition({ positions, handleJoin }) {
  return (
    <>
      {positions.map((pos) => (
        <div 
          key={pos.id}
          onClick={() => handleJoin(pos.id)}
          className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center cursor-pointer group hover:z-10"
          style={{ top: pos.top, left: pos.left }}
        >
          {/* Forma (Numaralı Yelek Tarzı) */}
          <div className={`w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-all duration-300 shadow-[0_4px_10px_rgba(0,0,0,0.5)] border-[3px] 
            ${pos.user === "Boş" 
              ? "bg-gray-800/80 border-gray-500 text-gray-500 group-hover:bg-green-500 group-hover:border-white group-hover:text-white group-hover:scale-110" 
              : pos.user.includes("İstek")
              ? "bg-yellow-500 border-yellow-200 text-yellow-900 scale-105 animate-pulse"
              : pos.team === "A" ? "bg-red-600 border-red-300 text-white scale-105" : "bg-blue-600 border-blue-300 text-white scale-105"}`}
          >
            <span className="text-sm font-black tracking-tighter">{pos.id}</span>
          </div>
          
          {/* Kullanıcı Adı Etiketi */}
          <div className="mt-1 bg-black/80 px-2 py-0.5 sm:py-1 rounded-xl backdrop-blur-md border border-white/20 min-w-[50px] sm:min-w-[70px] text-center z-10 shadow-lg">
            <p className={`text-[8px] sm:text-[10px] font-black uppercase tracking-tighter ${pos.user === "Boş" ? "text-gray-400" : pos.user.includes("İstek") ? "text-yellow-400" : "text-white"}`}>
              {pos.user}
            </p>
            <p className="text-[6px] sm:text-[7px] text-green-400 font-bold uppercase tracking-widest">{pos.role}</p>
          </div>
        </div>
      ))}
    </>
  );
}
