FROM node:latest

COPY ./webseed /app/webseed
COPY ./package.json /app
COPY ./config /app/config
COPY ./files /app/files

WORKDIR /app/

RUN npm install --prod

CMD node webseed/
EXPOSE 5000
