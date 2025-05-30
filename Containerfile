FROM registry.access.redhat.com/ubi9/nodejs-22:latest as builder

USER root

RUN dnf install jq -y

USER default

RUN npm i -g yarn

# Download build scripts from GitHub instead of copying from local
RUN mkdir -p /opt/app-root/bin/ && \
    curl -L -o /opt/app-root/bin/universal_build.sh https://raw.githubusercontent.com/RedHatInsights/insights-frontend-builder-common/refs/heads/master/universal_build.sh && \
    curl -L -o /opt/app-root/bin/build_app_info.sh https://raw.githubusercontent.com/RedHatInsights/insights-frontend-builder-common/refs/heads/master/build_app_info.sh && \
    curl -L -o /opt/app-root/bin/server_config_gen.sh https://raw.githubusercontent.com/RedHatInsights/insights-frontend-builder-common/refs/heads/master/server_config_gen.sh && \
    chmod +x /opt/app-root/bin/universal_build.sh /opt/app-root/bin/build_app_info.sh /opt/app-root/bin/server_config_gen.sh

COPY --chown=default . .

ARG NPM_BUILD_SCRIPT=""
RUN universal_build.sh

FROM registry.access.redhat.com/ubi9-minimal:latest

COPY LICENSE /licenses/

COPY --from=builder /opt/app-root/src/dist dist
COPY package.json .
