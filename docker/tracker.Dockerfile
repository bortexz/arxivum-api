FROM node:latest

COPY ./tracker /app/tracker
COPY ./package.json /app
COPY ./config /app/config

WORKDIR /app/

RUN npm install --prod

CMD node ./tracker/
EXPOSE 4000
