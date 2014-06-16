var q = require('q');
var util = require('util');
var cheerio = require('cheerio');
var request = require('request');
var NodeCache = require('node-cache');

var Profile = require('./lib/Profile');
var FetchResult = require('./lib/FetchResult');

var RE_LINK = /^((http|https):\/\/)?((m|mobile|www)\.)?twitter\.com\/([\w_]+)\/?$/i;
var RE_SCREENNAME = /^@?([\w_]+)$/i;
var TPL_URL = 'https://mobile.twitter.com/%s';
var HEADER_UA = 'User-Agent:Mozilla/5.0 (X11; Linux i686) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/33.0.1750.149 Safari/537.36';

var RE_COMMA_NUMBER = /^(\d+)(,(\d+))*$/gi;
var RE_SPACE_NUMBER = /^(\d+)(\s+(\d+))*$/gi;

var DOM_DETAILS_TABLE = 'table.profile-details';
var DOM_SCREEN_NAME = '.screen-name';
var DOM_LOCATION = '.location';
var DOM_STATNUM = '.statnum';
var DOM_AVATAR = '.avatar img';
var DOM_NAME = '.fullname';
var DOM_STAT = 'td.stat';
var DOM_BIO = '.bio';

var CACHE_TTL = 100; //seconds
var CACHE_CHECK_PERIOD = 120; //seconds

var cache = new NodeCache({
  stdTTL: CACHE_TTL,
  ccheckperiod: CACHE_CHECK_PERIOD
});

function normalize(ref) {
  var m;
  if ('[object String]' !== Object.prototype.toString.call(ref)) {
    throw new TypeError('ref must be a string');
  }
  ref = ref.trim();

  m = ref.match(RE_SCREENNAME);
  if (m) {
    return m[1];
  }

  m = ref.match(RE_LINK);
  if (m) {
    return m[5];
  }
  return null;
}

function safeTrim(value) {
  if (!value) {
    return value;
  }
  return value.trim();
}

function parseNumber(numText) {
  numText = ('' + numText).trim();
  if (numText.match(RE_COMMA_NUMBER) || numText.match(RE_SPACE_NUMBER)) {
    return parseInt(numText.replace(/\D+/g, ''), 10);
  }
  return null;
}

function domParseRequest(body) {
  var $ = cheerio.load(body);
  var tableDetails = $(DOM_DETAILS_TABLE);

  var screenName = safeTrim(tableDetails.find(DOM_SCREEN_NAME).text());
  var name = safeTrim(tableDetails.find(DOM_NAME).text());
  if (!screenName || !name) {
    return null;
  }

  var bio = safeTrim(tableDetails.find(DOM_BIO).text());
  var avatar = safeTrim(tableDetails.find(DOM_AVATAR).attr('src'));
  var location = safeTrim(tableDetails.find(DOM_LOCATION).text());


  var profile = {
    screenName: screenName,
    location: location,
    avatar: avatar,
    name: name,
    bio: bio,
  };

  var statBlocks = $(DOM_STAT);
  if (statBlocks.length === 3) {
    var tweetsCount = $(statBlocks[0]).find(DOM_STATNUM).text();
    var friendsCount = $(statBlocks[1]).find(DOM_STATNUM).text();
    var followersCount = $(statBlocks[2]).find(DOM_STATNUM).text();

    profile.tweetsCount = parseNumber(tweetsCount);
    profile.friendsCount = parseNumber(friendsCount);
    profile.followersCount = parseNumber(followersCount);
  }


  return profile;
}

function fetchByScreenName(screenName, cb) {
  var cached = cache.get(screenName)[screenName];
  if (cached) {
    cb(null, cached);
    return;
  }

  var url = util.format(TPL_URL, screenName);
  request({
    url: url,
    headers: {
      'User-Agent': HEADER_UA
    }
  }, function(err, res, body) {
    if (err) {
      cb(err);
      return;
    }
    var result;

    if (200 === res.statusCode) {
      var profile = domParseRequest(body);
      result = new FetchResult.ok(new Profile(profile));
      cache.set(screenName, result);
      cb(null, result);
      return;
    }

    if (404 === res.statusCode) {
      result = new FetchResult.notFound();
      cache.set(screenName, result);
      cb(null, result);
      return;
    }

    cb(new Error('HTTP_' + res.statusCode));

  });
}

function fetchByRef(ref, cb) {
  var screenName;
  screenName = normalize(ref);
  if (screenName === null) {
    cb(TypeError('Illegal screen name'));
    return;
  }
  fetchByScreenName(screenName, cb);
}

var qFetchByRef = q.denodeify(fetchByRef);
module.exports = {
  fetchByRef: qFetchByRef
};