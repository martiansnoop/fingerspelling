const cacheName = "cache-v1";
const urlsToCache = [
    "words.txt",
	"images/a.gif",
	"images/b.gif",
	"images/c.gif",
	"images/d.gif",
	"images/e.gif",
	"images/f.gif",
	"images/g.gif",
	"images/h.gif",
	"images/i.gif",
	"images/j.gif",
	"images/k.gif",
	"images/l.gif",
	"images/m.gif",
	"images/n.gif",
	"images/o.gif",
	"images/p.gif",
	"images/q.gif",
	"images/r.gif",
	"images/s.gif",
	"images/t.gif",
	"images/u.gif",
	"images/v.gif",
	"images/w.gif",
	"images/x.gif",
	"images/y.gif",
	"images/z.gif"
];

self.addEventListener("install", function(event) {
	event.waitUntil(
		caches.open(cacheName)
			.then(cache => {
				return cache.addAll(urlsToCache);	
			})
	);
});

self.addEventListener("fetch", function(event) {
	event.respondWith(
		caches.match(event.request)
			.then(function(response) {
                if (response) {
                    return response;
                }				
                return fetch(event.request);
			})
	);
});

