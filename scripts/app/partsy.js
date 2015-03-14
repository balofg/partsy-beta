var Partsy = {
	sort: 'hot',
	isBusy: false,
	hasMoreData: true,
	subreddit: 'pointlessartsyphotos',
	entries: null,
	count: 0,
	after: 'null',
	limit: 24,
	maxchar: 50
}

function partsy_buildUrl() {
	var url = 'http://www.reddit.com/r/';
	url += Partsy.subreddit + '/';
	url += Partsy.sort + '.json?';
	url += 'limit=' + Partsy.limit;

	if (Partsy.after)
		url += '&after=' + Partsy.after;

	return url;
}

function partsy_status(status) {
	if (!Partsy.isBusy) {
		$('#status span').toggleClass('active', false);
		$('#status #' + status).toggleClass('active', true);
	}
}

function partsy_sort(sort) {
	$("#sort button").toggleClass('active', false);
	$('#sort button[value="' + sort + '"]').toggleClass('active', true);

	partsy_load(true);
}

function partsy_load(reset) {
	if (!Partsy.isBusy) {
		Partsy.isBusy = true;
		if (reset) {
			Partsy.count = 0;
			Partsy.after = null;
			Partsy.entries = [];

			partsy_template();
		}

		partsy_status('loading');

		$.get(partsy_buildUrl(), function (response) {
			var count = response.data.children.length;
			Partsy.count += count;
			if (count < Partsy.limit) {
				Partsy.hasMoreData = false;
			} else {
				Partsy.after = response.data.after;
			}

			$(response.data.children).each(function () {
				var data = this.data;
				var entryHtml = $('<div></div>').html(data.selftext_html);
				entryHtml.html(entryHtml.text()); //decodes html entities
				var entryDescription = entryHtml.find('p')
					.clone()
					.children()
					.remove()
					.end()
					.text(); //found this shit on stackoverflow. thiw way I remove everything that's not text, including the image link

				var imgurLink = entryHtml.find('a').first().attr('href');

				var entry = {
					reddit: {
						link: 'http://www.reddit.com' + data.permalink,
						title: data.title,
						description: entryDescription.substring(0, Partsy.maxchar) + ((entryDescription.length > Partsy.maxchar) ? '...' : ''), //ellipsis
						upvotes: data.ups,
						comments: data.num_comments,
						author: data.author,
						time: moment(data.created_utc * 1000).fromNow()
					},
					imgur: {
						link: imgurLink,
						thumbnail: imgurLink.slice(0, imgurLink.lastIndexOf('.')) + 'l' + imgurLink.slice(imgurLink.lastIndexOf('.') - imgurLink.length)
					}
				}

				Partsy.entries.push(entry);
			});

			partsy_template();
			Partsy.isBusy = false;

			if (Partsy.hasMoreData)
				partsy_status('more');
			else
				partsy_status('done');
		})
	}
}

function partsy_template() {
	var source = $('script#gallery-template').html();
	var template = Handlebars.compile(source);
	var html = template({entries: Partsy.entries});

	$('#gallery').html(html);
}

function partsy_init() {
	$('#sort button').click(function () {
		partsy_sort($(this).val());
	});

	$('#status #more').click(function () {
		partsy_load(false);
	});

	partsy_load(true);
}

$(document).ready(function () {
	partsy_init();
});