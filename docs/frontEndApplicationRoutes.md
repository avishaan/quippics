#define URL_GET_MY_CHALLENGES @"http://quippics-dev.herokuapp.com/api/v1/users/%@/challenges/page/%i"//:uid :page
#define URL_REGISTER @"http://quippics-dev.herokuapp.com/api/v1/register"
#define URL_Login @"http://quippics-dev.herokuapp.com/api/v1/users"
#define URL_GET_FRIENDS @"http://quippics-dev.herokuapp.com/api/v1/users/%@/friends"
#define URL_GET_RESENT @"http://quippics-dev.herokuapp.com/api/v1/activities/page/%i"
#define URL_USERS @"http://quippics-dev.herokuapp.com/api/v1/users/page/%i"
#define URL_PRO_INFO @"http://quippics-dev.herokuapp.com/api/v1/users/%@"
#define URL_GET_CHALLANGES @"http://quippics-dev.herokuapp.com/api/v1/challenges/page/%i"
#define URL_CREATE_CHALLANGES @"http://quippics-dev.herokuapp.com/api/v1/challenges"
#define URL_GET_CHALLEGE_BY_ID @"http://quippics-dev.herokuapp.com/api/v1/challenges/%@"
#define URL_CREAT_NEW_SUBMISSION @"http://quippics-dev.herokuapp.com/api/v1/challenges/%@/submissions"
#define URL_TOP_SUBMISSION @"http://quippics-dev.herokuapp.com/api/v1/challenges/%@/submissions/top"
#define URL_All_SUBMISSION @"http://quippics-dev.herokuapp.com/api/v1/challenges/%@/submissions"
#define URL_GET_MY_SUBMISSION @"http://quippics-dev.herokuapp.com/api/v1/challenges/%@/submissions/users/%@"
#define URL_UpdateProfile @"http://quippics-dev.herokuapp.com/api/v1/users/%@"
#define URL_Search @"http://quippics-dev.herokuapp.com/api/v1/users/search/%@"
#define URL_AddFriend @"http://quippics-dev.herokuapp.com/api/v1/users/%@/friends"
#define URL_GET_SUBMISSION @"http://quippics-dev.herokuapp.com/api/v1/challenges/%@/submissions/%@"//:cid :sid
#define URL_GET_USER_Submitions @"http://quippics-dev.herokuapp.com/api/v1/challenges/%@/submissions/users/%@/voted"//cid:uid
#define URL_Get_Archive @"http://quippics-dev.herokuapp.com/api/v1/users/%@/submissions/archive"//:uid
#define URL_POST_SUBMITTION @"http://quippics-dev.herokuapp.com/api/v1/challenges/%@/submissions"
#define URL_POST_COMMENT @"http://quippics-dev.herokuapp.com/api/v1/challenges/%@/submissions/%@/comments"
#define URL_GET_COMMENTS @"http://quippics-dev.herokuapp.com/api/v1/challenges/%@/submissions/%@/comments"
#define URL_GET_USER_LIST_OF_INVITED_ChALLENGES @"http://quippics-dev.herokuapp.com/api/v1/users/%@/challenges/invited"
#define URL_POST_RATE_SUBMISSION @"http://quippics-dev.herokuapp.com/api/v1/challenges/%@/submissions/%@/ballots"//cid.sid
