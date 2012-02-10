function async() {
	var args = Array.prototype.slice.call(arguments);
	var dfd = new Deferred();
	window.setTimeout(function() {
		var sum = 0;
		for(var i=args.length;i--;){
			sum+=args[i];
		}
	  dfd.resolve(5 + sum);
	}, 1000);
	return dfd.promise();
}

describe('Promises',function(){
	var promise;
	//Create a promise before each spec
	beforeEach(function(){
		promise = async();
	});

	it("Single resolution",function(){
		var result;
		promise.done(function(res){
			result = res;
		});
		waits(1000);
		runs(function(){
			expect(result).toEqual(5);
		});
	});

	it("Multiple resolution",function(){
		var result1,result2;
		promise.done([
			function(res){
				result1 = res + 1;//6
			},
			function(res){
				result2 = res + 2;//7
			}
		]);

		waits(1000);
		runs(function(){
			expect(result1+result2).toEqual(13);
		});
	});

	it("When", function(){
		var result;
		var p2 = async(10);
		var p = Promise.when(promise,p2);
		p.then(function(res){
			result = res[0][0] + res[1][0];
		});
		waits(1000);
		runs(function(){
			expect(result).toEqual(20);
		});
	});

	it("Pipe", function(){
		var result;
		var p = promise.pipe(function(res){
			return res + 2;
		});
		p.then(function(res){
			result = res;
		});
		waits(1000);
		runs(function(){
			expect(result).toEqual(7);
		});
	});

	it("Pipe-Chaining", function(){
		var result;
		var p = promise.pipe(function(res){
			p2 = async(res);
			return p2;
		});
		p.then(function(res){
			result = res;
		});

		//wait 2 seconds now as we are running two async calls in serial
		waits(2000);
		runs(function(){
			expect(result).toEqual(10);
		});
	});
});