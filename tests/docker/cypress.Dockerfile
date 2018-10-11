FROM cypress/base:10

RUN mkdir /code
WORKDIR /code

RUN npm install cypress --save-dev
RUN $(npm bin)/cypress verify

ADD ./cypress ./cypress
ADD cypress.env.json cypress.env.json
ADD cypress.json cypress.json

RUN curl -OL 'https://github.com/vishnubob/wait-for-it/raw/master/wait-for-it.sh'
RUN chmod +x wait-for-it.sh

ENTRYPOINT $(npm bin)/cypress run