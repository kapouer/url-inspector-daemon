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
				var size = Math.ceil(data.size / 1024);
				if (!isNaN(size)) {
					dim = (dim ? dim + ", " : "") + size + 'KB';
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

document.addEventListener('click', function(e) {
	var target = e.target.closest('.item');
	if (!target) return;
	e.preventDefault();
	var display = document.getElementById('displayHTML');
	var iframe = display.querySelector('iframe');
	var doc = iframe.contentWindow.document;
	doc.open();
	doc.write(
		'<!DOCTYPE html><html><head><link rel="stylesheet" href="iframe.css" /></head><body>'
		+	target.dataset.html
		+ '</body></html>'
	);
	doc.close();
	display.removeAttribute('hidden');
});

document.addEventListener('click', function(e) {
	var target = e.target;
	if (!target.matches('.displayClose')) return;
	var display = document.getElementById('displayHTML');
	var iframe = display.querySelector('iframe');
	var doc = iframe.contentWindow.document;
	display.setAttribute('hidden', 'hidden');
	doc.open();
	doc.write("");
	doc.close();
});
