function async() {
  var dfd = new Deferred();
  window.setTimeout(function() {
    dfd.resolve('Yay');
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
			expect(result).toEqual('Yay');
		});
	});
	
	it("Multiple resolution",function(){
		var result1,result2;
		promise.done([
			function(res){
				result1 = res + 1;
			},
			function(res){
				result2 = res + 2;
			}
		]);
		
		waits(1000);
		runs(function(){
			expect(result1+result2).toEqual('Yay1Yay2');
		});
	});

	it("When", function(){
		var result;
		var p = Promise.when(promise,{a:5});
		p.then(function(res){
			console.log(res);
			result = 'parallel';
		});
		waits(2000);
		runs(function(){
			expect(result).toEqual('parallel')
		})
	});
});