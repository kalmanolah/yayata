FROM node:8

RUN mkdir /code
WORKDIR /code
ADD . .

RUN npm install

EXPOSE 8080
ENTRYPOINT npm run dev -- --host 0.0.0.0