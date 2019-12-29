const mongoose = require("mongoose");

const ImageSchema = mongoose.Schema({
  imageID: String,
  imageURL: String,
  attributes: [Number]
});

module.exports = ImageSchema;
