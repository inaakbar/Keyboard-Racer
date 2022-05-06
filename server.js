const express = require("express");
const bodyParser = require("body-parser");
const textGen = require('txtgen');
const app = express();
var mongoose = require('mongoose');
var session = require('cookie-session');
var passport = require('passport');
var passportLocalMongoose = require('passport-local-mongoose');
var cookieParser = require('cookie-parser');
app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(cookieParser("My Name is Syed Ali Aatif and I am not gonna let you hack my website"));

app.use(session({
  secret: "My Name is Syed Ali Aatif and I am not gonna let you hack my website",
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
var con1 = new mongoose.Mongoose();
var con2 = new mongoose.Mongoose();
con1.connect('mongodb+srv://mafailure:myfirstproject@cluster0.e6ou5.mongodb.net/userDB');
con2.connect('mongodb+srv://mafailure:myfirstproject@cluster0.e6ou5.mongodb.net/infoDB');
const userDbSchema = con1.Schema;
const infoDBSchema = con2.Schema;
const userSchema = new userDbSchema({
  username: String,
  password: String
});

userSchema.plugin(passportLocalMongoose);
const User = con1.model("user", userSchema);
const infoSchema = new infoDBSchema({
  username: String,
  name: String,
  race: Number,
  speed: Number
});
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
const Info = con2.model('info', infoSchema);


//const userDB=mongoose.connect('mongodb://localhost:27017/')
var message = "";

async function getLeaderboard(){
  var ans=[];

   await Info.find({},['_id','username','race','speed'],{
      sort:{
        speed:-1
      }
    }, function(err,allInfos){
      for(let i=0;i<Math.min(allInfos.length,10);i++){
        ans.push(allInfos[i]);
      }
    }).clone();

    //console.log(ans);
    return ans;
}
  async function getProfile(state,user){
   if(state===true){
     let ans=[];
     await Info.find({ username:user},['_id','username','race','speed'],{},function(err,allinfo){
       if(err){
         console.log(err);
       }
         else {

           console.log("AllInfo: ");
           console.log(allinfo);
          ans=allinfo;
       }
       }).clone();

       return ans;

     }

   else {

     return [
       {
         username:'Guest',
         race:0,
         speed:0
       }
     ]

   }
 }


app.get('/', function(req, res) {

  // console.log(req.user);
  var state = false;
  if (req.isAuthenticated()) {
    state = true;
  }
var gl=async function( ){


var user;
if(state==true){user=req.user.username;}
else {user="Guest"; }

const arr= await Promise.all([getLeaderboard(),getProfile(state,user)]);
const lead=arr[0];
const profile=arr[1][0];
console.log("Lead :");
console.log(lead);
console.log("Profile : ");
console.log(profile);
  res.render('home', {
    title: "Home",
    state: state,
    lead: arr[0],
    profile: arr[1][0]

  });
}
gl();


});

app.post('/login', function(req, res) {
  const user = new User({
    username: req.body.username,
    password: req.body.password
  });
  User.findOne({
    username: req.body.username
  }).exec(function(err, cur) {
    if (err) {
      console.log(err);
      res.redirect('/login');
    } else if (cur) {
      req.login(user, function(err) {
        if (err) {
          console.log(err);
          message = "Wrong Username Or Password";
          res.redirect('/login');
        } else {
          res.redirect('/');
        }
      });
    } else {
      res.redirect('/register');
    }
  });

});




app.get('/login', function(req, res) {
  const toSend = message;
  message = "";
  var state = false;
  if (req.isAuthenticated()) {
    state = true;
  }
  res.render('login.ejs', {
    title: "Login",
    state: state,
    message: toSend
  });
})

app.get('/register', function(req, res) {
  var state = false;
  if (req.isAuthenticated()) {
    state = true;
  }
  res.render('register.ejs', {
    title: "Register",
    state: state
  });
});
app.post('/register', function(req, res) {

  console.log(req.body);
  User.findOne({
    username: req.body.username
  }).exec(function(err, user) {
    if (err) {
      console.log(err);
    } else {
      if (user) {
        res.redirect('/register');
      }
    }
  });

  User.register({
    username: req.body.username
  }, req.body.password, function(err, user) {
    if (err) {
      console.log(err);
      res.redirect('/register');
    } else {
      passport.authenticate('local')(req, res, function() {
        const info = new Info({
          username: req.body.username,
          name: req.body.name,
          race: 0,
          speed: 0
        });
        info.save(function(err) {
          if (err) {
            console.log(err);
          }
        });
        res.redirect('/');
      });
    }
  })
});
app.get('/race', function(req, res) {
  const val = Math.floor(Math.random() * 10) + 2;
  var paragraph = textGen.paragraph([1]);
  paragraph = paragraph.substr(0, Math.min(paragraph.length, 800));
  let r = paragraph.length - 1;
  while (paragraph[r] != ' ') {
    r--;
  }
  paragraph = paragraph.substr(0, r + 1);
  //res.sendFile(__dirname+'/race.html');
  var state = false;
  if (req.isAuthenticated()) {
    state = true;
  }
  res.render('race', {
    title: "Race",
    state: state,
    content: paragraph
  });
});
app.get('/racecomplete', function(req, res) {
  var state = false;
  if (req.isAuthenticated()) {
    state = true;
  }
  var timeTaken = req.query.time;
  var words = req.query.words;
  var curInfo = {

    name: 'Guest',
    username: 'Guest',
    race: 0,
    speed: 0
  };
  let speed = Math.round(words / timeTaken);
  let avgSpeed = speed;
  if (req.isAuthenticated()) {
    console.log("Authenticated !");
    curInfo.username = req.user.username;
    var xxx = async function() {

    await  Info.findOne({
        username: req.user.username
      }).exec( async function(err, info) {
        if (err) {
          console.log(err);
        } else {
          curInfo._id=info._id;
          curInfo.username = info.username;
          curInfo.race = info.race;
          curInfo.speed = info.speed;
          console.log(info);
          avgSpeed = (info.speed * info.race + speed) / (info.race + 1);
          avgSpeed = Math.round(avgSpeed * 100 + Number.EPSILON) / 100;

           info.update({race:curInfo.race+1, speed:avgSpeed},function(err){
            if(err){
              console.log(err);
            }
            else {
              console.log("updated Succesfully ! ");
              res.render('finished.ejs', {
                title: "Race Finished",
                state: state,
                info: {
                  username: curInfo.username,
                  timetaken: req.query.time,
                  words: req.query.words,
                  avgspeed: avgSpeed,
                  race: curInfo.race + 1
                }
              });
            }
          });
        }

      });





    };
    xxx();

  }
  else{

  //Info.findOne({username:req.user.username}).exec(function(err,info))
  //console.log(curInfo);
  res.render('finished.ejs', {
    title: "Race Finished",
    state: state,
    info: {
      username: curInfo.username,
      timetaken: req.query.time,
      words: req.query.words,
      avgspeed: avgSpeed,
      race: curInfo.race + 1
    }
  });
}

});

app.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/');
})

app.get('/leaderboard',function(req,res){

  async function gl(){
    var lead=await getLeaderboard();
    res.render('leaderboard.ejs',{
      title:"Leaderboard",
      lead:lead,
      state:req.isAuthenticated()
    });
  }
  gl();

});




app.listen(process.env.PORT || 3000, function() {
  console.log("Server up and running on port " + process.env.PORT);
});
/*
#E3FDFD
#CBF1F5
#A6E3E9
#71C9CE
*/
