rm -rf node_modules/ package-lock.json
rm -rf dist/
npm install
EXPO_NO_METRO_LAZY=true npx expo export -c -p web