class UserEvent {
    /**
     * 
     * @param {String} name 
     * @param {Int} timeslotLengthMin 
     * @param {Array.<String>} timeslots 
     */
    constructor(name, timeslotLengthMin, timeslots = []){
        this.name = name;
        this.timeslotLengthMin = timeslotLengthMin;
        this.timeslots = timeslots;
    }
}

module.exports = UserEvent;