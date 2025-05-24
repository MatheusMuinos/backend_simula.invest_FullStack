curl --request POST \
  --url http://localhost:3000/log-Simulation \
  --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNzQ4MTA2OTgzLCJleHAiOjE3NDgxMTA1ODN9.WYngQMy_uHiS-fpxR6hqjgc2xL34KtE2OYYWePTedKQ' \
  --header 'Content-Type: application/json' \
  --data '{
    "tipo": "acao",
    "nome": "APPL",
    "valor": 35.50,
    "invest_inicial": 10000,
    "invest_mensal": 1000,
    "meses": 60,
    "inflacao": 0.045
}'