const express = require("express");
const path = require("path");
const URL = require("./models/url");
const staticRoute = require("./routes/staticRouter");
const { connectToMongoDB } = require("./connect");
const app = express();
const urlRoute = require("./routes/url");
const PORT = 8001;

connectToMongoDB("mongodb://127.0.0.1:27017/url_shortener").then(() =>
  console.log("MongoDB Connected")
);

app.set("view engine", "ejs");

app.set("views", path.resolve("./views"));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/url", urlRoute);
app.use("/", staticRoute);

app.get("/:shortId", async (req, res) => {
  const shortId = req.params.shortId;
  const entry = await URL.findOneAndUpdate(
    {
      shortId,
    },
    {
      $push: {
        visitHistory: {
          timestamp: Date.now(),
        },
      },
    }
  );

  if (entry !== null && entry.redirectURL !== undefined) {
    res.redirect(entry.redirectURL);
  } else {
    res.send("Invalid shortId");
  }
});

app.listen(PORT, () => {
  console.log("Server started at Port 8001");
});
