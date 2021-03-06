#!/bin/bash

ARG=$1
if [[ -z $ARG ]]; then
    echo "Usage: $0 <branch>|-c"
    echo "Start an Insights API environment (as a set of containers) from <branch> in the insights-advisor-api git repo"
    echo
    echo "    <branch> : checkout <branch> and start the containers"
    echo "    -u       : runs git pull to get latest code for the checked-out branch (containers must be running)"
    echo "    -c       : stop and cleanup the containers"
    exit 1
fi

if ! type docker >/dev/null 2>&1; then
    echo "Couldn't run docker on the local machine."
    echo "Please install it and make sure its configured to run containers as a normal user, then try running this script again."
    exit 1
fi

function check_port () {
    local port=$1
    while lsof -P -iTCP -sTCP:LISTEN | grep -q $port; do
      ((port++))
    done
    echo $port
}

function echo_bold () {
    echo -e "\n\033[1m$1\033[0m"
}

API_REPO="git@github.com:RedHatInsights/insights-advisor-api.git"
REPO_LOCAL_DIR="/tmp/insights-advisor-api"

API_CONTAINER=advisor_api_for_frontend
DB_CONTAINER=advisor_db_for_frontend
PROXY_CONTAINER=insights_proxy_for_frontend
CONTAINER_NETWORK=advisor_api_net_for_frontend

SPANDX_CONFIG="spandx.config.js"
REPO_SPANDX_CONFIG="./config/${SPANDX_CONFIG}"
TMP_SPANDX_CONFIG="/tmp/${SPANDX_CONFIG}"

if [[ "$ARG" == "-u" ]]; then
    if ! docker ps | grep -q $API_CONTAINER; then
        echo "The $API_CONTAINER container must be running to use the -u option"
        exit 1
    fi
    # pull the latest changes from origin/$BRANCH
    # Note that this fails if commits are amended and force pushed (merge conflicts)
    docker exec $API_CONTAINER git pull
    exit $?
fi

function clean_up()
{
    # Remove the containers and repos to start fresh
    echo_bold "Cleaning up any existing advisor containers ..."
    docker rm -f $PROXY_CONTAINER $API_CONTAINER $DB_CONTAINER 2>/dev/null
    docker rmi -f $API_CONTAINER 2>/dev/null
    docker network rm $CONTAINER_NETWORK 2>/dev/null
    rm -f $TMP_SPANDX_CONFIG
    rm -rf $REPO_LOCAL_DIR
}
clean_up
[[ "$ARG" == "-c" ]] && exit 0

# Check which host ports we should connect the containers to
API_PORT=$(check_port 8000)
DB_PORT=$(check_port 5432)
PROXY_PORT=$(check_port 1337)

API_URL="http://localhost:${API_PORT}/api/insights/v1/"
FRONTEND_URL="https://ci.foo.redhat.com:${PROXY_PORT}"
IMPORT_CONTENT_URL="http://localhost:${API_PORT}/private/import_content/"
CONTENT_SERVER="http://content-server-advisor-ci.5a9f.insights-dev.openshiftapps.com"
TEST_DATA_URL="${CONTENT_SERVER}/testdata/"
TEST_DATA_FIXTURE=540155_test_data.json

# Download the insights-advisor-api repo and checkout the specified branch
BRANCH=$ARG
CMD="git clone --branch $BRANCH --single-branch $API_REPO $REPO_LOCAL_DIR"
echo_bold "Running '$CMD' ..."
if ! $CMD; then
    echo_bold "Problems cloning insights-advisor-api repo and checking out branch '$BRANCH'."
    echo "Please ensure branch '$BRANCH' exists."
    exit 1
fi

# Build and start the containers
echo_bold "Building the $API_CONTAINER container ..."
docker build -t $API_CONTAINER $REPO_LOCAL_DIR

echo_bold "Starting the advisor containers ..."
docker network create $CONTAINER_NETWORK

