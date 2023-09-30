const express = require('express');
const mongoose = require('mongoose');
const Post = require('./models/Post');
const User = require('./models/User');
const app = express();
require('dotenv').config();
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { ObjectId } = require('mongodb');

const PORT = process.env.PORT || 4000;
const BASE_URL = process.env.BASE_URL;
const MONGO_URL = process.env.MONGO_URL;

app.use(cors({credentials:true, origin: `${BASE_URL}`}));
app.use(express.json());
app.use(cookieParser());

mongoose.connect(MONGO_URL);
const database = mongoose.connection
database.on('error', (error) => {
  console.log(error)
})
database.once('connected', () => {
  console.log('Database Connected');
})

app.post('/post', async (req,res) => {
  const {imageURL, postHeading, postDetails} = req.body;
  const postNewsDetails = await Post.create({imageURL, postHeading, postDetails});
  res.json(postNewsDetails);
});

app.put('/post', async (req,res) => {
  await Post.findByIdAndUpdate(req.body.id, {
    imageURL : req.body.imageURL,
    postHeading : req.body.postHeading,
    postDetails : req.body.postDetails,
  });
});

//viewAllNews is to NEWS PAGE
app.get('/viewAllNews', async (req,res) => {
  res.json(
    await Post.find()
      .sort({createdAt: -1})
  );
});

//getAllNews is for ADMIN
app.get('/getAllNews', async (req,res) => {
  res.json(
    await Post.find()
      .sort({createdAt: -1})
  );
});

app.get('/news/:id', async (req, res) => {
  const {id} = req.params;
  const newsInfo = await Post.findById(id);
  res.json(newsInfo);
});

app.delete('/deleteNews/:id', async (req, res) => {
  const id = req.params.id;
    try {
      const result = await Post.deleteOne({ _id: new ObjectId(id) });
      if (result.deletedCount > 0) {
        res.status(200).json({ message: 'News deleted successfully' });
      } else {
        res.status(404).json({ error: 'News not found' });
      }
    } catch (err) {
      console.error('Error deleting News:', err);
      res.status(500).json({ error: 'Failed to delete the News' });
    }
});

app.listen(PORT, () => {
    console.log(`Server Started at ${PORT}`)
})