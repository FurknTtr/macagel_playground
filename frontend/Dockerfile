# Aşama 1: Build (Vite projesini derleme)
FROM node:20-alpine AS builder

WORKDIR /app

# Bağımlılıkları kur
COPY package*.json ./
RUN npm install --legacy-peer-deps
#legacy peer deps ekleyerek versiyon uyuşmazlıklarını geçici olarak çözebiliriz.

# Kodları kopyala ve projeyi derle
COPY . .
RUN npm run build

# Aşama 2: Sunma (Nginx ile yayınlama)
FROM nginx:alpine

# Nginx'in varsayılan statik dosya dizinine derlenmiş uygulamanızı kopyalayın
COPY --from=builder /app/dist /usr/share/nginx/html

# Nginx 80 portundan hizmet verecek
EXPOSE 80

# Nginx'i başlat
CMD ["nginx", "-g", "daemon off;"]