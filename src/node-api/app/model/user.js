var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var UserSchema   = new Schema({
	nome: String,
	cpf: String,
	data: Date,
	bateria: Number,
	status: Number
});

module.exports = mongoose.model('User', UserSchema);