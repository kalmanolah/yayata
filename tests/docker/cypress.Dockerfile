FROM node:10-slim

RUN mkdir /code
WORKDIR /code

RUN npm install cypress --save-dev

RUN apt-get update && \
  apt-get install -y \
    libgtk2.0-0 \
    libnotify-dev \
    libgconf-2-4 \
    libnss3 \
    libxss1 \
    libasound2 \
    xvfb

RUN $(npm bin)/cypress verify

ADD ./cypress ./cypress
ADD cypress.json cypress.json

RUN curl -OL 'https://github.com/vishnubob/wait-for-it/raw/master/wait-for-it.sh'
RUN chmod +x wait-for-it.sh

ENTRYPOINT $(npm bin)/cypress run