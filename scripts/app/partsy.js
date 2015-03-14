var Partsy = {
	sort: 'hot',
	statuses: ['loading', 'more', 'done'],
	entries: []
}

function partsy_status(status) {
	if (Partsy.statuses.indexOf(status) < 0)
		return false;

	$('#status span').toggleClass('active', false);
	$('#status #' + status).toggleClass('active', true);
}