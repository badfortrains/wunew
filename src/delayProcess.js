var Promise = require("bluebird");

var processQueue = function(items,func,delay,max,done){
  var index = 0,
      active = 0,
      lastSearch = Date.now(),
      timer;

  return new Promise( (resolve,reject) => {

    function queueItem(){
      if(active < max && lastSearch + delay < Date.now() && index < items.length){
        func(items[index]).finally( () => active-- )
        index++;
        active++;
        lastSearch = Date.now();
      }

      if(active == 0 && index >= items.length){
        clearInterval(timer);
        resolve();
      }
    }

    timer = setInterval(queueItem,delay)

  })
}

module.exports = processQueue;
