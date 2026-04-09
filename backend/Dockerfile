FROM node:22-alpine
RUN mkdir /app
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
COPY .env .env 
CMD ["npm", "run", "dev"]