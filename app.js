//jshint esversion:6
//enable-npm

var favicon = require('serve-favicon');

app.use(favicon(__dirname + '/public/favicon.ico'));

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose')
const _=require('lodash')

const app = express();

app.set('view engine', 'ejs');

app.use(express.urlencoded({
  extended: true
}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://zakirjan-admin:Develop17ment01@cluster0.t1yse.mongodb.net/todolistDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true
})

const itemsScheme = new mongoose.Schema({
  name: String
})
const Item = mongoose.model("Item", itemsScheme);

const item1 = new Item({
  name: "Welcome to your todo list page!"
});
const item2 = new Item({
  name: "Press + button to add todos"
});
const item3 = new Item({
  name: "<-- Hit this to delete item"
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsScheme]
}

const List = mongoose.model("List", listSchema);

app.get("/", function (req, res) {

  Item.find({}, function (err, foudItems) {

    if (err) {
      console.log(err)
    } else if (foudItems.length === 0) {
      Item.insertMany(defaultItems, function (err) {
        console.log("3 Starting items added succesfully to DB!");
      })
      res.redirect("/")
    } else {
      res.render("list", {
        listTitle: "Today",
        newListItems: foudItems
      });
    }
  })
});

app.get("/:customListName", function (req, res) {
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({
    name: customListName
  }, function (err, foundList) {
    if (!err) {
      if (!foundList) {
        const list = new List({
          name: customListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/" + customListName)
      } else {
        res.render("list", {
          listTitle: foundList.name,
          newListItems: foundList.items
        });
      }
    }
  })

})

app.post("/", function (req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.list;

  item = new Item({
    name: itemName
  })

  if (listName === "Today") {
    item.save()
    res.redirect("/");
  } else {
    List.findOne({name: listName}, function (err, foundList) {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+ listName);
    })
  }


});

app.post("/delete", function (req, res) {
  const checkedById = req.body.checkbox;
  const listName= req.body.listName;

  if(listName === "Today"){
    Item.findByIdAndRemove(checkedById, function (err) {
      if (!err) {
        console.log("deleted successfully");
        res.redirect("/")
      }
    })
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items:{_id:checkedById}}}, function(err, foundList){
      if(!err){
        res.redirect("/"+ listName)
      }
    })
  }
  
})


app.get("/about", function (req, res) {
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function () {
  console.log("Server started successfully");
});
