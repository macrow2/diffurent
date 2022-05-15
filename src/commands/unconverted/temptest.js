/* This is a test for temporary punishment systems

Major challenges:
Correctly parse dates, and unpunish the user once the time has ended.
*/

function parseDate(date){
    var dateMap = {
        "s":1,
        "sec":1,
        "second":1,
        "seconds":1,
        "m": 60,
        "min":60,
        "mins":60,
        "minute":60,
        "minutes":60,
        "h": 3600,
        "hour": 3600,
        "hours": 3600,
        "d": 86400,
        "day": 86400,
        "days": 86400
    }
    var endBit = date.split(parseInt(date).toString()).join("");
    var x = dateMap[endBit];
    if(x == undefined) return undefined;
    var amount = parseInt(date);
    if(isNaN(amount)) return undefined;
    var endDate = Date.now()+(1000*(amount*x));
    return endDate;
}

module.exports = {
    name:"tempTest",
    aliases:[],
    execute: function(message, client){
        var args = message.content.split(/ +/).slice(1);
        message.channel.send(`${new Date(Date.now()).toString()}. ${new Date(parseDate(args[0])).toString()}`)
    }
}