Activity
----------------------
Routes here are related to viewing activities

####List activities for all of the user's friends
#####_Status: Developed, Tested
GET v1/activities/users/:uid/friends/page/:page (depreciated)
GET v1/users/:uid/friends/activities/page/:page (preferred)

Example Response for Ballots
```
{
  "sentence": "sleepyfloydshaan3069496 voted on, jack19853069496update's photo in, Frisby Challenge 1 a 10/10",
  "object": {
      "_id": "536eab78486cbdb681000005",
      "username": "jack19853069496update",
      "thumbnail": {
          "contentType": "image/png",
          "data": "iVBORw0KGgoAAAANSUhEUgAAAFoAAAB
      }
  },
  "subject": {
      "username": "sleepyfloydshaan3069496",
      "_id": "536eab78486cbdb681000006"
  },
  "score": 10,
  "modelType": "Ballot",
  "_id": "536eab7a486cbdb68100001e",
  "owner": null,
  "references": {
      "submission": {
          "_id": "536eab79486cbdb681000010",
          "owner": "536eab78486cbdb681000005"
      },
      "challenge": {
          "_id": "536eab78486cbdb68100000b",
          "expiration": "2013-11-15T08:00:00.000Z",
          "owner": "536eab78486cbdb681000005",
          "title": "Frisby Challenge 1"
      }
  },
  "date": "2014-05-10T22:43:06.033Z"
}
```

Example Response for Comments
```
{
  "sentence": "jill19873069496 commented on, jack19853069496update's photo",
  "modelType": "Comment",
  "object": {
      "_id": "536eab78486cbdb681000005",
      "username": "jack19853069496update",
      "thumbnail": {
          "contentType": "image/png",
          "data": "iVBORw0KGgoAAAANSUhEUgAAAFo      }
  },
  "subject": {
      "_id": "536eab77486cbdb681000003",
      "username": "jill19873069496",
      "thumbnail": {
          "data": "iVBORw0KGgoAAAANSUhEUgAAAFo
          "contentType": "image/png"
      }
  },
  "_id": "536eab7b486cbdb681000022",
  "owner": null,
  "references": {
      "submission": {
          "_id": "536eab79486cbdb681000010",
          "owner": "536eab78486cbdb681000005"
      },
      "comment": "536eab7b486cbdb681000021",
      "challenge": null
  },
  "date": "2014-05-10T22:43:07.237Z"
}
```

Example Response for Submissions
```
{
  "sentence": "jill19873069496 submitted into challenge, Frisby Challenge 1",
  "subject": {
      "_id": "536eab77486cbdb681000003",
      "username": "jill19873069496",
      "thumbnail": {
          "data": "iVBORw0KGgoAAAANSUhEUgAAAFo,
          "contentType": "image/png"
      }
  },
  "owner": 536eab77486cbdb681000003,
  "modelType": "Submission",
  "_id": "536eab79486cbdb681000014",
  "object": null,
  "references": {
      "challenge": {
          "_id": "536eab78486cbdb68100000b",
          "expiration": "2013-11-15T08:00:00.000Z",
          "owner": "536eab78486cbdb681000005",
          "title": "Frisby Challenge 1"
      },
      "submission": {
          "_id": "536eab79486cbdb681000011",
          "owner": "536eab77486cbdb681000003"
      }
  },
  "date": "2014-05-10T22:43:05.245Z"
}
```

Example Response for Challenge
```
{
  "sentence": "jack19853069496update created a challenge, Frisby Challenge 1",
  "subject": {
      "_id": "536eab78486cbdb681000005",
      "username": "jack19853069496update",
      "thumbnail": {
          "contentType": "image/png",
          "data": "iVBORw0KGgoAAAANSUhEUgAAAFoAAABaAQAAAAAQ03yvAAAABGdBTUEAAYagMeiWXwAAAAJiS0dEAAHdihOkAAAACXBIWXMAABYlAAAWJQFJUiTwAAAAEklEQVQ4y2NgGAWjYBSMgsECAASSAAEg+JsVAAAAJXRFWHRkYXRlOmNyZWF0ZQAyMDE0LTA1LTEwVDE1OjQzOjA0LTA3OjAw+/vvZQAAACV0RVh0ZGF0ZTptb2RpZnkAMjAxNC0wNS0xMFQxNTo0MzowNC0wNzowMIqmV9kAAAAASUVORK5CYII="
      }
  },
  "modelType": "Challenge",
  "_id": "536eab78486cbdb68100000c",
  "object": null,
  "owner": null,
  "references": {
      "challenge": {
          "_id": "536eab78486cbdb68100000b",
          "expiration": "2013-11-15T08:00:00.000Z",
          "owner": "536eab78486cbdb681000005",
          "title": "Frisby Challenge 1"
      },
      "submission": null
  },
  "date": "2014-05-10T22:43:04.923Z"
},
```

####List activities specific to the user
#####_Status: Developed, Tested
GET v1/activities/users/:uid/page/:page (depreciated)
GET v1/users/:uid/activities/page/:page (preferred)

Example Response
(same as above for activities of all the user's friends)
[Linky](list-activities-for-all-of-the-user's-friends)
