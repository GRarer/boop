# runs linters for backend, frontend, and core packages
cd "$(cd "$(dirname "${BASH_SOURCE[0]}")" ; pwd -P)"

for d in backend frontend core; do
    cd "$d"
    npm run lint
    cd -
done
