const mongoose = require('mongoose');
const {Schema,model} = mongoose;

const PostSchema = new Schema({
  imageURL:String,
  postHeading:String,
  postDetails:String
}, {
  timestamps: true,
});

const PostModel = model('Post', PostSchema);

module.exports = PostModel;