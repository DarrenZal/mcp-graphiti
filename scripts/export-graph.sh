#!/bin/bash
set -e

# Source .env file if it exists to load environment variables
if [ -f .env ]; then
  set -a # Automatically export all variables
  source .env
  set +a # Stop automatically exporting
fi

echo "Exporting CodeArchGraph knowledge graph..."
# Default container name from docker-compose.yml is graphiti-mcp-neo4j
# Users can override this with NEO4J_CONTAINER_NAME in .env
NEO4J_CONTAINER_NAME_VAR="${NEO4J_CONTAINER_NAME:-graphiti-mcp-neo4j}"

echo "Attempting to find Neo4j container named '${NEO4J_CONTAINER_NAME_VAR}'..."
CONTAINER_ID=""
RETRY_COUNT=0
MAX_RETRIES=5
RETRY_DELAY=3 # seconds

# Loop to find the container ID, with retries
while [ -z "$CONTAINER_ID" ] && [ "$RETRY_COUNT" -lt "$MAX_RETRIES" ]; do
  if [ "$RETRY_COUNT" -gt 0 ]; then
    echo "Retrying to find container '${NEO4J_CONTAINER_NAME_VAR}' (attempt ${RETRY_COUNT}/${MAX_RETRIES-1})..."
    sleep $RETRY_DELAY
  fi
  # Use anchored regex for exact name match
  CONTAINER_ID=$(docker ps -qf "name=^${NEO4J_CONTAINER_NAME_VAR}$")
  RETRY_COUNT=$((RETRY_COUNT+1))
done

# Export the specific graph for the "rawr-mcp-graphiti" group ID
echo "Found Neo4j container ID for '${NEO4J_CONTAINER_NAME_VAR}': $CONTAINER_ID"

if [ -z "$CONTAINER_ID" ]; then
  echo "Error: Neo4j container '${NEO4J_CONTAINER_NAME_VAR}' not found or not running."
  exit 1
fi

# Get Neo4j image from the running container to ensure version consistency
NEO4J_IMAGE=$(docker inspect $CONTAINER_ID --format '{{.Config.Image}}')
echo "Using Neo4j image: ${NEO4J_IMAGE}"

# Get the Neo4j data volume name mapped to /data in the container
NEO4J_DATA_VOLUME=$(docker inspect $CONTAINER_ID --format '{{range .Mounts}}{{if eq .Destination "/data"}}{{.Name}}{{end}}{{end}}')
if [ -z "$NEO4J_DATA_VOLUME" ]; then
  echo "Error: Could not determine Neo4j data volume for container $CONTAINER_ID."
  exit 1
fi
echo "Using Neo4j data volume: ${NEO4J_DATA_VOLUME}"

TEMP_DUMPER_NAME="neo4j_dumper_temp_$(date +%s)"
DUMP_DIR_IN_TEMP_CONTAINER="/tmp/neo4j_export_in_temp"
DUMP_FILE_IN_TEMP_CONTAINER="${DUMP_DIR_IN_TEMP_CONTAINER}/neo4j.dump"
LOCAL_DUMP_FILE_PATH="./graphiti-data/codearchgraph-knowledge.dump"

echo "Stopping main Neo4j container: $CONTAINER_ID..."
docker stop $CONTAINER_ID
echo "Waiting for container to stop..."
sleep 10

echo "Starting temporary dumper container (${TEMP_DUMPER_NAME}) from image ${NEO4J_IMAGE} with volume ${NEO4J_DATA_VOLUME}..."
# Run the dumper container. It will create the dump and then exit.
docker run \
  -v "${NEO4J_DATA_VOLUME}:/data" \
  --name "${TEMP_DUMPER_NAME}" \
  "${NEO4J_IMAGE}" \
  /bin/sh -c "mkdir -p ${DUMP_DIR_IN_TEMP_CONTAINER} && neo4j-admin database dump neo4j --to-path=${DUMP_DIR_IN_TEMP_CONTAINER} --overwrite-destination=true"

# Check if dump was successful by checking dumper container exit code (though neo4j-admin might not set it reliably on all errors)
# A more robust check would be to see if the dump file exists inside the temporary container before copying.
# For now, we assume success if docker run completes.

echo "Copying dump file from temporary dumper container..."
docker cp "${TEMP_DUMPER_NAME}:${DUMP_FILE_IN_TEMP_CONTAINER}" "${LOCAL_DUMP_FILE_PATH}"

echo "Removing temporary dumper container..."
docker rm "${TEMP_DUMPER_NAME}"

echo "Restarting main Neo4j container: $CONTAINER_ID..."
docker start $CONTAINER_ID
echo "Waiting for main Neo4j container to start..."
# Check health or wait longer. For now, a simple sleep.
# The docker-compose.yml has a healthcheck, so 'docker ps' would show its status.
sleep 20 

echo "Knowledge graph exported successfully to ${LOCAL_DUMP_FILE_PATH}"
# Add a check for file existence
if [ -f "$LOCAL_DUMP_FILE_PATH" ]; then
  echo "Dump file confirmed at $LOCAL_DUMP_FILE_PATH"
else
  echo "Error: Dump file NOT found at $LOCAL_DUMP_FILE_PATH. Export may have failed."
  exit 1
fi
