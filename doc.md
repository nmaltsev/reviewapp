Examples of API usage

``` typescript
const SCHEMAORG:RDF.Namespace = $rdf.Namespace('https://schema.org/');

$rdf.sym(SCHEMAORG('Review')).toNT() === "<https://schema.org/Review>"

$rdf.triple(
    $rdf.sym(SCHEMAORG('Review')), 
    $rdf.sym(SCHEMAORG('Review')), 
    $rdf.sym(SCHEMAORG('Review'))
).toNT() === "<https://schema.org/Review> <https://schema.org/Review> <https://schema.org/Review> ."

$rdf.quad(
    $rdf.sym(SCHEMAORG('Review')), 
    $rdf.sym(SCHEMAORG('Review')), 
    $rdf.sym(SCHEMAORG('Review')), 
    $rdf.sym(SCHEMAORG('Review'))
).toCanonical() === "<https://schema.org/Review> <https://schema.org/Review> <https://schema.org/Review> <https://schema.org/Review> ."


```
***************************************

## Wrapper for primitive values
``` javascript
$rdf.term(3).toNT() === '"3"^^<http://www.w3.org/2001/XMLSchema#integer>'
```
***************************************

Working with graph

``` Javascript
var RDF = $rdf.Namespace("http://www.w3.org/1999/02/22-rdf-syntax-ns#");
var DCT = $rdf.Namespace("http://purl.org/dc/terms/");
var SIOC = $rdf.Namespace("http://rdfs.org/sioc/ns#");

var g = $rdf.graph();

// set triples
g.add($rdf.sym(followURI), RDF('type'), SIOC('Usergroup'));
g.add($rdf.sym(followURI), DCT('created'), $rdf.lit(Date.now(), '', $rdf.Symbol.prototype.XSDdateTime));
// ...
var user = $scope.users[key];
var uid = '#user_'+i;
// add hash id to main graph
g.add($rdf.sym(followURI), SIOC('has_member'), $rdf.sym(uid));
g.add($rdf.sym(uid), RDF('type'), SIOC('UserAccount'));
g.add($rdf.sym(uid), SIOC('account_of'), $rdf.sym(user.webid));
g.add($rdf.sym(uid), SIOC('name'), $rdf.lit(user.name));
g.add($rdf.sym(uid), SIOC('avatar'), $rdf.sym(user.pic));
// ...
// add the channel reference back to the user
g.add($rdf.sym(uid), SIOC('feed'), $rdf.sym(ch_id));
// add channel details
g.add($rdf.sym(ch_id), RDF('type'), SIOC('Container'));
g.add($rdf.sym(ch_id), SIOC('link'), $rdf.sym(ch.uri));
g.add($rdf.sym(ch_id), DCT('title'), $rdf.lit(ch.title));

// ...
// serialize graph
var s = new $rdf.Serializer(g).toN3(g);
// ...

```

***************************************

Update request
``` javascript
$http({
    method: 'PUT', 
    url: uri,
    data: resource,
    headers: {
    'Content-Type': 'text/turtle',
    'Link': '<http://www.w3.org/ns/ldp#Resource>; rel="type"'
    },
    withCredentials: true
}).

```
remove resource
``` javascript
var uri = $scope.currentapp.id;
$http({
        method: 'DELETE',
        url: uri,
        withCredentials: true
    }).

```
*********************************

# Creating new storage
``` Javascript
var storage = ($scope.storageuri)?$scope.storageuri:'shared/';
// replace whitespaces and force lowercase
storage = storage.toLowerCase().split(' ').join('_');

// add trailing slash since we have dir
if (storage.substring(storage.length - 1) != '/')
    storage = storage+'/';

var RDF = $rdf.Namespace("http://www.w3.org/1999/02/22-rdf-syntax-ns#");
var DCT = $rdf.Namespace("http://purl.org/dc/terms/");
var FOAF = $rdf.Namespace('http://xmlns.com/foaf/0.1/');
var SPACE = $rdf.Namespace("http://www.w3.org/ns/pim/space#");
var SIOC = $rdf.Namespace("http://rdfs.org/sioc/ns#");
var g = $rdf.graph();

// add storage triple
g.add($rdf.sym($scope.me.webid), SPACE('storage'), $rdf.sym(storage));

var s = new $rdf.Serializer(g).toN3(g);
console.log(s);
if (s.length > 0) {
    $.ajax({
        type: "POST",
        url: $scope.me.webid,
        contentType: "text/turtle",
        data: s,
        processData: false,
        xhrFields: {
            withCredentials: true
        },
```


