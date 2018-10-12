FROM node:10-alpine

RUN mkdir /code
WORKDIR /code
ADD . .

RUN npm install

EXPOSE 8080
ENTRYPOINT npm run dev -- --host 0.0.0.0