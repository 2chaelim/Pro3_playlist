const express = require("express");
const app = express();

const methodOverride = require("method-override");
app.use(methodOverride("_method"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");
app.use("/public", express.static("public"));

const { MongoClient, ObjectId } = require("mongodb");
const url =
  "mongodb+srv://charry8540:dlcofla0524@cluster0.ehmp7bh.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(url);

async function main() {
  try {
    await client.connect();
    const postCollection = client.db("playlist").collection("post");
    const counterCollection = client.db("playlist").collection("counter");
    const cateCollection = client.db("playlist").collection("category");
    console.log("서버에 연결됐다");

    //GET
    app.get("/", async (req, res) => {
      const list = cateCollection.find({});
      const result2 = await list.toArray();
      const cursor = postCollection.find({});
      const result = (await cursor.toArray()).sort().reverse();
      res.render("list_re.ejs", { post: result, post2: result2 });
    });

    app.get("/write_re", (req, res) => {
      res.render("write_re.ejs");
    });

    app.get("/detail/:id", async function (req, res) {
      const result = await postCollection.findOne({
        _id: parseInt(req.params.id),
      });
      const cursor = postCollection.find({});
      const result2 = (await cursor.toArray()).sort().reverse();
      res.render("detail.ejs", { data: result, data2: result2 });
    });

    app.get("/edit/:id", async function (req, res) {
      const result = await postCollection.findOne({
        _id: parseInt(req.params.id),
      });
      res.render("edit.ejs", { post: result });
    });

    //POST
    app.post("/add", async function (req, res) {
      const { title, artist, date } = req.body;
      const { totalcounter } = await counterCollection.findOne({
        name: "count",
      });
      await postCollection.insertOne({
        _id: totalcounter + 1,
        postTitle: title,
        postDate: date,
        postArtist: artist,
      });
      await counterCollection.updateOne(
        { name: "count" },
        { $inc: { totalcounter: 1 } }
      );
      res.redirect("/");
    });

    // DELETE
    app.delete("/delete", async function (req, res) {
      req.body._id = parseInt(req.body._id);
      await postCollection.deleteOne(req.body);
      res.status(200).send();
    });

    //PUT
    app.put("/edit", async (req, res) => {
      const { id, title, date } = req.body;
      await postCollection.updateOne(
        { _id: parseInt(id) },
        { $set: { postTitle: title, postDate: date } }
      );
      console.log("수정완료");
      res.redirect("/");
    });
  } finally {
    console.log("마무리");
  }
}

main().catch(console.dir);

app.listen(8080);
