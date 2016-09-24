CREATE TABLE users (
  user_id int NOT NULL UNIQUE,
  username varchar(30) NOT NULL,
  password varchar(100) NOT NULL,
  email varchar(100) NOT NULL,
  created_at timestamp NOT NULL,
  PRIMARY KEY (user_id)
);

CREATE TABLE rooms (
  room_id int NOT NULL UNIQUE,
  created_at timestamp NOT NULL,
  destroyed_at timestamp NOT NULL,
  PRIMARY KEY (room_id)
);

CREATE TABLE room_words (
  room_id int NOT NULL REFERENCES rooms (room_id),
  user_id int NOT NULL REFERENCES users (user_id), 
  word varchar(12) NOT NULL,
  parent1 varchar(12),
  parent2 varchar(12),
  duration int NOT NULL,
  halt boolean,
  created_at timestamp NOT NULL,
  PRIMARY KEY (room_id, user_id, word),
  UNIQUE (room_id, user_id, word)
);

CREATE TABLE room_users (
  room_id int NOT NULL REFERENCES rooms (room_id),
  user_id int NOT NULL REFERENCES users (user_id),
  entered_at timestamp NOT NULL,
  left_at timestamp,
  PRIMARY KEY (room_id, user_id),
  UNIQUE (room_id, user_id)
);
