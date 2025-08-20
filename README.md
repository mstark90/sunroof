# Sunroof

Sunroof is an open-source project for turning a Raspberry Pi connected to a TV into a smart calendar for your family. Right now, it's in its infancy and I hope to expand on it more. It's built with a Swift backend and a React front-end and runs on Docker for ease of installation. I recommend at least using a Raspberry Pi 4 for the best performance.

## Running

For now, you can clone this repository onto the Raspberry Pi (or other device) you want to run this on and create a .env file from the sample file. You will then run the following commands to get started:

```
cd sunroof-ui/
npm i
npm run build
cd ..
docker compose --env-file .env build
docker compose --env-file .env run migrate
docker compose --env-file .env up -d ui
```
