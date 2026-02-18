FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY . .
ENV VITE_PROXY_TARGET=http://backend:5000
EXPOSE 3000

CMD ["npm", "run", "dev"]
