FROM cypress/base:10

RUN mkdir /code
WORKDIR /code
ADD ./cypress ./cypress
ADD cypress.env.json cypress.env.json
ADD cypress.json cypress.json

RUN npm install cypress --save-dev
RUN $(npm bin)/cypress verify

ENTRYPOINT $(npm bin)/cypress run