docker run -d --name $DB_CONTAINER -p ${DB_PORT}:5432 --network $CONTAINER_NETWORK \
       -e POSTGRESQL_USER=insightsapi -e POSTGRESQL_PASSWORD=InsightsData -e POSTGRESQL_DATABASE=insightsapi \
       registry.access.redhat.com/rhscl/postgresql-10-rhel7

docker run -d --name $API_CONTAINER -p ${API_PORT}:8000 --network $CONTAINER_NETWORK \
       -e ADVISOR_CONTENT_URL="${CONTENT_SERVER}/content" \
       -e ADVISOR_CONTENT_CONFIG_URL="${CONTENT_SERVER}/config" \
       -e ADVISOR_DB_HOST=$DB_CONTAINER -e USE_DJANGO_WEBSERVER=true \
       -e ADVISOR_ENV=prod -e LOG_LEVEL=INFO \
       $API_CONTAINER /bin/bash -c "sleep 5 && \
                   advisor/manage.py migrate --noinput && \
                   advisor/manage.py loaddata rulesets rule_categories system_types && \
                   (curl -sS ${TEST_DATA_URL} -o advisor/api/fixtures/${TEST_DATA_FIXTURE} && \
                   advisor/manage.py loaddata $TEST_DATA_FIXTURE || \
                   advisor/manage.py loaddata upload_sources basic_test_data) && \
                   ./app.sh"

# Check that API container is running
if ! docker ps | grep -q $API_CONTAINER; then
    echo_bold "Problem starting $API_CONTAINER.  Exiting ..."
    clean_up
    exit 1
fi

# Add user's ~/.ssh directory to the Advisor container for running git pull from within it
docker cp ~/.ssh $API_CONTAINER:/opt/app-root/src/
docker exec --user 0 $API_CONTAINER /bin/bash -c "chown -R 1001:0 /opt/app-root/src/.ssh"
docker exec $API_CONTAINER /bin/bash -c "git config --global user.email user@example.com && \
                                         git config --global user.name 'User Name'"

echo_bold "Importing the content into the API in the background ..."
(if [[ "$(type curl 2>/dev/null)" ]]; then
    IMPORT_WITH="curl -s"
elif [[ "$(type wget 2>/dev/null)" ]]; then
    IMPORT_WITH="wget -q"
else
    echo_bold "Couldn't find either curl or wget to automatically import the content into the API."
    echo "Try importing it manually by pointing a browser to ${IMPORT_CONTENT_URL}"
fi

if [[ "$IMPORT_WITH" ]]; then
  TRIES=1
  while [[ ! $(${IMPORT_WITH} ${IMPORT_CONTENT_URL}) ]]; do
      if [[ ${TRIES} -eq 3 ]]; then
          echo_bold "Unsuccessfully tried ${TRIES} times to import the content automatically into the API."
          echo "Try importing it manually by pointing a browser to ${IMPORT_CONTENT_URL}"
          break
      fi
      sleep 10
      ((TRIES++))
  done
fi) &

echo_bold "Starting insights-proxy container  ..."
sed "s|apiHost = .*$|apiHost = \`http://localhost:${API_PORT}\`;|" $REPO_SPANDX_CONFIG > $TMP_SPANDX_CONFIG
# Check what platform we are running on, ie Linux or Mac or ?
PLATFORM=$(uname -s | tr '[A-Z]' '[a-z'])
[[ $PLATFORM == 'linux' ]] && USE_HOST_NET='--net=host' || USE_HOST_NET=''
docker run -d --name $PROXY_CONTAINER -p $PROXY_PORT:1337 \
       -e PLATFORM=$PLATFORM $USE_HOST_NET \
       -v $TMP_SPANDX_CONFIG:/config/spandx.config.js \
       docker.io/redhatinsights/insights-proxy

echo_bold "Finished setting up Insights API environment."
echo "Don't forget to run 'npm install' and 'npm start' to start the frontend."
echo "The Insights Frontend URL is ${FRONTEND_URL}"
echo "The Insights API URL is ${API_URL}"
