//============================
// VARS
//============================
	// server 
var express = require("express"),
 	app = express(),
 	//DB
	mongoose= require("mongoose"),
	//other
	bodyParser = require("body-parser"),
	ejs = require("ejs"),
	moment = require('moment'),
	// user auth
	User = require("./models/user"), 
	Employee = require("./models/employee"),
	passport = require("passport"),
	LocalStrategy = require("passport-local"),
	passportLocalMongoose = require("passport-local-mongoose");


//============================
// CONFIG: user auth
//============================
	app.use(require("express-session")({
		secret: "Todo app is my first app ever",
		resave: false,
		saveUninitialized:false
	}));

	app.use(passport.initialize());
	app.use(passport.session());
	passport.use(new LocalStrategy(User.authenticate()))
	passport.serializeUser(User.serializeUser());
	passport.deserializeUser(User.deserializeUser());
//============================
// CONFIG: DB 
//============================
// mongoose.connect("mongodb://localhost/app");
mongoose.connect("mongodb://laura:laura@ds131511.mlab.com:31511/laura");
mongoose.Promise = global.Promise; 

//============================
// CONFIG: Express, ejs & Body Parser
//============================
app.set("view engine","ejs");
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static(__dirname + "/public"));
app.use(express.static(__dirname + "/controllers"));
app.locals.moment = require('moment');

//============================
// ROUTERS
//============================

app.post("/editharvest",isLoggedIn,function(req,res){
	var year = req.body.year;
	var week = req.body.week;
	var day = req.body.day;
	var employee = req.body.employee;
	var value = req.body.value;
	var user = req.user.username;
	var daystatus;
	Employee.findOne({"username":req.user.username, "_id":employee},function(err,foundEmployee){
		if(err){
			console.log("deuruim /");
		} else {
			var employeeCleaned = createObjectLayers(foundEmployee, year, week, day);
			employeeCleaned["production"][year][week][day] = {
				data:value, 
				status:daystatus
			};
			var employeeCleanedWithStats = addStatsToEmployeeWeek(foundEmployee, year, week, day)
			Employee.update({"username":req.user.username, "_id":employee},{$set:{production:employeeCleanedWithStats["production"]}},function(err, response){
				res.redirect("/")
			})
		}
	})
});

app.get("/",isLoggedIn, function(req,res){
	Employee.find({"username":req.user.username},function(err,employees){
		if(err){
			console.log("deuruim /");
		} else {
			res.render("history", {employees:employees, farm: req.user.farm, });
		}
	})
});

app.get("/employee",isLoggedIn, function(req,res){
	Employee.find({"username":req.user.username},function(err,employees){
		if(err){
			console.log("deuruim /");
		} else {
		res.render("employee", {employees:employees, username:req.user.username, farm: req.user.farm});
		}
	})
});


app.get("/addemployee",isLoggedIn, function(req,res){
	res.render("addemployee", {farm: req.user.farm});
});

app.get("/employee/edit/:id",isLoggedIn, function(req,res){
	Employee.findOne({"username":req.user.username, "name":req.params.id},function(err,employee){
		if(err){
			console.log("deuruim /");
		} else {
			res.render("editemployee", {employee:employee, username:req.user.username, farm: req.user.farm});
		}
	})
});

app.get("/employees", isLoggedIn, function(req,res){
	Employee.find({"username":req.user.username},function(err,employees){
		if(err){
			console.log("deuruim /");
		} else {
			res.send(employees);
		}
	})
})

app.get("/employeereport", isLoggedIn, function(req,res){
	Employee.find({"username":req.user.username},function(err,employees){
		if(err){
			console.log("deuruim /");
		} else {
			res.render("employeereport",{employees:employees, username:req.user.username, farm: req.user.farm});
		}
	})
})


app.post("/add",isLoggedIn,function(req,res){
	var newEmployee={
		name: req.body.name,
		type:req.body.type,
		start:req.body.startdate,
		username:req.user.username,
		farm:req.user.farm,
		production:{}
	};
	Employee.create(newEmployee, function(err,item){
		if(err){
		} else {
			res.redirect("/employee");
		}
	});
});