``` Javascript
console.log('Success! Created new uB directory at '+mburi+'/');
g.add($rdf.sym(mburi+'/'), RDF('type'), SIOC('Space'));
g.add($rdf.sym(mburi+'/'), DCT('title'), $rdf.lit("Microblogging workspace"));
g.add($rdf.sym(mburi+'/'), LDPX('ldprPrefix'), $rdf.lit("ch"));
```


## ACL

Send Head request to get headers!

``` Javascript
// set the corresponding ACLs for the given post, using the right ACL URI
$scope.setACL = function(uri, type, defaultForNew) {
    // get the acl URI first
    $.ajax({
        type: "HEAD",
        url: uri,
        xhrFields: {
            withCredentials: true
        },
        success: function(d,s,r) {
            // acl URI
            var acl = parseLinkHeader(r.getResponseHeader('Link'));
            var aclURI = acl['acl']['href'];
            // frag identifier
            var frag = '#'+basename(uri);

            var RDF = $rdf.Namespace("http://www.w3.org/1999/02/22-rdf-syntax-ns#");
            var WAC = $rdf.Namespace("http://www.w3.org/ns/auth/acl#");
            var FOAF = $rdf.Namespace("http://xmlns.com/foaf/0.1/");

            var g = $rdf.graph();
            // add document triples
            g.add($rdf.sym(''), RDF('type'), WAC('Authorization'));
            g.add($rdf.sym(''), WAC('accessTo'), $rdf.sym(''));
            g.add($rdf.sym(''), WAC('accessTo'), $rdf.sym(uri));
            g.add($rdf.sym(''),	WAC('agent'), $rdf.sym($scope.me.webid));
            g.add($rdf.sym(''),	WAC('mode'), WAC('Read'));
            g.add($rdf.sym(''),	WAC('mode'), WAC('Write'));

            // add post triples
            g.add($rdf.sym(frag), RDF('type'), WAC('Authorization'));
            g.add($rdf.sym(frag), WAC('accessTo'), $rdf.sym(uri));
            // public visibility
            if (type == 'public' || type == 'friends') {
                g.add($rdf.sym(frag), WAC('agentClass'), FOAF('Agent'));
                g.add($rdf.sym(frag), WAC('mode'), WAC('Read'));
            } else if (type == 'private') {
                // private visibility
                g.add($rdf.sym(frag), WAC('agent'), $rdf.sym($scope.me.webid));
                g.add($rdf.sym(frag), WAC('mode'), WAC('Read'));
                g.add($rdf.sym(frag), WAC('mode'), WAC('Write'));
            }
            if (defaultForNew && uri.substring(uri.length - 1) == '/')
                g.add($rdf.sym(frag), WAC('defaultForNew'), $rdf.sym(uri));

            var s = new $rdf.Serializer(g).toN3(g);

            if (s && aclURI) {
                $.ajax({
                    type: "PUT", // overwrite just in case
                    url: aclURI,
                    contentType: "text/turtle",
                    data: s,
                    processData: false,
                    xhrFields: {
                        withCredentials: true
                    },
                    statusCode: {
                        200: function(data) {
                            console.log("200 Created");
                        },
                        401: function() {
                            console.log("401 Unauthorized");
                            notify('Error', 'Unauthorized! You need to authentify before posting.');
                        },
                        403: function() {
                            console.log("403 Forbidden");
                            notify('Error', 'Forbidden! You are not allowed to update the selected profile.');
                        },
                        406: function() {
                            console.log("406 Content-type unacceptable");
                            notify('Error', 'Content-type unacceptable.');
                        },
                        507: function() {
                            console.log("507 Insufficient storage");
                            notify('Error', 'Insuffifient storage left! Check your server storage.');
                        },
                    },
                    success: function(d,s,r) {
                        console.log('Success! ACLs are now set.');
                    }
                });
            }
        }
    });
}
```

