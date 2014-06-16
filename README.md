twisolver
=========

Twitter resolver that does not require Twitter API

## Installation

    npm install git://github.com/huevy/twisolver.git#master

## Usage example

```javascript
var twisolver = require('twisolver');
twisolver.fetchByRef('@microsoft')
  .then(function(result) {
    console.log(result);
  }, function(error) {
    console.error('ERROR:', error);
  });
```

Result:

```
{ status: 'OK',
  profile:
   { screenName: 'Microsoft',
     location: 'Redmond, WA',
     avatar: 'https://pbs.twimg.com/profile_images/453557798576476160/75K_F9Ck_normal.png',
     name: 'Microsoft',
     bio: 'The official Twitter page for Microsoft consumer products and your source for major announcements and events.',
     tweetsCount: 9048,
     friendsCount: 1159,
     followersCount: 4886768 } }

```
