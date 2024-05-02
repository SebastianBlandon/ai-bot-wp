FROM node:18-bullseye as bot
WORKDIR /app
ENV EVENT_TOKEN "ba81672c5d4e77c6c59fb020c21d47e1"\
    OPENAI_API_KEY "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"\
    MAPS_API_KEY "AIzaSyAbFctSkNF2rLgtr2BPDWusm6aMhiTUOvQ"
COPY package*.json ./
RUN npm i
COPY . .
ARG RAILWAY_STATIC_URL
ARG PUBLIC_URL
ARG PORT
CMD ["npm", "start"]
