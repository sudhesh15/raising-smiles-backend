const express = require('express');
const mongoose = require('mongoose');
const Post = require('./models/Post');
const User = require('./models/User');
const app = express();
require('dotenv').config();
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
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

let ifLoggedIn = false;

const salt = bcrypt.genSaltSync(10);
const secret = "aszxde12we0dsjm3";

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const userDoc = await User.findOne({ username });
  const result = bcrypt.compareSync(password, userDoc.password);
  if (result) {
    jwt.sign({ username, id: userDoc._id }, secret, {}, (err, token) => {
      if (err) throw err;
      res.cookie('token', token, { httpOnly: true }).json({
        id: userDoc._id,
        username,
      });
      ifLoggedIn = true;
      console.log("USER LOGGED IN", ifLoggedIn)
    });
  } else {
    res.status(400).json('wrong credentials');
  }
});

app.post('/logout', (req, res) => {
  ifLoggedIn = false;
  res.clearCookie('token');
  res.status(200).json('Logged out successfully');
});

app.post('/post', async (req,res) => {
  if(ifLoggedIn){
    const {imageURL, postHeading, postDetails} = req.body;
    const postNewsDetails = await Post.create({imageURL, postHeading, postDetails});
    res.json(postNewsDetails);
  }
});

app.put('/post', async (req,res) => {
  if(ifLoggedIn){
    await Post.findByIdAndUpdate(req.body.id, {
    imageURL : req.body.imageURL,
    postHeading : req.body.postHeading,
    postDetails : req.body.postDetails,
    });
  }
});

//viewAllNews is to NEWS PAGE
app.get('/viewAllNews', async (req,res) => {
  console.log("ifLoggedIn viewAllNews  1-->", ifLoggedIn)
  res.json(
    await Post.find()
      .sort({createdAt: -1})
  );
});

//getAllNews is for ADMIN
app.get('/getAllNews', async (req,res) => {
  if(ifLoggedIn){
    res.json(
      await Post.find()
        .sort({createdAt: -1})
    );
  }
});

app.get('/news/:id', async (req, res) => {
  if(ifLoggedIn){
    const {id} = req.params;
    const newsInfo = await Post.findById(id);
    res.json(newsInfo);
  }
});

app.delete('/deleteNews/:id', async (req, res) => {
  if(ifLoggedIn){
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
  }
});

app.listen(PORT, () => {
    console.log(`Server Started at ${PORT}`)
})