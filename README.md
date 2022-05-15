To start the project do following steps

pre-requisites

1 - postgress sql running
2 - nodejs 14 version running
3 - postgress database with sample user
4 - add database and user details inside ".env.local"


To Start the project

1 - run command -> npm run dev 

2 - execute API to sync postgress sql tables - POST - "http://localhost:3000/api/setup/sync"

3 - all set you can start indexes the events into database using this API - POST - http://localhost:3000/api/pools/refresh/1 - body - { fromBlock : 10000, poolId : 1 }


4 - you can tract the events indexing status inside db using below API - GET - http://localhost:3000/api/pools/refresh/stats?poolId=1

5 - to see all list of available pools ( tokens pairs) use this API - GET - http://localhost:3000/api/pools/lists

6 - once all the events are indexed inside database then you can use transaction filter API to filter data based on below filter "Transactions filtered by added/removed, date/time, user address"
body - {
 poolId - mandotory field -> indicates for which pool you want to see data
 status : "add" or "remove" -> to filter transactions by added/removed
 fromDate : pass timezone date to see transaction from to that date 
 user_address : pass transaction user address to filter transaction by user_address,
}
