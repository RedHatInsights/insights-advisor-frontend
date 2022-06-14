#!/bin/bash 
export APP_NAME="advisor"
function generate_caddy_conf() {
  PREFIX=""
  if [[ "${TRAVIS_BRANCH}" = "master" ||  "${TRAVIS_BRANCH}" = "main" || "${TRAVIS_BRANCH}" =~ "beta" ]]; then
    PREFIX="/beta"
  fi

  echo ":8000 {
    log
    # Define the regex for an app match
    @app_match {
        path_regexp ^/apps/${APP_NAME}(.*)
    }
    handle @app_match {
        # Substitution for alias from nginx
        uri strip_prefix /apps/${APP_NAME}
        file_server * {
            root /opt/app-root/src/dist 
            browse
        }
    }
    handle / {
        redir /apps/chrome/index.html permanent
    }
}
    " > Caddyfile.gen
}

generate_caddy_conf