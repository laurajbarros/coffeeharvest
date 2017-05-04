var mongoose = require("mongoose");

var employeeSchema = new mongoose.Schema({
	id:Number,
	username: String,
	name: String,
	type: String,
	start: String,
	status: String,
	production: Object
})
module.exports = mongoose.model("Employee", employeeSchema);