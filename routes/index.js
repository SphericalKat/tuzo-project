const express = require("express");
const _ = require("lodash");
const { check, validationResult } = require("express-validator");
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

router.get("/getImages", (req, res) => {
  if (req.session.images) {
    let images = req.session.images;
    if (images.length > 5) {
      // only enter if we have sufficient images
      let imageArr = [];

      for (var i = 0; i < 5; i++) {
        const index = Math.floor(Math.random() * images.length); // get a random index
        imageArr[i] = images[index]; // add image at random index to return array
        images.splice(index, 1); // remove this image from original image array
      }

      req.session.images = images;
      req.session.count++;
      req.session.currImages = imageArr;
      return res.status(200).send({
        images: imageArr,
        count: req.session.count
      });
    }
  } else {
    Image.find({}, (err, results) => {
      if (err != null) {
        console.log(err);
        return;
      }
      let images = results;
      if (images.length > 5) {
        // only enter if we have sufficient images
        let imageArr = [];

        for (var i = 0; i < 5; i++) {
          const index = Math.floor(Math.random() * images.length); // get a random index
          imageArr[i] = images[index]; // add image at random index to return array
          images.splice(index, 1); // remove this image from original image array
        }

        req.session.images = images;
        req.session.count = 1;
        req.session.currImages = imageArr;
        return res.status(200).send({
          images: imageArr,
          count: req.session.count
        });
      }
    });
  }
});

router.post(
  "/setResults",
  [
    // validate incoming image results
    check("results")
      .isArray({ min: 5, max: 5 })
      .bail(),
    check("results.*")
      .isIn([1, 2, 3, 4, 5])
      .bail()
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).send({ errors: errors.array() });
    }

    if (!req.session.currImages) {
      return res.status(404).send({
        message: "You have not requested any images yet"
      });
    }

    if (!req.session.virtImage) {
      req.session.virtImage = _.fill(Array(50), 0);
    }

    for (var i = 0; i < req.session.currImages.length; i++) {
      const multFactor = req.body.results[i] / 5; // get multiplication factor out of 5

      // get running total of current image
      const runTotal = req.session.currImages[i].attributes.map(
        attr => attr * multFactor
      );

      // add running total to virtual image
      req.session.virtImage = req.session.virtImage.map(
        (num, idx) => (num += runTotal[idx])
      );

      if (req.session.count === 5) {
        req.session.done = true;
      }
    }

    return res.status(200).send({ message: "Successfully set results" });
  }
);

router.get("/getVirtImage", (req, res) => {
  if (!req.session.virtImage) {
    return res.status(404).send({ message: "You haven't set any results yet" });
  }

  if (!req.session.done) {
    return res
      .status(404)
      .send({ message: "You haven't completed 25 images yet" });
  }

  req.session.virtImage = req.session.virtImage.map(num => num / 25);

  return res.status(200).send({ virt_image: req.session.virtImage });
});

module.exports = router;
