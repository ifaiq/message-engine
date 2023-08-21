FROM node:14.18.1-alpine

ARG db_pwd_prod
ENV DBPW_PROD=$db_pwd_prod

ARG db_pwd_dev
ENV DBPW_DEV=$db_pwd_dev

ARG DBPW_CLOUD_development
ENV DBPW_CLOUD_development=$DBPW_CLOUD_development

ARG DBPW_CLOUD_production
ENV DBPW_CLOUD_production=$DBPW_CLOUD_production

ARG es_pwd_dev
ENV ESPW_DEV=$es_pwd_dev

ARG es_pwd_prod
ENV ESPW_PROD=$es_pwd_prod

ARG sendgrid_key
ENV sendGridApiKey=$sendgrid_key

ARG termii_key
ENV termiiApiKey=$termii_key

ARG we_api_password
ENV weApiPassword=$we_api_password

ARG twilioSID
ENV twilioSID=$twilioSID

ARG twilioSIDTest
ENV twilioSIDTest=$twilioSIDTest

ARG twilioApiKey
ENV twilioApiKey=$twilioApiKey

ARG twilioApiKeyTest
ENV twilioApiKeyTest=$twilioApiKeyTest

ARG twilioApiSecret
ENV twilioApiSecret=$twilioApiSecret

ARG twilioApiSecretTest
ENV twilioApiSecretTest=$twilioApiSecretTest

ARG firebase_key
ENV firebaseKey=$firebase_key

ARG apmApiKey
ENV apmApiKey=$apmApiKey

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
RUN ls
COPY package*.json ./
COPY patches ./patches

RUN yarn install
COPY . .
EXPOSE 3002
CMD [ "npm", "start" ]
