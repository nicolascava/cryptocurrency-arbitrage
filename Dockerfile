FROM node:9.3.0

WORKDIR /usr/src/app

COPY ./yarn.lock ./package.json /usr/src/app/
COPY ./src/ /usr/src/app/src/

RUN yarn --pure-lockfile
RUN yarn build
RUN rm -rf ./src ./yarn.lock ./package.json

CMD node ./lib
