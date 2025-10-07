#!/bin/bash

# Keploy Recording Script for AutoCrate NX Generator
# This script records API interactions for replay testing

echo "🎬 Starting Keploy Recording Session"
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="autocrate-nx-generator"
APP_PORT=3000
KEPLOY_PORT=16789
DNS_PORT=26789

# Function to check if application is running
check_app_running() {
    echo -e "${YELLOW}Checking if application is running on port $APP_PORT...${NC}"

    if curl -s -o /dev/null -w "%{http_code}" http://localhost:$APP_PORT | grep -q "200"; then
        echo -e "${GREEN}✓ Application is running${NC}"
        return 0
    else
        echo -e "${RED}✗ Application is not running${NC}"
        return 1
    fi
}

# Function to record tests
record_tests() {
    local test_set=$1
    echo -e "\n${YELLOW}Recording test set: $test_set${NC}"

    case $test_set in
        "standard")
            echo "Recording standard crate calculations..."
            docker run --rm \
                --name keploy-recorder \
                -p $KEPLOY_PORT:$KEPLOY_PORT \
                -p $DNS_PORT:$DNS_PORT \
                --network host \
                -v "$(pwd)/keploy-tests:/app/tests" \
                -v "$(pwd)/keploy-mocks:/app/mocks" \
                ghcr.io/keploy/keploy:latest \
                record \
                -c "node scripts/keploy-test-scenarios.js" \
                --path "./keploy-tests/standard" \
                --app-name "$APP_NAME"
            ;;

        "optimization")
            echo "Recording optimization tests..."
            docker run --rm \
                --name keploy-recorder \
                -p $KEPLOY_PORT:$KEPLOY_PORT \
                -p $DNS_PORT:$DNS_PORT \
                --network host \
                -v "$(pwd)/keploy-tests:/app/tests" \
                -v "$(pwd)/keploy-mocks:/app/mocks" \
                ghcr.io/keploy/keploy:latest \
                record \
                -c "curl -X POST http://localhost:$APP_PORT/api/plywood-optimization \
                    -H 'Content-Type: application/json' \
                    -d '{\"panelDimensions\":{\"width\":1000,\"height\":1500}}'" \
                --path "./keploy-tests/optimization" \
                --app-name "$APP_NAME"
            ;;

        "nx-export")
            echo "Recording NX export tests..."
            docker run --rm \
                --name keploy-recorder \
                -p $KEPLOY_PORT:$KEPLOY_PORT \
                -p $DNS_PORT:$DNS_PORT \
                --network host \
                -v "$(pwd)/keploy-tests:/app/tests" \
                -v "$(pwd)/keploy-mocks:/app/mocks" \
                ghcr.io/keploy/keploy:latest \
                record \
                -c "curl -X POST http://localhost:$APP_PORT/api/nx-export \
                    -H 'Content-Type: application/json' \
                    -d '{\"dimensions\":{\"length\":1000,\"width\":800,\"height\":600},\"weight\":300}'" \
                --path "./keploy-tests/nx-export" \
                --app-name "$APP_NAME"
            ;;

        "all")
            echo "Recording all test scenarios..."
            record_tests "standard"
            record_tests "optimization"
            record_tests "nx-export"
            ;;

        *)
            echo -e "${RED}Unknown test set: $test_set${NC}"
            echo "Available sets: standard, optimization, nx-export, all"
            exit 1
            ;;
    esac
}

# Main execution
main() {
    echo "Keploy Test Recording for AutoCrate NX Generator"
    echo "================================================="

    # Check if application is running
    if ! check_app_running; then
        echo -e "${YELLOW}Starting application...${NC}"
        npm run dev &
        sleep 10

        if ! check_app_running; then
            echo -e "${RED}Failed to start application${NC}"
            exit 1
        fi
    fi

    # Create test directories if they don't exist
    mkdir -p keploy-tests/{standard,optimization,nx-export,edge-cases}
    mkdir -p keploy-mocks

    # Get test set from argument or default to all
    TEST_SET=${1:-all}

    # Record tests
    record_tests "$TEST_SET"

    echo -e "\n${GREEN}✓ Recording completed successfully!${NC}"
    echo "Tests saved in: ./keploy-tests/"
    echo "Mocks saved in: ./keploy-mocks/"

    # Generate summary
    echo -e "\n${YELLOW}Test Summary:${NC}"
    find ./keploy-tests -name "*.yaml" | wc -l | xargs echo "Total test cases recorded:"

    echo -e "\n${GREEN}Next steps:${NC}"
    echo "1. Review recorded tests in ./keploy-tests/"
    echo "2. Run tests with: ./scripts/keploy-test.sh"
    echo "3. Generate report with: ./scripts/keploy-report.sh"
}

# Run main function
main "$@"