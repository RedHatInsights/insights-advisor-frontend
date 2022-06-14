FROM caddy:latest 

COPY ./Caddyfile /opt/app-root/src/Caddyfile
COPY dist /opt/app-root/src/dist/
COPY ./package.json /opt/app-root/src
WORKDIR /opt/app-root/src
CMD ["caddy", "run", "--config", "/opt/app-root/src/Caddyfile"]