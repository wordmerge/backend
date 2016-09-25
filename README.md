# WordMerge (Backend)
> Backend for the WordMerge application

WordMerge is a mobile game where users engagingly try to merge together on a word based upon the clues of their previously uttered words. Behind the scenes, the application builds an ever-persistent graph of words along with their semantic relationships and connections - much like SyntaxNet, but with crowd-sourced data.

## Running the Application

To run the backend, provided you have [Docker](https://www.docker.com/) and [Docker-Compose](https://docs.docker.com/compose/) installed, fill out your environment variables on the `.env` file (using the `.env_sample` file as a guideline), simply run `docker-compose build` and `docker-compose up`. Also make sure to install application dependencies using `npm install`!

## Tech Stack
WordMerge's backend is powered by the following technologies
* **Docker** for environment containerization
* **Postgres** relational database (for storing relational data)
* **Neo4J** Graph Database (for storing word relationships as well as being able to query into such relationships)
* **NodeJS** for the backend application logic
  * **Express** for HTTP-based routes
  * **Socket.IO** for WebSocket-based routes
  
## Routes
There are 2 types of routes - HTTP-based routes for synchronous request-response based messages and Websocket-based routes for asynchronous publish-subscribe based messages.

* **HTTP Routes** - 
  The following routes offer the synchronous request-response based functionality for the backend. All sent and received payloads are encoded in JSON.
  
  1. `POST /auth/login`
    * Accepts `{username:string, password:string}`
    * Returns 
      * `{status:200, message:string, auth_token:string}`
      * `{status:400, message:string}`

  2. `POST /auth/signup`
    * Accepts `{email:string, username:string, password:string, image_url:string}`
    * Returns
      * `{status:200, message:string}`
      * `{status:400, message:string}`

  3. `POST /room/create`
    * Accepts `{auth_token:string, game_mode:string}`
    * Returns 
      * `{status:200, message:string, room_id:string}`
      * `{status:400, message:string}`

  4. `POST /room/join_specific`
    * Accepts `{auth_token:string, room_id:string}`
    * Returns
      * `{status:200, message:string}`
      * `{status:400, message:string}`
  
  5. `POST /room/join_random`
    * Accepts `{auth_token:string, game_mode:string?}`
    * Returns
      * `{status:200, message:string, room_id:string}`
      * `{status:400, message:string}`
  
  6. `POST /room/leave`
    * Accepts `{auth_token:string, room_id:string}`
    * Returns
      * `{status:200, message:string}`
      * `{status:400, message:string}`

* **Websocket Routes** - 
  The following websocket flow offer the asynchronous publish-subscribe based functionality for the backend. All sent and received payloads are encoded in JSON.
  
  1. Client-side driven events (sent by the client, received by the server)
    * `{type:'user_joined', auth_token:string, room_id:string}`
    * `{type:'user_left', auth_token:string}`
    * `{type:'user_typing', auth_token:string}`
    * `{type:'say_word', auth_token:string, word:string, parent1:string, parent2:string, duration:int, halt:boolean, created_at:timestamp}`
  
  2. Server-side driven events (received by the client, sent by the server)
    * `{type:'room_ready', other_user:{username:string, image:string}}`
    * `{type:'said_word', other_user:{username:string,
    image:string}, word:string}`
    * `{type:'user_typed', other_user:{username:string, image:string}}`
    * `{type:'game_ended'}`
    
## Relational Entities
The following represents the entities as stored on our relational database:

  * **users**: user_id:serial, username:varchar, email:varchar, password:varchar, created_at:timestamp
    * primary_key: user_id    
  * **rooms**: room_id:varchar, game_mode:string, created_at:timestamp, destroyed_at:timestamp
    * primary_key: room_id
  * **room_words**: room_id:rooms/room_id, user_id:users/user_id, word:varchar, parent1:varchar, parent2:varchar, duration:int, halt:boolean, created_at:varchar
    * primary_key: [room, user, word]
  * **room_users**: room:rooms/room_id, user:users/user_id, entered_at:timestamp, left_at:timestamp
    * primary_key: [room, user]
