Challenge.aggregate(
[
  {$match: {privacy: 'private'}},
  {$project: {bigTitle: {$toUpper: '$title'}, _id:0}}
],
function(err, results){
  console.log(results);
});

Challenge.aggregate(
[
  {$unwind: '$participants'}
],
function(err, results){
  console.log(results);
});

User.aggregate([
  {$match: {_id: {$in: [ObjectId( "53dcb70a52ed92f4ff2b73fe"), ObjectId("53dcb70a52ed92f4ff2b73ff")]}}},
  {$unwind: "$devices"},
  {$project: {
    uuid: '$devices.uuid',
    timestamp: '$devices.timestamp',
    _id: 0
  }}
], p);

Challenge.aggregate([
  {$project: {participants: 1}},
  {$match: {_id: ObjectId("53db22048b4b826fd45d5cc7")}},
  {$unwind: "$participants"},
  {$match: {'participants.inviteStatus': {$in: ['invited', 'accepted']}}}
], p);

Challenge.find({
  participants: {
    $elemMatch:{ //returns one challenge that matches the following exactly
      user: ObjectId('53ed30726cb7710000990c28'),
      inviteStatus: {$ne: 'declined'}
    }
  }
}, '_id title', p); //get challenge where not declined

Challenge.aggregate(
  {$project: {participants: 1}},
  {$match: {_id: submission.challenge._id}},
  {$unwind: "$participants"},
  {$match: {'participants.inviteStatus': {$in: ['invited', 'accepted']}}},
  {$project: {
    inviteStatus: '$participants.inviteStatus',
    user: '$participants.user'
  }}

Challenge.aggregate(
[
  {$match: {privacy: 'private'}},
  {$project:{title:1, participants:1}},
  {$unwind: '$participants'},
  {
    $group: {
      _id: '$_id',
      numParticipants: {$sum: 1}
    }
  }
],
function(err, results){
  console.log(results);
});

  Challenge.find({}, {participants: {$elemMatch: {user: '53a54d8fef9e460000c98d66'}}}).select('_id owner title createdOn expiration participants invites').exec(p);
