document.addEventListener('focusin', function(e) {
	var target = e.target;
	if (target.matches('input') && target.classList.contains('error')) {
		target.value = "";
		target.classList.remove('error');
	}
});

document.addEventListener('submit', function(e) {
	e.preventDefault();
	var target = document.querySelector('input[name="url"]');
	var url = target.value;
	if (!url) return fail("empty url");
	fetch('/inspector?url=' + encodeURIComponent(target.value)).then(function(res) {
		if (res.status != 200) return Promise.reject(res);
		return res.json();
	}).then(function(data) {
		Domt('.items').merge({data: [data]}, {
			remove: function(val, context) {
				if (!val) context.node.remove();
				return val;
			},
			dimension: function(val, context) {
				var data = context.scope.data;
				var dim = data.duration;
				if (!dim && data.width && data.height) dim = data.width + "x" + data.height;
				var size = parseInt(data.size / 1024);
				if (!isNaN(size)) {
					dim += ", " + size + 'KB';
				}
				return dim || "";
			}
		});
	}).catch(fail);
	function fail(err) {
		target.blur();
		target.classList.add('error');
		console.error(err);
	}
});

document.addEventListener('DOMContentLoaded', function() {
	Domt('.items').empty();
});

