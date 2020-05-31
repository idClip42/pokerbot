exports = module.exports = (function(){

    CONFIG = require("./config.json");

    let Log = function(log){
        console.log(log);
    }

    if(CONFIG.logging.enabled === false) Log = function(){};

    return Log;

})();