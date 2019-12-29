const express = require("express");
const csv = require("csv-parser");
const mongoose = require("mongoose");
const imageSchema = require("../model/images_schema");
const Image = mongoose.model("Image", imageSchema);
const fs = require("fs");
const router = express.Router();

router.get("/", (req, res) => {
  res.send({
    result: "Success"
  });
});

router.get("/getImages", (req, res) => {});

router.post("/loadCSV", (req, res) => {
  fs.createReadStream("data.csv")
    .pipe(csv())
    .on("data", element => {
      // iterate over csv rows
      let image = new Image(); // declare image instance
      let attrs = []; // image attributes

      // iterate over all keys of row
      for (var prop in element) {
        if (element.hasOwnProperty(prop)) {
          // don't iterate over unwanted props
          switch (prop) {
            case "image_id":
              image.imageID = element[prop];
              continue;
            case "image_url":
              image.imageURL = element[prop];
              continue;
            default:
              attrs.push(element[prop]);
          }

          image.attributes = attrs;
          // save image to db
          image.save().catch(err => console.log);
        }
      }
    });

  res.status(200).send({
    err: null,
    message: "CSV file successfully pushed to db"
  });
});

module.exports = router;
