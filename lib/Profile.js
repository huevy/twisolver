function Profile(data) {
	this.screenName = data.screenName;
	this.location = data.location;
	this.avatar = data.avatar;
	this.name = data.name;
	this.bio = data.bio;

	this.tweetsCount = data.tweetsCount;
	this.friendsCount = data.friendsCount;
	this.followersCount = data.followersCount;
}

module.exports = Profile;