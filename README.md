# arxivum-api
This repository contains the different modules of the backend of the Arxivum project.

The arxivum project is a final degree project that solves download efficiency by adding webtorrent to share private files, in a platform where users can only register after invitation of the administrator.

In order to have a distributed system like webtorrent to share our files, this backend contains 3 different modules:
- API that stores the information and files
- Tracker to find other connected peers
- Webseed to serve as first seed of the file, in case no one else is connected.

The webseed is a public HTTP server, so the files are AES-256 encrypted in the backend for distribution. Only users with a valid access key (registered users) can get the key to decrypt the files when downloading to disk or streaming.

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

## Testing
