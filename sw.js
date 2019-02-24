const assetCache = "cache-v1";
const assetUrls = [
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

const appShellCache = "app-shell-cache-v1";
const appShellUrls = [
    "styles.css",
    "fingerspelling.js",
    "/"
];

const cacheNames = [assetCache, appShellCache];
const cacheUrlsByName = {
    [assetCache]: assetUrls,
    [appShellCache]: appShellUrls
};

self.addEventListener("install", function(event) {
    console.log("sw install");
    event.waitUntil(
        Promise.all(
            cacheNames.map(name => {
                return caches.open(name)
                    .then(cache => cache.addAll(cacheUrlsByName[name]));
            })
        )
    );
});

self.addEventListener("activate", function(event) {
    console.log("sw activate");
    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames
                    .filter(name => !cacheNames.includes(name))
                    .map(name => caches.delete(name))
            );
        })
    );
});

self.addEventListener("fetch", function(event) {
    event.respondWith(
        caches.match(event.request)
            .then(function(response) {
                if (response) {
                    console.log("cached response for", event.request );
                    return response;
                }				
                console.log("going to network for", event.request);
                return fetch(event.request);
            })
    );
});