**************************************************

## TODO

``` Javascript
// get relevant info for a webid
$scope.getInfo = function(webid, mine, update) {
    if (mine)
        $scope.loading = true;

    $scope.found = true;

    var RDF = $rdf.Namespace("http://www.w3.org/1999/02/22-rdf-syntax-ns#");
    var FOAF = $rdf.Namespace("http://xmlns.com/foaf/0.1/");
    var SPACE = $rdf.Namespace("http://www.w3.org/ns/pim/space#");
    var ACL = $rdf.Namespace("http://www.w3.org/ns/auth/acl#");
    var g = $rdf.graph();
    var f = $rdf.fetcher(g, TIMEOUT);
    // add CORS proxy
    $rdf.Fetcher.crossSiteProxyTemplate=PROXY;

    var docURI = webid.slice(0, webid.indexOf('#'));
    var webidRes = $rdf.sym(webid);

    // fetch user data
    f.nowOrWhenFetched(docURI,undefined,function(ok, body) {
        if (!ok) {
            if ($scope.search && $scope.search.webid && $scope.search.webid == webid) {
                notify('Warning', 'WebID profile not found.');
                $scope.found = false;
                $scope.searchbtn = 'Search';
                $scope.$apply();
            }
        }
        // get some basic info
        var name = g.any(webidRes, FOAF('name'));
        var pic = g.any(webidRes, FOAF('img'));
        var depic = g.any(webidRes, FOAF('depiction'));
        // get storage endpoints
        var storage = g.any(webidRes, SPACE('storage'));
        // get list of delegatees
        var delegs = g.statementsMatching(webidRes, ACL('delegatee'), undefined);
/*			if (delegs.length > 0) {
            jQuery.ajaxPrefilter(function(options) {
                options.url = AUTH_PROXY + encodeURIComponent(options.url);
            });
        }
*/
        // Clean up name
        name = (name)?name.value:'';

        // set avatar picture
        if (pic) {
            pic = pic.value
        } else {
            if (depic)
                pic = depic.value;
            else
                pic = 'img/generic_photo.png';
        }

        var _user = {
                webid: webid,
                name: name,
                pic: pic,
                storagespace: storage
            }

        // add to search object if it was the object of a search
        if ($scope.search && $scope.search.webid && $scope.search.webid == webid)
            $scope.search = _user;

        if (update) {
            $scope.refreshinguser = true;
            $scope.users[webid].name = name;
            $scope.users[webid].pic = pic;
            $scope.users[webid].storagespace = storage;
        }

        // get channels for the user
        if (storage != undefined) {
            storage = storage.value;
            // get channels for user
            $scope.getChannels(storage, webid, mine, update);
        } else {
            $scope.gotstorage = false;
        }

        if (mine) { // mine
            $scope.me.name = name;
            $scope.me.pic = pic;
            $scope.me.storagespace = storage;

            // find microblogging feeds/channels
            if (!storage)
                $scope.loading = false; // hide spinner

            // cache user credentials in sessionStorage
            $scope.saveCredentials();
            // also add myself to the users list
            //$scope.users[webid] = _user;
            // update DOM
            $scope.loggedin = true;
            $scope.profileloading = false;
            $scope.$apply();
        }
    });
    if ($scope.search && $scope.search.webid && $scope.search.webid == webid)
        $scope.searchbtn = 'Search';
}

// get channel feeds based on a storage container
$scope.getChannels = function(uri, webid, mine, update) {
    var RDF = $rdf.Namespace("http://www.w3.org/1999/02/22-rdf-syntax-ns#");
    var DCT = $rdf.Namespace("http://purl.org/dc/terms/");
    var FOAF = $rdf.Namespace("http://xmlns.com/foaf/0.1/");
    var SIOC = $rdf.Namespace("http://rdfs.org/sioc/ns#");
    var SPACE = $rdf.Namespace("http://www.w3.org/ns/pim/space#");
    var g = $rdf.graph();
    var f = $rdf.fetcher(g, TIMEOUT);
    // add CORS proxy
    $rdf.Fetcher.crossSiteProxyTemplate=PROXY;
    $.ajax ({
        type:"GET",
    url:uri,
    processData: false,
        headers: {
        Accept: 'text/turtle'
    },
        xhrFields: { withCredentials: true },
    success: function(d,s,r) {
            var l = r.getResponseHeader('Link');
            if (l != null) {
            var meta = parseLinkHeader(l);
            var metaURI = meta['meta']['href'];
            if (metaURI.indexOf ('/.') != -1)
        meta_starts_with_dot = true;
            }
            },
        error: function() {}});
    // fetch user data: SIOC:Space -> SIOC:Container -> SIOC:Post
    f.nowOrWhenFetched(uri,undefined,function(){
        // find all SIOC:Container
        var ws = g.statementsMatching(undefined, RDF('type'), SIOC('Space'));

        if (ws.length > 0) {
            // set a default Microblog workspace
            if (mine) {
                // set default Microblog space
                $scope.me.mbspace = ws[0]['subject']['value'];
                // get the list of people I'm following + channels + posts
                $scope.getUsers(true);
            }
            for (var i in ws) {
                w = ws[i]['subject']['value'];

                // find the channels info for the user (from .meta files)
                f.nowOrWhenFetched(w + (meta_starts_with_dot ? '.*' : '*'), undefined,function(){
                    var chs = g.statementsMatching(undefined, RDF('type'), SIOC('Container'));
                    var channels = [];

                    if (chs.length > 0) {
                        // clear list first
                        if (mine)
                            $scope.me.channels = [];
                        if (update)
                            $scope.users[webid].channels = [];

                        for (var ch in chs) {
                            var channel = {};
                            channel.uri = chs[ch]['subject']['value'];
                            var title = g.any(chs[ch]['subject'], DCT('title')).value;

                            if (title)
                                channel.title = title;
                            else
                                channel.title = channel.uri;

                            // add channel to the list
                            channels.push(channel);

                            // mine
                            if (mine) {
                                $scope.me.channels.push(channel);
                                // force get the posts for my channels
                                $scope.getPosts(channel.uri, channel.title);
                                $scope.me.chspace = true;
                            }

                            // update
                            if (update) {
                                var exists = findWithAttr($scope.users[webid].channels, 'uri', channel.uri);
                                if (exists == undefined) {
                                    $scope.users[webid].channels.push(channel);
                                }
                            }
                        }

                        // set a default channel for the logged user
                        if (mine)
                            $scope.defaultChannel = $scope.me.channels[0];

                        // done refreshing user information -> update view
                        if (update) {
                            $scope.addChannelStyling(webid, $scope.users[webid].channels);
                            delete $scope.users[webid].refreshing;
                            $scope.$apply();
                        }
                    } else {
                        console.log('No channels found!');
                        if (mine) {
                            // hide loader
                            $scope.loading = false;
                            $scope.me.chspace = false;
                        }
                    }

                    // also save updated users & channels list
                    if (update)
                        $scope.saveUsers();

                    // if we were called by search
                    if ($scope.search && $scope.search.webid && $scope.search.webid == webid) {
                        $scope.search.channels = channels;
                        $scope.drawSearchResults();
                    }

                    if (mine) {
                        $scope.saveCredentials();
                        $scope.$apply();
                    }
                });
            }
        } else { // no Microblogging workspaces found!
            // we were called by search
            if ($scope.search && $scope.search.webid && $scope.search.webid == webid) {
                $scope.drawSearchResults();
            }

            if (mine) {
                console.log('No microblog found!');
                $scope.gotmb = false;
                $scope.me.mbspace = false;
                $scope.me.chspace = false;
                $scope.me.channels = [];
                $scope.saveCredentials();
                // hide loader
                $scope.loading = false;
                $scope.$apply();
            }
        }
    });
}

$scope.getPosts = function(channeluri, title) {
        var RDF = $rdf.Namespace("http://www.w3.org/1999/02/22-rdf-syntax-ns#");
        var DCT = $rdf.Namespace("http://purl.org/dc/terms/");
        var FOAF = $rdf.Namespace("http://xmlns.com/foaf/0.1/");
        var SIOC = $rdf.Namespace("http://rdfs.org/sioc/ns#");
        var SPACE = $rdf.Namespace("http://www.w3.org/ns/pim/space#");

        var g = $rdf.graph();
        var f = $rdf.fetcher(g, TIMEOUT);

        // add CORS proxy
        $rdf.Fetcher.crossSiteProxyTemplate=PROXY;

        // get all SIOC:Post (using globbing)
        f.nowOrWhenFetched(channeluri+'*', undefined, function(){

            var posts = g.statementsMatching(undefined, RDF('type'), SIOC('Post'));

            if (posts.length > 0) {

                for (var p in posts) {
                    var uri = posts[p]['subject'];                    
                    var useraccount = g.any(uri, SIOC('has_creator'));
                    var post = g.statementsMatching(posts[p]['subject']);
                    var body = ''; //default 
                    var username = ''; //default
                    var userpic = 'assets/generic_photo.png'; //default
                    var userwebid; //default
                    var date = ''; //default

                    if (g.any(uri, DCT('created'))) {
                        var d = g.any(uri, DCT('created')).value;
                        date = moment(d).zone('00:00');
                    }

                    if (g.any(useraccount, SIOC('account_of'))) {
                        userwebid = g.any(useraccount, SIOC('account_of')).value;
                    } else {
                        userwebid = undefined;
                    }

                    // try using the picture from the WebID first

                    if (userwebid && $scope.users[userwebid]) {
                        userpic = $scope.users[userwebid].picture;
                    }
                    else if (g.any(useraccount, SIOC('avatar'))) {
                        userpic = g.any(useraccount, SIOC('avatar')).value;
                    }

                    // try using the name from the WebID first
                    if (userwebid && $scope.users[userwebid]) {
                        username = $scope.users[userwebid].name;
                    } else if (g.any(useraccount, FOAF('name'))) {
                        username = g.any(useraccount, FOAF('name')).value;
                    } else {
                        username = '';
                    }

                    if (g.any(uri, SIOC('content'))) {
                        body = g.any(uri, SIOC('content')).value;
                    } else {
                        body = '';
                    }

                    uri = uri.value;

                    // check if we need to overwrite instead of pushing new item

                    var _newPost = {
                        uri : uri,
                        channel: channeluri,
                        chtitle: title,
                        date : date,
                        userwebid : userwebid,
                        userpic : userpic,
                        username : username,
                        body : body
                    };

                    if (!$scope.posts) {
                        $scope.posts =  {};
                    }

                    if ($scope.channels[channeluri]) {
                        if (!$scope.channels[channeluri]['posts']) {
                            $scope.channels[channeluri]['posts'] = []; 
                        }
                        $scope.channels[channeluri].posts.push(_newPost);
                    }


                    // add to user's channels
                    if ($scope.users[userwebid] &&
                        $scope.users[userwebid].channels &&
                        $scope.users[userwebid].channels[channeluri]) {
                        if (!$scope.users[userwebid].channels[channeluri]['posts']) {
                            $scope.users[userwebid].channels[channeluri]["posts"] = [];
                        }
                        $scope.users[userwebid].channels[channeluri].posts.push(_newPost);
                    }

                    // filter post by language (only show posts in English or show all) 
                    //not implemented yet ^, currently a redundant if/else statement        
                    if ($scope.filterFlag && testIfAllEnglish(_newPost.body)) {
                        // add/overwrite post
                        $scope.posts[uri] = _newPost; 
                        $scope.$apply();
                    } else {
                        $scope.posts[uri] = _newPost;
                        $scope.$apply();
                    }             
                    if (!$scope.users[$scope.userProfile.webid]) {
                        $scope.users[$scope.userProfile.webid] = {};
                    }       
                    $scope.users[$scope.userProfile.webid].gotposts = true;
                }
            } else {
                if (isEmpty($scope.posts)) {
                    $scope.users[$scope.userProfile.webid].gotposts = false;
                }
            }
            // hide spinner
            $scope.loading = false;
            ngProgress.complete(); 
            $scope.$apply();
        });
    };

```