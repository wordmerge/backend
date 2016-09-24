# WordMerge (Backend)
> Backend for the WordMerge application

WordMerge is a mobile game where users engagingly try to merge together on a word based upon the clues of their previously uttered words. Behind the scenes, the application builds an ever-persistent graph of words along with their semantic relationships and connections - much like SyntaxNet, but with crowd-sourced data.

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

  3. `POST /room/create_specific`
    * Accepts `{auth_token:string}`
    * Returns 
      * `{status:200, message:string, room_id:string}`
      * `{status:400, message:string}`

  4. `POST /room/join_specific`
    * Accepts `{auth_token:string, room_id:string}`
    * Returns
      * `{status:200, message:string}`
      * `{status:400, message:string}`
  
  5. `POST /room/join_random`
    * Accepts `{auth_token:string}`
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
    * `{event:'user_typing', auth_token:string}`
    * `{event:'say_word', auth_token:string, word:string}`
  
  2. Server-side driven events (received by the client, sent by the server)
    * `{event:'room_ready', other_user:{username:string, image:string}}`
    * `{event:'user_typed', other_user:{username:string, image:string}}`
    * `{event:'heard_word', word:string}`
    * `{event:'wordmerge'}`
    
## Relational Entities
The following represents the entities as stored on our relational database

  * **users**: user_id:int, username:varchar, email:varchar, password:varchar, created_at:timestamp
    * primary_key: user_id
    
  * **rooms**: room_id:int, created_at:timestamp, destroyed_at:timestamp
    * primary_key: room_id
    
  * **room_words**: room:rooms/room_id, user:users/user_id, word:varchar, parent1:varchar, parent2:varchar, created_at:varchar, duration:int, halt:boolean
    * primary_key: [room, user, word]
    
  * **room_users**: room:rooms/room_id, user:users/user_id, entered_at:timestamp, left_at:timestamp
    * primary_key: [room, user]
