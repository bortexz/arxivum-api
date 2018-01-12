# Arxivum Backend
This repository contains the different modules of the backend of the Arxivum project.

The arxivum project is a final degree project that solves download efficiency by adding webtorrent to share private files, in a platform where users can only register after invitation of the administrator.

In order to have a distributed system like webtorrent to share our files, this backend contains 3 different modules:
- API that stores the information and files
- Tracker to find other connected peers
- Webseed to serve as first seed of the file, in case no one else is connected.

The webseed is a public HTTP server, so the files are AES-256 encrypted in the backend for distribution. Only users with a valid access key (registered users) can get the key to decrypt the files when downloading to disk or streaming.

## Technologies
The three modules are using Node.js, requiring version >8 for the API and the webseed,
as they use async/await features.

The API uses [koa@2](https://github.com/koajs/koa) as a framework, with [Mongoose](https://github.com/Automattic/mongoose) to connect to a MongoDB database.

The webseed uses koa@2 with [koa-range](https://github.com/koajs/koa-range)

## Deploy from docker images
Links:
- Tracker https://hub.docker.com/r/albertoferbcn/arxivum-tracker/
- API https://hub.docker.com/r/albertoferbcn/arxivum-api/
- Webseed https://hub.docker.com/r/albertoferbcn/arxivum-webseed/

These images are configured via enviroment variables. These are the variables
that each one accepts:
- **Api**
  - NODE_ENV: prod, dev, ... Use prod for production environments
  - PUBLIC_URL: The url where the frontend will be accessed
  - DATABASE_URL: MongoDB database where to connect
  - ADMIN_EMAIL: The admin user is created on startup using this email
  - ADMIN_PASSWORD: Password of the admin user at the moment of creation
  - JWT_SECRET: A secret to sign the authentication tokens.
  - WEBSEED_FOLDER: Root folder of the files. Use /app/files by default
  - PUBLIC_API_URL: Public URL to access this API
  - PUBLIC_TRACKER_URL: Public URL of the tracker
  - PUBLIC_WEBSEED_URL: Public URL of the webseed
  - EMAILER_PORT: Al emailer options are to connect nodemailer. Port of email service
  - EMAILER_HOST: SMTP host
  - EMAILER_PUBLIC_EMAIL: Public email
  - EMAILER_AUTH_USER: Authentication user
  - EMAILER_AUTH_PASSWORD: Authentication password

- **Tracker**

The tracker does not need to configure any environment variable
- **Webseed**

The webseed foes not need any environment variable, but it needs to share a volume with the
API for the files. The /app/files folder is the default folder where files will go inside
both of the modules. Make sure these folders point to the same volume on disk.

## Deploy from source code (Not recommended)
Each of the modules has a npm script to start it automatically (`start-api`, `start-tracker` and `start-webseed`). You can also use the index on the root of the repository, it is a simple implementation of a reverse proxy to use during development. It is recommended to use something like [nginx](https://www.nginx.com/) for production proxy of the different modules.

## Testing
Run `npm test`. Make sure you have a MongoDB instance running on localhost.

## License

Copyright 2017 Alberto Fernandez

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
