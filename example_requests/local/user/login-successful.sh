curl --request POST \
  --url http://localhost:3000/login \
  --header 'Content-Type: application/json' \
  --data '{
    "username": "newuser",
    "password": "ValidPass123"
}'