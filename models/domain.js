var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/Addonis-Inventory');

var db = mongoose.connection;

var DomainSchema = mongoose.Schema({
    domain_name: {
        type: String,
        //index: true,
        //Los documentos requieren este campo.
        required: true,
        //Este campo no se repite, debe ser unico.
        unique: true,
    },
    adquisition_date: {
        type: String,
    },
    expiration_date: {
        type: String
    },
    adquisition_period: {
        type: String
    },
    registered_email: {
        type: String
    }
});

var Domain = module.exports = mongoose.model('Domain', DomainSchema);

module.exports.createDomain = function(newDomain, callback){
    newDomain.save(callback);
}