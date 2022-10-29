# Auth0 - machine-to-machine demo

Update the values in /client_service/.env and  /resource_service/.env

```
cd client_service
npm i
npm run start

cd ../resource_service
npm i
npm run start
```

http://localhost:3000

## Test auth

If you hit the url above you should get "You are authenticated".

If you comment out the "Authorization" header in the client you should get "Unauthorized".
