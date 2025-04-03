#!/bin/bash

set -e

function apply_env() {
  ENV=$1

  if [ "$ENV" != "dev" ] && [ "$ENV" != "prod" ] && [ "$ENV" != "preprod" ]; then
    echo "❌ Укажи dev, preprod или prod"
    exit 1
  fi

  echo "📦 Применяю .env.$ENV → .env"
  cp .env.$ENV .env
}

function clean_all() {
  echo "🧹 Чищу проект..."
  rm -rf node_modules yarn.lock package-lock.json dist
  echo "📦 Устанавливаю зависимости..."
  yarn install
}

function build_env() {
  ENV=$1
  DIR="dist/$ENV"

  echo "🚀 Сборка для $ENV → $DIR"
  apply_env $ENV
  EXPO_ENV=$ENV EXPO_NO_METRO_LAZY=true npx expo export --output-dir $DIR -p web -c
  echo "✅ Готово: $DIR"
}

echo "🔁 Старт полной сборки..."

clean_all

build_env dev
build_env preprod
build_env prod

echo "🎉 Сборка завершена успешно!"
