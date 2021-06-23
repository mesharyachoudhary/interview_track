const express = require('express');
const bcrypt = require('bcryptjs')
const router = express.Router(); // to use route module of express.
const passport = require('passport');
const Topic = require('../models/Topics');
const Question = require('../models/Questions');
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');

router.get('/', ensureAuthenticated,async (req,res)=>{
    let searchOptions = {}
  if (req.query.name != null && req.query.name !== '') {
    searchOptions.name = new RegExp(req.query.name, 'i')
  }
    try{
        const topics = await Topic.find(searchOptions).sort({name:'asc'});
        const question = new Question()
        res.render('topiclist',{
            topics:topics,
            searchOptions: req.query,
            question:question,
            user:req.user
        });
    }
    catch{
        res.redirect('/');
    }
});

router.get('/:id', ensureAuthenticated,async (req, res) => {
  try {
    const topic = await Topic.findById(req.params.id)
    const questions = await Question.find({ topics: topic.id }).sort({name:'asc'}).exec()
    res.render('questionlist', {
      topic:topic,
      questionbytopic: questions,
      user:req.user
    })
  } catch {
    res.redirect('/')
  }
})

router.post('/', async (req,res)=>{
  const question = new Question({
    name: req.body.name,
    linkto: req.body.link,
    topics: req.body.topic
  })
  try{
    const newQuestion = await question.save()
    
    if(1)
    {
      req.flash('success_msg','Question is sent for approval !');
      res.redirect('/topics');
    }
    
  }
  catch{
        
    req.flash('error_msg','Please fill all fields ');    
    res.redirect('/topics')
  }
});

module.exports = router;

router.get('/like/:id', ensureAuthenticated,async (req, res) => {
  //console.log("k");
  //console.log(req.params.id);
  try {
    const question = await Question.findById(req.params.id)
    user=req.user
    let liked = false; 
    let temp=[];
    if(question.liked.includes(user.id)){
      for(let i=0; i<question.liked.length; i++){
        if(question.liked[i]!=user.id){
          temp.push(question.liked[i]);
        }
      }
    }
    else{
      //console.log(question.liked);
      temp=question.liked;
      temp.push(user.id);
      liked=true;
      //question.difficulty=3;
     // console.log(question.liked);
    }
    question.liked=temp;
    //console.log(temp);
    question.save();
    resp = {
      'liked':liked,
      }
    res.json(resp);
  } catch {
    res.redirect('/')
  }
})

module.exports = router;