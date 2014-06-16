function FetchResult(status, profile) {
	this.status = status;
	this.profile = profile || null;
}

FetchResult.NOTFOUND = 'NOTFOUND';
FetchResult.OK = 'OK';

FetchResult.ok = function(profile) {
	return new FetchResult(
		FetchResult.OK,
		profile);
};

FetchResult.notFound = function() {
	return new FetchResult(
		FetchResult.NOTFOUND,
		null);
};

module.exports = FetchResult;