import subprocess

subprocess.run('yarn cache clean', shell=True)
subprocess.run('rm -rf node_modules/ package-lock.json yarn.lock', shell=True)
subprocess.run('rm -rf dist/', shell=True)
subprocess.run('yarn install', shell=True)
subprocess.run('EXPO_NO_METRO_LAZY=true EXPO_ENV=dev yarn expo export --output-dir dist/dev -c -p web', shell=True)
subprocess.run('EXPO_NO_METRO_LAZY=true EXPO_ENV=prod yarn expo export --output-dir dist/prod -c -p web', shell=True)

