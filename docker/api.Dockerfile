FROM node:latest

COPY api /app/api
COPY package.json /app/
COPY config /app/config
COPY files /app/files

WORKDIR /app/

RUN npm install --prod

CMD node api/
EXPOSE 3000
