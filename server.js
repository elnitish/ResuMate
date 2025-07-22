let express = require("express");
let mongoose = require("mongoose");
const { type } = require("os");
let app = express();
let path = require("path");
let port = 1000;
let {jsPDF} = require("jspdf");
let cookieParser = require('cookie-parser');
const multer = require("multer");
const { ifError } = require("assert");
let pdf = new jsPDF();


//database
mongoose.connect("mongodb://127.0.0.1:27017/ResuMate")
    .then(() => {
        console.log("Database connected successfully");
    }).catch(() => {
        console.log((("Error in connecting Database")));
    });

let userSignupSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    email: {
        type: String,
        unique: true,
    },
    password: {
        type: String,
    }

}, { timestamps: true });

let userSignupModel = new mongoose.model("Accessed_Users", userSignupSchema);


// Configure multer for memory storage
const upload = multer({ dest: 'uploads/' });


//middlewares
app.use(express.static(path.join(__dirname, "views")));
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(cookieParser("nitishishot"));
app.use(express.json());
app.use(express.static('uploads'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

//get routes
app.get("/", (req, res) => {
    res.status(201).sendFile(path.join(__dirname, "views", "index.html"));
})

app.get("/login", (req, res) => {
    res.status(201).sendFile(path.join(__dirname, "views", "login.html"),);
})

app.get("/signup", (req, res) => {
    res.status(201).sendFile(path.join(__dirname, "views", "signup.html"));
})
app.get("/home", (req, res) => {
    let name = req.cookies.name;
    if (!name) {
        res.send("To access this page first login");
        return;
    }
    console.log(name, " is in home page");
    res.status(201).render("home.ejs", { name });
})

//post routes
app.post("/login", async (req, res) => {
    let { email, password } = req.body;
    if (!email || !password) {
        console.log("Credentials Missing");
        res.end("Wrong");
    }
    let user = await userSignupModel.findOne({
        email: email,
        password: password,
    });
    if (!user) {
        res.status(400).sendFile(path.join(__dirname,"views","errCredentials.html"));
        return;
    }
    else{
        res.cookie("name", user.name);
        let name = user.name;
        console.log(name, "Logged in");
        res.status(201).redirect("/home");
    }
})

app.post("/signup", async (req, res) => {
    let { name, email, password } = req.body;
    if (!name || !email || !password) {
        console.log("Empty credentials");
        res.end("Wrong");
    }

    try {
        await userSignupModel.create({
            name: name,
            email: email,
            password: password,
        });
        console.log("New user Signed Up Successfully");
        res.sendFile(path.join(__dirname, "views", "login.html"), (err) => {
            if (err) {
                console.error('Error sending file:', err);
                res.status(500).send('Internal Server Error');
            }
        });

    } catch (err) {
        if (err.code === 11000) {
            res.status(400).send('Email already exists!');
        } else {
            console.error(err);
            res.status(500).send('Internal server error');
        }
    }


});

app.post("/home", upload.single('profilePicture'), async (req, res) => {
    let body = req.body;
    let profilePicture = req.file ? req.file.path : null;
    console.log('File received:', req.file);
    console.log('Form data:', req.body);
    let format=body.format;
    console.log("Display ",format);
    let user = {
        fullname: body.name,
        age: body.age,
        gender: body.gender,
        dob: body.date,
        about: body.about,
        phone: body.phone,
        email: body.email,
        url: body.url,
        address: body.address,
        positionApplying: body.position,
        qualification: body.qualification,
        expertise: body.expertise,
        languages: body.language,
        cn: body.company,
        pos: body.pos,
        duration: body.duration,
        workexp: body.experience,
        refname: body.refname,
        refcomp: body.refcomp,
        refcon: body.refcon,
        refemail: body.refemail,
    };
    if (profilePicture) {
        console.log("Profile photo exist");
    }
    switch (format) {
        case "format1":res.status(201).render("format_1.ejs", { user, profilePicture });
          break;
        case "format2":res.status(201).render("format_2.ejs", { user, profilePicture });
          break;
        default:
      } 
    

});

//listener
try {
    app.listen(port,(req, res) => {
        console.log("Server is started");
    })
} catch (error) {
    if(error)
    {
        console.log("Server crashed")
        console.log("Internal server error 501")
         
    }
}
