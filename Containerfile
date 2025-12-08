FROM registry.access.redhat.com/ubi9/nodejs-22:latest as builder

USER root

RUN dnf install jq -y

USER default

RUN npm i -g yarn

RUN mkdir -p /opt/app-root/bin/
COPY  ./build-tools/universal_build.sh /opt/app-root/bin/universal_build.sh
COPY ./build-tools/build_app_info.sh /opt/app-root/bin/build_app_info.sh
COPY ./build-tools/server_config_gen.sh /opt/app-root/bin/server_config_gen.sh

COPY --chown=default . .

ARG NPM_BUILD_SCRIPT=""
ARG PACKAGE_JSON_PATH=package.json
ENV APP_NAME="advisor-frontend"
RUN universal_build.sh

FROM scratch

COPY LICENSE /licenses/
COPY --from=builder /opt/app-root/src/dist /srv/dist
COPY package.json /srv/package.json
