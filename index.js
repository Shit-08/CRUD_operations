const { faker } = require('@faker-js/faker');
const mysql=require('mysql2');
const express=require("express");
const app=express();
const path=require("path");
const {v4 :uuidv4} = require("uuid");
const methodOverride=require("method-override");


app.use(methodOverride("_method"));
app.use(express.urlencoded({extended:true}));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"))

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  database: 'Delta_app',
  password: 'Shital@08'
});

let createRandomUser= function () {
  return [
    faker.string.uuid(),
    faker.internet.username(), // before version 9.1.0, use userName()
    faker.internet.email(),
    faker.internet.password(),
  ];
}

//inserting fake data
// let q="INSERT INTO user(id, username, email, password) VALUES ? ";
// let data=[];


// for(let i=1; i<=100; i++ ){
//     data.push(createRandomUser()); //100 fake users data is generated here 
// }

// try{
//     connection.query(q,[data], (err, result)=>{ 
//     if(err) throw err;
//     console.log(result);
// })
// }
// catch(err){
//     console.log(err);
// }

// connection.end();

//Home route
app.get('/',(req,res)=>{
    let q=`SELECT COUNT(*) as count FROM USER`;
    try{
        connection.query(q,(err,result)=>{
            if(err) throw err;
            console.log(result[0].count);
            let count=result[0].count;
            res.render("home.ejs",{count});
        })
    }
    catch(err){
        console.log(err);
        res.send("some error in database")
    }
})

//Show route

app.get('/user',(req,res)=>{
    let q=`SELECT * from user`;
     try{
        connection.query(q,(err,users)=>{
        res.render("show.ejs",{users});
        })
    }
    catch(err){
        console.log(err);
        res.send("some error in database")
    }
})

//Edit route
app.get('/user/:id/edit',(req,res)=>{
    let {id}=req.params;
    let q=`SELECT * from user where id='${id}'`;
     try{
        connection.query(q,(err,result)=>{
            if(err) throw err;
            console.log(result[0]);
            let user=result[0];
            res.render("edit.ejs",{user});
        })
    }
    catch(err){
        console.log(err);
        res.send("some error in database")
    }

});

//update (DB) route
app.patch("/user/:id",(req,res)=>{
    let {id}=req.params;
    let {username:newUserName, password:formPassw}=req.body;
    console.log(newUserName,formPassw);
    let q=`SELECT * from user where id='${id}'`;
     try{
        connection.query(q,(err,result)=>{
            if(err) throw err;
            let user=result[0];
            if(formPassw===user.password){
                let q2=`Update user SET username= '${newUserName}' WHERE id='${id}'`;
                connection.query(q2,(err,result)=>{
                    if(err) throw err;
                    res.redirect('/user');
                })
            }
            else{
                res.send("Wrong Password")
            }
        })
    }
    catch(err){
        console.log(err);
        res.send("some error in database");
    };
    
})

//new route
app.get('/user/new',(req,res)=>{
    res.render("new.ejs");
})

//create route

app.post('/user/new',(req,res)=>{
    let {username, email, password}= req.body;
    id=uuidv4();
    let q=`INSERT into user(id,username,email,password) VALUES ('${id}', '${username}', '${email}', '${password}')`;
    try{
        connection.query(q,(err,result)=>{
            if(err) throw err;
            console.log("added new user");
            res.redirect('/user');
        })
    }
    catch{
        res.send("some error while adding user");
    }
})

//Delete route

app.get('/user/:id/delete',(req,res)=>{
    let {id}=req.params;
    let q=`SELECT email,password from user where id='${id}' `;
    try{
        connection.query(q,(err,result)=>{
            if(err) throw err;
            let user=result[0];
            res.render("delete.ejs", {user});
        })
    }
    catch{
        res.send("some error while deleting user");
    }
    
})

app.delete('/user/:id',(req,res)=>{
    let {id}=req.params;
    let {password}=req.body;
    let q1 = `SELECT * FROM user WHERE email='${id}'`;
    try{
        connection.query(q1,(err,result)=>{
            if(err) throw err;
            let user=result[0];
            if(user.password===password){
                let q2=`DELETE from user where email='${id}' `;
                try{
                    connection.query(q2,(err,result)=>{
                        if(err) throw err;
                        res.redirect('/user');
                    })
                }
                catch(err){
                    res.send("some error while deleting user");
                }
            }
            else{
                res.send("WROng password entered")
            }
        })
    }
    catch(err){
        res.send("some error while deleting user");
    }

})

app.listen("8080",()=>{
    console.log("server is listening to port 8080");
})

