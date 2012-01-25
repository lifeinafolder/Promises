var Promise = {};

//Constructor
var Deferred = function(){
	this._state = 0;	// 0 : pending
	this.failList = [];
	this.successList = [];
	this.progressList = [];
	this.pipeList = [];
};

Deferred.prototype.resolve = function(){
	// unless this promise has been already resolved/rejected
	if(this._state === 0){
		var args = Array.prototype.slice.call(arguments);
		//save the arguments for done 'callbacks' attached after resolution.
		this.successParams = args;
		this._state = 1;
		this.successList.forEach(function(cbk){
			cbk(args);
		});
	}
};

Deferred.prototype.reject = function(){
	// unless this promise has been already rejected/resolved
	if(this._state === 0){
		var args = Array.prototype.slice.call(arguments);
		this.failParams = args;
		this._state = -1;
		this.failList.forEach(function(cbk){
			cbk(args);
		});
	}
};

Deferred.prototype.notify = function(){
	var args = Array.prototype.slice.call(arguments);
	this.progressList.forEach(function(cbk){
		cbk(args);
	});
};

Deferred.prototype.state = function(){
	return this._state;
};

Deferred.prototype.progress = function(fn){
	// add to progressList only if deferred is not resolved/rejected.
	if(this._state === 0){
		this.progressList.push(fn);
	}
	return this;
};

Deferred.prototype.done = function(fn){
	// if deferred is already resolved, return immediately with resolved params
	// else add to queue of doneCallBacks to call when resolution happens
	(this._state === 1) ? fn(this.successParams) : this.successList.push(fn);
	return this;
};

Deferred.prototype.fail = function(fn){
	(this._state === -1) ? fn(this.failParams) : this.failList.push(fn);
	return this;
};

Deferred.prototype.then = function(doneCbks,failCbks){
	var self = this;

	doneCbks = [].concat(doneCbks);
	failCbks = [].concat(failCbks);

	doneCbks.forEach(function(cbk){
		self.done(cbk);
	});

	failCbks.forEach(function(cbk){
		self.fail(cbk);
	});
};

Deferred.prototype.promise = (function(obj){
	// Constructor for Promise object
	function Promise(obj){
		this.done = obj.done.bind(obj);
		this.fail = obj.fail.bind(obj);
		this.progress = obj.progress.bind(obj);
		this.state = obj.state.bind(obj);
		this.pipe = obj.pipe.bind(obj);
		this.then = obj.then.bind(obj);
	}

	return function(){
		var promise = new Promise(this);
		return promise;
	};

}());

// serially bind async calls.
Deferred.prototype.pipe = function(fn){
	//TODO
};

// parallel'ly execute async calls and return when all done.
Promise.when = function(){
	var args = Array.prototype.slice.call(arguments);
	if (args.length < 2) {
		// return the promise object if any, else call doneCallbacks immediately
		if (args[0].constructor.name === 'Promise') {
			return args[0];
		}
		else {
			// its not a deferred object. treat it as a resolved deferred then
			var d = new Deferred();
			d.resolve(args[0]);
			return d.promise();
		}
	}
	else {
		var master = new Deferred();
		var results = [];
		var tasksLeft = args.length;

		var taskCbk = function(){
			var response = Array.prototype.slice.call(arguments);
			var ind = response.shift();
			results[ind] = response;

			// Another task completed.
			tasksLeft--;

			// If all tasks are completed, resolve master deferred.
			if(tasksLeft ===0){
				master.resolve(results);
			}
		};

		var failCbk = function(){
			var failArgs = Array.prototype.slice.call(arguments);
			master.reject(failArgs);
		};

		// Hold resolved result of each deferred object in args.
		for(var i=0,il=args.length; i < il; i++){
			var def = args[i];

			var tmp = taskCbk.bind(null,i);
			def.done(tmp);
			def.fail(failCbk);
		}

		return master.promise();
	}
};