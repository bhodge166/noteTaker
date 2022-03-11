const express = require("express");
const db = require("./db/db.json");
const app = express();
const path = require("path");
const { randomUUID } = require("crypto");
const fs = require("fs");
const PORT = 3001;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static("public"));

app.get("/", (req, res) => res.sendFile(path.join(__dirname, "index.html")));

app.get("/notes", (req, res) =>
  res.sendFile(path.join(__dirname, "public/notes.html"))
);

app.get("/api/notes", (req, res) => {
  fs.readFile("./db/db.json", "utf8", (err, data) => {
    if (err) {
      console.log(err);
    } else {
      const readNotes = JSON.parse(data);
      res.json(readNotes);
    }
  });
});

app.post("/api/notes", (req, res) => {
  console.info(`${req.method} request received`);
  const { title, text } = req.body;

  if (title && text) {
    const newNote = {
      title,
      text,
      id: randomUUID(),
    };

    fs.readFile("./db/db.json", "utf-8", (err, data) => {
      if (err) {
        console.error(err);
      } else {
        const parsedNotes = JSON.parse(data);
        parsedNotes.push(newNote);

        fs.writeFile("./db/db.json", JSON.stringify(parsedNotes), (err) => {
          if (err) {
            console.err(err);
          } else {
            console.info("Successfully updated notes");
          }
        });
      }
    });
    const response = {
      status: "success",
      body: newNote,
    };

    console.log(response);
    res.json(response);
  } else {
    res.json("Error posting note");
  }
});

app.delete("/api/notes/:id", (req, res) => {
  const requestedDelete = req.params.id;
  for (let i = 0; i < db.length; i++) {
    if (requestedDelete === db[i].id) {
      db.splice(i, 1);
      fs.writeFile("./db/db.json", JSON.stringify(db), (err) => {
        if (err) {
          console.err(err);
        } else {
          console.info("file rewritten");
        }
      });
    }
  }
  res.json("Note successfuly deleted");
});

app.listen(PORT, () => {
  console.log(`App listening at http://localhost:${PORT}`);
});
