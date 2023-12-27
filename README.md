<h1 align="center">Sun Home API</h1>

Project uses [NestJS](https://nestjs.com/) and [Typeorm](https://typeorm.io/).

## 📦 General Information

```bash
- Node version: v21.1.0
```

## 📦 Docker Container

```bash
# Create or run docker container
$ docker-compose up
```

## 📦 Migration

```bash
Run migration

# Use npm
$ npm run migrate:up

Down migration

# Use npm
$ npm run migrate:down

-----------------or-----------------

# Use yarn
$ yarn migrate:up

Down migration

# Use npm
$ yarn migrate:down
```

## 📦 Install & Run

```bash
# Use npm
Install package
$ npm install

Run
$ npm run start:dev

-----------------or-----------------

# Use yarn
Install package
$ yarn install
Run
$ yarn start:dev
```

## 🔨 Build

```bash
# Use npm
$ npm install
$ npm run build

# Use yarn
$ yarn install
$ yarn build
```

For project initialization, create environment-specific files such as `development.env`, `staging.env`, or `production.env` in `src/config/environments`. Please adhere to the format outlined in the `sample.env` file.
