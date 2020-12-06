//Importing all the required pacakges
const express = require("express");
const MongoClient = require("mongodb");
const path = require("path");
const bodyParser = require("body-parser");
const { SSL_OP_SSLEAY_080_CLIENT_DH_BUG } = require("constants");

//Global Variables
global.userid_g="";

function foo(){
    const size = document.querySelector("#size").value;
    return size;
}

//Initializing express and body-parser
var app = express();
app.use(bodyParser.urlencoded({extended: true}));

//URL for MongoClient
const url = "mongodb://localhost:27017";
const dbname = "users_products";
//making the main folder as public where HTML, css and pictures are stored

app.use(express.static(path.join(__dirname)));

// General calling the pages

//index.html is found at http://localhost:3000
app.get("/", function(req, res){
    console.log("Index Page initiated.");
    res.sendFile(path.join(__dirname,"/index.html"));
});

//login.html is found at http://localhost:3000/login
app.get("/login", function(req, res){
    console.log("Login Page initiated.");
    res.sendFile(path.join(__dirname,"/login.html"));
});

//product-detail.html is found at http://localhost:3000/product-detail
app.get("/product-detail", function(req, res){
    console.log("Product Details page initiated.");
    res.sendFile(path.join(__dirname,"/product-detail.html"));
});

//product-detail.html is found at http://localhost:3000/product
app.get("/product", function(req, res){
    console.log("Product page initiated.");
    res.sendFile(path.join(__dirname,"/product.html"));
});

//orders.html is found at http://localhost:3000/orders
app.get("/orders", function(req, res){
    console.log("Orders Page initiated.");
    res.sendFile(path.join(__dirname, "/orders.html"));
});

app.get("/product_new", function(req, res){
    console.log("Product Details started.");
    




});

//Sign Up process
app.post("/signup/request", function(req, res){
    console.log("Request to Sign Up");
    
    //Taking Input from the user
    var first_name = req.body.first_name;
    var last_name = req.body.last_name;
    var email = req.body.email;
    var username = req.body.username;
    var password = req.body.password;
    var repassword = req.body.repassword;

    if(password != repassword){
        console.log("Passwords don't match.");
        res.status(401).end('Passwords do not match.');
    }

    //doing work on the database
    //checking if the user already exists
    MongoClient.connect(url, function(err, db){
        if(err)
            throw err;
        var dbo = db.db(dbname);
        var user = {user_name: username};


        dbo.collection("users").findOne(user, function(error, result){
            if(error)
                throw error;
            if(result!=null){
                //User exists already
                db.close(); 
                res.status(401).send('User already exists.');
            }
            else{
                //User doesn't exist adding new user 
                var usr = {
                    firstn: first_name,
                    lastn: last_name,
                    email_id: email,
                    user_name: username,
                    pass: password
                }
    
                dbo.collection("users").insertOne(usr, function(error_1, respo){
                    if(error_1){
                        throw error_1
                    }
                    console.log("1 user added.");
                    //userid_g = username;
                    res.status(200).send("User Added Successful. Please Login to Continue.");
                    db.close();
                });
            }
        });
    });
});

//Login process
app.post("/login/request", function(req, res){
    console.log("Request to Login.");

    var username = req.body.user_name;
    var password = req.body.pass_word;

    //Working on the Database
    MongoClient.connect(url, function(err, db){
        if(err)
            throw err
        var info_check = {user_name: username};
        var dbo = db.db(dbname);

        
        dbo.collection("users").find(info_check, {projection: {_id: 0, user_name: 1, pass: 1}}).toArray(function(error, result){
            if(error)
                throw error;
            /* Only 1 user will exist
            console.log(result[0].user_name);
            so that is why using the first element only 
            */
            
            if(result.length == 0){
                db.close();
                res.status(401).send("User doesn't exists. Please Sign Up.");
            }
            else{
                if(result[0].pass == password){
                    var input = {userid_g: username, total: 0};
                    dbo.collection("login").insertOne(input);
                    db.close();
                    //userid_g= username;
                    
                    //res.sendFile(path.join(__dirname,"/html_pages/index.html"));
                    res.status(200).send("Successful Connection.");
                    return userid_g;
                }
                else{
                    db.close();
                    //console.log(document.querySelector(".btn"));
                    res.status(401).send("Incorrect Password.");
                }
            }
        });
        console.log(userid_g);
    });
});

//Cart 
app.post("/buying/red_printed", function(req, res){
    //const cloth = "Red Printed Tshirt";
    const cloth_arr = ["Red Printed T-Shirt", "HRX Shoes", "Sport Trouser", "Puma Polo T-Shirt", "Grey Shoes", "Black T-Shirt", "HRX Socks", "Sport Watch", "Sport Watch", "Sport Shoes", "Causel Shoes", "Nike Trouser"];
    const price_arr = [50, 75, 38, 60, 50, 75, 38, 60, 50, 75, 38, 60];
    //foo();
    const size = req.body.size;
    const quant = req.body.quantity;
    //const price_1 = quant*50;
    const captcha_1 = req.body.captcha;
    
    const captcha = captcha_1.split("/");
    const username = captcha[0];
    const cloth = captcha[1];
    var i = cloth_arr.findIndex(cloth);
    const price = quant*price_arr[i];
    console.log(cloth);

    
    MongoClient.connect(url, function(err, db){
        if(err)
            throw err;
        var dbo = db.db(dbname);
        
        let final = [price];//quantity * price
        
        dbo.collection("login").find({userid_g: username}).toArray(function(error_1, result_1){
            if(error_1)
                throw error_1;
            console.log(result_1);
            if(result_1.length == 0){
                res.send("Login First");
            }
            final.push(parseInt(result_1[0].total));
            console.log(final);
        });
        setTimeout(function(){
            console.log(final);
            var sum = final.reduce(function(a, b){
                return a + b;
            }, 0);
            console.log(sum)
            dbo.collection("login").updateOne({userid_g: username}, {$set: {total: sum}}, function(error_1, result_1){
                if(error_1)
                    throw error_1
                //console.log(result_1);
                res.status(200).send("Product added to cart.");
            });
            db.close();
        }, 5000);   
    });
});

/*
function add_to_cart(){
    const cloth = document.querySelector("#cloth").innerText;
    const price = document.querySelector("#price").innerText;
    const size = document.querySelector("#size").value;
    const quant = document.querySelector("#quantity").value;
    
    MongoClient.connect(url, function(err, db){
        if(err)
            throw err;
        var dbo = db.db(dbname);
        console.log("Hello");
        
        dbo.collection("login").find({}, {projection: {_id: 0, user_name: 1}}).toArray(function(error, result){
            if(error)
                throw error;
            console.log(result);
            if(result.length == 0){
                //alert("Please Login First.");
                //res.sendFile(path.join(__dirname, "/login.html"));
                dbo.close();
                //call function to do query selector job
            }
            else{
                
            }

        });
    });

}
*/


//Listening on PORT 3000
app.listen(3000, function(error){
    if(error)
        throw error;
    console.log("Listening at 3000");
});