##define URL_GET_MY_CHALLENGES @"http://quippics-dev.herokuapp.com/api/v1/users/%@/challenges/page/%i"//:uid :page
looks correct
##define URL_REGISTER @"http://quippics-dev.herokuapp.com/api/v1/register"
looks correct
##define URL_Login @"http://quippics-dev.herokuapp.com/api/v1/users"
looks correct, note this also returns the userid of the username
##define URL_GET_FRIENDS @"http://quippics-dev.herokuapp.com/api/v1/users/%@/friends"
this is wrong, according to github documentation this should be /v1/users/%@/friends/page/%i
##define URL_GET_RESENT @"http://quippics-dev.herokuapp.com/api/v1/activities/page/%i"
What is this route, 'resent' for? If it's for activities please look at the mocksups and documentation
##define URL_USERS @"http://quippics-dev.herokuapp.com/api/v1/users/page/%i"
this is wrong, according to github documentation this should be /users/%@/users/page/%i
##define URL_PRO_INFO @"http://quippics-dev.herokuapp.com/api/v1/users/%@"
looks correct
##define URL_GET_CHALLANGES @"http://quippics-dev.herokuapp.com/api/v1/challenges/page/%i"
what is this route for? it doesn't appear in the mockups and has been depreciated for a while
##define URL_CREATE_CHALLANGES @"http://quippics-dev.herokuapp.com/api/v1/challenges"
looks correct
##define URL_GET_CHALLEGE_BY_ID @"http://quippics-dev.herokuapp.com/api/v1/challenges/%@"
this route doesn't exist, doublecheck you actually use this route as I am unsure where you would use this
##define URL_CREAT_NEW_SUBMISSION @"http://quippics-dev.herokuapp.com/api/v1/challenges/%@/submissions"
looks correct
##define URL_TOP_SUBMISSION @"http://quippics-dev.herokuapp.com/api/v1/challenges/%@/submissions/top"
looks correct
##define URL_All_SUBMISSION @"http://quippics-dev.herokuapp.com/api/v1/challenges/%@/submissions"
##define URL_GET_MY_SUBMISSION @"http://quippics-dev.herokuapp.com/api/v1/challenges/%@/submissions/users/%@"
looks correct
##define URL_UpdateProfile @"http://quippics-dev.herokuapp.com/api/v1/users/%@"
looks correct
##define URL_Search @"http://quippics-dev.herokuapp.com/api/v1/users/search/%@"
looks correct
##define URL_AddFriend @"http://quippics-dev.herokuapp.com/api/v1/users/%@/friends"
this is wrong, according to github documentation there is no such route to directly add friends
##define URL_GET_SUBMISSION @"http://quippics-dev.herokuapp.com/api/v1/challenges/%@/submissions/%@"//:cid :sid
looks correct
##define URL_GET_USER_Submitions @"http://quippics-dev.herokuapp.com/api/v1/challenges/%@/submissions/users/%@/voted"//cid:uid
looks correct
##define URL_Get_Archive @"http://quippics-dev.herokuapp.com/api/v1/users/%@/submissions/archive"//:uid
this is wrong, according to github documentation should be /users/%@/challenges/archive/page/%i
note: these are actually challenges that are being returned, not submissions
##define URL_POST_SUBMITTION @"http://quippics-dev.herokuapp.com/api/v1/challenges/%@/submissions"
looks correct
##define URL_POST_COMMENT @"http://quippics-dev.herokuapp.com/api/v1/challenges/%@/submissions/%@/comments"
looks correct
##define URL_GET_COMMENTS @"http://quippics-dev.herokuapp.com/api/v1/challenges/%@/submissions/%@/comments"
looks correct
##define URL_GET_USER_LIST_OF_INVITED_ChALLENGES @"http://quippics-dev.herokuapp.com/api/v1/users/%@/challenges/invited"
this is wrong, according to github documentation should be /users/%@/challenges/page/%i
also, more generally, this is a list of challenges where the user is invited, public, and not expired
##define URL_POST_RATE_SUBMISSION @"http://quippics-dev.herokuapp.com/api/v1/challenges/%@/submissions/%@/ballots"//cid.sid
looks correct
##MISSING
there are no routes around accepting friends, declining friends, getting my activities, accepting
a challenge, rejecting challenges, etcetc.
