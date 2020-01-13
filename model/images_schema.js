const mongoose = require("mongoose");

const ImageSchema = mongoose.Schema({
  imageID: String,
  imageURL: String,
  attributes: [Number],
  distance: Number
});

module.exports = ImageSchema;
