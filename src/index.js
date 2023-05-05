const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  // Checks if user account exists based on username
  const { username } = request.headers;

  const userToBeFound = users.find((user) => username === user.username);

  if (!userToBeFound) {
    return response.status(404).json({ error: "User not found." });
  }

  request.user = userToBeFound;

  return next();
}

app.post("/users", (request, response) => {
  // Create new user
  const { name, username } = request.body;

  const checkIfUserExists = users.find((user) => user.username === username);

  if (checkIfUserExists) {
    return response.status(400).json({ error: "User already exists" });
  }

  const newUser = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  };

  users.push(newUser);

  return response.status(201).json(newUser);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  // Gets user todolist
  const { user } = request;

  return response.json(user.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  // Creates new todo to user list
  const { title, deadline } = request.body;
  const { user } = request;

  const newTodo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  user.todos.push(newTodo);

  return response.status(201).json(newTodo);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  // Changes title and deadline of one user todo
  const { user } = request;
  const { title, deadline } = request.body;
  const { id } = request.params;

  const todo = user.todos.find((todo) => {
    return todo.id === id;
  });

  if (!todo) {
    return response.status(404).json({ error: "Todo not found" });
  }

  todo.title = title;
  todo.deadline = new Date(deadline);

  return response.status(201).json(todo);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  // Changes one user todo to done
  const { user } = request;
  const { id } = request.params;

  const todo = user.todos.find((todo) => {
    return todo.id === id;
  });

  if (!todo) {
    return response.status(404).json({ error: "Todo not found" });
  }

  todo.done = true;

  return response.status(201).json(todo);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  // Deletes the todo that matches the id of route params
  const { user } = request;
  const { id } = request.params;

  const todo = user.todos.findIndex((todo) => todo.id === id);

  if (todo === -1) {
    return response.status(404).json({ error: "Todo not found" });
  }

  user.todos.splice(todo, 1);

  return response.status(204).send();
});

module.exports = app;