app.post("/employee/edit/:id",isLoggedIn,function(req,res){
	var newEmployee={
		name: req.body.name,
		type:req.body.type,
		start:req.body.startdate,
		username:req.user.username
	};
	Employee.update({"username":req.user.username, "name":req.body.originalName}, newEmployee, function(err,item){
		if(err){
		} else {
			res.redirect("/employee");
		}
	});
})

app.get("/employee/delete/:id",isLoggedIn,function(req,res){
	Employee.remove({"username":req.user.username, "name":req.params.id}, function(err,item){
		if(err){
		} else {
			res.redirect("/employee");
		}
	});
})



//============================
// Auth ROUTERS
//============================

app.get("/register",function(req,res){
	res.render("register");
})

app.post("/register",function(req,res){
	User.register(new User({username: req.body.username, farm: req.body.farm}),req.body.password,function(err,user){
		if(err){
			console.log(err);
			return res.render("register");
		};
		passport.authenticate("local")(req,res,function(){
			res.redirect("/");
		})
	})
})
//============================
// Login ROUTERS
//============================

function isLoggedIn(req,res,next){
	if(req.isAuthenticated()){
		return next();
	}
	res.redirect("/login");
}


app.get("/login",function(req,res){
	res.render("login");
})

app.post("/login", passport.authenticate("local",{
		successRedirect:"/",
		failureRedirect:"/login"
}),	function(req,res){
	}
);

app.get("/logout",function(req,res){
	req.logout();
	res.redirect("/");
});

//============================
// Server listener
//============================
app.listen(3001, process.env.IP, function(){
   console.log("App tá no ar"); 
});


//============================
// Acessory functions
//============================

function createObjectLayers(foundEmployee, year, week, day){
	if(foundEmployee["production"]){
		if(foundEmployee["production"][year]){
			if(foundEmployee["production"][year][week]){
				if(foundEmployee["production"][year][week][day]){

				} else{
					foundEmployee["production"][year][week][day] = {};
				}
			} else{
				foundEmployee["production"][year][week] = {};
				foundEmployee["production"][year][week][day] = {};	
			}
		} else{
			foundEmployee["production"][year] = {};
			foundEmployee["production"][year][week] = {};
		}
	} else{
		foundEmployee["production"] = {};
		foundEmployee["production"][year] = {};
		foundEmployee["production"][year][week] = {};
		foundEmployee["production"][year][week][day] = {};
	}
	return foundEmployee;
}


function sumOfCoffeeMeasures(harvested){
	var sum = 0;
	harvested.forEach(function(value){
		var integer = Math.trunc(value);
		var decimalConverted = parseFloat((value - integer).toFixed(2))/6*10;
		var valueConverted = integer + decimalConverted;
		sum = sum + valueConverted;
	})
	var sumInteger = Math.trunc(sum);
	var sumDecimal = sum - sumInteger;
	var sumConvertedBack = sumDecimal/10*6;
	var sumFinal = sumInteger + sumConvertedBack;
	return sumFinal
}

function addStatsToEmployeeWeek(foundEmployee, year, week){
	foundEmployee["production"][year][week]["stats"] = {
		status:"A Pagar",
		commments: "No comment"
	} 
	var sum = [];
	var daysItHasData = Object.keys(foundEmployee["production"][year][week]);
	daysItHasData.forEach(function(day){
		if(!isNaN(day)){
			var dataInEachDay = foundEmployee["production"][year][week][day]["data"];
			sum.push(dataInEachDay);
		}
	})
	var workedDays = determineWorkedDays(sum);
	var finalSum = sumOfCoffeeMeasures(sum);
	foundEmployee["production"][year][week]["stats"]["sum"] = finalSum;
	foundEmployee["production"][year][week]["stats"]["workedDays"] = workedDays;
	return foundEmployee
}


function determineWorkedDays(sum){
	var worked = [];
	sum.forEach(function(each){
		if(!isNaN(each) && each !== "" && each !== "0" && each !== 0 && each !== undefined && each !== null){
			worked.push(each)
		}
	})
	return worked.length
}