#!/bin/bash
set -e

# Source .env file if it exists to load environment variables
if [ -f .env ]; then
  set -a # Automatically export all variables
  source .env
  set +a # Stop automatically exporting
fi

echo "Restoring CodeArchGraph knowledge graph..."

NEO4J_CONTAINER_NAME_VAR="${NEO4J_CONTAINER_NAME:-graphiti-mcp-neo4j}"
LOCAL_DUMP_FILE_PATH="./graphiti-data/codearchgraph-knowledge.dump"
DUMP_FILE_IN_TEMP_CONTAINER="/tmp/codearchgraph-knowledge.dump" # Path inside the temporary container

if [ ! -f "$LOCAL_DUMP_FILE_PATH" ]; then
  echo "Error: Dump file not found at $LOCAL_DUMP_FILE_PATH"
  exit 1
fi

echo "Attempting to find Neo4j container named '${NEO4J_CONTAINER_NAME_VAR}'..."
CONTAINER_ID=""
RETRY_COUNT=0
MAX_RETRIES=5
RETRY_DELAY=3 # seconds

while [ -z "$CONTAINER_ID" ] && [ "$RETRY_COUNT" -lt "$MAX_RETRIES" ]; do
  if [ "$RETRY_COUNT" -gt 0 ]; then
    echo "Retrying to find container '${NEO4J_CONTAINER_NAME_VAR}' (attempt ${RETRY_COUNT}/${MAX_RETRIES-1})..."
    sleep $RETRY_DELAY
  fi
  CONTAINER_ID=$(docker ps -qf "name=^${NEO4J_CONTAINER_NAME_VAR}$")
  RETRY_COUNT=$((RETRY_COUNT+1))
done

echo "Found Neo4j container ID for '${NEO4J_CONTAINER_NAME_VAR}': $CONTAINER_ID"

if [ -z "$CONTAINER_ID" ]; then
  echo "Error: Neo4j container '${NEO4J_CONTAINER_NAME_VAR}' not found or not running."
  exit 1
fi

NEO4J_IMAGE=$(docker inspect $CONTAINER_ID --format '{{.Config.Image}}')
echo "Using Neo4j image: ${NEO4J_IMAGE}"

NEO4J_DATA_VOLUME=$(docker inspect $CONTAINER_ID --format '{{range .Mounts}}{{if eq .Destination "/data"}}{{.Name}}{{end}}{{end}}')
if [ -z "$NEO4J_DATA_VOLUME" ]; then
  echo "Error: Could not determine Neo4j data volume for container $CONTAINER_ID."
  exit 1
fi
echo "Using Neo4j data volume: ${NEO4J_DATA_VOLUME}"

TEMP_RESTORER_NAME="neo4j_restorer_temp_$(date +%s)"

echo "Stopping main Neo4j container: $CONTAINER_ID..."
docker stop $CONTAINER_ID
echo "Waiting for container to stop..."
sleep 10

echo "Starting temporary restorer container (${TEMP_RESTORER_NAME}) from image ${NEO4J_IMAGE} with volume ${NEO4J_DATA_VOLUME}..."
# Run the restorer container with a simple command to keep it alive for cp and exec
docker run -d \
  -v "${NEO4J_DATA_VOLUME}:/data" \
  --name "${TEMP_RESTORER_NAME}" \
  "${NEO4J_IMAGE}" \
  tail -f /dev/null # Keep container running

# Wait a moment for the container to be fully up
sleep 5

echo "Copying dump file to temporary restorer container..."
docker cp "${LOCAL_DUMP_FILE_PATH}" "${TEMP_RESTORER_NAME}:${DUMP_FILE_IN_TEMP_CONTAINER}"

echo "Restoring database from dump in temporary container..."
docker exec "${TEMP_RESTORER_NAME}" neo4j-admin database load neo4j \
  --from="${DUMP_FILE_IN_TEMP_CONTAINER}" --force

echo "Stopping and removing temporary restorer container..."
docker stop "${TEMP_RESTORER_NAME}" > /dev/null
docker rm "${TEMP_RESTORER_NAME}" > /dev/null

echo "Restarting main Neo4j container: $CONTAINER_ID..."
docker start $CONTAINER_ID
echo "Waiting for main Neo4j container to start..."
sleep 20

echo "CodeArchGraph knowledge graph restored successfully!"
