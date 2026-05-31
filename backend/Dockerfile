FROM node:20-alpine

WORKDIR /app

# Sadece dependency'leri kopyalayıp kuruyoruz (cache avantajı için)
COPY package*.json ./
RUN npm install

# Tüm backend kodlarını kopyalıyoruz
COPY . .

# Backend'in çalışacağı port
EXPOSE 3000

# Uygulamayı başlat
CMD ["npm", "start"]