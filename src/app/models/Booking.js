const mongoose = require('mongoose')
const Schema = mongoose.Schema

var Hospital = mongoose.model('Hospital')
var User = mongoose.model('User')
var Doctor = mongoose.model('Doctor')

const Booking = new Schema({
    user: {ref: User},
    hospital: {type: Hospital},
    bookingDate: {type: Date},
    creationDate: {type: Date},
    doctor: {ref: Doctor},
})

module.exports = mongoose.model('Booking', Booking)