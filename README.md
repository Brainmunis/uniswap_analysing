To start the project do following steps

pre-requisites

1 - docker and docker compose installed


To Start the project

1 - sudo docker-compose build

2 - sudo docker-compose up

3 - execute API to sync postgress sql tables 
  - POST - "http://localhost:5000/api/setup/sync"
  - Above API do following things
    1 - sync all tables
    2 - add sample 3 pairs in pools table

Till this step our server should up and running on 5000 port and tables should synced

4 - You can start indexes the events into database using this API 
    POST - http://localhost:5000/api/pools/refresh/1 - 
    body - { fromBlock : 10000, poolId : 1 }
    Explaination 
      - poolId -> earlier we have added sample 3 pairs in pools table. 
        So in pools table 3 pairs will represent as their unique id as 1,2,3

5 - We can track the record of ongoing indexes using below API 
  - GET - http://localhost:5000/api/pools/refresh/stats?poolId=1

6 - To see all list of available pools ( tokens pairs) use this API 
  - GET - http://localhost:5000/api/pools/lists

7 - once all the events are indexed inside database then you can use transaction filter 
    API to filter data based on below filter 
    "Transactions filtered by added/removed, date/time, user address"

    - GET - http://localhost:5000/api/pools/transaction/filter?poolId=1
    
    - query params - {
        poolId - mandotory field -> indicates for which pool you want to see data
        status : "add" or "remove" -> to filter transactions by added/removed
        fromDate : pass timezone date to see transaction from to that date 
        user_address : pass transaction user address to filter transaction by user_address,
    }

8 - We can check status of the event indexes in db using below API
  - GET - http://localhost:5000/api/pools/refresh/stats?poolId=1


9 - You can also get pool status using below API
  - GET - http://localhost:5000/api/pools/status?poolId=1
