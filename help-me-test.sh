set -e
set -u

function runNpmTest() {
  echo "🧪 $1"
  npm run $1

}
runNpmTest "test:service"

runNpmTest "test:e2e"

runNpmTest "test:vc-athumi"
