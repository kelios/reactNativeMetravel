import subprocess

subprocess.run('yarn cache clean', shell=True)
subprocess.run('rm -rf node_modules/ package-lock.json yarn.lock', shell=True)
subprocess.run('rm -rf dist/', shell=True)
subprocess.run('yarn install', shell=True)
subprocess.run('EXPO_NO_METRO_LAZY=true yarn export:dev --output-dir dist/dev -c -p web', shell=True)
subprocess.run('EXPO_NO_METRO_LAZY=true yarn export:prod --output-dir dist/prod -c -p web', shell=True)

