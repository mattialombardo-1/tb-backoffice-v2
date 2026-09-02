<!-- Generator: Widdershins v4.0.1 -->

<h1 id="elliotadminstg">ElliotAdminStg v2026-05-26T10:54:30Z</h1>

> Scroll down for code samples, example requests and responses. Select a language for code samples from the tabs above or the mobile navigation menu.

Elliot Admin API

Base URLs:

* <a href="https://tw16nt2svf.execute-api.eu-south-1.amazonaws.com/{basePath}">https://tw16nt2svf.execute-api.eu-south-1.amazonaws.com/{basePath}</a>

    * **basePath** -  Default: prod

# Authentication

* API Key (AdminApiStackstgCognitoAuthorizerCognitoAuthorizerstg9DCFA5E0)
    - Parameter Name: **Authorization**, in: header. 

<h1 id="elliotadminstg-default">Default</h1>

## get__community-users_{communityUserId}

> Code samples

```javascript

const headers = {
  'Accept':'application/json',
  'Authorization':'API_KEY'
};

fetch('https://tw16nt2svf.execute-api.eu-south-1.amazonaws.com/{basePath}/community-users/{communityUserId}',
{
  method: 'GET',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`GET /community-users/{communityUserId}`

<h3 id="get__community-users_{communityuserid}-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|communityUserId|path|string|true|none|

> Example responses

> 200 Response

```json
{
  "lastLogin": "string",
  "createdAt": "string",
  "cognitoId": "string",
  "roleIds": [
    "string"
  ],
  "__v": 0,
  "_id": "string",
  "updatedAt": "string"
}
```

<h3 id="get__community-users_{communityuserid}-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|200 response|[CommunityUserPayload](#schemacommunityuserpayload)|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
AdminApiStackstgCognitoAuthorizerCognitoAuthorizerstg9DCFA5E0
</aside>

## put__community-users_{communityUserId}

> Code samples

```javascript
const inputBody = '{
  "cognitoId": "string",
  "roleIds": [
    "string"
  ]
}';
const headers = {
  'Content-Type':'application/json',
  'Accept':'application/json',
  'Authorization':'API_KEY'
};

fetch('https://tw16nt2svf.execute-api.eu-south-1.amazonaws.com/{basePath}/community-users/{communityUserId}',
{
  method: 'PUT',
  body: inputBody,
  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`PUT /community-users/{communityUserId}`

> Body parameter

```json
{
  "cognitoId": "string",
  "roleIds": [
    "string"
  ]
}
```

<h3 id="put__community-users_{communityuserid}-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|communityUserId|path|string|true|none|
|body|body|[UpdateCommunityUserModel](#schemaupdatecommunityusermodel)|true|none|

> Example responses

> 200 Response

```json
{
  "lastLogin": "string",
  "createdAt": "string",
  "cognitoId": "string",
  "roleIds": [
    "string"
  ],
  "__v": 0,
  "_id": "string",
  "updatedAt": "string"
}
```

<h3 id="put__community-users_{communityuserid}-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|200 response|[CommunityUserPayload](#schemacommunityuserpayload)|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
AdminApiStackstgCognitoAuthorizerCognitoAuthorizerstg9DCFA5E0
</aside>

## delete__community-users_{communityUserId}

> Code samples

```javascript

const headers = {
  'Authorization':'API_KEY'
};

fetch('https://tw16nt2svf.execute-api.eu-south-1.amazonaws.com/{basePath}/community-users/{communityUserId}',
{
  method: 'DELETE',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`DELETE /community-users/{communityUserId}`

<h3 id="delete__community-users_{communityuserid}-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|communityUserId|path|string|true|none|

> Example responses

<h3 id="delete__community-users_{communityuserid}-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|204|[No Content](https://tools.ietf.org/html/rfc7231#section-6.3.5)|204 response|None|

<h3 id="delete__community-users_{communityuserid}-responseschema">Response Schema</h3>

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
AdminApiStackstgCognitoAuthorizerCognitoAuthorizerstg9DCFA5E0
</aside>

## options__community-users_{communityUserId}

> Code samples

```javascript

const headers = {
  'Accept':'application/json'
};

fetch('https://tw16nt2svf.execute-api.eu-south-1.amazonaws.com/{basePath}/community-users/{communityUserId}',
{
  method: 'OPTIONS',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`OPTIONS /community-users/{communityUserId}`

<h3 id="options__community-users_{communityuserid}-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|communityUserId|path|string|true|none|

> Example responses

> 200 Response

```json
{}
```

<h3 id="options__community-users_{communityuserid}-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|200 response|[Empty](#schemaempty)|

### Response Headers

|Status|Header|Type|Format|Description|
|---|---|---|---|---|
|200|Access-Control-Allow-Origin|string||none|
|200|Access-Control-Allow-Methods|string||none|
|200|Access-Control-Allow-Credentials|string||none|
|200|Access-Control-Allow-Headers|string||none|

<aside class="success">
This operation does not require authentication
</aside>

## get__pools_{poolId}

> Code samples

```javascript

const headers = {
  'Accept':'application/json',
  'Authorization':'API_KEY'
};

fetch('https://tw16nt2svf.execute-api.eu-south-1.amazonaws.com/{basePath}/pools/{poolId}',
{
  method: 'GET',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`GET /pools/{poolId}`

<h3 id="get__pools_{poolid}-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|poolId|path|string|true|none|

> Example responses

> 200 Response

```json
{
  "totalQuestions": 0,
  "createdAt": "string",
  "questionCountBySubject": [
    {
      "count": 0,
      "subjectId": "string",
      "subjectName": "string"
    }
  ],
  "brands": [
    "string"
  ],
  "questionCountByTopic": [
    {
      "topicId": "string",
      "count": 0,
      "topicName": "string"
    }
  ],
  "name": "string",
  "description": "string",
  "attributes": [
    "string"
  ],
  "_id": "string",
  "status": "active",
  "updatedAt": "string"
}
```

<h3 id="get__pools_{poolid}-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|200 response|[PoolPayload](#schemapoolpayload)|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
AdminApiStackstgCognitoAuthorizerCognitoAuthorizerstg9DCFA5E0
</aside>

## put__pools_{poolId}

> Code samples

```javascript
const inputBody = '{
  "brands": [
    "string"
  ],
  "name": "string",
  "description": "string"
}';
const headers = {
  'Content-Type':'application/json',
  'Accept':'application/json',
  'Authorization':'API_KEY'
};

fetch('https://tw16nt2svf.execute-api.eu-south-1.amazonaws.com/{basePath}/pools/{poolId}',
{
  method: 'PUT',
  body: inputBody,
  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`PUT /pools/{poolId}`

> Body parameter

```json
{
  "brands": [
    "string"
  ],
  "name": "string",
  "description": "string"
}
```

<h3 id="put__pools_{poolid}-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|poolId|path|string|true|none|
|body|body|[EditPoolModel](#schemaeditpoolmodel)|true|none|

> Example responses

> 200 Response

```json
{
  "totalQuestions": 0,
  "createdAt": "string",
  "questionCountBySubject": [
    {
      "count": 0,
      "subjectId": "string",
      "subjectName": "string"
    }
  ],
  "brands": [
    "string"
  ],
  "questionCountByTopic": [
    {
      "topicId": "string",
      "count": 0,
      "topicName": "string"
    }
  ],
  "name": "string",
  "description": "string",
  "attributes": [
    "string"
  ],
  "_id": "string",
  "status": "active",
  "updatedAt": "string"
}
```

<h3 id="put__pools_{poolid}-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|200 response|[PoolPayload](#schemapoolpayload)|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
AdminApiStackstgCognitoAuthorizerCognitoAuthorizerstg9DCFA5E0
</aside>

## delete__pools_{poolId}

> Code samples

```javascript

const headers = {
  'Authorization':'API_KEY'
};

fetch('https://tw16nt2svf.execute-api.eu-south-1.amazonaws.com/{basePath}/pools/{poolId}',
{
  method: 'DELETE',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`DELETE /pools/{poolId}`

<h3 id="delete__pools_{poolid}-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|poolId|path|string|true|none|

> Example responses

<h3 id="delete__pools_{poolid}-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|204|[No Content](https://tools.ietf.org/html/rfc7231#section-6.3.5)|204 response|None|

<h3 id="delete__pools_{poolid}-responseschema">Response Schema</h3>

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
AdminApiStackstgCognitoAuthorizerCognitoAuthorizerstg9DCFA5E0
</aside>

## options__pools_{poolId}

> Code samples

```javascript

const headers = {
  'Accept':'application/json'
};

fetch('https://tw16nt2svf.execute-api.eu-south-1.amazonaws.com/{basePath}/pools/{poolId}',
{
  method: 'OPTIONS',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`OPTIONS /pools/{poolId}`

<h3 id="options__pools_{poolid}-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|poolId|path|string|true|none|

> Example responses

> 200 Response

```json
{}
```

<h3 id="options__pools_{poolid}-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|200 response|[Empty](#schemaempty)|

### Response Headers

|Status|Header|Type|Format|Description|
|---|---|---|---|---|
|200|Access-Control-Allow-Origin|string||none|
|200|Access-Control-Allow-Methods|string||none|
|200|Access-Control-Allow-Credentials|string||none|
|200|Access-Control-Allow-Headers|string||none|

<aside class="success">
This operation does not require authentication
</aside>

## put__subjects_{subjectId}_topics_{topicId}_subtopics_{subtopicId}

> Code samples

```javascript
const inputBody = '{
  "name": "string"
}';
const headers = {
  'Content-Type':'application/json',
  'Accept':'application/json',
  'Authorization':'API_KEY'
};

fetch('https://tw16nt2svf.execute-api.eu-south-1.amazonaws.com/{basePath}/subjects/{subjectId}/topics/{topicId}/subtopics/{subtopicId}',
{
  method: 'PUT',
  body: inputBody,
  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`PUT /subjects/{subjectId}/topics/{topicId}/subtopics/{subtopicId}`

> Body parameter

```json
{
  "name": "string"
}
```

<h3 id="put__subjects_{subjectid}_topics_{topicid}_subtopics_{subtopicid}-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|subjectId|path|string|true|none|
|topicId|path|string|true|none|
|subtopicId|path|string|true|none|
|body|body|[UpdateSubtopicMethod](#schemaupdatesubtopicmethod)|true|none|

> Example responses

> 200 Response

```json
{
  "createdAt": "string",
  "topics": [
    {
      "name": "string",
      "subtopics": [
        {
          "name": "string",
          "_id": "string"
        }
      ],
      "_id": "string"
    }
  ],
  "__v": 0,
  "name": "string",
  "style": {
    "light": "string",
    "icon": "string",
    "primary": "string"
  },
  "_id": "string",
  "updatedAt": "string"
}
```

<h3 id="put__subjects_{subjectid}_topics_{topicid}_subtopics_{subtopicid}-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|200 response|[SubjectPayload](#schemasubjectpayload)|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
AdminApiStackstgCognitoAuthorizerCognitoAuthorizerstg9DCFA5E0
</aside>

## delete__subjects_{subjectId}_topics_{topicId}_subtopics_{subtopicId}

> Code samples

```javascript

const headers = {
  'Authorization':'API_KEY'
};

fetch('https://tw16nt2svf.execute-api.eu-south-1.amazonaws.com/{basePath}/subjects/{subjectId}/topics/{topicId}/subtopics/{subtopicId}',
{
  method: 'DELETE',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`DELETE /subjects/{subjectId}/topics/{topicId}/subtopics/{subtopicId}`

<h3 id="delete__subjects_{subjectid}_topics_{topicid}_subtopics_{subtopicid}-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|subjectId|path|string|true|none|
|topicId|path|string|true|none|
|subtopicId|path|string|true|none|

> Example responses

<h3 id="delete__subjects_{subjectid}_topics_{topicid}_subtopics_{subtopicid}-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|204|[No Content](https://tools.ietf.org/html/rfc7231#section-6.3.5)|204 response|None|

<h3 id="delete__subjects_{subjectid}_topics_{topicid}_subtopics_{subtopicid}-responseschema">Response Schema</h3>

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
AdminApiStackstgCognitoAuthorizerCognitoAuthorizerstg9DCFA5E0
</aside>

## options__subjects_{subjectId}_topics_{topicId}_subtopics_{subtopicId}

> Code samples

```javascript

const headers = {
  'Accept':'application/json'
};

fetch('https://tw16nt2svf.execute-api.eu-south-1.amazonaws.com/{basePath}/subjects/{subjectId}/topics/{topicId}/subtopics/{subtopicId}',
{
  method: 'OPTIONS',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`OPTIONS /subjects/{subjectId}/topics/{topicId}/subtopics/{subtopicId}`

<h3 id="options__subjects_{subjectid}_topics_{topicid}_subtopics_{subtopicid}-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|subjectId|path|string|true|none|
|topicId|path|string|true|none|
|subtopicId|path|string|true|none|

> Example responses

> 200 Response

```json
{}
```

<h3 id="options__subjects_{subjectid}_topics_{topicid}_subtopics_{subtopicid}-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|200 response|[Empty](#schemaempty)|

### Response Headers

|Status|Header|Type|Format|Description|
|---|---|---|---|---|
|200|Access-Control-Allow-Origin|string||none|
|200|Access-Control-Allow-Methods|string||none|
|200|Access-Control-Allow-Credentials|string||none|
|200|Access-Control-Allow-Headers|string||none|

<aside class="success">
This operation does not require authentication
</aside>

## get__syllabi_{syllabusId}

> Code samples

```javascript

const headers = {
  'Accept':'application/json',
  'Authorization':'API_KEY'
};

fetch('https://tw16nt2svf.execute-api.eu-south-1.amazonaws.com/{basePath}/syllabi/{syllabusId}',
{
  method: 'GET',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`GET /syllabi/{syllabusId}`

<h3 id="get__syllabi_{syllabusid}-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|syllabusId|path|string|true|none|

> Example responses

> 200 Response

```json
{
  "createdAt": "string",
  "mapping": [
    {
      "displayTopic": "string",
      "displaySubtopic": "string",
      "baseTopicId": "string",
      "displaySubject": "string",
      "baseSubtopicId": "string",
      "baseSubjectId": "string"
    }
  ],
  "brandId": "string",
  "__v": 0,
  "testYear": 0,
  "_id": "string",
  "testName": "string",
  "updatedAt": "string"
}
```

<h3 id="get__syllabi_{syllabusid}-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|200 response|[SyllabusPayload](#schemasyllabuspayload)|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
AdminApiStackstgCognitoAuthorizerCognitoAuthorizerstg9DCFA5E0
</aside>

## post__syllabi_{syllabusId}

> Code samples

```javascript
const inputBody = '{
  "mapping": [
    {
      "displayTopic": "string",
      "displaySubtopic": "string",
      "baseTopicId": "string",
      "displaySubject": "string",
      "baseSubtopicId": "string",
      "baseSubjectId": "string"
    }
  ],
  "brandId": "string",
  "testYear": 0,
  "testName": "string"
}';
const headers = {
  'Content-Type':'application/json',
  'Accept':'application/json',
  'Authorization':'API_KEY'
};

fetch('https://tw16nt2svf.execute-api.eu-south-1.amazonaws.com/{basePath}/syllabi/{syllabusId}',
{
  method: 'POST',
  body: inputBody,
  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`POST /syllabi/{syllabusId}`

> Body parameter

```json
{
  "mapping": [
    {
      "displayTopic": "string",
      "displaySubtopic": "string",
      "baseTopicId": "string",
      "displaySubject": "string",
      "baseSubtopicId": "string",
      "baseSubjectId": "string"
    }
  ],
  "brandId": "string",
  "testYear": 0,
  "testName": "string"
}
```

<h3 id="post__syllabi_{syllabusid}-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|syllabusId|path|string|true|none|
|body|body|[UpdateSyllabusModel](#schemaupdatesyllabusmodel)|true|none|

> Example responses

> 200 Response

```json
{
  "createdAt": "string",
  "mapping": [
    {
      "displayTopic": "string",
      "displaySubtopic": "string",
      "baseTopicId": "string",
      "displaySubject": "string",
      "baseSubtopicId": "string",
      "baseSubjectId": "string"
    }
  ],
  "brandId": "string",
  "__v": 0,
  "testYear": 0,
  "_id": "string",
  "testName": "string",
  "updatedAt": "string"
}
```

<h3 id="post__syllabi_{syllabusid}-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|200 response|[SyllabusPayload](#schemasyllabuspayload)|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
AdminApiStackstgCognitoAuthorizerCognitoAuthorizerstg9DCFA5E0
</aside>

## delete__syllabi_{syllabusId}

> Code samples

```javascript

const headers = {
  'Accept':'application/json',
  'Authorization':'API_KEY'
};

fetch('https://tw16nt2svf.execute-api.eu-south-1.amazonaws.com/{basePath}/syllabi/{syllabusId}',
{
  method: 'DELETE',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`DELETE /syllabi/{syllabusId}`

<h3 id="delete__syllabi_{syllabusid}-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|syllabusId|path|string|true|none|

> Example responses

> 200 Response

```json
{
  "createdAt": "string",
  "mapping": [
    {
      "displayTopic": "string",
      "displaySubtopic": "string",
      "baseTopicId": "string",
      "displaySubject": "string",
      "baseSubtopicId": "string",
      "baseSubjectId": "string"
    }
  ],
  "brandId": "string",
  "__v": 0,
  "testYear": 0,
  "_id": "string",
  "testName": "string",
  "updatedAt": "string"
}
```

<h3 id="delete__syllabi_{syllabusid}-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|200 response|[SyllabusPayload](#schemasyllabuspayload)|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
AdminApiStackstgCognitoAuthorizerCognitoAuthorizerstg9DCFA5E0
</aside>

## options__syllabi_{syllabusId}

> Code samples

```javascript

const headers = {
  'Accept':'application/json'
};

fetch('https://tw16nt2svf.execute-api.eu-south-1.amazonaws.com/{basePath}/syllabi/{syllabusId}',
{
  method: 'OPTIONS',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`OPTIONS /syllabi/{syllabusId}`

<h3 id="options__syllabi_{syllabusid}-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|syllabusId|path|string|true|none|

> Example responses

> 200 Response

```json
{}
```

<h3 id="options__syllabi_{syllabusid}-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|200 response|[Empty](#schemaempty)|

### Response Headers

|Status|Header|Type|Format|Description|
|---|---|---|---|---|
|200|Access-Control-Allow-Origin|string||none|
|200|Access-Control-Allow-Methods|string||none|
|200|Access-Control-Allow-Credentials|string||none|
|200|Access-Control-Allow-Headers|string||none|

<aside class="success">
This operation does not require authentication
</aside>

## options__packages_{packageId}_active

> Code samples

```javascript

const headers = {
  'Accept':'application/json'
};

fetch('https://tw16nt2svf.execute-api.eu-south-1.amazonaws.com/{basePath}/packages/{packageId}/active',
{
  method: 'OPTIONS',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`OPTIONS /packages/{packageId}/active`

<h3 id="options__packages_{packageid}_active-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|packageId|path|string|true|none|

> Example responses

> 200 Response

```json
{}
```

<h3 id="options__packages_{packageid}_active-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|200 response|[Empty](#schemaempty)|

### Response Headers

|Status|Header|Type|Format|Description|
|---|---|---|---|---|
|200|Access-Control-Allow-Origin|string||none|
|200|Access-Control-Allow-Methods|string||none|
|200|Access-Control-Allow-Credentials|string||none|
|200|Access-Control-Allow-Headers|string||none|

<aside class="success">
This operation does not require authentication
</aside>

## patch__packages_{packageId}_active

> Code samples

```javascript
const inputBody = '{
  "active": true
}';
const headers = {
  'Content-Type':'application/json',
  'Accept':'application/json',
  'Authorization':'API_KEY'
};

fetch('https://tw16nt2svf.execute-api.eu-south-1.amazonaws.com/{basePath}/packages/{packageId}/active',
{
  method: 'PATCH',
  body: inputBody,
  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`PATCH /packages/{packageId}/active`

> Body parameter

```json
{
  "active": true
}
```

<h3 id="patch__packages_{packageid}_active-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|packageId|path|string|true|none|
|body|body|[SetPackageActiveModel](#schemasetpackageactivemodel)|true|none|

> Example responses

> 200 Response

```json
{
  "active": true,
  "expiresAt": "string",
  "poolIds": [
    "string"
  ],
  "skuName": "string",
  "createdAt": "string",
  "isFree": true,
  "collectionIds": [
    "string"
  ],
  "__v": 0,
  "name": "string",
  "_id": "string",
  "skuId": "string",
  "skuCode": "string",
  "updatedAt": "string"
}
```

<h3 id="patch__packages_{packageid}_active-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|200 response|[PackagePayload](#schemapackagepayload)|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
AdminApiStackstgCognitoAuthorizerCognitoAuthorizerstg9DCFA5E0
</aside>

## get__tests

> Code samples

```javascript

const headers = {
  'Accept':'application/json',
  'Authorization':'API_KEY'
};

fetch('https://tw16nt2svf.execute-api.eu-south-1.amazonaws.com/{basePath}/tests',
{
  method: 'GET',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`GET /tests`

<h3 id="get__tests-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|brandId|query|string|false|none|
|year|query|string|false|none|
|limit|query|string|false|none|
|page|query|string|false|none|
|name|query|string|false|none|

> Example responses

> 200 Response

```json
{
  "total": 0,
  "data": [
    {
      "syllabus": [
        {
          "baseTopic": "string",
          "baseSubtopic": "string",
          "displayTopic": "string",
          "displaySubtopic": "string",
          "baseSubject": "string",
          "displaySubject": "string"
        }
      ],
      "createdAt": "string",
      "brands": [
        {
          "name": "string",
          "id": "string"
        }
      ],
      "year": 0,
      "__v": 0,
      "name": "string",
      "_id": "string",
      "defaultScores": {
        "correct": 0,
        "empty": 0,
        "wrong": 0
      },
      "tags": [
        "string"
      ],
      "updatedAt": "string"
    }
  ],
  "limit": 0,
  "page": 0
}
```

<h3 id="get__tests-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|200 response|[AdminListTestsPayload](#schemaadminlisttestspayload)|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
AdminApiStackstgCognitoAuthorizerCognitoAuthorizerstg9DCFA5E0
</aside>

## post__tests

> Code samples

```javascript
const inputBody = '{
  "syllabus": [
    {
      "baseTopic": "string",
      "baseSubtopic": "string",
      "displayTopic": "string",
      "displaySubtopic": "string",
      "baseSubject": "string",
      "displaySubject": "string"
    }
  ],
  "brands": [
    {
      "name": "string",
      "id": "string"
    }
  ],
  "year": 0,
  "name": "string",
  "defaultScores": {
    "correct": 0,
    "empty": 0,
    "wrong": 0
  }
}';
const headers = {
  'Content-Type':'application/json',
  'Accept':'application/json',
  'Authorization':'API_KEY'
};

fetch('https://tw16nt2svf.execute-api.eu-south-1.amazonaws.com/{basePath}/tests',
{
  method: 'POST',
  body: inputBody,
  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`POST /tests`

> Body parameter

```json
{
  "syllabus": [
    {
      "baseTopic": "string",
      "baseSubtopic": "string",
      "displayTopic": "string",
      "displaySubtopic": "string",
      "baseSubject": "string",
      "displaySubject": "string"
    }
  ],
  "brands": [
    {
      "name": "string",
      "id": "string"
    }
  ],
  "year": 0,
  "name": "string",
  "defaultScores": {
    "correct": 0,
    "empty": 0,
    "wrong": 0
  }
}
```

<h3 id="post__tests-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|body|body|[AdminNewTestModel](#schemaadminnewtestmodel)|true|none|

> Example responses

> 201 Response

```json
{
  "syllabus": [
    {
      "baseTopic": "string",
      "baseSubtopic": "string",
      "displayTopic": "string",
      "displaySubtopic": "string",
      "baseSubject": "string",
      "displaySubject": "string"
    }
  ],
  "createdAt": "string",
  "brands": [
    {
      "name": "string",
      "id": "string"
    }
  ],
  "year": 0,
  "__v": 0,
  "name": "string",
  "_id": "string",
  "defaultScores": {
    "correct": 0,
    "empty": 0,
    "wrong": 0
  },
  "tags": [
    "string"
  ],
  "updatedAt": "string"
}
```

<h3 id="post__tests-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|201|[Created](https://tools.ietf.org/html/rfc7231#section-6.3.2)|201 response|[AdminTestPayload](#schemaadmintestpayload)|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
AdminApiStackstgCognitoAuthorizerCognitoAuthorizerstg9DCFA5E0
</aside>

## options__tests

> Code samples

```javascript

const headers = {
  'Accept':'application/json'
};

fetch('https://tw16nt2svf.execute-api.eu-south-1.amazonaws.com/{basePath}/tests',
{
  method: 'OPTIONS',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`OPTIONS /tests`

> Example responses

> 200 Response

```json
{}
```

<h3 id="options__tests-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|200 response|[Empty](#schemaempty)|

### Response Headers

|Status|Header|Type|Format|Description|
|---|---|---|---|---|
|200|Access-Control-Allow-Origin|string||none|
|200|Access-Control-Allow-Methods|string||none|
|200|Access-Control-Allow-Credentials|string||none|
|200|Access-Control-Allow-Headers|string||none|

<aside class="success">
This operation does not require authentication
</aside>

## get__pools

> Code samples

```javascript

const headers = {
  'Accept':'application/json',
  'Authorization':'API_KEY'
};

fetch('https://tw16nt2svf.execute-api.eu-south-1.amazonaws.com/{basePath}/pools',
{
  method: 'GET',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`GET /pools`

<h3 id="get__pools-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|brandId|query|string|false|none|
|status|query|string|false|none|
|limit|query|string|false|none|
|page|query|string|false|none|

> Example responses

> 200 Response

```json
{
  "total": 0,
  "data": [
    {
      "totalQuestions": 0,
      "createdAt": "string",
      "questionCountBySubject": [
        {
          "count": 0,
          "subjectId": "string",
          "subjectName": "string"
        }
      ],
      "brands": [
        "string"
      ],
      "questionCountByTopic": [
        {
          "topicId": "string",
          "count": 0,
          "topicName": "string"
        }
      ],
      "name": "string",
      "description": "string",
      "attributes": [
        "string"
      ],
      "_id": "string",
      "status": "active",
      "updatedAt": "string"
    }
  ],
  "limit": 0,
  "page": 0
}
```

<h3 id="get__pools-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|200 response|[ListPoolsPayload](#schemalistpoolspayload)|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
AdminApiStackstgCognitoAuthorizerCognitoAuthorizerstg9DCFA5E0
</aside>

## post__pools

> Code samples

```javascript
const inputBody = '{
  "brands": [
    "string"
  ],
  "name": "string",
  "description": "string",
  "status": "active"
}';
const headers = {
  'Content-Type':'application/json',
  'Accept':'application/json',
  'Authorization':'API_KEY'
};

fetch('https://tw16nt2svf.execute-api.eu-south-1.amazonaws.com/{basePath}/pools',
{
  method: 'POST',
  body: inputBody,
  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`POST /pools`

> Body parameter

```json
{
  "brands": [
    "string"
  ],
  "name": "string",
  "description": "string",
  "status": "active"
}
```

<h3 id="post__pools-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|body|body|[NewPoolModel](#schemanewpoolmodel)|true|none|

> Example responses

> 201 Response

```json
{
  "totalQuestions": 0,
  "createdAt": "string",
  "questionCountBySubject": [
    {
      "count": 0,
      "subjectId": "string",
      "subjectName": "string"
    }
  ],
  "brands": [
    "string"
  ],
  "questionCountByTopic": [
    {
      "topicId": "string",
      "count": 0,
      "topicName": "string"
    }
  ],
  "name": "string",
  "description": "string",
  "attributes": [
    "string"
  ],
  "_id": "string",
  "status": "active",
  "updatedAt": "string"
}
```

<h3 id="post__pools-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|201|[Created](https://tools.ietf.org/html/rfc7231#section-6.3.2)|201 response|[PoolPayload](#schemapoolpayload)|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
AdminApiStackstgCognitoAuthorizerCognitoAuthorizerstg9DCFA5E0
</aside>

## options__pools

> Code samples

```javascript

const headers = {
  'Accept':'application/json'
};

fetch('https://tw16nt2svf.execute-api.eu-south-1.amazonaws.com/{basePath}/pools',
{
  method: 'OPTIONS',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`OPTIONS /pools`

> Example responses

> 200 Response

```json
{}
```

<h3 id="options__pools-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|200 response|[Empty](#schemaempty)|

### Response Headers

|Status|Header|Type|Format|Description|
|---|---|---|---|---|
|200|Access-Control-Allow-Origin|string||none|
|200|Access-Control-Allow-Methods|string||none|
|200|Access-Control-Allow-Credentials|string||none|
|200|Access-Control-Allow-Headers|string||none|

<aside class="success">
This operation does not require authentication
</aside>

## get__collections

> Code samples

```javascript

const headers = {
  'Accept':'application/json',
  'Authorization':'API_KEY'
};

fetch('https://tw16nt2svf.execute-api.eu-south-1.amazonaws.com/{basePath}/collections',
{
  method: 'GET',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`GET /collections`

<h3 id="get__collections-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|limit|query|string|false|none|
|type|query|string|false|none|
|brandIds|query|string|false|none|
|status|query|string|false|none|
|page|query|string|false|none|
|archived|query|string|false|none|
|search|query|string|false|none|
|testId|query|string|false|none|

> Example responses

> 200 Response

```json
{
  "total": 0,
  "data": [
    {
      "brands": [
        {
          "name": "string"
        }
      ],
      "timed": true,
      "type": "exercise",
      "authorId": "string",
      "brandIds": [
        "string"
      ],
      "sections": [
        {
          "maxAttempts": 0,
          "questions": [
            {
              "questionId": "string",
              "points": {
                "correctPoint": 0,
                "wrongPoint": 0,
                "emptyPoint": 0
              }
            }
          ],
          "rules": {
            "duration": 0,
            "pausable": true,
            "extraTime": [
              0
            ]
          },
          "_id": "string"
        }
      ],
      "tags": [
        "string"
      ],
      "archived": true,
      "createdAt": "string",
      "name": "string",
      "testId": "string",
      "attributes": [
        "string"
      ],
      "_id": "string",
      "status": "draft",
      "updatedAt": "string"
    }
  ],
  "limit": 0,
  "page": 0
}
```

<h3 id="get__collections-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|200 response|[AdminListCollectionsPayload](#schemaadminlistcollectionspayload)|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
AdminApiStackstgCognitoAuthorizerCognitoAuthorizerstg9DCFA5E0
</aside>

## post__collections

> Code samples

```javascript
const inputBody = '{
  "timed": true,
  "name": "string",
  "testId": "string",
  "type": "simulation",
  "brandIds": [
    "string"
  ],
  "sections": [
    {
      "maxAttempts": 0,
      "questions": [
        {
          "questionId": "string",
          "points": {
            "correctPoint": 0,
            "wrongPoint": 0,
            "emptyPoint": 0
          }
        }
      ],
      "rules": {
        "duration": 0,
        "pausable": true,
        "extraTime": [
          0
        ]
      }
    }
  ],
  "tags": [
    "string"
  ]
}';
const headers = {
  'Content-Type':'application/json',
  'Accept':'application/json',
  'Authorization':'API_KEY'
};

fetch('https://tw16nt2svf.execute-api.eu-south-1.amazonaws.com/{basePath}/collections',
{
  method: 'POST',
  body: inputBody,
  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`POST /collections`

> Body parameter

```json
{
  "timed": true,
  "name": "string",
  "testId": "string",
  "type": "simulation",
  "brandIds": [
    "string"
  ],
  "sections": [
    {
      "maxAttempts": 0,
      "questions": [
        {
          "questionId": "string",
          "points": {
            "correctPoint": 0,
            "wrongPoint": 0,
            "emptyPoint": 0
          }
        }
      ],
      "rules": {
        "duration": 0,
        "pausable": true,
        "extraTime": [
          0
        ]
      }
    }
  ],
  "tags": [
    "string"
  ]
}
```

<h3 id="post__collections-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|body|body|[AdminNewCollectionModel](#schemaadminnewcollectionmodel)|true|none|

> Example responses

> 201 Response

```json
{
  "brands": [
    {
      "name": "string"
    }
  ],
  "timed": true,
  "type": "exercise",
  "authorId": "string",
  "brandIds": [
    "string"
  ],
  "sections": [
    {
      "maxAttempts": 0,
      "questions": [
        {
          "questionId": "string",
          "points": {
            "correctPoint": 0,
            "wrongPoint": 0,
            "emptyPoint": 0
          }
        }
      ],
      "rules": {
        "duration": 0,
        "pausable": true,
        "extraTime": [
          0
        ]
      },
      "_id": "string"
    }
  ],
  "tags": [
    "string"
  ],
  "archived": true,
  "createdAt": "string",
  "name": "string",
  "testId": "string",
  "attributes": [
    "string"
  ],
  "_id": "string",
  "status": "draft",
  "updatedAt": "string"
}
```

<h3 id="post__collections-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|201|[Created](https://tools.ietf.org/html/rfc7231#section-6.3.2)|201 response|[AdminCollectionPayload](#schemaadmincollectionpayload)|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
AdminApiStackstgCognitoAuthorizerCognitoAuthorizerstg9DCFA5E0
</aside>

## options__collections

> Code samples

```javascript

const headers = {
  'Accept':'application/json'
};

fetch('https://tw16nt2svf.execute-api.eu-south-1.amazonaws.com/{basePath}/collections',
{
  method: 'OPTIONS',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`OPTIONS /collections`

> Example responses

> 200 Response

```json
{}
```

<h3 id="options__collections-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|200 response|[Empty](#schemaempty)|

### Response Headers

|Status|Header|Type|Format|Description|
|---|---|---|---|---|
|200|Access-Control-Allow-Origin|string||none|
|200|Access-Control-Allow-Methods|string||none|
|200|Access-Control-Allow-Credentials|string||none|
|200|Access-Control-Allow-Headers|string||none|

<aside class="success">
This operation does not require authentication
</aside>

## post__subjects_{subjectId}_topics

> Code samples

```javascript
const inputBody = '{
  "name": "string"
}';
const headers = {
  'Content-Type':'application/json',
  'Accept':'application/json',
  'Authorization':'API_KEY'
};

fetch('https://tw16nt2svf.execute-api.eu-south-1.amazonaws.com/{basePath}/subjects/{subjectId}/topics',
{
  method: 'POST',
  body: inputBody,
  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`POST /subjects/{subjectId}/topics`

> Body parameter

```json
{
  "name": "string"
}
```

<h3 id="post__subjects_{subjectid}_topics-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|subjectId|path|string|true|none|
|body|body|[AddTopicMethod](#schemaaddtopicmethod)|true|none|

> Example responses

> 201 Response

```json
{
  "createdAt": "string",
  "topics": [
    {
      "name": "string",
      "subtopics": [
        {
          "name": "string",
          "_id": "string"
        }
      ],
      "_id": "string"
    }
  ],
  "__v": 0,
  "name": "string",
  "style": {
    "light": "string",
    "icon": "string",
    "primary": "string"
  },
  "_id": "string",
  "updatedAt": "string"
}
```

<h3 id="post__subjects_{subjectid}_topics-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|201|[Created](https://tools.ietf.org/html/rfc7231#section-6.3.2)|201 response|[SubjectPayload](#schemasubjectpayload)|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
AdminApiStackstgCognitoAuthorizerCognitoAuthorizerstg9DCFA5E0
</aside>

## options__subjects_{subjectId}_topics

> Code samples

```javascript

const headers = {
  'Accept':'application/json'
};

fetch('https://tw16nt2svf.execute-api.eu-south-1.amazonaws.com/{basePath}/subjects/{subjectId}/topics',
{
  method: 'OPTIONS',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`OPTIONS /subjects/{subjectId}/topics`

<h3 id="options__subjects_{subjectid}_topics-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|subjectId|path|string|true|none|

> Example responses

> 200 Response

```json
{}
```

<h3 id="options__subjects_{subjectid}_topics-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|200 response|[Empty](#schemaempty)|

### Response Headers

|Status|Header|Type|Format|Description|
|---|---|---|---|---|
|200|Access-Control-Allow-Origin|string||none|
|200|Access-Control-Allow-Methods|string||none|
|200|Access-Control-Allow-Credentials|string||none|
|200|Access-Control-Allow-Headers|string||none|

<aside class="success">
This operation does not require authentication
</aside>

## delete__collections_{collectionId}_sections_{sectionIdx}_questions_{questionId}

> Code samples

```javascript

const headers = {
  'Authorization':'API_KEY'
};

fetch('https://tw16nt2svf.execute-api.eu-south-1.amazonaws.com/{basePath}/collections/{collectionId}/sections/{sectionIdx}/questions/{questionId}',
{
  method: 'DELETE',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`DELETE /collections/{collectionId}/sections/{sectionIdx}/questions/{questionId}`

<h3 id="delete__collections_{collectionid}_sections_{sectionidx}_questions_{questionid}-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|collectionId|path|string|true|none|
|sectionIdx|path|string|true|none|
|questionId|path|string|true|none|

> Example responses

<h3 id="delete__collections_{collectionid}_sections_{sectionidx}_questions_{questionid}-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|204|[No Content](https://tools.ietf.org/html/rfc7231#section-6.3.5)|204 response|None|

<h3 id="delete__collections_{collectionid}_sections_{sectionidx}_questions_{questionid}-responseschema">Response Schema</h3>

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
AdminApiStackstgCognitoAuthorizerCognitoAuthorizerstg9DCFA5E0
</aside>

## options__collections_{collectionId}_sections_{sectionIdx}_questions_{questionId}

> Code samples

```javascript

const headers = {
  'Accept':'application/json'
};

fetch('https://tw16nt2svf.execute-api.eu-south-1.amazonaws.com/{basePath}/collections/{collectionId}/sections/{sectionIdx}/questions/{questionId}',
{
  method: 'OPTIONS',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`OPTIONS /collections/{collectionId}/sections/{sectionIdx}/questions/{questionId}`

<h3 id="options__collections_{collectionid}_sections_{sectionidx}_questions_{questionid}-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|collectionId|path|string|true|none|
|sectionIdx|path|string|true|none|
|questionId|path|string|true|none|

> Example responses

> 200 Response

```json
{}
```

<h3 id="options__collections_{collectionid}_sections_{sectionidx}_questions_{questionid}-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|200 response|[Empty](#schemaempty)|

### Response Headers

|Status|Header|Type|Format|Description|
|---|---|---|---|---|
|200|Access-Control-Allow-Origin|string||none|
|200|Access-Control-Allow-Methods|string||none|
|200|Access-Control-Allow-Credentials|string||none|
|200|Access-Control-Allow-Headers|string||none|

<aside class="success">
This operation does not require authentication
</aside>

## get__collections_{collectionId}_stats

> Code samples

```javascript

const headers = {
  'Accept':'application/json',
  'Authorization':'API_KEY'
};

fetch('https://tw16nt2svf.execute-api.eu-south-1.amazonaws.com/{basePath}/collections/{collectionId}/stats',
{
  method: 'GET',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`GET /collections/{collectionId}/stats`

<h3 id="get__collections_{collectionid}_stats-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|collectionId|path|string|true|none|

> Example responses

> 200 Response

```json
{
  "totalCorrect": 0,
  "totalAttempts": 0,
  "totalWrong": 0,
  "totalEmpty": 0,
  "averageScore": 0
}
```

<h3 id="get__collections_{collectionid}_stats-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|200 response|[AdminCollectionStatsPayload](#schemaadmincollectionstatspayload)|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
AdminApiStackstgCognitoAuthorizerCognitoAuthorizerstg9DCFA5E0
</aside>

## options__collections_{collectionId}_stats

> Code samples

```javascript

const headers = {
  'Accept':'application/json'
};

fetch('https://tw16nt2svf.execute-api.eu-south-1.amazonaws.com/{basePath}/collections/{collectionId}/stats',
{
  method: 'OPTIONS',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`OPTIONS /collections/{collectionId}/stats`

<h3 id="options__collections_{collectionid}_stats-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|collectionId|path|string|true|none|

> Example responses

> 200 Response

```json
{}
```

<h3 id="options__collections_{collectionid}_stats-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|200 response|[Empty](#schemaempty)|

### Response Headers

|Status|Header|Type|Format|Description|
|---|---|---|---|---|
|200|Access-Control-Allow-Origin|string||none|
|200|Access-Control-Allow-Methods|string||none|
|200|Access-Control-Allow-Credentials|string||none|
|200|Access-Control-Allow-Headers|string||none|

<aside class="success">
This operation does not require authentication
</aside>

## put__collections_{collectionId}_sections_{sectionIdx}

> Code samples

```javascript
const inputBody = '{
  "maxAttempts": 0,
  "questions": [
    {
      "questionId": "string",
      "points": {
        "correctPoint": 0,
        "wrongPoint": 0,
        "emptyPoint": 0
      }
    }
  ],
  "rules": {
    "duration": 0,
    "pausable": true,
    "extraTime": [
      0
    ]
  }
}';
const headers = {
  'Content-Type':'application/json',
  'Accept':'application/json',
  'Authorization':'API_KEY'
};

fetch('https://tw16nt2svf.execute-api.eu-south-1.amazonaws.com/{basePath}/collections/{collectionId}/sections/{sectionIdx}',
{
  method: 'PUT',
  body: inputBody,
  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`PUT /collections/{collectionId}/sections/{sectionIdx}`

> Body parameter

```json
{
  "maxAttempts": 0,
  "questions": [
    {
      "questionId": "string",
      "points": {
        "correctPoint": 0,
        "wrongPoint": 0,
        "emptyPoint": 0
      }
    }
  ],
  "rules": {
    "duration": 0,
    "pausable": true,
    "extraTime": [
      0
    ]
  }
}
```

<h3 id="put__collections_{collectionid}_sections_{sectionidx}-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|collectionId|path|string|true|none|
|sectionIdx|path|string|true|none|
|body|body|[AdminEditCollectionSectionModel](#schemaadmineditcollectionsectionmodel)|true|none|

> Example responses

> 200 Response

```json
{
  "brands": [
    {
      "name": "string"
    }
  ],
  "timed": true,
  "type": "exercise",
  "authorId": "string",
  "brandIds": [
    "string"
  ],
  "sections": [
    {
      "maxAttempts": 0,
      "questions": [
        {
          "questionId": "string",
          "points": {
            "correctPoint": 0,
            "wrongPoint": 0,
            "emptyPoint": 0
          }
        }
      ],
      "rules": {
        "duration": 0,
        "pausable": true,
        "extraTime": [
          0
        ]
      },
      "_id": "string"
    }
  ],
  "tags": [
    "string"
  ],
  "archived": true,
  "createdAt": "string",
  "name": "string",
  "testId": "string",
  "attributes": [
    "string"
  ],
  "_id": "string",
  "status": "draft",
  "updatedAt": "string"
}
```

<h3 id="put__collections_{collectionid}_sections_{sectionidx}-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|200 response|[AdminCollectionPayload](#schemaadmincollectionpayload)|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
AdminApiStackstgCognitoAuthorizerCognitoAuthorizerstg9DCFA5E0
</aside>

## delete__collections_{collectionId}_sections_{sectionIdx}

> Code samples

```javascript

const headers = {
  'Authorization':'API_KEY'
};

fetch('https://tw16nt2svf.execute-api.eu-south-1.amazonaws.com/{basePath}/collections/{collectionId}/sections/{sectionIdx}',
{
  method: 'DELETE',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`DELETE /collections/{collectionId}/sections/{sectionIdx}`

<h3 id="delete__collections_{collectionid}_sections_{sectionidx}-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|collectionId|path|string|true|none|
|sectionIdx|path|string|true|none|

> Example responses

<h3 id="delete__collections_{collectionid}_sections_{sectionidx}-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|204|[No Content](https://tools.ietf.org/html/rfc7231#section-6.3.5)|204 response|None|

<h3 id="delete__collections_{collectionid}_sections_{sectionidx}-responseschema">Response Schema</h3>

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
AdminApiStackstgCognitoAuthorizerCognitoAuthorizerstg9DCFA5E0
</aside>

## options__collections_{collectionId}_sections_{sectionIdx}

> Code samples

```javascript

const headers = {
  'Accept':'application/json'
};

fetch('https://tw16nt2svf.execute-api.eu-south-1.amazonaws.com/{basePath}/collections/{collectionId}/sections/{sectionIdx}',
{
  method: 'OPTIONS',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`OPTIONS /collections/{collectionId}/sections/{sectionIdx}`

<h3 id="options__collections_{collectionid}_sections_{sectionidx}-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|collectionId|path|string|true|none|
|sectionIdx|path|string|true|none|

> Example responses

> 200 Response

```json
{}
```

<h3 id="options__collections_{collectionid}_sections_{sectionidx}-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|200 response|[Empty](#schemaempty)|

### Response Headers

|Status|Header|Type|Format|Description|
|---|---|---|---|---|
|200|Access-Control-Allow-Origin|string||none|
|200|Access-Control-Allow-Methods|string||none|
|200|Access-Control-Allow-Credentials|string||none|
|200|Access-Control-Allow-Headers|string||none|

<aside class="success">
This operation does not require authentication
</aside>

## post__collections_{collectionId}_sections

> Code samples

```javascript
const inputBody = '{
  "maxAttempts": 0,
  "questions": [
    {
      "questionId": "string",
      "points": {
        "correctPoint": 0,
        "wrongPoint": 0,
        "emptyPoint": 0
      }
    }
  ],
  "rules": {
    "duration": 0,
    "pausable": true,
    "extraTime": [
      0
    ]
  }
}';
const headers = {
  'Content-Type':'application/json',
  'Accept':'application/json',
  'Authorization':'API_KEY'
};

fetch('https://tw16nt2svf.execute-api.eu-south-1.amazonaws.com/{basePath}/collections/{collectionId}/sections',
{
  method: 'POST',
  body: inputBody,
  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`POST /collections/{collectionId}/sections`

> Body parameter

```json
{
  "maxAttempts": 0,
  "questions": [
    {
      "questionId": "string",
      "points": {
        "correctPoint": 0,
        "wrongPoint": 0,
        "emptyPoint": 0
      }
    }
  ],
  "rules": {
    "duration": 0,
    "pausable": true,
    "extraTime": [
      0
    ]
  }
}
```

<h3 id="post__collections_{collectionid}_sections-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|collectionId|path|string|true|none|
|body|body|[AdminNewCollectionSectionModel](#schemaadminnewcollectionsectionmodel)|true|none|

> Example responses

> 201 Response

```json
{
  "brands": [
    {
      "name": "string"
    }
  ],
  "timed": true,
  "type": "exercise",
  "authorId": "string",
  "brandIds": [
    "string"
  ],
  "sections": [
    {
      "maxAttempts": 0,
      "questions": [
        {
          "questionId": "string",
          "points": {
            "correctPoint": 0,
            "wrongPoint": 0,
            "emptyPoint": 0
          }
        }
      ],
      "rules": {
        "duration": 0,
        "pausable": true,
        "extraTime": [
          0
        ]
      },
      "_id": "string"
    }
  ],
  "tags": [
    "string"
  ],
  "archived": true,
  "createdAt": "string",
  "name": "string",
  "testId": "string",
  "attributes": [
    "string"
  ],
  "_id": "string",
  "status": "draft",
  "updatedAt": "string"
}
```

<h3 id="post__collections_{collectionid}_sections-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|201|[Created](https://tools.ietf.org/html/rfc7231#section-6.3.2)|201 response|[AdminCollectionPayload](#schemaadmincollectionpayload)|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
AdminApiStackstgCognitoAuthorizerCognitoAuthorizerstg9DCFA5E0
</aside>

## options__collections_{collectionId}_sections

> Code samples

```javascript

const headers = {
  'Accept':'application/json'
};

fetch('https://tw16nt2svf.execute-api.eu-south-1.amazonaws.com/{basePath}/collections/{collectionId}/sections',
{
  method: 'OPTIONS',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`OPTIONS /collections/{collectionId}/sections`

<h3 id="options__collections_{collectionid}_sections-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|collectionId|path|string|true|none|

> Example responses

> 200 Response

```json
{}
```

<h3 id="options__collections_{collectionid}_sections-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|200 response|[Empty](#schemaempty)|

### Response Headers

|Status|Header|Type|Format|Description|
|---|---|---|---|---|
|200|Access-Control-Allow-Origin|string||none|
|200|Access-Control-Allow-Methods|string||none|
|200|Access-Control-Allow-Credentials|string||none|
|200|Access-Control-Allow-Headers|string||none|

<aside class="success">
This operation does not require authentication
</aside>

## get__community-profile

> Code samples

```javascript

const headers = {
  'Accept':'application/json',
  'Authorization':'API_KEY'
};

fetch('https://tw16nt2svf.execute-api.eu-south-1.amazonaws.com/{basePath}/community-profile',
{
  method: 'GET',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`GET /community-profile`

> Example responses

> 200 Response

```json
{
  "lastLogin": "string",
  "createdAt": "string",
  "cognitoId": "string",
  "roleIds": [
    "string"
  ],
  "__v": 0,
  "_id": "string",
  "updatedAt": "string"
}
```

<h3 id="get__community-profile-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|200 response|[CommunityUserPayload](#schemacommunityuserpayload)|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
AdminApiStackstgCognitoAuthorizerCognitoAuthorizerstg9DCFA5E0
</aside>

## options__community-profile

> Code samples

```javascript

const headers = {
  'Accept':'application/json'
};

fetch('https://tw16nt2svf.execute-api.eu-south-1.amazonaws.com/{basePath}/community-profile',
{
  method: 'OPTIONS',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`OPTIONS /community-profile`

> Example responses

> 200 Response

```json
{}
```

<h3 id="options__community-profile-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|200 response|[Empty](#schemaempty)|

### Response Headers

|Status|Header|Type|Format|Description|
|---|---|---|---|---|
|200|Access-Control-Allow-Origin|string||none|
|200|Access-Control-Allow-Methods|string||none|
|200|Access-Control-Allow-Credentials|string||none|
|200|Access-Control-Allow-Headers|string||none|

<aside class="success">
This operation does not require authentication
</aside>

## get__questions_{questionId}

> Code samples

```javascript

const headers = {
  'Accept':'application/json',
  'Authorization':'API_KEY'
};

fetch('https://tw16nt2svf.execute-api.eu-south-1.amazonaws.com/{basePath}/questions/{questionId}',
{
  method: 'GET',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`GET /questions/{questionId}`

<h3 id="get__questions_{questionid}-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|includes|query|string|false|none|
|questionId|path|string|true|none|

> Example responses

> 200 Response

```json
{
  "versionCount": 0,
  "subject": {
    "name": "string"
  },
  "language": "it",
  "type": "completion",
  "subjectId": "string",
  "questionText": "string",
  "revisorId": "string",
  "explanationImages": [
    "string"
  ],
  "archived": true,
  "createdAt": "string",
  "approved": true,
  "stats": {
    "correct": 0,
    "answersCount": [
      0
    ],
    "empty": 0,
    "wrong": 0
  },
  "__v": 0,
  "completionAnswers": [
    "string"
  ],
  "subtopic": {
    "name": "string"
  },
  "updatedAt": "string",
  "explanationText": "string",
  "revisor": {
    "email": "string"
  },
  "author": {
    "email": "string"
  },
  "authorId": "string",
  "tags": [
    "string"
  ],
  "difficulty": 0,
  "topicId": "string",
  "topic": {
    "name": "string"
  },
  "alternatives": [
    {
      "image": "string",
      "correct": true,
      "text": "string"
    }
  ],
  "subtopicId": "string",
  "_id": "string",
  "questionImages": [
    "string"
  ],
  "status": "draft"
}
```

<h3 id="get__questions_{questionid}-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|200 response|[QuestionPayload](#schemaquestionpayload)|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
AdminApiStackstgCognitoAuthorizerCognitoAuthorizerstg9DCFA5E0
</aside>

## put__questions_{questionId}

> Code samples

```javascript
const inputBody = '{
  "explanationText": "string",
  "revisor": {
    "id": "string",
    "email": "string",
    "username": "string"
  },
  "subject": {
    "name": "string",
    "_id": "string"
  },
  "author": {
    "id": "string",
    "email": "string",
    "username": "string"
  },
  "language": "it",
  "questionText": "string",
  "explanationImages": [
    "string"
  ],
  "tags": [
    "string"
  ],
  "difficulty": 0,
  "approved": true,
  "draft": true,
  "alternatives": [
    {
      "image": "string",
      "correct": true,
      "text": "string"
    }
  ],
  "topic": {
    "name": "string",
    "_id": "string"
  },
  "questionImages": [
    "string"
  ]
}';
const headers = {
  'Content-Type':'application/json',
  'Accept':'application/json',
  'Authorization':'API_KEY'
};

fetch('https://tw16nt2svf.execute-api.eu-south-1.amazonaws.com/{basePath}/questions/{questionId}',
{
  method: 'PUT',
  body: inputBody,
  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`PUT /questions/{questionId}`

> Body parameter

```json
{
  "explanationText": "string",
  "revisor": {
    "id": "string",
    "email": "string",
    "username": "string"
  },
  "subject": {
    "name": "string",
    "_id": "string"
  },
  "author": {
    "id": "string",
    "email": "string",
    "username": "string"
  },
  "language": "it",
  "questionText": "string",
  "explanationImages": [
    "string"
  ],
  "tags": [
    "string"
  ],
  "difficulty": 0,
  "approved": true,
  "draft": true,
  "alternatives": [
    {
      "image": "string",
      "correct": true,
      "text": "string"
    }
  ],
  "topic": {
    "name": "string",
    "_id": "string"
  },
  "questionImages": [
    "string"
  ]
}
```

<h3 id="put__questions_{questionid}-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|questionId|path|string|true|none|
|body|body|[UpdateQuestionModel](#schemaupdatequestionmodel)|true|none|

> Example responses

> 200 Response

```json
{
  "versionCount": 0,
  "subject": {
    "name": "string"
  },
  "language": "it",
  "type": "completion",
  "subjectId": "string",
  "questionText": "string",
  "revisorId": "string",
  "explanationImages": [
    "string"
  ],
  "archived": true,
  "createdAt": "string",
  "approved": true,
  "stats": {
    "correct": 0,
    "answersCount": [
      0
    ],
    "empty": 0,
    "wrong": 0
  },
  "__v": 0,
  "completionAnswers": [
    "string"
  ],
  "subtopic": {
    "name": "string"
  },
  "updatedAt": "string",
  "explanationText": "string",
  "revisor": {
    "email": "string"
  },
  "author": {
    "email": "string"
  },
  "authorId": "string",
  "tags": [
    "string"
  ],
  "difficulty": 0,
  "topicId": "string",
  "topic": {
    "name": "string"
  },
  "alternatives": [
    {
      "image": "string",
      "correct": true,
      "text": "string"
    }
  ],
  "subtopicId": "string",
  "_id": "string",
  "questionImages": [
    "string"
  ],
  "status": "draft"
}
```

<h3 id="put__questions_{questionid}-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|200 response|[QuestionPayload](#schemaquestionpayload)|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
AdminApiStackstgCognitoAuthorizerCognitoAuthorizerstg9DCFA5E0
</aside>

## delete__questions_{questionId}

> Code samples

```javascript

const headers = {
  'Authorization':'API_KEY'
};

fetch('https://tw16nt2svf.execute-api.eu-south-1.amazonaws.com/{basePath}/questions/{questionId}',
{
  method: 'DELETE',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`DELETE /questions/{questionId}`

<h3 id="delete__questions_{questionid}-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|questionId|path|string|true|none|

> Example responses

<h3 id="delete__questions_{questionid}-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|204|[No Content](https://tools.ietf.org/html/rfc7231#section-6.3.5)|204 response|None|

<h3 id="delete__questions_{questionid}-responseschema">Response Schema</h3>

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
AdminApiStackstgCognitoAuthorizerCognitoAuthorizerstg9DCFA5E0
</aside>

## options__questions_{questionId}

> Code samples

```javascript

const headers = {
  'Accept':'application/json'
};

fetch('https://tw16nt2svf.execute-api.eu-south-1.amazonaws.com/{basePath}/questions/{questionId}',
{
  method: 'OPTIONS',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`OPTIONS /questions/{questionId}`

<h3 id="options__questions_{questionid}-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|questionId|path|string|true|none|

> Example responses

> 200 Response

```json
{}
```

<h3 id="options__questions_{questionid}-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|200 response|[Empty](#schemaempty)|

### Response Headers

|Status|Header|Type|Format|Description|
|---|---|---|---|---|
|200|Access-Control-Allow-Origin|string||none|
|200|Access-Control-Allow-Methods|string||none|
|200|Access-Control-Allow-Credentials|string||none|
|200|Access-Control-Allow-Headers|string||none|

<aside class="success">
This operation does not require authentication
</aside>

## put__subjects_{subjectId}_topics_{topicId}

> Code samples

```javascript
const inputBody = '{
  "name": "string"
}';
const headers = {
  'Content-Type':'application/json',
  'Accept':'application/json',
  'Authorization':'API_KEY'
};

fetch('https://tw16nt2svf.execute-api.eu-south-1.amazonaws.com/{basePath}/subjects/{subjectId}/topics/{topicId}',
{
  method: 'PUT',
  body: inputBody,
  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`PUT /subjects/{subjectId}/topics/{topicId}`

> Body parameter

```json
{
  "name": "string"
}
```

<h3 id="put__subjects_{subjectid}_topics_{topicid}-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|subjectId|path|string|true|none|
|topicId|path|string|true|none|
|body|body|[UpdateTopicMethod](#schemaupdatetopicmethod)|true|none|

> Example responses

> 200 Response

```json
{
  "createdAt": "string",
  "topics": [
    {
      "name": "string",
      "subtopics": [
        {
          "name": "string",
          "_id": "string"
        }
      ],
      "_id": "string"
    }
  ],
  "__v": 0,
  "name": "string",
  "style": {
    "light": "string",
    "icon": "string",
    "primary": "string"
  },
  "_id": "string",
  "updatedAt": "string"
}
```

<h3 id="put__subjects_{subjectid}_topics_{topicid}-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|200 response|[SubjectPayload](#schemasubjectpayload)|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
AdminApiStackstgCognitoAuthorizerCognitoAuthorizerstg9DCFA5E0
</aside>

## delete__subjects_{subjectId}_topics_{topicId}

> Code samples

```javascript

const headers = {
  'Authorization':'API_KEY'
};

fetch('https://tw16nt2svf.execute-api.eu-south-1.amazonaws.com/{basePath}/subjects/{subjectId}/topics/{topicId}',
{
  method: 'DELETE',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`DELETE /subjects/{subjectId}/topics/{topicId}`

<h3 id="delete__subjects_{subjectid}_topics_{topicid}-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|subjectId|path|string|true|none|
|topicId|path|string|true|none|

> Example responses

<h3 id="delete__subjects_{subjectid}_topics_{topicid}-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|204|[No Content](https://tools.ietf.org/html/rfc7231#section-6.3.5)|204 response|None|

<h3 id="delete__subjects_{subjectid}_topics_{topicid}-responseschema">Response Schema</h3>

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
AdminApiStackstgCognitoAuthorizerCognitoAuthorizerstg9DCFA5E0
</aside>

## options__subjects_{subjectId}_topics_{topicId}

> Code samples

```javascript

const headers = {
  'Accept':'application/json'
};

fetch('https://tw16nt2svf.execute-api.eu-south-1.amazonaws.com/{basePath}/subjects/{subjectId}/topics/{topicId}',
{
  method: 'OPTIONS',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`OPTIONS /subjects/{subjectId}/topics/{topicId}`

<h3 id="options__subjects_{subjectid}_topics_{topicid}-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|subjectId|path|string|true|none|
|topicId|path|string|true|none|

> Example responses

> 200 Response

```json
{}
```

<h3 id="options__subjects_{subjectid}_topics_{topicid}-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|200 response|[Empty](#schemaempty)|

### Response Headers

|Status|Header|Type|Format|Description|
|---|---|---|---|---|
|200|Access-Control-Allow-Origin|string||none|
|200|Access-Control-Allow-Methods|string||none|
|200|Access-Control-Allow-Credentials|string||none|
|200|Access-Control-Allow-Headers|string||none|

<aside class="success">
This operation does not require authentication
</aside>

## get__modules_{moduleId}

> Code samples

```javascript

const headers = {
  'Accept':'application/json',
  'Authorization':'API_KEY'
};

fetch('https://tw16nt2svf.execute-api.eu-south-1.amazonaws.com/{basePath}/modules/{moduleId}',
{
  method: 'GET',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`GET /modules/{moduleId}`

<h3 id="get__modules_{moduleid}-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|moduleId|path|string|true|none|

> Example responses

> 200 Response

```json
{
  "area": "string",
  "createdAt": "string",
  "documents": [
    "string"
  ],
  "brandId": "string",
  "__v": 0,
  "name": "string",
  "_id": "string",
  "sku": [
    "string"
  ],
  "simulations": [
    "string"
  ],
  "updatedAt": "string"
}
```

<h3 id="get__modules_{moduleid}-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|200 response|[ModulePayload](#schemamodulepayload)|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
AdminApiStackstgCognitoAuthorizerCognitoAuthorizerstg9DCFA5E0
</aside>

## post__modules_{moduleId}

> Code samples

```javascript
const inputBody = '{
  "documents": [
    "string"
  ],
  "name": "string",
  "sku": [
    "string"
  ],
  "simulations": [
    "string"
  ]
}';
const headers = {
  'Content-Type':'application/json',
  'Accept':'application/json',
  'Authorization':'API_KEY'
};

fetch('https://tw16nt2svf.execute-api.eu-south-1.amazonaws.com/{basePath}/modules/{moduleId}',
{
  method: 'POST',
  body: inputBody,
  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`POST /modules/{moduleId}`

> Body parameter

```json
{
  "documents": [
    "string"
  ],
  "name": "string",
  "sku": [
    "string"
  ],
  "simulations": [
    "string"
  ]
}
```

<h3 id="post__modules_{moduleid}-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|moduleId|path|string|true|none|
|body|body|[UpdateModuleModel](#schemaupdatemodulemodel)|true|none|

> Example responses

> 200 Response

```json
{
  "area": "string",
  "createdAt": "string",
  "documents": [
    "string"
  ],
  "brandId": "string",
  "__v": 0,
  "name": "string",
  "_id": "string",
  "sku": [
    "string"
  ],
  "simulations": [
    "string"
  ],
  "updatedAt": "string"
}
```

<h3 id="post__modules_{moduleid}-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|200 response|[ModulePayload](#schemamodulepayload)|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
AdminApiStackstgCognitoAuthorizerCognitoAuthorizerstg9DCFA5E0
</aside>

## delete__modules_{moduleId}

> Code samples

```javascript

const headers = {
  'Accept':'application/json',
  'Authorization':'API_KEY'
};

fetch('https://tw16nt2svf.execute-api.eu-south-1.amazonaws.com/{basePath}/modules/{moduleId}',
{
  method: 'DELETE',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`DELETE /modules/{moduleId}`

<h3 id="delete__modules_{moduleid}-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|moduleId|path|string|true|none|

> Example responses

> 200 Response

```json
{
  "area": "string",
  "createdAt": "string",
  "documents": [
    "string"
  ],
  "brandId": "string",
  "__v": 0,
  "name": "string",
  "_id": "string",
  "sku": [
    "string"
  ],
  "simulations": [
    "string"
  ],
  "updatedAt": "string"
}
```

<h3 id="delete__modules_{moduleid}-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|200 response|[ModulePayload](#schemamodulepayload)|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
AdminApiStackstgCognitoAuthorizerCognitoAuthorizerstg9DCFA5E0
</aside>

## options__modules_{moduleId}

> Code samples

```javascript

const headers = {
  'Accept':'application/json'
};

fetch('https://tw16nt2svf.execute-api.eu-south-1.amazonaws.com/{basePath}/modules/{moduleId}',
{
  method: 'OPTIONS',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`OPTIONS /modules/{moduleId}`

<h3 id="options__modules_{moduleid}-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|moduleId|path|string|true|none|

> Example responses

> 200 Response

```json
{}
```

<h3 id="options__modules_{moduleid}-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|200 response|[Empty](#schemaempty)|

### Response Headers

|Status|Header|Type|Format|Description|
|---|---|---|---|---|
|200|Access-Control-Allow-Origin|string||none|
|200|Access-Control-Allow-Methods|string||none|
|200|Access-Control-Allow-Credentials|string||none|
|200|Access-Control-Allow-Headers|string||none|

<aside class="success">
This operation does not require authentication
</aside>

## get__community-roles

> Code samples

```javascript

const headers = {
  'Accept':'application/json',
  'Authorization':'API_KEY'
};

fetch('https://tw16nt2svf.execute-api.eu-south-1.amazonaws.com/{basePath}/community-roles',
{
  method: 'GET',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`GET /community-roles`

> Example responses

> 200 Response

```json
{
  "total": 0,
  "data": [
    {
      "createdAt": "string",
      "capabilities": [
        {
          "resource": "string",
          "actions": [
            "string"
          ]
        }
      ],
      "displayName": "string",
      "__v": 0,
      "name": "string",
      "description": "string",
      "rank": 0,
      "_id": "string",
      "updatedAt": "string"
    }
  ],
  "limit": 0,
  "page": 0
}
```

<h3 id="get__community-roles-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|200 response|[CommunityRolesPayload](#schemacommunityrolespayload)|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
AdminApiStackstgCognitoAuthorizerCognitoAuthorizerstg9DCFA5E0
</aside>

## post__community-roles

> Code samples

```javascript
const inputBody = '{
  "capabilities": [
    {
      "resource": "string",
      "actions": [
        "string"
      ]
    }
  ],
  "displayName": "string",
  "name": "string",
  "description": "string",
  "rank": 0
}';
const headers = {
  'Content-Type':'application/json',
  'Accept':'application/json',
  'Authorization':'API_KEY'
};

fetch('https://tw16nt2svf.execute-api.eu-south-1.amazonaws.com/{basePath}/community-roles',
{
  method: 'POST',
  body: inputBody,
  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`POST /community-roles`

> Body parameter

```json
{
  "capabilities": [
    {
      "resource": "string",
      "actions": [
        "string"
      ]
    }
  ],
  "displayName": "string",
  "name": "string",
  "description": "string",
  "rank": 0
}
```

<h3 id="post__community-roles-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|body|body|[NewCommunityRoleModel](#schemanewcommunityrolemodel)|true|none|

> Example responses

> 201 Response

```json
{
  "createdAt": "string",
  "capabilities": [
    {
      "resource": "string",
      "actions": [
        "string"
      ]
    }
  ],
  "displayName": "string",
  "__v": 0,
  "name": "string",
  "description": "string",
  "rank": 0,
  "_id": "string",
  "updatedAt": "string"
}
```

<h3 id="post__community-roles-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|201|[Created](https://tools.ietf.org/html/rfc7231#section-6.3.2)|201 response|[CommunityRolePayload](#schemacommunityrolepayload)|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
AdminApiStackstgCognitoAuthorizerCognitoAuthorizerstg9DCFA5E0
</aside>

## options__community-roles

> Code samples

```javascript

const headers = {
  'Accept':'application/json'
};

fetch('https://tw16nt2svf.execute-api.eu-south-1.amazonaws.com/{basePath}/community-roles',
{
  method: 'OPTIONS',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`OPTIONS /community-roles`

> Example responses

> 200 Response

```json
{}
```

<h3 id="options__community-roles-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|200 response|[Empty](#schemaempty)|

### Response Headers

|Status|Header|Type|Format|Description|
|---|---|---|---|---|
|200|Access-Control-Allow-Origin|string||none|
|200|Access-Control-Allow-Methods|string||none|
|200|Access-Control-Allow-Credentials|string||none|
|200|Access-Control-Allow-Headers|string||none|

<aside class="success">
This operation does not require authentication
</aside>

## post__collections_{collectionId}_sections_{sectionIdx}_questions

> Code samples

```javascript
const inputBody = '{
  "questionId": "string",
  "points": {
    "correctPoint": 0,
    "wrongPoint": 0,
    "emptyPoint": 0
  }
}';
const headers = {
  'Content-Type':'application/json',
  'Accept':'application/json',
  'Authorization':'API_KEY'
};

fetch('https://tw16nt2svf.execute-api.eu-south-1.amazonaws.com/{basePath}/collections/{collectionId}/sections/{sectionIdx}/questions',
{
  method: 'POST',
  body: inputBody,
  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`POST /collections/{collectionId}/sections/{sectionIdx}/questions`

> Body parameter

```json
{
  "questionId": "string",
  "points": {
    "correctPoint": 0,
    "wrongPoint": 0,
    "emptyPoint": 0
  }
}
```

<h3 id="post__collections_{collectionid}_sections_{sectionidx}_questions-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|collectionId|path|string|true|none|
|sectionIdx|path|string|true|none|
|body|body|[AdminAddCollectionSectionQuestionModel](#schemaadminaddcollectionsectionquestionmodel)|true|none|

> Example responses

> 201 Response

```json
{
  "brands": [
    {
      "name": "string"
    }
  ],
  "timed": true,
  "type": "exercise",
  "authorId": "string",
  "brandIds": [
    "string"
  ],
  "sections": [
    {
      "maxAttempts": 0,
      "questions": [
        {
          "questionId": "string",
          "points": {
            "correctPoint": 0,
            "wrongPoint": 0,
            "emptyPoint": 0
          }
        }
      ],
      "rules": {
        "duration": 0,
        "pausable": true,
        "extraTime": [
          0
        ]
      },
      "_id": "string"
    }
  ],
  "tags": [
    "string"
  ],
  "archived": true,
  "createdAt": "string",
  "name": "string",
  "testId": "string",
  "attributes": [
    "string"
  ],
  "_id": "string",
  "status": "draft",
  "updatedAt": "string"
}
```

<h3 id="post__collections_{collectionid}_sections_{sectionidx}_questions-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|201|[Created](https://tools.ietf.org/html/rfc7231#section-6.3.2)|201 response|[AdminCollectionPayload](#schemaadmincollectionpayload)|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
AdminApiStackstgCognitoAuthorizerCognitoAuthorizerstg9DCFA5E0
</aside>

## options__collections_{collectionId}_sections_{sectionIdx}_questions

> Code samples

```javascript

const headers = {
  'Accept':'application/json'
};

fetch('https://tw16nt2svf.execute-api.eu-south-1.amazonaws.com/{basePath}/collections/{collectionId}/sections/{sectionIdx}/questions',
{
  method: 'OPTIONS',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`OPTIONS /collections/{collectionId}/sections/{sectionIdx}/questions`

<h3 id="options__collections_{collectionid}_sections_{sectionidx}_questions-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|collectionId|path|string|true|none|
|sectionIdx|path|string|true|none|

> Example responses

> 200 Response

```json
{}
```

<h3 id="options__collections_{collectionid}_sections_{sectionidx}_questions-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|200 response|[Empty](#schemaempty)|

### Response Headers

|Status|Header|Type|Format|Description|
|---|---|---|---|---|
|200|Access-Control-Allow-Origin|string||none|
|200|Access-Control-Allow-Methods|string||none|
|200|Access-Control-Allow-Credentials|string||none|
|200|Access-Control-Allow-Headers|string||none|

<aside class="success">
This operation does not require authentication
</aside>

## get__skus_{skuId}

> Code samples

```javascript

const headers = {
  'Accept':'application/json',
  'Authorization':'API_KEY'
};

fetch('https://tw16nt2svf.execute-api.eu-south-1.amazonaws.com/{basePath}/skus/{skuId}',
{
  method: 'GET',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`GET /skus/{skuId}`

<h3 id="get__skus_{skuid}-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|skuId|path|string|true|none|

> Example responses

> 200 Response

```json
{
  "createdAt": "string",
  "code": "string",
  "brands": [
    {
      "name": "string",
      "id": "string"
    }
  ],
  "__v": 0,
  "name": "string",
  "_id": "string",
  "url": "string",
  "updatedAt": "string"
}
```

<h3 id="get__skus_{skuid}-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|200 response|[SkuPayload](#schemaskupayload)|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
AdminApiStackstgCognitoAuthorizerCognitoAuthorizerstg9DCFA5E0
</aside>

## put__skus_{skuId}

> Code samples

```javascript
const inputBody = '{
  "code": "string",
  "brands": [
    {
      "name": "string",
      "id": "string"
    }
  ],
  "name": "string",
  "url": "string"
}';
const headers = {
  'Content-Type':'application/json',
  'Accept':'application/json',
  'Authorization':'API_KEY'
};

fetch('https://tw16nt2svf.execute-api.eu-south-1.amazonaws.com/{basePath}/skus/{skuId}',
{
  method: 'PUT',
  body: inputBody,
  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`PUT /skus/{skuId}`

> Body parameter

```json
{
  "code": "string",
  "brands": [
    {
      "name": "string",
      "id": "string"
    }
  ],
  "name": "string",
  "url": "string"
}
```

<h3 id="put__skus_{skuid}-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|skuId|path|string|true|none|
|body|body|[EditSkuModel](#schemaeditskumodel)|true|none|

> Example responses

> 200 Response

```json
{
  "createdAt": "string",
  "code": "string",
  "brands": [
    {
      "name": "string",
      "id": "string"
    }
  ],
  "__v": 0,
  "name": "string",
  "_id": "string",
  "url": "string",
  "updatedAt": "string"
}
```

<h3 id="put__skus_{skuid}-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|200 response|[SkuPayload](#schemaskupayload)|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
AdminApiStackstgCognitoAuthorizerCognitoAuthorizerstg9DCFA5E0
</aside>

## delete__skus_{skuId}

> Code samples

```javascript

const headers = {
  'Authorization':'API_KEY'
};

fetch('https://tw16nt2svf.execute-api.eu-south-1.amazonaws.com/{basePath}/skus/{skuId}',
{
  method: 'DELETE',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`DELETE /skus/{skuId}`

<h3 id="delete__skus_{skuid}-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|skuId|path|string|true|none|

> Example responses

<h3 id="delete__skus_{skuid}-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|204|[No Content](https://tools.ietf.org/html/rfc7231#section-6.3.5)|204 response|None|

<h3 id="delete__skus_{skuid}-responseschema">Response Schema</h3>

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
AdminApiStackstgCognitoAuthorizerCognitoAuthorizerstg9DCFA5E0
</aside>

## options__skus_{skuId}

> Code samples

```javascript

const headers = {
  'Accept':'application/json'
};

fetch('https://tw16nt2svf.execute-api.eu-south-1.amazonaws.com/{basePath}/skus/{skuId}',
{
  method: 'OPTIONS',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`OPTIONS /skus/{skuId}`

<h3 id="options__skus_{skuid}-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|skuId|path|string|true|none|

> Example responses

> 200 Response

```json
{}
```

<h3 id="options__skus_{skuid}-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|200 response|[Empty](#schemaempty)|

### Response Headers

|Status|Header|Type|Format|Description|
|---|---|---|---|---|
|200|Access-Control-Allow-Origin|string||none|
|200|Access-Control-Allow-Methods|string||none|
|200|Access-Control-Allow-Credentials|string||none|
|200|Access-Control-Allow-Headers|string||none|

<aside class="success">
This operation does not require authentication
</aside>

## get__questions

> Code samples

```javascript

const headers = {
  'Accept':'application/json',
  'Authorization':'API_KEY'
};

fetch('https://tw16nt2svf.execute-api.eu-south-1.amazonaws.com/{basePath}/questions',
{
  method: 'GET',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`GET /questions`

<h3 id="get__questions-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|includes|query|string|false|none|
|statuses|query|string|false|none|
|subjectId|query|string|false|none|
|language|query|string|false|none|
|status|query|string|false|none|
|languages|query|string|false|none|
|subjectIds|query|string|false|none|
|subtopicId|query|string|false|none|
|authorId|query|string|false|none|
|topicId|query|string|false|none|
|limit|query|string|false|none|
|sort|query|string|false|none|
|difficulties|query|string|false|none|
|topicIds|query|string|false|none|
|type|query|string|false|none|
|types|query|string|false|none|
|page|query|string|false|none|
|archived|query|string|false|none|
|difficulty|query|string|false|none|

> Example responses

> 200 Response

```json
{
  "total": 0,
  "data": [
    {
      "versionCount": 0,
      "subject": {
        "name": "string"
      },
      "language": "it",
      "type": "completion",
      "subjectId": "string",
      "questionText": "string",
      "revisorId": "string",
      "explanationImages": [
        "string"
      ],
      "archived": true,
      "createdAt": "string",
      "approved": true,
      "stats": {
        "correct": 0,
        "answersCount": [
          0
        ],
        "empty": 0,
        "wrong": 0
      },
      "__v": 0,
      "completionAnswers": [
        "string"
      ],
      "subtopic": {
        "name": "string"
      },
      "updatedAt": "string",
      "explanationText": "string",
      "revisor": {
        "email": "string"
      },
      "author": {
        "email": "string"
      },
      "authorId": "string",
      "tags": [
        "string"
      ],
      "difficulty": 0,
      "topicId": "string",
      "topic": {
        "name": "string"
      },
      "alternatives": [
        {
          "image": "string",
          "correct": true,
          "text": "string"
        }
      ],
      "subtopicId": "string",
      "_id": "string",
      "questionImages": [
        "string"
      ],
      "status": "draft"
    }
  ],
  "limit": 0,
  "page": 0
}
```

<h3 id="get__questions-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|200 response|[ListQuestionsPayload](#schemalistquestionspayload)|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
AdminApiStackstgCognitoAuthorizerCognitoAuthorizerstg9DCFA5E0
</aside>

## post__questions

> Code samples

```javascript
const inputBody = '{
  "explanationText": "string",
  "difficulty": 0,
  "subject": {
    "name": "string",
    "_id": "string"
  },
  "draft": true,
  "alternatives": [
    {
      "image": "string",
      "correct": true,
      "text": "string"
    }
  ],
  "topic": {
    "name": "string",
    "_id": "string"
  },
  "language": "it",
  "questionImages": [
    "string"
  ],
  "questionText": "string",
  "explanationImages": [
    "string"
  ],
  "tags": [
    "string"
  ]
}';
const headers = {
  'Content-Type':'application/json',
  'Accept':'application/json',
  'Authorization':'API_KEY'
};

fetch('https://tw16nt2svf.execute-api.eu-south-1.amazonaws.com/{basePath}/questions',
{
  method: 'POST',
  body: inputBody,
  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`POST /questions`

> Body parameter

```json
{
  "explanationText": "string",
  "difficulty": 0,
  "subject": {
    "name": "string",
    "_id": "string"
  },
  "draft": true,
  "alternatives": [
    {
      "image": "string",
      "correct": true,
      "text": "string"
    }
  ],
  "topic": {
    "name": "string",
    "_id": "string"
  },
  "language": "it",
  "questionImages": [
    "string"
  ],
  "questionText": "string",
  "explanationImages": [
    "string"
  ],
  "tags": [
    "string"
  ]
}
```

<h3 id="post__questions-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|body|body|[NewQuestionModel](#schemanewquestionmodel)|true|none|

> Example responses

> 201 Response

```json
{
  "versionCount": 0,
  "subject": {
    "name": "string"
  },
  "language": "it",
  "type": "completion",
  "subjectId": "string",
  "questionText": "string",
  "revisorId": "string",
  "explanationImages": [
    "string"
  ],
  "archived": true,
  "createdAt": "string",
  "approved": true,
  "stats": {
    "correct": 0,
    "answersCount": [
      0
    ],
    "empty": 0,
    "wrong": 0
  },
  "__v": 0,
  "completionAnswers": [
    "string"
  ],
  "subtopic": {
    "name": "string"
  },
  "updatedAt": "string",
  "explanationText": "string",
  "revisor": {
    "email": "string"
  },
  "author": {
    "email": "string"
  },
  "authorId": "string",
  "tags": [
    "string"
  ],
  "difficulty": 0,
  "topicId": "string",
  "topic": {
    "name": "string"
  },
  "alternatives": [
    {
      "image": "string",
      "correct": true,
      "text": "string"
    }
  ],
  "subtopicId": "string",
  "_id": "string",
  "questionImages": [
    "string"
  ],
  "status": "draft"
}
```

<h3 id="post__questions-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|201|[Created](https://tools.ietf.org/html/rfc7231#section-6.3.2)|201 response|[QuestionPayload](#schemaquestionpayload)|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
AdminApiStackstgCognitoAuthorizerCognitoAuthorizerstg9DCFA5E0
</aside>

## options__questions

> Code samples

```javascript

const headers = {
  'Accept':'application/json'
};

fetch('https://tw16nt2svf.execute-api.eu-south-1.amazonaws.com/{basePath}/questions',
{
  method: 'OPTIONS',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`OPTIONS /questions`

> Example responses

> 200 Response

```json
{}
```

<h3 id="options__questions-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|200 response|[Empty](#schemaempty)|

### Response Headers

|Status|Header|Type|Format|Description|
|---|---|---|---|---|
|200|Access-Control-Allow-Origin|string||none|
|200|Access-Control-Allow-Methods|string||none|
|200|Access-Control-Allow-Credentials|string||none|
|200|Access-Control-Allow-Headers|string||none|

<aside class="success">
This operation does not require authentication
</aside>

## get__community-users

> Code samples

```javascript

const headers = {
  'Accept':'application/json',
  'Authorization':'API_KEY'
};

fetch('https://tw16nt2svf.execute-api.eu-south-1.amazonaws.com/{basePath}/community-users',
{
  method: 'GET',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`GET /community-users`

<h3 id="get__community-users-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|roleId|query|string|false|none|
|page|query|string|false|none|
|search|query|string|false|none|
|per_page|query|string|false|none|

> Example responses

> 200 Response

```json
{
  "total": 0,
  "communityUsers": [
    {
      "lastLogin": "string",
      "createdAt": "string",
      "cognitoId": "string",
      "roleIds": [
        "string"
      ],
      "__v": 0,
      "_id": "string",
      "updatedAt": "string"
    }
  ]
}
```

<h3 id="get__community-users-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|200 response|[CommunityUsersPayload](#schemacommunityuserspayload)|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
AdminApiStackstgCognitoAuthorizerCognitoAuthorizerstg9DCFA5E0
</aside>

## post__community-users

> Code samples

```javascript
const inputBody = '{
  "cognitoId": "string",
  "roleIds": [
    "string"
  ]
}';
const headers = {
  'Content-Type':'application/json',
  'Accept':'application/json',
  'Authorization':'API_KEY'
};

fetch('https://tw16nt2svf.execute-api.eu-south-1.amazonaws.com/{basePath}/community-users',
{
  method: 'POST',
  body: inputBody,
  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`POST /community-users`

> Body parameter

```json
{
  "cognitoId": "string",
  "roleIds": [
    "string"
  ]
}
```

<h3 id="post__community-users-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|body|body|[NewCommunityUserModel](#schemanewcommunityusermodel)|true|none|

> Example responses

> 201 Response

```json
{
  "lastLogin": "string",
  "createdAt": "string",
  "cognitoId": "string",
  "roleIds": [
    "string"
  ],
  "__v": 0,
  "_id": "string",
  "updatedAt": "string"
}
```

<h3 id="post__community-users-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|201|[Created](https://tools.ietf.org/html/rfc7231#section-6.3.2)|201 response|[CommunityUserPayload](#schemacommunityuserpayload)|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
AdminApiStackstgCognitoAuthorizerCognitoAuthorizerstg9DCFA5E0
</aside>

## options__community-users

> Code samples

```javascript

const headers = {
  'Accept':'application/json'
};

fetch('https://tw16nt2svf.execute-api.eu-south-1.amazonaws.com/{basePath}/community-users',
{
  method: 'OPTIONS',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`OPTIONS /community-users`

> Example responses

> 200 Response

```json
{}
```

<h3 id="options__community-users-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|200 response|[Empty](#schemaempty)|

### Response Headers

|Status|Header|Type|Format|Description|
|---|---|---|---|---|
|200|Access-Control-Allow-Origin|string||none|
|200|Access-Control-Allow-Methods|string||none|
|200|Access-Control-Allow-Credentials|string||none|
|200|Access-Control-Allow-Headers|string||none|

<aside class="success">
This operation does not require authentication
</aside>

## get__collections_search

> Code samples

```javascript

const headers = {
  'Accept':'application/json',
  'Authorization':'API_KEY'
};

fetch('https://tw16nt2svf.execute-api.eu-south-1.amazonaws.com/{basePath}/collections/search',
{
  method: 'GET',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`GET /collections/search`

<h3 id="get__collections_search-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|limit|query|string|false|none|
|type|query|string|false|none|
|brandIds|query|string|false|none|
|status|query|string|false|none|
|page|query|string|false|none|
|archived|query|string|false|none|
|search|query|string|false|none|
|testId|query|string|false|none|

> Example responses

> 200 Response

```json
{
  "total": 0,
  "data": [
    {
      "brands": [
        {
          "name": "string"
        }
      ],
      "timed": true,
      "type": "exercise",
      "authorId": "string",
      "brandIds": [
        "string"
      ],
      "sections": [
        {
          "maxAttempts": 0,
          "questions": [
            {
              "questionId": "string",
              "points": {
                "correctPoint": 0,
                "wrongPoint": 0,
                "emptyPoint": 0
              }
            }
          ],
          "rules": {
            "duration": 0,
            "pausable": true,
            "extraTime": [
              0
            ]
          },
          "_id": "string"
        }
      ],
      "tags": [
        "string"
      ],
      "archived": true,
      "createdAt": "string",
      "name": "string",
      "testId": "string",
      "attributes": [
        "string"
      ],
      "_id": "string",
      "status": "draft",
      "updatedAt": "string"
    }
  ],
  "limit": 0,
  "page": 0
}
```

<h3 id="get__collections_search-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|200 response|[AdminListCollectionsPayload](#schemaadminlistcollectionspayload)|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
AdminApiStackstgCognitoAuthorizerCognitoAuthorizerstg9DCFA5E0
</aside>

## options__collections_search

> Code samples

```javascript

const headers = {
  'Accept':'application/json'
};

fetch('https://tw16nt2svf.execute-api.eu-south-1.amazonaws.com/{basePath}/collections/search',
{
  method: 'OPTIONS',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`OPTIONS /collections/search`

> Example responses

> 200 Response

```json
{}
```

<h3 id="options__collections_search-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|200 response|[Empty](#schemaempty)|

### Response Headers

|Status|Header|Type|Format|Description|
|---|---|---|---|---|
|200|Access-Control-Allow-Origin|string||none|
|200|Access-Control-Allow-Methods|string||none|
|200|Access-Control-Allow-Credentials|string||none|
|200|Access-Control-Allow-Headers|string||none|

<aside class="success">
This operation does not require authentication
</aside>

## post__subjects_{subjectId}_topics_{topicId}_subtopics

> Code samples

```javascript
const inputBody = '{
  "name": "string"
}';
const headers = {
  'Content-Type':'application/json',
  'Accept':'application/json',
  'Authorization':'API_KEY'
};

fetch('https://tw16nt2svf.execute-api.eu-south-1.amazonaws.com/{basePath}/subjects/{subjectId}/topics/{topicId}/subtopics',
{
  method: 'POST',
  body: inputBody,
  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`POST /subjects/{subjectId}/topics/{topicId}/subtopics`

> Body parameter

```json
{
  "name": "string"
}
```

<h3 id="post__subjects_{subjectid}_topics_{topicid}_subtopics-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|subjectId|path|string|true|none|
|topicId|path|string|true|none|
|body|body|[AddSubtopicMethod](#schemaaddsubtopicmethod)|true|none|

> Example responses

> 201 Response

```json
{
  "createdAt": "string",
  "topics": [
    {
      "name": "string",
      "subtopics": [
        {
          "name": "string",
          "_id": "string"
        }
      ],
      "_id": "string"
    }
  ],
  "__v": 0,
  "name": "string",
  "style": {
    "light": "string",
    "icon": "string",
    "primary": "string"
  },
  "_id": "string",
  "updatedAt": "string"
}
```

<h3 id="post__subjects_{subjectid}_topics_{topicid}_subtopics-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|201|[Created](https://tools.ietf.org/html/rfc7231#section-6.3.2)|201 response|[SubjectPayload](#schemasubjectpayload)|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
AdminApiStackstgCognitoAuthorizerCognitoAuthorizerstg9DCFA5E0
</aside>

## options__subjects_{subjectId}_topics_{topicId}_subtopics

> Code samples

```javascript

const headers = {
  'Accept':'application/json'
};

fetch('https://tw16nt2svf.execute-api.eu-south-1.amazonaws.com/{basePath}/subjects/{subjectId}/topics/{topicId}/subtopics',
{
  method: 'OPTIONS',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`OPTIONS /subjects/{subjectId}/topics/{topicId}/subtopics`

<h3 id="options__subjects_{subjectid}_topics_{topicid}_subtopics-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|subjectId|path|string|true|none|
|topicId|path|string|true|none|

> Example responses

> 200 Response

```json
{}
```

<h3 id="options__subjects_{subjectid}_topics_{topicid}_subtopics-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|200 response|[Empty](#schemaempty)|

### Response Headers

|Status|Header|Type|Format|Description|
|---|---|---|---|---|
|200|Access-Control-Allow-Origin|string||none|
|200|Access-Control-Allow-Methods|string||none|
|200|Access-Control-Allow-Credentials|string||none|
|200|Access-Control-Allow-Headers|string||none|

<aside class="success">
This operation does not require authentication
</aside>

## get__subjects

> Code samples

```javascript

const headers = {
  'Accept':'application/json',
  'Authorization':'API_KEY'
};

fetch('https://tw16nt2svf.execute-api.eu-south-1.amazonaws.com/{basePath}/subjects',
{
  method: 'GET',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`GET /subjects`

<h3 id="get__subjects-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|includes|query|string|false|none|

> Example responses

> 200 Response

```json
{
  "total": 0,
  "data": [
    {
      "createdAt": "string",
      "topics": [
        {
          "name": "string",
          "subtopics": [
            {
              "name": "string",
              "_id": "string"
            }
          ],
          "_id": "string"
        }
      ],
      "__v": 0,
      "name": "string",
      "style": {
        "light": "string",
        "icon": "string",
        "primary": "string"
      },
      "_id": "string",
      "updatedAt": "string"
    }
  ],
  "limit": 0,
  "page": 0
}
```

<h3 id="get__subjects-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|200 response|[SubjectsPayload](#schemasubjectspayload)|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
AdminApiStackstgCognitoAuthorizerCognitoAuthorizerstg9DCFA5E0
</aside>

## post__subjects

> Code samples

```javascript
const inputBody = '{
  "name": "string"
}';
const headers = {
  'Content-Type':'application/json',
  'Accept':'application/json',
  'Authorization':'API_KEY'
};

fetch('https://tw16nt2svf.execute-api.eu-south-1.amazonaws.com/{basePath}/subjects',
{
  method: 'POST',
  body: inputBody,
  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`POST /subjects`

> Body parameter

```json
{
  "name": "string"
}
```

<h3 id="post__subjects-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|body|body|[InsertSubjectModel](#schemainsertsubjectmodel)|true|none|

> Example responses

> 201 Response

```json
{
  "createdAt": "string",
  "topics": [
    {
      "name": "string",
      "subtopics": [
        {
          "name": "string",
          "_id": "string"
        }
      ],
      "_id": "string"
    }
  ],
  "__v": 0,
  "name": "string",
  "style": {
    "light": "string",
    "icon": "string",
    "primary": "string"
  },
  "_id": "string",
  "updatedAt": "string"
}
```

<h3 id="post__subjects-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|201|[Created](https://tools.ietf.org/html/rfc7231#section-6.3.2)|201 response|[SubjectPayload](#schemasubjectpayload)|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
AdminApiStackstgCognitoAuthorizerCognitoAuthorizerstg9DCFA5E0
</aside>

## options__subjects

> Code samples

```javascript

const headers = {
  'Accept':'application/json'
};

fetch('https://tw16nt2svf.execute-api.eu-south-1.amazonaws.com/{basePath}/subjects',
{
  method: 'OPTIONS',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`OPTIONS /subjects`

> Example responses

> 200 Response

```json
{}
```

<h3 id="options__subjects-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|200 response|[Empty](#schemaempty)|

### Response Headers

|Status|Header|Type|Format|Description|
|---|---|---|---|---|
|200|Access-Control-Allow-Origin|string||none|
|200|Access-Control-Allow-Methods|string||none|
|200|Access-Control-Allow-Credentials|string||none|
|200|Access-Control-Allow-Headers|string||none|

<aside class="success">
This operation does not require authentication
</aside>

## get__pools_{poolId}_questions

> Code samples

```javascript

const headers = {
  'Accept':'application/json',
  'Authorization':'API_KEY'
};

fetch('https://tw16nt2svf.execute-api.eu-south-1.amazonaws.com/{basePath}/pools/{poolId}/questions',
{
  method: 'GET',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`GET /pools/{poolId}/questions`

<h3 id="get__pools_{poolid}_questions-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|topicId|query|string|false|none|
|limit|query|string|false|none|
|subjectId|query|string|false|none|
|type|query|string|false|none|
|language|query|string|false|none|
|page|query|string|false|none|
|difficulty|query|string|false|none|
|search|query|string|false|none|
|subtopicId|query|string|false|none|
|poolId|path|string|true|none|

> Example responses

> 200 Response

```json
{
  "total": 0,
  "data": [
    {
      "addedAt": "string",
      "questionId": "string",
      "subject": {
        "name": "string"
      },
      "addedBy": "string",
      "language": "it",
      "type": "completion",
      "subjectId": "string",
      "difficulty": 0,
      "topicId": "string",
      "__v": 0,
      "poolId": "string",
      "topic": {
        "name": "string"
      },
      "subtopicId": "string",
      "_id": "string",
      "subtopic": {
        "name": "string"
      }
    }
  ],
  "limit": 0,
  "page": 0
}
```

<h3 id="get__pools_{poolid}_questions-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|200 response|[ListPoolQuestionsPayload](#schemalistpoolquestionspayload)|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
AdminApiStackstgCognitoAuthorizerCognitoAuthorizerstg9DCFA5E0
</aside>

## post__pools_{poolId}_questions

> Code samples

```javascript
const inputBody = '{
  "questionId": "string"
}';
const headers = {
  'Content-Type':'application/json',
  'Accept':'application/json',
  'Authorization':'API_KEY'
};

fetch('https://tw16nt2svf.execute-api.eu-south-1.amazonaws.com/{basePath}/pools/{poolId}/questions',
{
  method: 'POST',
  body: inputBody,
  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`POST /pools/{poolId}/questions`

> Body parameter

```json
{
  "questionId": "string"
}
```

<h3 id="post__pools_{poolid}_questions-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|poolId|path|string|true|none|
|body|body|[AddPoolQuestionModel](#schemaaddpoolquestionmodel)|true|none|

> Example responses

> 201 Response

```json
{
  "addedAt": "string",
  "questionId": "string",
  "subject": {
    "name": "string"
  },
  "addedBy": "string",
  "language": "it",
  "type": "completion",
  "subjectId": "string",
  "difficulty": 0,
  "topicId": "string",
  "__v": 0,
  "poolId": "string",
  "topic": {
    "name": "string"
  },
  "subtopicId": "string",
  "_id": "string",
  "subtopic": {
    "name": "string"
  }
}
```

<h3 id="post__pools_{poolid}_questions-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|201|[Created](https://tools.ietf.org/html/rfc7231#section-6.3.2)|201 response|[PoolQuestionPayload](#schemapoolquestionpayload)|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
AdminApiStackstgCognitoAuthorizerCognitoAuthorizerstg9DCFA5E0
</aside>

## options__pools_{poolId}_questions

> Code samples

```javascript

const headers = {
  'Accept':'application/json'
};

fetch('https://tw16nt2svf.execute-api.eu-south-1.amazonaws.com/{basePath}/pools/{poolId}/questions',
{
  method: 'OPTIONS',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`OPTIONS /pools/{poolId}/questions`

<h3 id="options__pools_{poolid}_questions-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|poolId|path|string|true|none|

> Example responses

> 200 Response

```json
{}
```

<h3 id="options__pools_{poolid}_questions-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|200 response|[Empty](#schemaempty)|

### Response Headers

|Status|Header|Type|Format|Description|
|---|---|---|---|---|
|200|Access-Control-Allow-Origin|string||none|
|200|Access-Control-Allow-Methods|string||none|
|200|Access-Control-Allow-Credentials|string||none|
|200|Access-Control-Allow-Headers|string||none|

<aside class="success">
This operation does not require authentication
</aside>

## get__community-roles_{communityRoleId}

> Code samples

```javascript

const headers = {
  'Accept':'application/json',
  'Authorization':'API_KEY'
};

fetch('https://tw16nt2svf.execute-api.eu-south-1.amazonaws.com/{basePath}/community-roles/{communityRoleId}',
{
  method: 'GET',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`GET /community-roles/{communityRoleId}`

<h3 id="get__community-roles_{communityroleid}-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|communityRoleId|path|string|true|none|

> Example responses

> 200 Response

```json
{
  "createdAt": "string",
  "capabilities": [
    {
      "resource": "string",
      "actions": [
        "string"
      ]
    }
  ],
  "displayName": "string",
  "__v": 0,
  "name": "string",
  "description": "string",
  "rank": 0,
  "_id": "string",
  "updatedAt": "string"
}
```

<h3 id="get__community-roles_{communityroleid}-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|200 response|[CommunityRolePayload](#schemacommunityrolepayload)|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
AdminApiStackstgCognitoAuthorizerCognitoAuthorizerstg9DCFA5E0
</aside>

## put__community-roles_{communityRoleId}

> Code samples

```javascript
const inputBody = '{
  "capabilities": [
    {
      "resource": "string",
      "actions": [
        "string"
      ]
    }
  ],
  "displayName": "string",
  "description": "string",
  "rank": 0
}';
const headers = {
  'Content-Type':'application/json',
  'Accept':'application/json',
  'Authorization':'API_KEY'
};

fetch('https://tw16nt2svf.execute-api.eu-south-1.amazonaws.com/{basePath}/community-roles/{communityRoleId}',
{
  method: 'PUT',
  body: inputBody,
  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`PUT /community-roles/{communityRoleId}`

> Body parameter

```json
{
  "capabilities": [
    {
      "resource": "string",
      "actions": [
        "string"
      ]
    }
  ],
  "displayName": "string",
  "description": "string",
  "rank": 0
}
```

<h3 id="put__community-roles_{communityroleid}-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|communityRoleId|path|string|true|none|
|body|body|[UpdateCommunityRoleModel](#schemaupdatecommunityrolemodel)|true|none|

> Example responses

> 200 Response

```json
{
  "createdAt": "string",
  "capabilities": [
    {
      "resource": "string",
      "actions": [
        "string"
      ]
    }
  ],
  "displayName": "string",
  "__v": 0,
  "name": "string",
  "description": "string",
  "rank": 0,
  "_id": "string",
  "updatedAt": "string"
}
```

<h3 id="put__community-roles_{communityroleid}-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|200 response|[CommunityRolePayload](#schemacommunityrolepayload)|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
AdminApiStackstgCognitoAuthorizerCognitoAuthorizerstg9DCFA5E0
</aside>

## delete__community-roles_{communityRoleId}

> Code samples

```javascript

const headers = {
  'Authorization':'API_KEY'
};

fetch('https://tw16nt2svf.execute-api.eu-south-1.amazonaws.com/{basePath}/community-roles/{communityRoleId}',
{
  method: 'DELETE',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`DELETE /community-roles/{communityRoleId}`

<h3 id="delete__community-roles_{communityroleid}-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|communityRoleId|path|string|true|none|

> Example responses

<h3 id="delete__community-roles_{communityroleid}-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|204|[No Content](https://tools.ietf.org/html/rfc7231#section-6.3.5)|204 response|None|

<h3 id="delete__community-roles_{communityroleid}-responseschema">Response Schema</h3>

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
AdminApiStackstgCognitoAuthorizerCognitoAuthorizerstg9DCFA5E0
</aside>

## options__community-roles_{communityRoleId}

> Code samples

```javascript

const headers = {
  'Accept':'application/json'
};

fetch('https://tw16nt2svf.execute-api.eu-south-1.amazonaws.com/{basePath}/community-roles/{communityRoleId}',
{
  method: 'OPTIONS',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`OPTIONS /community-roles/{communityRoleId}`

<h3 id="options__community-roles_{communityroleid}-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|communityRoleId|path|string|true|none|

> Example responses

> 200 Response

```json
{}
```

<h3 id="options__community-roles_{communityroleid}-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|200 response|[Empty](#schemaempty)|

### Response Headers

|Status|Header|Type|Format|Description|
|---|---|---|---|---|
|200|Access-Control-Allow-Origin|string||none|
|200|Access-Control-Allow-Methods|string||none|
|200|Access-Control-Allow-Credentials|string||none|
|200|Access-Control-Allow-Headers|string||none|

<aside class="success">
This operation does not require authentication
</aside>

## get__questions_{questionId}_stats

> Code samples

```javascript

const headers = {
  'Accept':'application/json',
  'Authorization':'API_KEY'
};

fetch('https://tw16nt2svf.execute-api.eu-south-1.amazonaws.com/{basePath}/questions/{questionId}/stats',
{
  method: 'GET',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`GET /questions/{questionId}/stats`

<h3 id="get__questions_{questionid}_stats-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|questionId|path|string|true|none|

> Example responses

> 200 Response

```json
{
  "correct": 0,
  "answersCount": [
    0
  ],
  "wrong": 0,
  "empty": 0
}
```

<h3 id="get__questions_{questionid}_stats-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|200 response|[QuestionStatsPayload](#schemaquestionstatspayload)|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
AdminApiStackstgCognitoAuthorizerCognitoAuthorizerstg9DCFA5E0
</aside>

## options__questions_{questionId}_stats

> Code samples

```javascript

const headers = {
  'Accept':'application/json'
};

fetch('https://tw16nt2svf.execute-api.eu-south-1.amazonaws.com/{basePath}/questions/{questionId}/stats',
{
  method: 'OPTIONS',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`OPTIONS /questions/{questionId}/stats`

<h3 id="options__questions_{questionid}_stats-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|questionId|path|string|true|none|

> Example responses

> 200 Response

```json
{}
```

<h3 id="options__questions_{questionid}_stats-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|200 response|[Empty](#schemaempty)|

### Response Headers

|Status|Header|Type|Format|Description|
|---|---|---|---|---|
|200|Access-Control-Allow-Origin|string||none|
|200|Access-Control-Allow-Methods|string||none|
|200|Access-Control-Allow-Credentials|string||none|
|200|Access-Control-Allow-Headers|string||none|

<aside class="success">
This operation does not require authentication
</aside>

## options__questions_{questionId}_status

> Code samples

```javascript

const headers = {
  'Accept':'application/json'
};

fetch('https://tw16nt2svf.execute-api.eu-south-1.amazonaws.com/{basePath}/questions/{questionId}/status',
{
  method: 'OPTIONS',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`OPTIONS /questions/{questionId}/status`

<h3 id="options__questions_{questionid}_status-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|questionId|path|string|true|none|

> Example responses

> 200 Response

```json
{}
```

<h3 id="options__questions_{questionid}_status-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|200 response|[Empty](#schemaempty)|

### Response Headers

|Status|Header|Type|Format|Description|
|---|---|---|---|---|
|200|Access-Control-Allow-Origin|string||none|
|200|Access-Control-Allow-Methods|string||none|
|200|Access-Control-Allow-Credentials|string||none|
|200|Access-Control-Allow-Headers|string||none|

<aside class="success">
This operation does not require authentication
</aside>

## patch__questions_{questionId}_status

> Code samples

```javascript
const inputBody = '{
  "status": "draft"
}';
const headers = {
  'Content-Type':'application/json',
  'Accept':'application/json',
  'Authorization':'API_KEY'
};

fetch('https://tw16nt2svf.execute-api.eu-south-1.amazonaws.com/{basePath}/questions/{questionId}/status',
{
  method: 'PATCH',
  body: inputBody,
  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`PATCH /questions/{questionId}/status`

> Body parameter

```json
{
  "status": "draft"
}
```

<h3 id="patch__questions_{questionid}_status-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|questionId|path|string|true|none|
|body|body|[UpdateQuestionStatusModel](#schemaupdatequestionstatusmodel)|true|none|

> Example responses

> 200 Response

```json
{
  "versionCount": 0,
  "subject": {
    "name": "string"
  },
  "language": "it",
  "type": "completion",
  "subjectId": "string",
  "questionText": "string",
  "revisorId": "string",
  "explanationImages": [
    "string"
  ],
  "archived": true,
  "createdAt": "string",
  "approved": true,
  "stats": {
    "correct": 0,
    "answersCount": [
      0
    ],
    "empty": 0,
    "wrong": 0
  },
  "__v": 0,
  "completionAnswers": [
    "string"
  ],
  "subtopic": {
    "name": "string"
  },
  "updatedAt": "string",
  "explanationText": "string",
  "revisor": {
    "email": "string"
  },
  "author": {
    "email": "string"
  },
  "authorId": "string",
  "tags": [
    "string"
  ],
  "difficulty": 0,
  "topicId": "string",
  "topic": {
    "name": "string"
  },
  "alternatives": [
    {
      "image": "string",
      "correct": true,
      "text": "string"
    }
  ],
  "subtopicId": "string",
  "_id": "string",
  "questionImages": [
    "string"
  ],
  "status": "draft"
}
```

<h3 id="patch__questions_{questionid}_status-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|200 response|[QuestionPayload](#schemaquestionpayload)|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
AdminApiStackstgCognitoAuthorizerCognitoAuthorizerstg9DCFA5E0
</aside>

## get__packages

> Code samples

```javascript

const headers = {
  'Accept':'application/json',
  'Authorization':'API_KEY'
};

fetch('https://tw16nt2svf.execute-api.eu-south-1.amazonaws.com/{basePath}/packages',
{
  method: 'GET',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`GET /packages`

<h3 id="get__packages-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|skuId|query|string|false|none|
|limit|query|string|false|none|
|page|query|string|false|none|
|active|query|string|false|none|

> Example responses

> 200 Response

```json
{
  "total": 0,
  "data": [
    {
      "active": true,
      "expiresAt": "string",
      "poolIds": [
        "string"
      ],
      "skuName": "string",
      "createdAt": "string",
      "isFree": true,
      "collectionIds": [
        "string"
      ],
      "__v": 0,
      "name": "string",
      "_id": "string",
      "skuId": "string",
      "skuCode": "string",
      "updatedAt": "string"
    }
  ],
  "limit": 0,
  "page": 0
}
```

<h3 id="get__packages-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|200 response|[ListPackagesPayload](#schemalistpackagespayload)|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
AdminApiStackstgCognitoAuthorizerCognitoAuthorizerstg9DCFA5E0
</aside>

## post__packages

> Code samples

```javascript
const inputBody = '{
  "isFree": true,
  "collectionIds": [
    "string"
  ],
  "name": "string",
  "active": true,
  "skuId": "string",
  "expiresAt": "string",
  "poolIds": [
    "string"
  ]
}';
const headers = {
  'Content-Type':'application/json',
  'Accept':'application/json',
  'Authorization':'API_KEY'
};

fetch('https://tw16nt2svf.execute-api.eu-south-1.amazonaws.com/{basePath}/packages',
{
  method: 'POST',
  body: inputBody,
  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`POST /packages`

> Body parameter

```json
{
  "isFree": true,
  "collectionIds": [
    "string"
  ],
  "name": "string",
  "active": true,
  "skuId": "string",
  "expiresAt": "string",
  "poolIds": [
    "string"
  ]
}
```

<h3 id="post__packages-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|body|body|[NewPackageModel](#schemanewpackagemodel)|true|none|

> Example responses

> 201 Response

```json
{
  "active": true,
  "expiresAt": "string",
  "poolIds": [
    "string"
  ],
  "skuName": "string",
  "createdAt": "string",
  "isFree": true,
  "collectionIds": [
    "string"
  ],
  "__v": 0,
  "name": "string",
  "_id": "string",
  "skuId": "string",
  "skuCode": "string",
  "updatedAt": "string"
}
```

<h3 id="post__packages-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|201|[Created](https://tools.ietf.org/html/rfc7231#section-6.3.2)|201 response|[PackagePayload](#schemapackagepayload)|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
AdminApiStackstgCognitoAuthorizerCognitoAuthorizerstg9DCFA5E0
</aside>

## options__packages

> Code samples

```javascript

const headers = {
  'Accept':'application/json'
};

fetch('https://tw16nt2svf.execute-api.eu-south-1.amazonaws.com/{basePath}/packages',
{
  method: 'OPTIONS',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`OPTIONS /packages`

> Example responses

> 200 Response

```json
{}
```

<h3 id="options__packages-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|200 response|[Empty](#schemaempty)|

### Response Headers

|Status|Header|Type|Format|Description|
|---|---|---|---|---|
|200|Access-Control-Allow-Origin|string||none|
|200|Access-Control-Allow-Methods|string||none|
|200|Access-Control-Allow-Credentials|string||none|
|200|Access-Control-Allow-Headers|string||none|

<aside class="success">
This operation does not require authentication
</aside>

## get__tests_{testId}

> Code samples

```javascript

const headers = {
  'Accept':'application/json',
  'Authorization':'API_KEY'
};

fetch('https://tw16nt2svf.execute-api.eu-south-1.amazonaws.com/{basePath}/tests/{testId}',
{
  method: 'GET',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`GET /tests/{testId}`

<h3 id="get__tests_{testid}-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|testId|path|string|true|none|

> Example responses

> 200 Response

```json
{
  "syllabus": [
    {
      "baseTopic": "string",
      "baseSubtopic": "string",
      "displayTopic": "string",
      "displaySubtopic": "string",
      "baseSubject": "string",
      "displaySubject": "string"
    }
  ],
  "createdAt": "string",
  "brands": [
    {
      "name": "string",
      "id": "string"
    }
  ],
  "year": 0,
  "__v": 0,
  "name": "string",
  "_id": "string",
  "defaultScores": {
    "correct": 0,
    "empty": 0,
    "wrong": 0
  },
  "tags": [
    "string"
  ],
  "updatedAt": "string"
}
```

<h3 id="get__tests_{testid}-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|200 response|[AdminTestPayload](#schemaadmintestpayload)|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
AdminApiStackstgCognitoAuthorizerCognitoAuthorizerstg9DCFA5E0
</aside>

## put__tests_{testId}

> Code samples

```javascript
const inputBody = '{
  "syllabus": [
    {
      "baseTopic": "string",
      "baseSubtopic": "string",
      "displayTopic": "string",
      "displaySubtopic": "string",
      "baseSubject": "string",
      "displaySubject": "string"
    }
  ],
  "brands": [
    {
      "name": "string",
      "id": "string"
    }
  ],
  "year": 0,
  "name": "string",
  "defaultScores": {
    "correct": 0,
    "empty": 0,
    "wrong": 0
  }
}';
const headers = {
  'Content-Type':'application/json',
  'Accept':'application/json',
  'Authorization':'API_KEY'
};

fetch('https://tw16nt2svf.execute-api.eu-south-1.amazonaws.com/{basePath}/tests/{testId}',
{
  method: 'PUT',
  body: inputBody,
  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`PUT /tests/{testId}`

> Body parameter

```json
{
  "syllabus": [
    {
      "baseTopic": "string",
      "baseSubtopic": "string",
      "displayTopic": "string",
      "displaySubtopic": "string",
      "baseSubject": "string",
      "displaySubject": "string"
    }
  ],
  "brands": [
    {
      "name": "string",
      "id": "string"
    }
  ],
  "year": 0,
  "name": "string",
  "defaultScores": {
    "correct": 0,
    "empty": 0,
    "wrong": 0
  }
}
```

<h3 id="put__tests_{testid}-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|testId|path|string|true|none|
|body|body|[AdminEditTestModel](#schemaadminedittestmodel)|true|none|

> Example responses

> 200 Response

```json
{
  "syllabus": [
    {
      "baseTopic": "string",
      "baseSubtopic": "string",
      "displayTopic": "string",
      "displaySubtopic": "string",
      "baseSubject": "string",
      "displaySubject": "string"
    }
  ],
  "createdAt": "string",
  "brands": [
    {
      "name": "string",
      "id": "string"
    }
  ],
  "year": 0,
  "__v": 0,
  "name": "string",
  "_id": "string",
  "defaultScores": {
    "correct": 0,
    "empty": 0,
    "wrong": 0
  },
  "tags": [
    "string"
  ],
  "updatedAt": "string"
}
```

<h3 id="put__tests_{testid}-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|200 response|[AdminTestPayload](#schemaadmintestpayload)|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
AdminApiStackstgCognitoAuthorizerCognitoAuthorizerstg9DCFA5E0
</aside>

## delete__tests_{testId}

> Code samples

```javascript

const headers = {
  'Authorization':'API_KEY'
};

fetch('https://tw16nt2svf.execute-api.eu-south-1.amazonaws.com/{basePath}/tests/{testId}',
{
  method: 'DELETE',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`DELETE /tests/{testId}`

<h3 id="delete__tests_{testid}-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|testId|path|string|true|none|

> Example responses

<h3 id="delete__tests_{testid}-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|204|[No Content](https://tools.ietf.org/html/rfc7231#section-6.3.5)|204 response|None|

<h3 id="delete__tests_{testid}-responseschema">Response Schema</h3>

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
AdminApiStackstgCognitoAuthorizerCognitoAuthorizerstg9DCFA5E0
</aside>

## options__tests_{testId}

> Code samples

```javascript

const headers = {
  'Accept':'application/json'
};

fetch('https://tw16nt2svf.execute-api.eu-south-1.amazonaws.com/{basePath}/tests/{testId}',
{
  method: 'OPTIONS',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`OPTIONS /tests/{testId}`

<h3 id="options__tests_{testid}-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|testId|path|string|true|none|

> Example responses

> 200 Response

```json
{}
```

<h3 id="options__tests_{testid}-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|200 response|[Empty](#schemaempty)|

### Response Headers

|Status|Header|Type|Format|Description|
|---|---|---|---|---|
|200|Access-Control-Allow-Origin|string||none|
|200|Access-Control-Allow-Methods|string||none|
|200|Access-Control-Allow-Credentials|string||none|
|200|Access-Control-Allow-Headers|string||none|

<aside class="success">
This operation does not require authentication
</aside>

## get__brands

> Code samples

```javascript

const headers = {
  'Accept':'application/json',
  'Authorization':'API_KEY'
};

fetch('https://tw16nt2svf.execute-api.eu-south-1.amazonaws.com/{basePath}/brands',
{
  method: 'GET',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`GET /brands`

<h3 id="get__brands-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|includes|query|string|false|none|

> Example responses

> 200 Response

```json
[
  {
    "createdAt": "string",
    "hostname": "string",
    "code": "string",
    "languages": [
      {
        "name": "string",
        "_id": "string",
        "lang": "string"
      }
    ],
    "__v": 0,
    "name": "string",
    "_id": "string",
    "socials": [
      {
        "icon": "string",
        "link": "string",
        "name": "string",
        "_id": "string"
      }
    ],
    "updatedAt": "string"
  }
]
```

<h3 id="get__brands-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|200 response|[BrandsPayload](#schemabrandspayload)|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
AdminApiStackstgCognitoAuthorizerCognitoAuthorizerstg9DCFA5E0
</aside>

## post__brands

> Code samples

```javascript
const inputBody = '{
  "hostname": "string",
  "code": "string",
  "languages": [
    {
      "name": "string",
      "lang": "string"
    }
  ],
  "name": "string",
  "socials": [
    {
      "icon": "string",
      "link": "string",
      "name": "string"
    }
  ]
}';
const headers = {
  'Content-Type':'application/json',
  'Accept':'application/json',
  'Authorization':'API_KEY'
};

fetch('https://tw16nt2svf.execute-api.eu-south-1.amazonaws.com/{basePath}/brands',
{
  method: 'POST',
  body: inputBody,
  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`POST /brands`

> Body parameter

```json
{
  "hostname": "string",
  "code": "string",
  "languages": [
    {
      "name": "string",
      "lang": "string"
    }
  ],
  "name": "string",
  "socials": [
    {
      "icon": "string",
      "link": "string",
      "name": "string"
    }
  ]
}
```

<h3 id="post__brands-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|body|body|[NewBrandModel](#schemanewbrandmodel)|true|none|

> Example responses

> 201 Response

```json
{
  "createdAt": "string",
  "hostname": "string",
  "code": "string",
  "languages": [
    {
      "name": "string",
      "_id": "string",
      "lang": "string"
    }
  ],
  "__v": 0,
  "name": "string",
  "_id": "string",
  "socials": [
    {
      "icon": "string",
      "link": "string",
      "name": "string",
      "_id": "string"
    }
  ],
  "updatedAt": "string"
}
```

<h3 id="post__brands-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|201|[Created](https://tools.ietf.org/html/rfc7231#section-6.3.2)|201 response|[BrandPayload](#schemabrandpayload)|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
AdminApiStackstgCognitoAuthorizerCognitoAuthorizerstg9DCFA5E0
</aside>

## options__brands

> Code samples

```javascript

const headers = {
  'Accept':'application/json'
};

fetch('https://tw16nt2svf.execute-api.eu-south-1.amazonaws.com/{basePath}/brands',
{
  method: 'OPTIONS',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`OPTIONS /brands`

> Example responses

> 200 Response

```json
{}
```

<h3 id="options__brands-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|200 response|[Empty](#schemaempty)|

### Response Headers

|Status|Header|Type|Format|Description|
|---|---|---|---|---|
|200|Access-Control-Allow-Origin|string||none|
|200|Access-Control-Allow-Methods|string||none|
|200|Access-Control-Allow-Credentials|string||none|
|200|Access-Control-Allow-Headers|string||none|

<aside class="success">
This operation does not require authentication
</aside>

## options__pools_{poolId}_status

> Code samples

```javascript

const headers = {
  'Accept':'application/json'
};

fetch('https://tw16nt2svf.execute-api.eu-south-1.amazonaws.com/{basePath}/pools/{poolId}/status',
{
  method: 'OPTIONS',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`OPTIONS /pools/{poolId}/status`

<h3 id="options__pools_{poolid}_status-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|poolId|path|string|true|none|

> Example responses

> 200 Response

```json
{}
```

<h3 id="options__pools_{poolid}_status-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|200 response|[Empty](#schemaempty)|

### Response Headers

|Status|Header|Type|Format|Description|
|---|---|---|---|---|
|200|Access-Control-Allow-Origin|string||none|
|200|Access-Control-Allow-Methods|string||none|
|200|Access-Control-Allow-Credentials|string||none|
|200|Access-Control-Allow-Headers|string||none|

<aside class="success">
This operation does not require authentication
</aside>

## patch__pools_{poolId}_status

> Code samples

```javascript
const inputBody = '{
  "status": "active"
}';
const headers = {
  'Content-Type':'application/json',
  'Accept':'application/json',
  'Authorization':'API_KEY'
};

fetch('https://tw16nt2svf.execute-api.eu-south-1.amazonaws.com/{basePath}/pools/{poolId}/status',
{
  method: 'PATCH',
  body: inputBody,
  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`PATCH /pools/{poolId}/status`

> Body parameter

```json
{
  "status": "active"
}
```

<h3 id="patch__pools_{poolid}_status-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|poolId|path|string|true|none|
|body|body|[UpdatePoolStatusModel](#schemaupdatepoolstatusmodel)|true|none|

> Example responses

> 200 Response

```json
{
  "totalQuestions": 0,
  "createdAt": "string",
  "questionCountBySubject": [
    {
      "count": 0,
      "subjectId": "string",
      "subjectName": "string"
    }
  ],
  "brands": [
    "string"
  ],
  "questionCountByTopic": [
    {
      "topicId": "string",
      "count": 0,
      "topicName": "string"
    }
  ],
  "name": "string",
  "description": "string",
  "attributes": [
    "string"
  ],
  "_id": "string",
  "status": "active",
  "updatedAt": "string"
}
```

<h3 id="patch__pools_{poolid}_status-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|200 response|[PoolPayload](#schemapoolpayload)|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
AdminApiStackstgCognitoAuthorizerCognitoAuthorizerstg9DCFA5E0
</aside>

## get__syllabi

> Code samples

```javascript

const headers = {
  'Accept':'application/json',
  'Authorization':'API_KEY'
};

fetch('https://tw16nt2svf.execute-api.eu-south-1.amazonaws.com/{basePath}/syllabi',
{
  method: 'GET',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`GET /syllabi`

<h3 id="get__syllabi-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|page|query|string|false|none|
|brand_id|query|string|false|none|
|search|query|string|false|none|
|per_page|query|string|false|none|

> Example responses

> 200 Response

```json
{
  "total": 0,
  "syllabi": [
    {
      "createdAt": "string",
      "mapping": [
        {
          "displayTopic": "string",
          "displaySubtopic": "string",
          "baseTopicId": "string",
          "displaySubject": "string",
          "baseSubtopicId": "string",
          "baseSubjectId": "string"
        }
      ],
      "brandId": "string",
      "__v": 0,
      "testYear": 0,
      "_id": "string",
      "testName": "string",
      "updatedAt": "string"
    }
  ]
}
```

<h3 id="get__syllabi-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|200 response|[SyllabiPayload](#schemasyllabipayload)|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
AdminApiStackstgCognitoAuthorizerCognitoAuthorizerstg9DCFA5E0
</aside>

## post__syllabi

> Code samples

```javascript
const inputBody = '{
  "mapping": [
    {
      "displayTopic": "string",
      "displaySubtopic": "string",
      "baseTopicId": "string",
      "displaySubject": "string",
      "baseSubtopicId": "string",
      "baseSubjectId": "string"
    }
  ],
  "brandId": "string",
  "testYear": 0,
  "testName": "string"
}';
const headers = {
  'Content-Type':'application/json',
  'Accept':'application/json',
  'Authorization':'API_KEY'
};

fetch('https://tw16nt2svf.execute-api.eu-south-1.amazonaws.com/{basePath}/syllabi',
{
  method: 'POST',
  body: inputBody,
  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`POST /syllabi`

> Body parameter

```json
{
  "mapping": [
    {
      "displayTopic": "string",
      "displaySubtopic": "string",
      "baseTopicId": "string",
      "displaySubject": "string",
      "baseSubtopicId": "string",
      "baseSubjectId": "string"
    }
  ],
  "brandId": "string",
  "testYear": 0,
  "testName": "string"
}
```

<h3 id="post__syllabi-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|body|body|[NewSyllabusModel](#schemanewsyllabusmodel)|true|none|

> Example responses

> 200 Response

```json
{
  "createdAt": "string",
  "mapping": [
    {
      "displayTopic": "string",
      "displaySubtopic": "string",
      "baseTopicId": "string",
      "displaySubject": "string",
      "baseSubtopicId": "string",
      "baseSubjectId": "string"
    }
  ],
  "brandId": "string",
  "__v": 0,
  "testYear": 0,
  "_id": "string",
  "testName": "string",
  "updatedAt": "string"
}
```

<h3 id="post__syllabi-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|200 response|[SyllabusPayload](#schemasyllabuspayload)|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
AdminApiStackstgCognitoAuthorizerCognitoAuthorizerstg9DCFA5E0
</aside>

## options__syllabi

> Code samples

```javascript

const headers = {
  'Accept':'application/json'
};

fetch('https://tw16nt2svf.execute-api.eu-south-1.amazonaws.com/{basePath}/syllabi',
{
  method: 'OPTIONS',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`OPTIONS /syllabi`

> Example responses

> 200 Response

```json
{}
```

<h3 id="options__syllabi-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|200 response|[Empty](#schemaempty)|

### Response Headers

|Status|Header|Type|Format|Description|
|---|---|---|---|---|
|200|Access-Control-Allow-Origin|string||none|
|200|Access-Control-Allow-Methods|string||none|
|200|Access-Control-Allow-Credentials|string||none|
|200|Access-Control-Allow-Headers|string||none|

<aside class="success">
This operation does not require authentication
</aside>

## get__users_{userId}_modules

> Code samples

```javascript

const headers = {
  'Accept':'application/json',
  'Authorization':'API_KEY'
};

fetch('https://tw16nt2svf.execute-api.eu-south-1.amazonaws.com/{basePath}/users/{userId}/modules',
{
  method: 'GET',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`GET /users/{userId}/modules`

<h3 id="get__users_{userid}_modules-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|userId|path|string|true|none|

> Example responses

> 200 Response

```json
[
  {
    "area": "string",
    "createdAt": "string",
    "documents": [
      "string"
    ],
    "brandId": "string",
    "__v": 0,
    "name": "string",
    "_id": "string",
    "sku": [
      "string"
    ],
    "simulations": [
      "string"
    ],
    "updatedAt": "string"
  }
]
```

<h3 id="get__users_{userid}_modules-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|200 response|[UserModulesPayload](#schemausermodulespayload)|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
AdminApiStackstgCognitoAuthorizerCognitoAuthorizerstg9DCFA5E0
</aside>

## options__users_{userId}_modules

> Code samples

```javascript

const headers = {
  'Accept':'application/json'
};

fetch('https://tw16nt2svf.execute-api.eu-south-1.amazonaws.com/{basePath}/users/{userId}/modules',
{
  method: 'OPTIONS',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`OPTIONS /users/{userId}/modules`

<h3 id="options__users_{userid}_modules-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|userId|path|string|true|none|

> Example responses

> 200 Response

```json
{}
```

<h3 id="options__users_{userid}_modules-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|200 response|[Empty](#schemaempty)|

### Response Headers

|Status|Header|Type|Format|Description|
|---|---|---|---|---|
|200|Access-Control-Allow-Origin|string||none|
|200|Access-Control-Allow-Methods|string||none|
|200|Access-Control-Allow-Credentials|string||none|
|200|Access-Control-Allow-Headers|string||none|

<aside class="success">
This operation does not require authentication
</aside>

## options__questions_{questionId}_archive

> Code samples

```javascript

const headers = {
  'Accept':'application/json'
};

fetch('https://tw16nt2svf.execute-api.eu-south-1.amazonaws.com/{basePath}/questions/{questionId}/archive',
{
  method: 'OPTIONS',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`OPTIONS /questions/{questionId}/archive`

<h3 id="options__questions_{questionid}_archive-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|questionId|path|string|true|none|

> Example responses

> 200 Response

```json
{}
```

<h3 id="options__questions_{questionid}_archive-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|200 response|[Empty](#schemaempty)|

### Response Headers

|Status|Header|Type|Format|Description|
|---|---|---|---|---|
|200|Access-Control-Allow-Origin|string||none|
|200|Access-Control-Allow-Methods|string||none|
|200|Access-Control-Allow-Credentials|string||none|
|200|Access-Control-Allow-Headers|string||none|

<aside class="success">
This operation does not require authentication
</aside>

## patch__questions_{questionId}_archive

> Code samples

```javascript
const inputBody = '{
  "archived": true
}';
const headers = {
  'Content-Type':'application/json',
  'Accept':'application/json',
  'Authorization':'API_KEY'
};

fetch('https://tw16nt2svf.execute-api.eu-south-1.amazonaws.com/{basePath}/questions/{questionId}/archive',
{
  method: 'PATCH',
  body: inputBody,
  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`PATCH /questions/{questionId}/archive`

> Body parameter

```json
{
  "archived": true
}
```

<h3 id="patch__questions_{questionid}_archive-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|questionId|path|string|true|none|
|body|body|[ArchiveQuestionModel](#schemaarchivequestionmodel)|true|none|

> Example responses

> 200 Response

```json
{
  "versionCount": 0,
  "subject": {
    "name": "string"
  },
  "language": "it",
  "type": "completion",
  "subjectId": "string",
  "questionText": "string",
  "revisorId": "string",
  "explanationImages": [
    "string"
  ],
  "archived": true,
  "createdAt": "string",
  "approved": true,
  "stats": {
    "correct": 0,
    "answersCount": [
      0
    ],
    "empty": 0,
    "wrong": 0
  },
  "__v": 0,
  "completionAnswers": [
    "string"
  ],
  "subtopic": {
    "name": "string"
  },
  "updatedAt": "string",
  "explanationText": "string",
  "revisor": {
    "email": "string"
  },
  "author": {
    "email": "string"
  },
  "authorId": "string",
  "tags": [
    "string"
  ],
  "difficulty": 0,
  "topicId": "string",
  "topic": {
    "name": "string"
  },
  "alternatives": [
    {
      "image": "string",
      "correct": true,
      "text": "string"
    }
  ],
  "subtopicId": "string",
  "_id": "string",
  "questionImages": [
    "string"
  ],
  "status": "draft"
}
```

<h3 id="patch__questions_{questionid}_archive-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|200 response|[QuestionPayload](#schemaquestionpayload)|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
AdminApiStackstgCognitoAuthorizerCognitoAuthorizerstg9DCFA5E0
</aside>

## get__users_{userId}

> Code samples

```javascript

const headers = {
  'Accept':'application/json',
  'Authorization':'API_KEY'
};

fetch('https://tw16nt2svf.execute-api.eu-south-1.amazonaws.com/{basePath}/users/{userId}',
{
  method: 'GET',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`GET /users/{userId}`

<h3 id="get__users_{userid}-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|userId|path|string|true|none|

> Example responses

> 200 Response

```json
{
  "createdAt": "string",
  "cognitoId": "string",
  "brands": [
    {
      "name": "string",
      "id": "string",
      "hasProfilation": true,
      "favoriteTest": "string"
    }
  ],
  "__v": 0,
  "_id": "string",
  "packages": [
    {
      "id": "string",
      "skuId": "string",
      "skuCode": "string"
    }
  ],
  "updatedAt": "string"
}
```

<h3 id="get__users_{userid}-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|200 response|[UserPayload](#schemauserpayload)|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
AdminApiStackstgCognitoAuthorizerCognitoAuthorizerstg9DCFA5E0
</aside>

## post__users_{userId}

> Code samples

```javascript
const inputBody = '{
  "cognitoId": "string",
  "givenOrders": [
    {
      "skus": [
        "string"
      ],
      "orderId": "string",
      "status": "Incomplete"
    }
  ],
  "stats": {
    "correct": 0,
    "subjectStats": [
      {
        "correct": 0,
        "subjectId": "string",
        "subjectName": "string",
        "wrong": 0,
        "empty": 0
      }
    ],
    "topicStats": [
      {
        "topicId": "string",
        "correct": 0,
        "topicName": "string",
        "wrong": 0,
        "empty": 0
      }
    ],
    "empty": 0,
    "wrong": 0
  },
  "orders": [
    {
      "skus": [
        "string"
      ],
      "orderId": "string",
      "status": "Incomplete"
    }
  ]
}';
const headers = {
  'Content-Type':'application/json',
  'Accept':'application/json',
  'Authorization':'API_KEY'
};

fetch('https://tw16nt2svf.execute-api.eu-south-1.amazonaws.com/{basePath}/users/{userId}',
{
  method: 'POST',
  body: inputBody,
  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`POST /users/{userId}`

> Body parameter

```json
{
  "cognitoId": "string",
  "givenOrders": [
    {
      "skus": [
        "string"
      ],
      "orderId": "string",
      "status": "Incomplete"
    }
  ],
  "stats": {
    "correct": 0,
    "subjectStats": [
      {
        "correct": 0,
        "subjectId": "string",
        "subjectName": "string",
        "wrong": 0,
        "empty": 0
      }
    ],
    "topicStats": [
      {
        "topicId": "string",
        "correct": 0,
        "topicName": "string",
        "wrong": 0,
        "empty": 0
      }
    ],
    "empty": 0,
    "wrong": 0
  },
  "orders": [
    {
      "skus": [
        "string"
      ],
      "orderId": "string",
      "status": "Incomplete"
    }
  ]
}
```

<h3 id="post__users_{userid}-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|userId|path|string|true|none|
|body|body|[UpdateUserModel](#schemaupdateusermodel)|true|none|

> Example responses

> 200 Response

```json
{
  "createdAt": "string",
  "cognitoId": "string",
  "brands": [
    {
      "name": "string",
      "id": "string",
      "hasProfilation": true,
      "favoriteTest": "string"
    }
  ],
  "__v": 0,
  "_id": "string",
  "packages": [
    {
      "id": "string",
      "skuId": "string",
      "skuCode": "string"
    }
  ],
  "updatedAt": "string"
}
```

<h3 id="post__users_{userid}-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|200 response|[UserPayload](#schemauserpayload)|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
AdminApiStackstgCognitoAuthorizerCognitoAuthorizerstg9DCFA5E0
</aside>

## delete__users_{userId}

> Code samples

```javascript

const headers = {
  'Accept':'application/json',
  'Authorization':'API_KEY'
};

fetch('https://tw16nt2svf.execute-api.eu-south-1.amazonaws.com/{basePath}/users/{userId}',
{
  method: 'DELETE',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`DELETE /users/{userId}`

<h3 id="delete__users_{userid}-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|userId|path|string|true|none|

> Example responses

> 200 Response

```json
{
  "createdAt": "string",
  "cognitoId": "string",
  "brands": [
    {
      "name": "string",
      "id": "string",
      "hasProfilation": true,
      "favoriteTest": "string"
    }
  ],
  "__v": 0,
  "_id": "string",
  "packages": [
    {
      "id": "string",
      "skuId": "string",
      "skuCode": "string"
    }
  ],
  "updatedAt": "string"
}
```

<h3 id="delete__users_{userid}-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|200 response|[UserPayload](#schemauserpayload)|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
AdminApiStackstgCognitoAuthorizerCognitoAuthorizerstg9DCFA5E0
</aside>

## options__users_{userId}

> Code samples

```javascript

const headers = {
  'Accept':'application/json'
};

fetch('https://tw16nt2svf.execute-api.eu-south-1.amazonaws.com/{basePath}/users/{userId}',
{
  method: 'OPTIONS',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`OPTIONS /users/{userId}`

<h3 id="options__users_{userid}-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|userId|path|string|true|none|

> Example responses

> 200 Response

```json
{}
```

<h3 id="options__users_{userid}-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|200 response|[Empty](#schemaempty)|

### Response Headers

|Status|Header|Type|Format|Description|
|---|---|---|---|---|
|200|Access-Control-Allow-Origin|string||none|
|200|Access-Control-Allow-Methods|string||none|
|200|Access-Control-Allow-Credentials|string||none|
|200|Access-Control-Allow-Headers|string||none|

<aside class="success">
This operation does not require authentication
</aside>

## get__questions_{questionId}_versions_{questionVersionId}

> Code samples

```javascript

const headers = {
  'Accept':'application/json',
  'Authorization':'API_KEY'
};

fetch('https://tw16nt2svf.execute-api.eu-south-1.amazonaws.com/{basePath}/questions/{questionId}/versions/{questionVersionId}',
{
  method: 'GET',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`GET /questions/{questionId}/versions/{questionVersionId}`

<h3 id="get__questions_{questionid}_versions_{questionversionid}-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|questionId|path|string|true|none|
|questionVersionId|path|string|true|none|

> Example responses

> 200 Response

```json
{
  "questionId": "string",
  "versionCounter": 0,
  "__v": 0,
  "_id": "string",
  "editMetadata": {
    "editor": {
      "id": "string",
      "email": "string",
      "username": "string"
    },
    "createdAt": "string",
    "changeReason": "string"
  },
  "snapshot": {
    "subject": {
      "name": "string"
    },
    "language": "it",
    "type": "completion",
    "subjectId": "string",
    "questionText": "string",
    "revisorId": "string",
    "explanationImages": [
      "string"
    ],
    "archived": true,
    "createdAt": "string",
    "approved": true,
    "stats": {
      "correct": 0,
      "answersCount": [
        0
      ],
      "empty": 0,
      "wrong": 0
    },
    "completionAnswers": [
      "string"
    ],
    "subtopic": {
      "name": "string"
    },
    "updatedAt": "string",
    "explanationText": "string",
    "revisor": {
      "email": "string"
    },
    "author": {
      "email": "string"
    },
    "authorId": "string",
    "tags": [
      "string"
    ],
    "difficulty": 0,
    "topicId": "string",
    "topic": {
      "name": "string"
    },
    "alternatives": [
      {
        "image": "string",
        "correct": true,
        "text": "string"
      }
    ],
    "subtopicId": "string",
    "questionImages": [
      "string"
    ],
    "status": "string"
  }
}
```

<h3 id="get__questions_{questionid}_versions_{questionversionid}-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|200 response|[QuestionVersionPayload](#schemaquestionversionpayload)|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
AdminApiStackstgCognitoAuthorizerCognitoAuthorizerstg9DCFA5E0
</aside>

## delete__questions_{questionId}_versions_{questionVersionId}

> Code samples

```javascript

const headers = {
  'Accept':'application/json',
  'Authorization':'API_KEY'
};

fetch('https://tw16nt2svf.execute-api.eu-south-1.amazonaws.com/{basePath}/questions/{questionId}/versions/{questionVersionId}',
{
  method: 'DELETE',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`DELETE /questions/{questionId}/versions/{questionVersionId}`

<h3 id="delete__questions_{questionid}_versions_{questionversionid}-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|questionId|path|string|true|none|
|questionVersionId|path|string|true|none|

> Example responses

> 200 Response

```json
{
  "questionId": "string",
  "versionCounter": 0,
  "__v": 0,
  "_id": "string",
  "editMetadata": {
    "editor": {
      "id": "string",
      "email": "string",
      "username": "string"
    },
    "createdAt": "string",
    "changeReason": "string"
  },
  "snapshot": {
    "subject": {
      "name": "string"
    },
    "language": "it",
    "type": "completion",
    "subjectId": "string",
    "questionText": "string",
    "revisorId": "string",
    "explanationImages": [
      "string"
    ],
    "archived": true,
    "createdAt": "string",
    "approved": true,
    "stats": {
      "correct": 0,
      "answersCount": [
        0
      ],
      "empty": 0,
      "wrong": 0
    },
    "completionAnswers": [
      "string"
    ],
    "subtopic": {
      "name": "string"
    },
    "updatedAt": "string",
    "explanationText": "string",
    "revisor": {
      "email": "string"
    },
    "author": {
      "email": "string"
    },
    "authorId": "string",
    "tags": [
      "string"
    ],
    "difficulty": 0,
    "topicId": "string",
    "topic": {
      "name": "string"
    },
    "alternatives": [
      {
        "image": "string",
        "correct": true,
        "text": "string"
      }
    ],
    "subtopicId": "string",
    "questionImages": [
      "string"
    ],
    "status": "string"
  }
}
```

<h3 id="delete__questions_{questionid}_versions_{questionversionid}-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|200 response|[QuestionVersionPayload](#schemaquestionversionpayload)|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
AdminApiStackstgCognitoAuthorizerCognitoAuthorizerstg9DCFA5E0
</aside>

## options__questions_{questionId}_versions_{questionVersionId}

> Code samples

```javascript

const headers = {
  'Accept':'application/json'
};

fetch('https://tw16nt2svf.execute-api.eu-south-1.amazonaws.com/{basePath}/questions/{questionId}/versions/{questionVersionId}',
{
  method: 'OPTIONS',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`OPTIONS /questions/{questionId}/versions/{questionVersionId}`

<h3 id="options__questions_{questionid}_versions_{questionversionid}-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|questionId|path|string|true|none|
|questionVersionId|path|string|true|none|

> Example responses

> 200 Response

```json
{}
```

<h3 id="options__questions_{questionid}_versions_{questionversionid}-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|200 response|[Empty](#schemaempty)|

### Response Headers

|Status|Header|Type|Format|Description|
|---|---|---|---|---|
|200|Access-Control-Allow-Origin|string||none|
|200|Access-Control-Allow-Methods|string||none|
|200|Access-Control-Allow-Credentials|string||none|
|200|Access-Control-Allow-Headers|string||none|

<aside class="success">
This operation does not require authentication
</aside>

## delete__pools_{poolId}_questions_{questionId}

> Code samples

```javascript

const headers = {
  'Authorization':'API_KEY'
};

fetch('https://tw16nt2svf.execute-api.eu-south-1.amazonaws.com/{basePath}/pools/{poolId}/questions/{questionId}',
{
  method: 'DELETE',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`DELETE /pools/{poolId}/questions/{questionId}`

<h3 id="delete__pools_{poolid}_questions_{questionid}-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|poolId|path|string|true|none|
|questionId|path|string|true|none|

> Example responses

<h3 id="delete__pools_{poolid}_questions_{questionid}-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|204|[No Content](https://tools.ietf.org/html/rfc7231#section-6.3.5)|204 response|None|

<h3 id="delete__pools_{poolid}_questions_{questionid}-responseschema">Response Schema</h3>

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
AdminApiStackstgCognitoAuthorizerCognitoAuthorizerstg9DCFA5E0
</aside>

## options__pools_{poolId}_questions_{questionId}

> Code samples

```javascript

const headers = {
  'Accept':'application/json'
};

fetch('https://tw16nt2svf.execute-api.eu-south-1.amazonaws.com/{basePath}/pools/{poolId}/questions/{questionId}',
{
  method: 'OPTIONS',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`OPTIONS /pools/{poolId}/questions/{questionId}`

<h3 id="options__pools_{poolid}_questions_{questionid}-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|poolId|path|string|true|none|
|questionId|path|string|true|none|

> Example responses

> 200 Response

```json
{}
```

<h3 id="options__pools_{poolid}_questions_{questionid}-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|200 response|[Empty](#schemaempty)|

### Response Headers

|Status|Header|Type|Format|Description|
|---|---|---|---|---|
|200|Access-Control-Allow-Origin|string||none|
|200|Access-Control-Allow-Methods|string||none|
|200|Access-Control-Allow-Credentials|string||none|
|200|Access-Control-Allow-Headers|string||none|

<aside class="success">
This operation does not require authentication
</aside>

## get__users

> Code samples

```javascript

const headers = {
  'Authorization':'API_KEY'
};

fetch('https://tw16nt2svf.execute-api.eu-south-1.amazonaws.com/{basePath}/users',
{
  method: 'GET',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`GET /users`

<h3 id="get__users-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|sort_by|query|string|false|none|
|admin|query|string|false|none|
|sort_direction|query|string|false|none|
|order_number|query|string|false|none|
|ids|query|string|false|none|
|page|query|string|false|none|
|search|query|string|false|none|
|role_ids|query|string|false|none|
|per_page|query|string|false|none|
|order_sku|query|string|false|none|

> Example responses

<h3 id="get__users-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|200 response|None|

<h3 id="get__users-responseschema">Response Schema</h3>

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
AdminApiStackstgCognitoAuthorizerCognitoAuthorizerstg9DCFA5E0
</aside>

## options__users

> Code samples

```javascript

const headers = {
  'Accept':'application/json'
};

fetch('https://tw16nt2svf.execute-api.eu-south-1.amazonaws.com/{basePath}/users',
{
  method: 'OPTIONS',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`OPTIONS /users`

> Example responses

> 200 Response

```json
{}
```

<h3 id="options__users-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|200 response|[Empty](#schemaempty)|

### Response Headers

|Status|Header|Type|Format|Description|
|---|---|---|---|---|
|200|Access-Control-Allow-Origin|string||none|
|200|Access-Control-Allow-Methods|string||none|
|200|Access-Control-Allow-Credentials|string||none|
|200|Access-Control-Allow-Headers|string||none|

<aside class="success">
This operation does not require authentication
</aside>

## get__packages_{packageId}

> Code samples

```javascript

const headers = {
  'Accept':'application/json',
  'Authorization':'API_KEY'
};

fetch('https://tw16nt2svf.execute-api.eu-south-1.amazonaws.com/{basePath}/packages/{packageId}',
{
  method: 'GET',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`GET /packages/{packageId}`

<h3 id="get__packages_{packageid}-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|packageId|path|string|true|none|

> Example responses

> 200 Response

```json
{
  "active": true,
  "expiresAt": "string",
  "poolIds": [
    "string"
  ],
  "skuName": "string",
  "createdAt": "string",
  "isFree": true,
  "collectionIds": [
    "string"
  ],
  "__v": 0,
  "name": "string",
  "_id": "string",
  "skuId": "string",
  "skuCode": "string",
  "updatedAt": "string"
}
```

<h3 id="get__packages_{packageid}-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|200 response|[PackagePayload](#schemapackagepayload)|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
AdminApiStackstgCognitoAuthorizerCognitoAuthorizerstg9DCFA5E0
</aside>

## put__packages_{packageId}

> Code samples

```javascript
const inputBody = '{
  "collectionIds": [
    "string"
  ],
  "name": "string",
  "expiresAt": "string",
  "poolIds": [
    "string"
  ]
}';
const headers = {
  'Content-Type':'application/json',
  'Accept':'application/json',
  'Authorization':'API_KEY'
};

fetch('https://tw16nt2svf.execute-api.eu-south-1.amazonaws.com/{basePath}/packages/{packageId}',
{
  method: 'PUT',
  body: inputBody,
  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`PUT /packages/{packageId}`

> Body parameter

```json
{
  "collectionIds": [
    "string"
  ],
  "name": "string",
  "expiresAt": "string",
  "poolIds": [
    "string"
  ]
}
```

<h3 id="put__packages_{packageid}-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|packageId|path|string|true|none|
|body|body|[EditPackageModel](#schemaeditpackagemodel)|true|none|

> Example responses

> 200 Response

```json
{
  "active": true,
  "expiresAt": "string",
  "poolIds": [
    "string"
  ],
  "skuName": "string",
  "createdAt": "string",
  "isFree": true,
  "collectionIds": [
    "string"
  ],
  "__v": 0,
  "name": "string",
  "_id": "string",
  "skuId": "string",
  "skuCode": "string",
  "updatedAt": "string"
}
```

<h3 id="put__packages_{packageid}-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|200 response|[PackagePayload](#schemapackagepayload)|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
AdminApiStackstgCognitoAuthorizerCognitoAuthorizerstg9DCFA5E0
</aside>

## delete__packages_{packageId}

> Code samples

```javascript

const headers = {
  'Authorization':'API_KEY'
};

fetch('https://tw16nt2svf.execute-api.eu-south-1.amazonaws.com/{basePath}/packages/{packageId}',
{
  method: 'DELETE',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`DELETE /packages/{packageId}`

<h3 id="delete__packages_{packageid}-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|packageId|path|string|true|none|

> Example responses

<h3 id="delete__packages_{packageid}-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|204|[No Content](https://tools.ietf.org/html/rfc7231#section-6.3.5)|204 response|None|

<h3 id="delete__packages_{packageid}-responseschema">Response Schema</h3>

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
AdminApiStackstgCognitoAuthorizerCognitoAuthorizerstg9DCFA5E0
</aside>

## options__packages_{packageId}

> Code samples

```javascript

const headers = {
  'Accept':'application/json'
};

fetch('https://tw16nt2svf.execute-api.eu-south-1.amazonaws.com/{basePath}/packages/{packageId}',
{
  method: 'OPTIONS',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`OPTIONS /packages/{packageId}`

<h3 id="options__packages_{packageid}-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|packageId|path|string|true|none|

> Example responses

> 200 Response

```json
{}
```

<h3 id="options__packages_{packageid}-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|200 response|[Empty](#schemaempty)|

### Response Headers

|Status|Header|Type|Format|Description|
|---|---|---|---|---|
|200|Access-Control-Allow-Origin|string||none|
|200|Access-Control-Allow-Methods|string||none|
|200|Access-Control-Allow-Credentials|string||none|
|200|Access-Control-Allow-Headers|string||none|

<aside class="success">
This operation does not require authentication
</aside>

## get__skus

> Code samples

```javascript

const headers = {
  'Accept':'application/json',
  'Authorization':'API_KEY'
};

fetch('https://tw16nt2svf.execute-api.eu-south-1.amazonaws.com/{basePath}/skus',
{
  method: 'GET',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`GET /skus`

<h3 id="get__skus-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|limit|query|string|false|none|
|page|query|string|false|none|

> Example responses

> 200 Response

```json
{
  "total": 0,
  "data": [
    {
      "createdAt": "string",
      "code": "string",
      "brands": [
        {
          "name": "string",
          "id": "string"
        }
      ],
      "__v": 0,
      "name": "string",
      "_id": "string",
      "url": "string",
      "updatedAt": "string"
    }
  ],
  "limit": 0,
  "page": 0
}
```

<h3 id="get__skus-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|200 response|[ListSkusPayload](#schemalistskuspayload)|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
AdminApiStackstgCognitoAuthorizerCognitoAuthorizerstg9DCFA5E0
</aside>

## post__skus

> Code samples

```javascript
const inputBody = '{
  "code": "string",
  "brands": [
    {
      "name": "string",
      "id": "string"
    }
  ],
  "name": "string",
  "url": "string"
}';
const headers = {
  'Content-Type':'application/json',
  'Accept':'application/json',
  'Authorization':'API_KEY'
};

fetch('https://tw16nt2svf.execute-api.eu-south-1.amazonaws.com/{basePath}/skus',
{
  method: 'POST',
  body: inputBody,
  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`POST /skus`

> Body parameter

```json
{
  "code": "string",
  "brands": [
    {
      "name": "string",
      "id": "string"
    }
  ],
  "name": "string",
  "url": "string"
}
```

<h3 id="post__skus-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|body|body|[NewSkuModel](#schemanewskumodel)|true|none|

> Example responses

> 201 Response

```json
{
  "createdAt": "string",
  "code": "string",
  "brands": [
    {
      "name": "string",
      "id": "string"
    }
  ],
  "__v": 0,
  "name": "string",
  "_id": "string",
  "url": "string",
  "updatedAt": "string"
}
```

<h3 id="post__skus-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|201|[Created](https://tools.ietf.org/html/rfc7231#section-6.3.2)|201 response|[SkuPayload](#schemaskupayload)|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
AdminApiStackstgCognitoAuthorizerCognitoAuthorizerstg9DCFA5E0
</aside>

## options__skus

> Code samples

```javascript

const headers = {
  'Accept':'application/json'
};

fetch('https://tw16nt2svf.execute-api.eu-south-1.amazonaws.com/{basePath}/skus',
{
  method: 'OPTIONS',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`OPTIONS /skus`

> Example responses

> 200 Response

```json
{}
```

<h3 id="options__skus-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|200 response|[Empty](#schemaempty)|

### Response Headers

|Status|Header|Type|Format|Description|
|---|---|---|---|---|
|200|Access-Control-Allow-Origin|string||none|
|200|Access-Control-Allow-Methods|string||none|
|200|Access-Control-Allow-Credentials|string||none|
|200|Access-Control-Allow-Headers|string||none|

<aside class="success">
This operation does not require authentication
</aside>

## get__questions_{questionId}_versions

> Code samples

```javascript

const headers = {
  'Accept':'application/json',
  'Authorization':'API_KEY'
};

fetch('https://tw16nt2svf.execute-api.eu-south-1.amazonaws.com/{basePath}/questions/{questionId}/versions',
{
  method: 'GET',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`GET /questions/{questionId}/versions`

<h3 id="get__questions_{questionid}_versions-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|questionId|path|string|true|none|

> Example responses

> 200 Response

```json
[
  {
    "questionId": "string",
    "versionCounter": 0,
    "__v": 0,
    "_id": "string",
    "editMetadata": {
      "editor": {
        "id": "string",
        "email": "string",
        "username": "string"
      },
      "createdAt": "string",
      "changeReason": "string"
    },
    "snapshot": {
      "subject": {
        "name": "string"
      },
      "language": "it",
      "type": "completion",
      "subjectId": "string",
      "questionText": "string",
      "revisorId": "string",
      "explanationImages": [
        "string"
      ],
      "archived": true,
      "createdAt": "string",
      "approved": true,
      "stats": {
        "correct": 0,
        "answersCount": [
          0
        ],
        "empty": 0,
        "wrong": 0
      },
      "completionAnswers": [
        "string"
      ],
      "subtopic": {
        "name": "string"
      },
      "updatedAt": "string",
      "explanationText": "string",
      "revisor": {
        "email": "string"
      },
      "author": {
        "email": "string"
      },
      "authorId": "string",
      "tags": [
        "string"
      ],
      "difficulty": 0,
      "topicId": "string",
      "topic": {
        "name": "string"
      },
      "alternatives": [
        {
          "image": "string",
          "correct": true,
          "text": "string"
        }
      ],
      "subtopicId": "string",
      "questionImages": [
        "string"
      ],
      "status": "string"
    }
  }
]
```

<h3 id="get__questions_{questionid}_versions-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|200 response|[QuestionVersionsPayload](#schemaquestionversionspayload)|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
AdminApiStackstgCognitoAuthorizerCognitoAuthorizerstg9DCFA5E0
</aside>

## post__questions_{questionId}_versions

> Code samples

```javascript
const inputBody = '{
  "explanationText": "string",
  "changeReason": "string",
  "alternatives": [
    {
      "image": "string",
      "correct": true,
      "text": "string"
    }
  ],
  "questionImages": [
    "string"
  ],
  "questionText": "string",
  "explanationImages": [
    "string"
  ]
}';
const headers = {
  'Content-Type':'application/json',
  'Accept':'application/json',
  'Authorization':'API_KEY'
};

fetch('https://tw16nt2svf.execute-api.eu-south-1.amazonaws.com/{basePath}/questions/{questionId}/versions',
{
  method: 'POST',
  body: inputBody,
  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`POST /questions/{questionId}/versions`

> Body parameter

```json
{
  "explanationText": "string",
  "changeReason": "string",
  "alternatives": [
    {
      "image": "string",
      "correct": true,
      "text": "string"
    }
  ],
  "questionImages": [
    "string"
  ],
  "questionText": "string",
  "explanationImages": [
    "string"
  ]
}
```

<h3 id="post__questions_{questionid}_versions-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|questionId|path|string|true|none|
|body|body|[NewQuestionVersionModel](#schemanewquestionversionmodel)|true|none|

> Example responses

> 200 Response

```json
{
  "questionId": "string",
  "versionCounter": 0,
  "__v": 0,
  "_id": "string",
  "editMetadata": {
    "editor": {
      "id": "string",
      "email": "string",
      "username": "string"
    },
    "createdAt": "string",
    "changeReason": "string"
  },
  "snapshot": {
    "subject": {
      "name": "string"
    },
    "language": "it",
    "type": "completion",
    "subjectId": "string",
    "questionText": "string",
    "revisorId": "string",
    "explanationImages": [
      "string"
    ],
    "archived": true,
    "createdAt": "string",
    "approved": true,
    "stats": {
      "correct": 0,
      "answersCount": [
        0
      ],
      "empty": 0,
      "wrong": 0
    },
    "completionAnswers": [
      "string"
    ],
    "subtopic": {
      "name": "string"
    },
    "updatedAt": "string",
    "explanationText": "string",
    "revisor": {
      "email": "string"
    },
    "author": {
      "email": "string"
    },
    "authorId": "string",
    "tags": [
      "string"
    ],
    "difficulty": 0,
    "topicId": "string",
    "topic": {
      "name": "string"
    },
    "alternatives": [
      {
        "image": "string",
        "correct": true,
        "text": "string"
      }
    ],
    "subtopicId": "string",
    "questionImages": [
      "string"
    ],
    "status": "string"
  }
}
```

<h3 id="post__questions_{questionid}_versions-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|200 response|[QuestionVersionPayload](#schemaquestionversionpayload)|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
AdminApiStackstgCognitoAuthorizerCognitoAuthorizerstg9DCFA5E0
</aside>

## options__questions_{questionId}_versions

> Code samples

```javascript

const headers = {
  'Accept':'application/json'
};

fetch('https://tw16nt2svf.execute-api.eu-south-1.amazonaws.com/{basePath}/questions/{questionId}/versions',
{
  method: 'OPTIONS',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`OPTIONS /questions/{questionId}/versions`

<h3 id="options__questions_{questionid}_versions-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|questionId|path|string|true|none|

> Example responses

> 200 Response

```json
{}
```

<h3 id="options__questions_{questionid}_versions-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|200 response|[Empty](#schemaempty)|

### Response Headers

|Status|Header|Type|Format|Description|
|---|---|---|---|---|
|200|Access-Control-Allow-Origin|string||none|
|200|Access-Control-Allow-Methods|string||none|
|200|Access-Control-Allow-Credentials|string||none|
|200|Access-Control-Allow-Headers|string||none|

<aside class="success">
This operation does not require authentication
</aside>

## get__collections_{collectionId}

> Code samples

```javascript

const headers = {
  'Accept':'application/json',
  'Authorization':'API_KEY'
};

fetch('https://tw16nt2svf.execute-api.eu-south-1.amazonaws.com/{basePath}/collections/{collectionId}',
{
  method: 'GET',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`GET /collections/{collectionId}`

<h3 id="get__collections_{collectionid}-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|collectionId|path|string|true|none|

> Example responses

> 200 Response

```json
{
  "brands": [
    {
      "name": "string"
    }
  ],
  "timed": true,
  "type": "exercise",
  "authorId": "string",
  "brandIds": [
    "string"
  ],
  "sections": [
    {
      "maxAttempts": 0,
      "questions": [
        {
          "questionId": "string",
          "points": {
            "correctPoint": 0,
            "wrongPoint": 0,
            "emptyPoint": 0
          }
        }
      ],
      "rules": {
        "duration": 0,
        "pausable": true,
        "extraTime": [
          0
        ]
      },
      "_id": "string"
    }
  ],
  "tags": [
    "string"
  ],
  "archived": true,
  "createdAt": "string",
  "name": "string",
  "testId": "string",
  "attributes": [
    "string"
  ],
  "_id": "string",
  "status": "draft",
  "updatedAt": "string"
}
```

<h3 id="get__collections_{collectionid}-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|200 response|[AdminCollectionPayload](#schemaadmincollectionpayload)|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
AdminApiStackstgCognitoAuthorizerCognitoAuthorizerstg9DCFA5E0
</aside>

## put__collections_{collectionId}

> Code samples

```javascript
const inputBody = '{
  "timed": true,
  "name": "string",
  "tags": [
    "string"
  ]
}';
const headers = {
  'Content-Type':'application/json',
  'Accept':'application/json',
  'Authorization':'API_KEY'
};

fetch('https://tw16nt2svf.execute-api.eu-south-1.amazonaws.com/{basePath}/collections/{collectionId}',
{
  method: 'PUT',
  body: inputBody,
  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`PUT /collections/{collectionId}`

> Body parameter

```json
{
  "timed": true,
  "name": "string",
  "tags": [
    "string"
  ]
}
```

<h3 id="put__collections_{collectionid}-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|collectionId|path|string|true|none|
|body|body|[AdminEditCollectionMetadataModel](#schemaadmineditcollectionmetadatamodel)|true|none|

> Example responses

> 200 Response

```json
{
  "brands": [
    {
      "name": "string"
    }
  ],
  "timed": true,
  "type": "exercise",
  "authorId": "string",
  "brandIds": [
    "string"
  ],
  "sections": [
    {
      "maxAttempts": 0,
      "questions": [
        {
          "questionId": "string",
          "points": {
            "correctPoint": 0,
            "wrongPoint": 0,
            "emptyPoint": 0
          }
        }
      ],
      "rules": {
        "duration": 0,
        "pausable": true,
        "extraTime": [
          0
        ]
      },
      "_id": "string"
    }
  ],
  "tags": [
    "string"
  ],
  "archived": true,
  "createdAt": "string",
  "name": "string",
  "testId": "string",
  "attributes": [
    "string"
  ],
  "_id": "string",
  "status": "draft",
  "updatedAt": "string"
}
```

<h3 id="put__collections_{collectionid}-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|200 response|[AdminCollectionPayload](#schemaadmincollectionpayload)|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
AdminApiStackstgCognitoAuthorizerCognitoAuthorizerstg9DCFA5E0
</aside>

## options__collections_{collectionId}

> Code samples

```javascript

const headers = {
  'Accept':'application/json'
};

fetch('https://tw16nt2svf.execute-api.eu-south-1.amazonaws.com/{basePath}/collections/{collectionId}',
{
  method: 'OPTIONS',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`OPTIONS /collections/{collectionId}`

<h3 id="options__collections_{collectionid}-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|collectionId|path|string|true|none|

> Example responses

> 200 Response

```json
{}
```

<h3 id="options__collections_{collectionid}-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|200 response|[Empty](#schemaempty)|

### Response Headers

|Status|Header|Type|Format|Description|
|---|---|---|---|---|
|200|Access-Control-Allow-Origin|string||none|
|200|Access-Control-Allow-Methods|string||none|
|200|Access-Control-Allow-Credentials|string||none|
|200|Access-Control-Allow-Headers|string||none|

<aside class="success">
This operation does not require authentication
</aside>

## get__brands_{brandId}

> Code samples

```javascript

const headers = {
  'Accept':'application/json',
  'Authorization':'API_KEY'
};

fetch('https://tw16nt2svf.execute-api.eu-south-1.amazonaws.com/{basePath}/brands/{brandId}',
{
  method: 'GET',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`GET /brands/{brandId}`

<h3 id="get__brands_{brandid}-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|includes|query|string|false|none|
|brandId|path|string|true|none|

> Example responses

> 200 Response

```json
{
  "createdAt": "string",
  "hostname": "string",
  "code": "string",
  "languages": [
    {
      "name": "string",
      "_id": "string",
      "lang": "string"
    }
  ],
  "__v": 0,
  "name": "string",
  "_id": "string",
  "socials": [
    {
      "icon": "string",
      "link": "string",
      "name": "string",
      "_id": "string"
    }
  ],
  "updatedAt": "string"
}
```

<h3 id="get__brands_{brandid}-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|200 response|[BrandPayload](#schemabrandpayload)|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
AdminApiStackstgCognitoAuthorizerCognitoAuthorizerstg9DCFA5E0
</aside>

## put__brands_{brandId}

> Code samples

```javascript
const inputBody = '{
  "hostname": "string",
  "languages": [
    {
      "name": "string",
      "lang": "string"
    }
  ],
  "name": "string",
  "socials": [
    {
      "icon": "string",
      "link": "string",
      "name": "string"
    }
  ]
}';
const headers = {
  'Content-Type':'application/json',
  'Accept':'application/json',
  'Authorization':'API_KEY'
};

fetch('https://tw16nt2svf.execute-api.eu-south-1.amazonaws.com/{basePath}/brands/{brandId}',
{
  method: 'PUT',
  body: inputBody,
  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`PUT /brands/{brandId}`

> Body parameter

```json
{
  "hostname": "string",
  "languages": [
    {
      "name": "string",
      "lang": "string"
    }
  ],
  "name": "string",
  "socials": [
    {
      "icon": "string",
      "link": "string",
      "name": "string"
    }
  ]
}
```

<h3 id="put__brands_{brandid}-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|brandId|path|string|true|none|
|body|body|[EditBrandModel](#schemaeditbrandmodel)|true|none|

> Example responses

> 200 Response

```json
{
  "createdAt": "string",
  "hostname": "string",
  "code": "string",
  "languages": [
    {
      "name": "string",
      "_id": "string",
      "lang": "string"
    }
  ],
  "__v": 0,
  "name": "string",
  "_id": "string",
  "socials": [
    {
      "icon": "string",
      "link": "string",
      "name": "string",
      "_id": "string"
    }
  ],
  "updatedAt": "string"
}
```

<h3 id="put__brands_{brandid}-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|200 response|[BrandPayload](#schemabrandpayload)|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
AdminApiStackstgCognitoAuthorizerCognitoAuthorizerstg9DCFA5E0
</aside>

## delete__brands_{brandId}

> Code samples

```javascript

const headers = {
  'Authorization':'API_KEY'
};

fetch('https://tw16nt2svf.execute-api.eu-south-1.amazonaws.com/{basePath}/brands/{brandId}',
{
  method: 'DELETE',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`DELETE /brands/{brandId}`

<h3 id="delete__brands_{brandid}-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|brandId|path|string|true|none|

> Example responses

<h3 id="delete__brands_{brandid}-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|204|[No Content](https://tools.ietf.org/html/rfc7231#section-6.3.5)|204 response|None|

<h3 id="delete__brands_{brandid}-responseschema">Response Schema</h3>

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
AdminApiStackstgCognitoAuthorizerCognitoAuthorizerstg9DCFA5E0
</aside>

## options__brands_{brandId}

> Code samples

```javascript

const headers = {
  'Accept':'application/json'
};

fetch('https://tw16nt2svf.execute-api.eu-south-1.amazonaws.com/{basePath}/brands/{brandId}',
{
  method: 'OPTIONS',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`OPTIONS /brands/{brandId}`

<h3 id="options__brands_{brandid}-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|brandId|path|string|true|none|

> Example responses

> 200 Response

```json
{}
```

<h3 id="options__brands_{brandid}-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|200 response|[Empty](#schemaempty)|

### Response Headers

|Status|Header|Type|Format|Description|
|---|---|---|---|---|
|200|Access-Control-Allow-Origin|string||none|
|200|Access-Control-Allow-Methods|string||none|
|200|Access-Control-Allow-Credentials|string||none|
|200|Access-Control-Allow-Headers|string||none|

<aside class="success">
This operation does not require authentication
</aside>

## post__questions_search

> Code samples

```javascript
const inputBody = '{
  "is_open": true,
  "language": "it",
  "includes": "string",
  "authorId": "string",
  "createdAfter": "string",
  "subjectId": "string",
  "simulations": [
    "string"
  ],
  "difficulty": 0,
  "topicId": "string",
  "search": "string",
  "perPage": 0,
  "page": 0,
  "id": "string",
  "createdBefore": "string"
}';
const headers = {
  'Content-Type':'application/json',
  'Accept':'application/json',
  'Authorization':'API_KEY'
};

fetch('https://tw16nt2svf.execute-api.eu-south-1.amazonaws.com/{basePath}/questions/search',
{
  method: 'POST',
  body: inputBody,
  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`POST /questions/search`

> Body parameter

```json
{
  "is_open": true,
  "language": "it",
  "includes": "string",
  "authorId": "string",
  "createdAfter": "string",
  "subjectId": "string",
  "simulations": [
    "string"
  ],
  "difficulty": 0,
  "topicId": "string",
  "search": "string",
  "perPage": 0,
  "page": 0,
  "id": "string",
  "createdBefore": "string"
}
```

<h3 id="post__questions_search-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|body|body|[SearchQuestionsModel](#schemasearchquestionsmodel)|true|none|

> Example responses

> 200 Response

```json
{
  "total": 0,
  "questions": [
    {
      "versionCount": 0,
      "notes": "string",
      "subject": {
        "name": "string"
      },
      "language": "it",
      "type": "completion",
      "subjectId": "string",
      "questionText": "string",
      "revisorId": "string",
      "explanationImages": [
        "string"
      ],
      "archived": true,
      "createdAt": "string",
      "approved": true,
      "stats": {
        "correct": 0,
        "answersCount": [
          0
        ],
        "empty": 0,
        "wrong": 0
      },
      "completionAnswers": [
        "string"
      ],
      "subtopic": {
        "name": "string"
      },
      "updatedAt": "string",
      "explanationText": "string",
      "revisor": {
        "email": "string"
      },
      "author": {
        "email": "string"
      },
      "authorId": "string",
      "favourite": true,
      "tags": [
        "string"
      ],
      "difficulty": 0,
      "topicId": "string",
      "topic": {
        "name": "string"
      },
      "alternatives": [
        {
          "image": "string",
          "correct": true,
          "text": "string"
        }
      ],
      "subtopicId": "string",
      "_id": "string",
      "questionImages": [
        "string"
      ],
      "status": "draft"
    }
  ]
}
```

<h3 id="post__questions_search-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|200 response|[QuestionsPayload](#schemaquestionspayload)|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
AdminApiStackstgCognitoAuthorizerCognitoAuthorizerstg9DCFA5E0
</aside>

## options__questions_search

> Code samples

```javascript

const headers = {
  'Accept':'application/json'
};

fetch('https://tw16nt2svf.execute-api.eu-south-1.amazonaws.com/{basePath}/questions/search',
{
  method: 'OPTIONS',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`OPTIONS /questions/search`

> Example responses

> 200 Response

```json
{}
```

<h3 id="options__questions_search-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|200 response|[Empty](#schemaempty)|

### Response Headers

|Status|Header|Type|Format|Description|
|---|---|---|---|---|
|200|Access-Control-Allow-Origin|string||none|
|200|Access-Control-Allow-Methods|string||none|
|200|Access-Control-Allow-Credentials|string||none|
|200|Access-Control-Allow-Headers|string||none|

<aside class="success">
This operation does not require authentication
</aside>

## get__modules

> Code samples

```javascript

const headers = {
  'Accept':'application/json',
  'Authorization':'API_KEY'
};

fetch('https://tw16nt2svf.execute-api.eu-south-1.amazonaws.com/{basePath}/modules',
{
  method: 'GET',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`GET /modules`

<h3 id="get__modules-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|search|query|string|false|none|
|per_page|query|string|false|none|
|page|query|string|false|none|

> Example responses

> 200 Response

```json
{
  "total": 0,
  "modules": [
    {
      "area": "string",
      "createdAt": "string",
      "documents": [
        "string"
      ],
      "brandId": "string",
      "__v": 0,
      "name": "string",
      "_id": "string",
      "sku": [
        "string"
      ],
      "simulations": [
        "string"
      ],
      "updatedAt": "string"
    }
  ]
}
```

<h3 id="get__modules-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|200 response|[ModulesPayload](#schemamodulespayload)|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
AdminApiStackstgCognitoAuthorizerCognitoAuthorizerstg9DCFA5E0
</aside>

## post__modules

> Code samples

```javascript
const inputBody = '{
  "documents": [
    "string"
  ],
  "name": "string",
  "sku": [
    "string"
  ],
  "simulations": [
    "string"
  ]
}';
const headers = {
  'Content-Type':'application/json',
  'Accept':'application/json',
  'Authorization':'API_KEY'
};

fetch('https://tw16nt2svf.execute-api.eu-south-1.amazonaws.com/{basePath}/modules',
{
  method: 'POST',
  body: inputBody,
  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`POST /modules`

> Body parameter

```json
{
  "documents": [
    "string"
  ],
  "name": "string",
  "sku": [
    "string"
  ],
  "simulations": [
    "string"
  ]
}
```

<h3 id="post__modules-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|body|body|[NewModuleModel](#schemanewmodulemodel)|true|none|

> Example responses

> 200 Response

```json
{
  "area": "string",
  "createdAt": "string",
  "documents": [
    "string"
  ],
  "brandId": "string",
  "__v": 0,
  "name": "string",
  "_id": "string",
  "sku": [
    "string"
  ],
  "simulations": [
    "string"
  ],
  "updatedAt": "string"
}
```

<h3 id="post__modules-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|200 response|[ModulePayload](#schemamodulepayload)|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
AdminApiStackstgCognitoAuthorizerCognitoAuthorizerstg9DCFA5E0
</aside>

## options__modules

> Code samples

```javascript

const headers = {
  'Accept':'application/json'
};

fetch('https://tw16nt2svf.execute-api.eu-south-1.amazonaws.com/{basePath}/modules',
{
  method: 'OPTIONS',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`OPTIONS /modules`

> Example responses

> 200 Response

```json
{}
```

<h3 id="options__modules-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|200 response|[Empty](#schemaempty)|

### Response Headers

|Status|Header|Type|Format|Description|
|---|---|---|---|---|
|200|Access-Control-Allow-Origin|string||none|
|200|Access-Control-Allow-Methods|string||none|
|200|Access-Control-Allow-Credentials|string||none|
|200|Access-Control-Allow-Headers|string||none|

<aside class="success">
This operation does not require authentication
</aside>

## options__collections_{collectionId}_archive

> Code samples

```javascript

const headers = {
  'Accept':'application/json'
};

fetch('https://tw16nt2svf.execute-api.eu-south-1.amazonaws.com/{basePath}/collections/{collectionId}/archive',
{
  method: 'OPTIONS',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`OPTIONS /collections/{collectionId}/archive`

<h3 id="options__collections_{collectionid}_archive-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|collectionId|path|string|true|none|

> Example responses

> 200 Response

```json
{}
```

<h3 id="options__collections_{collectionid}_archive-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|200 response|[Empty](#schemaempty)|

### Response Headers

|Status|Header|Type|Format|Description|
|---|---|---|---|---|
|200|Access-Control-Allow-Origin|string||none|
|200|Access-Control-Allow-Methods|string||none|
|200|Access-Control-Allow-Credentials|string||none|
|200|Access-Control-Allow-Headers|string||none|

<aside class="success">
This operation does not require authentication
</aside>

## patch__collections_{collectionId}_archive

> Code samples

```javascript
const inputBody = '{
  "archived": true
}';
const headers = {
  'Content-Type':'application/json',
  'Accept':'application/json',
  'Authorization':'API_KEY'
};

fetch('https://tw16nt2svf.execute-api.eu-south-1.amazonaws.com/{basePath}/collections/{collectionId}/archive',
{
  method: 'PATCH',
  body: inputBody,
  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`PATCH /collections/{collectionId}/archive`

> Body parameter

```json
{
  "archived": true
}
```

<h3 id="patch__collections_{collectionid}_archive-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|collectionId|path|string|true|none|
|body|body|[AdminArchiveCollectionModel](#schemaadminarchivecollectionmodel)|true|none|

> Example responses

> 200 Response

```json
{
  "brands": [
    {
      "name": "string"
    }
  ],
  "timed": true,
  "type": "exercise",
  "authorId": "string",
  "brandIds": [
    "string"
  ],
  "sections": [
    {
      "maxAttempts": 0,
      "questions": [
        {
          "questionId": "string",
          "points": {
            "correctPoint": 0,
            "wrongPoint": 0,
            "emptyPoint": 0
          }
        }
      ],
      "rules": {
        "duration": 0,
        "pausable": true,
        "extraTime": [
          0
        ]
      },
      "_id": "string"
    }
  ],
  "tags": [
    "string"
  ],
  "archived": true,
  "createdAt": "string",
  "name": "string",
  "testId": "string",
  "attributes": [
    "string"
  ],
  "_id": "string",
  "status": "draft",
  "updatedAt": "string"
}
```

<h3 id="patch__collections_{collectionid}_archive-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|200 response|[AdminCollectionPayload](#schemaadmincollectionpayload)|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
AdminApiStackstgCognitoAuthorizerCognitoAuthorizerstg9DCFA5E0
</aside>

## get__subjects_{subjectId}

> Code samples

```javascript

const headers = {
  'Accept':'application/json',
  'Authorization':'API_KEY'
};

fetch('https://tw16nt2svf.execute-api.eu-south-1.amazonaws.com/{basePath}/subjects/{subjectId}',
{
  method: 'GET',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`GET /subjects/{subjectId}`

<h3 id="get__subjects_{subjectid}-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|subjectId|path|string|true|none|

> Example responses

> 200 Response

```json
{
  "createdAt": "string",
  "topics": [
    {
      "name": "string",
      "subtopics": [
        {
          "name": "string",
          "_id": "string"
        }
      ],
      "_id": "string"
    }
  ],
  "__v": 0,
  "name": "string",
  "style": {
    "light": "string",
    "icon": "string",
    "primary": "string"
  },
  "_id": "string",
  "updatedAt": "string"
}
```

<h3 id="get__subjects_{subjectid}-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|200 response|[SubjectPayload](#schemasubjectpayload)|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
AdminApiStackstgCognitoAuthorizerCognitoAuthorizerstg9DCFA5E0
</aside>

## put__subjects_{subjectId}

> Code samples

```javascript
const inputBody = '{
  "name": "string"
}';
const headers = {
  'Content-Type':'application/json',
  'Accept':'application/json',
  'Authorization':'API_KEY'
};

fetch('https://tw16nt2svf.execute-api.eu-south-1.amazonaws.com/{basePath}/subjects/{subjectId}',
{
  method: 'PUT',
  body: inputBody,
  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`PUT /subjects/{subjectId}`

> Body parameter

```json
{
  "name": "string"
}
```

<h3 id="put__subjects_{subjectid}-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|subjectId|path|string|true|none|
|body|body|[EditSubjectModel](#schemaeditsubjectmodel)|true|none|

> Example responses

> 200 Response

```json
{
  "createdAt": "string",
  "topics": [
    {
      "name": "string",
      "subtopics": [
        {
          "name": "string",
          "_id": "string"
        }
      ],
      "_id": "string"
    }
  ],
  "__v": 0,
  "name": "string",
  "style": {
    "light": "string",
    "icon": "string",
    "primary": "string"
  },
  "_id": "string",
  "updatedAt": "string"
}
```

<h3 id="put__subjects_{subjectid}-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|200 response|[SubjectPayload](#schemasubjectpayload)|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
AdminApiStackstgCognitoAuthorizerCognitoAuthorizerstg9DCFA5E0
</aside>

## delete__subjects_{subjectId}

> Code samples

```javascript

const headers = {
  'Authorization':'API_KEY'
};

fetch('https://tw16nt2svf.execute-api.eu-south-1.amazonaws.com/{basePath}/subjects/{subjectId}',
{
  method: 'DELETE',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`DELETE /subjects/{subjectId}`

<h3 id="delete__subjects_{subjectid}-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|subjectId|path|string|true|none|

> Example responses

<h3 id="delete__subjects_{subjectid}-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|204|[No Content](https://tools.ietf.org/html/rfc7231#section-6.3.5)|204 response|None|

<h3 id="delete__subjects_{subjectid}-responseschema">Response Schema</h3>

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
AdminApiStackstgCognitoAuthorizerCognitoAuthorizerstg9DCFA5E0
</aside>

## options__subjects_{subjectId}

> Code samples

```javascript

const headers = {
  'Accept':'application/json'
};

fetch('https://tw16nt2svf.execute-api.eu-south-1.amazonaws.com/{basePath}/subjects/{subjectId}',
{
  method: 'OPTIONS',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`OPTIONS /subjects/{subjectId}`

<h3 id="options__subjects_{subjectid}-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|subjectId|path|string|true|none|

> Example responses

> 200 Response

```json
{}
```

<h3 id="options__subjects_{subjectid}-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|200 response|[Empty](#schemaempty)|

### Response Headers

|Status|Header|Type|Format|Description|
|---|---|---|---|---|
|200|Access-Control-Allow-Origin|string||none|
|200|Access-Control-Allow-Methods|string||none|
|200|Access-Control-Allow-Credentials|string||none|
|200|Access-Control-Allow-Headers|string||none|

<aside class="success">
This operation does not require authentication
</aside>

## options__collections_{collectionId}_status

> Code samples

```javascript

const headers = {
  'Accept':'application/json'
};

fetch('https://tw16nt2svf.execute-api.eu-south-1.amazonaws.com/{basePath}/collections/{collectionId}/status',
{
  method: 'OPTIONS',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`OPTIONS /collections/{collectionId}/status`

<h3 id="options__collections_{collectionid}_status-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|collectionId|path|string|true|none|

> Example responses

> 200 Response

```json
{}
```

<h3 id="options__collections_{collectionid}_status-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|200 response|[Empty](#schemaempty)|

### Response Headers

|Status|Header|Type|Format|Description|
|---|---|---|---|---|
|200|Access-Control-Allow-Origin|string||none|
|200|Access-Control-Allow-Methods|string||none|
|200|Access-Control-Allow-Credentials|string||none|
|200|Access-Control-Allow-Headers|string||none|

<aside class="success">
This operation does not require authentication
</aside>

## patch__collections_{collectionId}_status

> Code samples

```javascript
const inputBody = '{
  "status": "draft"
}';
const headers = {
  'Content-Type':'application/json',
  'Accept':'application/json',
  'Authorization':'API_KEY'
};

fetch('https://tw16nt2svf.execute-api.eu-south-1.amazonaws.com/{basePath}/collections/{collectionId}/status',
{
  method: 'PATCH',
  body: inputBody,
  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`PATCH /collections/{collectionId}/status`

> Body parameter

```json
{
  "status": "draft"
}
```

<h3 id="patch__collections_{collectionid}_status-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|collectionId|path|string|true|none|
|body|body|[AdminUpdateCollectionStatusModel](#schemaadminupdatecollectionstatusmodel)|true|none|

> Example responses

> 200 Response

```json
{
  "brands": [
    {
      "name": "string"
    }
  ],
  "timed": true,
  "type": "exercise",
  "authorId": "string",
  "brandIds": [
    "string"
  ],
  "sections": [
    {
      "maxAttempts": 0,
      "questions": [
        {
          "questionId": "string",
          "points": {
            "correctPoint": 0,
            "wrongPoint": 0,
            "emptyPoint": 0
          }
        }
      ],
      "rules": {
        "duration": 0,
        "pausable": true,
        "extraTime": [
          0
        ]
      },
      "_id": "string"
    }
  ],
  "tags": [
    "string"
  ],
  "archived": true,
  "createdAt": "string",
  "name": "string",
  "testId": "string",
  "attributes": [
    "string"
  ],
  "_id": "string",
  "status": "draft",
  "updatedAt": "string"
}
```

<h3 id="patch__collections_{collectionid}_status-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|200 response|[AdminCollectionPayload](#schemaadmincollectionpayload)|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
AdminApiStackstgCognitoAuthorizerCognitoAuthorizerstg9DCFA5E0
</aside>

# Schemas

<h2 id="tocS_AdminListTestsPayload">AdminListTestsPayload</h2>
<!-- backwards compatibility -->
<a id="schemaadminlisttestspayload"></a>
<a id="schema_AdminListTestsPayload"></a>
<a id="tocSadminlisttestspayload"></a>
<a id="tocsadminlisttestspayload"></a>

```json
{
  "total": 0,
  "data": [
    {
      "syllabus": [
        {
          "baseTopic": "string",
          "baseSubtopic": "string",
          "displayTopic": "string",
          "displaySubtopic": "string",
          "baseSubject": "string",
          "displaySubject": "string"
        }
      ],
      "createdAt": "string",
      "brands": [
        {
          "name": "string",
          "id": "string"
        }
      ],
      "year": 0,
      "__v": 0,
      "name": "string",
      "_id": "string",
      "defaultScores": {
        "correct": 0,
        "empty": 0,
        "wrong": 0
      },
      "tags": [
        "string"
      ],
      "updatedAt": "string"
    }
  ],
  "limit": 0,
  "page": 0
}

```

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|total|number|true|none|none|
|data|[object]|true|none|none|
|» syllabus|[object]|false|none|none|
|»» baseTopic|string|true|none|none|
|»» baseSubtopic|string|false|none|none|
|»» displayTopic|string|true|none|none|
|»» displaySubtopic|string|false|none|none|
|»» baseSubject|string|true|none|none|
|»» displaySubject|string|true|none|none|
|» createdAt|string|true|none|none|
|» brands|[object]|false|none|none|
|»» name|string|true|none|none|
|»» id|string|true|none|none|
|» year|number|false|none|none|
|» __v|number|false|none|none|
|» name|string|true|none|none|
|» _id|string|true|none|none|
|» defaultScores|object|false|none|none|
|»» correct|number|true|none|none|
|»» empty|number|true|none|none|
|»» wrong|number|true|none|none|
|» tags|[string]|false|none|none|
|» updatedAt|string|true|none|none|
|limit|number|true|none|none|
|page|number|true|none|none|

<h2 id="tocS_ModulePayload">ModulePayload</h2>
<!-- backwards compatibility -->
<a id="schemamodulepayload"></a>
<a id="schema_ModulePayload"></a>
<a id="tocSmodulepayload"></a>
<a id="tocsmodulepayload"></a>

```json
{
  "area": "string",
  "createdAt": "string",
  "documents": [
    "string"
  ],
  "brandId": "string",
  "__v": 0,
  "name": "string",
  "_id": "string",
  "sku": [
    "string"
  ],
  "simulations": [
    "string"
  ],
  "updatedAt": "string"
}

```

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|area|string|false|none|none|
|createdAt|string|false|none|none|
|documents|[string]|true|none|none|
|brandId|string|true|none|none|
|__v|number|false|none|none|
|name|string|true|none|none|
|_id|string|true|none|none|
|sku|[string]|true|none|none|
|simulations|[string]|true|none|none|
|updatedAt|string|false|none|none|

<h2 id="tocS_AddSubtopicMethod">AddSubtopicMethod</h2>
<!-- backwards compatibility -->
<a id="schemaaddsubtopicmethod"></a>
<a id="schema_AddSubtopicMethod"></a>
<a id="tocSaddsubtopicmethod"></a>
<a id="tocsaddsubtopicmethod"></a>

```json
{
  "name": "string"
}

```

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|name|string|true|none|none|

<h2 id="tocS_UpdateQuestionStatusModel">UpdateQuestionStatusModel</h2>
<!-- backwards compatibility -->
<a id="schemaupdatequestionstatusmodel"></a>
<a id="schema_UpdateQuestionStatusModel"></a>
<a id="tocSupdatequestionstatusmodel"></a>
<a id="tocsupdatequestionstatusmodel"></a>

```json
{
  "status": "draft"
}

```

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|status|string|true|none|none|

#### Enumerated Values

|Property|Value|
|---|---|
|status|draft|
|status|in_review|
|status|approved|
|status|rejected|

<h2 id="tocS_UpdateTopicMethod">UpdateTopicMethod</h2>
<!-- backwards compatibility -->
<a id="schemaupdatetopicmethod"></a>
<a id="schema_UpdateTopicMethod"></a>
<a id="tocSupdatetopicmethod"></a>
<a id="tocsupdatetopicmethod"></a>

```json
{
  "name": "string"
}

```

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|name|string|true|none|none|

<h2 id="tocS_EditPackageModel">EditPackageModel</h2>
<!-- backwards compatibility -->
<a id="schemaeditpackagemodel"></a>
<a id="schema_EditPackageModel"></a>
<a id="tocSeditpackagemodel"></a>
<a id="tocseditpackagemodel"></a>

```json
{
  "collectionIds": [
    "string"
  ],
  "name": "string",
  "expiresAt": "string",
  "poolIds": [
    "string"
  ]
}

```

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|collectionIds|[string]|false|none|none|
|name|string|false|none|none|
|expiresAt|string|false|none|none|
|poolIds|[string]|false|none|none|

<h2 id="tocS_ListSkusPayload">ListSkusPayload</h2>
<!-- backwards compatibility -->
<a id="schemalistskuspayload"></a>
<a id="schema_ListSkusPayload"></a>
<a id="tocSlistskuspayload"></a>
<a id="tocslistskuspayload"></a>

```json
{
  "total": 0,
  "data": [
    {
      "createdAt": "string",
      "code": "string",
      "brands": [
        {
          "name": "string",
          "id": "string"
        }
      ],
      "__v": 0,
      "name": "string",
      "_id": "string",
      "url": "string",
      "updatedAt": "string"
    }
  ],
  "limit": 0,
  "page": 0
}

```

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|total|number|true|none|none|
|data|[object]|true|none|none|
|» createdAt|string|false|none|none|
|» code|string|true|none|none|
|» brands|[object]|false|none|none|
|»» name|string|true|none|none|
|»» id|string|true|none|none|
|» __v|number|false|none|none|
|» name|string|true|none|none|
|» _id|string|true|none|none|
|» url|string|false|none|none|
|» updatedAt|string|false|none|none|
|limit|number|true|none|none|
|page|number|true|none|none|

<h2 id="tocS_NewBrandModel">NewBrandModel</h2>
<!-- backwards compatibility -->
<a id="schemanewbrandmodel"></a>
<a id="schema_NewBrandModel"></a>
<a id="tocSnewbrandmodel"></a>
<a id="tocsnewbrandmodel"></a>

```json
{
  "hostname": "string",
  "code": "string",
  "languages": [
    {
      "name": "string",
      "lang": "string"
    }
  ],
  "name": "string",
  "socials": [
    {
      "icon": "string",
      "link": "string",
      "name": "string"
    }
  ]
}

```

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|hostname|string|false|none|none|
|code|string|true|none|none|
|languages|[object]|false|none|none|
|» name|string|false|none|none|
|» lang|string|false|none|none|
|name|string|true|none|none|
|socials|[object]|false|none|none|
|» icon|string|false|none|none|
|» link|string|false|none|none|
|» name|string|false|none|none|

<h2 id="tocS_BrandPayload">BrandPayload</h2>
<!-- backwards compatibility -->
<a id="schemabrandpayload"></a>
<a id="schema_BrandPayload"></a>
<a id="tocSbrandpayload"></a>
<a id="tocsbrandpayload"></a>

```json
{
  "createdAt": "string",
  "hostname": "string",
  "code": "string",
  "languages": [
    {
      "name": "string",
      "_id": "string",
      "lang": "string"
    }
  ],
  "__v": 0,
  "name": "string",
  "_id": "string",
  "socials": [
    {
      "icon": "string",
      "link": "string",
      "name": "string",
      "_id": "string"
    }
  ],
  "updatedAt": "string"
}

```

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|createdAt|string|false|none|none|
|hostname|string|false|none|none|
|code|string|true|none|none|
|languages|[object]|false|none|none|
|» name|string|true|none|none|
|» _id|string|true|none|none|
|» lang|string|true|none|none|
|__v|number|false|none|none|
|name|string|true|none|none|
|_id|string|true|none|none|
|socials|[object]|false|none|none|
|» icon|string|true|none|none|
|» link|string|true|none|none|
|» name|string|true|none|none|
|» _id|string|true|none|none|
|updatedAt|string|false|none|none|

<h2 id="tocS_NewPackageModel">NewPackageModel</h2>
<!-- backwards compatibility -->
<a id="schemanewpackagemodel"></a>
<a id="schema_NewPackageModel"></a>
<a id="tocSnewpackagemodel"></a>
<a id="tocsnewpackagemodel"></a>

```json
{
  "isFree": true,
  "collectionIds": [
    "string"
  ],
  "name": "string",
  "active": true,
  "skuId": "string",
  "expiresAt": "string",
  "poolIds": [
    "string"
  ]
}

```

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|isFree|boolean|false|none|none|
|collectionIds|[string]|false|none|none|
|name|string|false|none|none|
|active|boolean|true|none|none|
|skuId|string|true|none|none|
|expiresAt|string|false|none|none|
|poolIds|[string]|false|none|none|

<h2 id="tocS_QuestionVersionsPayload">QuestionVersionsPayload</h2>
<!-- backwards compatibility -->
<a id="schemaquestionversionspayload"></a>
<a id="schema_QuestionVersionsPayload"></a>
<a id="tocSquestionversionspayload"></a>
<a id="tocsquestionversionspayload"></a>

```json
[
  {
    "questionId": "string",
    "versionCounter": 0,
    "__v": 0,
    "_id": "string",
    "editMetadata": {
      "editor": {
        "id": "string",
        "email": "string",
        "username": "string"
      },
      "createdAt": "string",
      "changeReason": "string"
    },
    "snapshot": {
      "subject": {
        "name": "string"
      },
      "language": "it",
      "type": "completion",
      "subjectId": "string",
      "questionText": "string",
      "revisorId": "string",
      "explanationImages": [
        "string"
      ],
      "archived": true,
      "createdAt": "string",
      "approved": true,
      "stats": {
        "correct": 0,
        "answersCount": [
          0
        ],
        "empty": 0,
        "wrong": 0
      },
      "completionAnswers": [
        "string"
      ],
      "subtopic": {
        "name": "string"
      },
      "updatedAt": "string",
      "explanationText": "string",
      "revisor": {
        "email": "string"
      },
      "author": {
        "email": "string"
      },
      "authorId": "string",
      "tags": [
        "string"
      ],
      "difficulty": 0,
      "topicId": "string",
      "topic": {
        "name": "string"
      },
      "alternatives": [
        {
          "image": "string",
          "correct": true,
          "text": "string"
        }
      ],
      "subtopicId": "string",
      "questionImages": [
        "string"
      ],
      "status": "string"
    }
  }
]

```

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|questionId|string|true|none|none|
|versionCounter|number|true|none|none|
|__v|number|false|none|none|
|_id|string|true|none|none|
|editMetadata|object|false|none|none|
|» editor|object|false|none|none|
|»» id|string|true|none|none|
|»» email|string|false|none|none|
|»» username|string|false|none|none|
|» createdAt|string|true|none|none|
|» changeReason|string|false|none|none|
|snapshot|object|false|none|none|
|» subject|object|false|none|none|
|»» name|string|true|none|none|
|» language|string|true|none|none|
|» type|string|true|none|none|
|» subjectId|string|true|none|none|
|» questionText|string|true|none|none|
|» revisorId|string|false|none|none|
|» explanationImages|[string]|false|none|none|
|» archived|boolean|false|none|none|
|» createdAt|string|true|none|none|
|» approved|boolean|false|none|none|
|» stats|object|false|none|none|
|»» correct|number|false|none|none|
|»» answersCount|[number]|false|none|none|
|»» empty|number|false|none|none|
|»» wrong|number|false|none|none|
|» completionAnswers|[string]|false|none|none|
|» subtopic|object|false|none|none|
|»» name|string|false|none|none|
|» updatedAt|string|true|none|none|
|» explanationText|string|false|none|none|
|» revisor|object|false|none|none|
|»» email|string|false|none|none|
|» author|object|false|none|none|
|»» email|string|true|none|none|
|» authorId|string|true|none|none|
|» tags|[string]|false|none|none|
|» difficulty|number|true|none|none|
|» topicId|string|true|none|none|
|» topic|object|false|none|none|
|»» name|string|true|none|none|
|» alternatives|[object]|false|none|none|
|»» image|string|false|none|none|
|»» correct|boolean|true|none|none|
|»» text|string|false|none|none|
|» subtopicId|string|false|none|none|
|» questionImages|[string]|false|none|none|
|» status|string|false|none|none|

#### Enumerated Values

|Property|Value|
|---|---|
|language|it|
|language|en|
|type|completion|
|type|alternative|

<h2 id="tocS_NewQuestionModel">NewQuestionModel</h2>
<!-- backwards compatibility -->
<a id="schemanewquestionmodel"></a>
<a id="schema_NewQuestionModel"></a>
<a id="tocSnewquestionmodel"></a>
<a id="tocsnewquestionmodel"></a>

```json
{
  "explanationText": "string",
  "difficulty": 0,
  "subject": {
    "name": "string",
    "_id": "string"
  },
  "draft": true,
  "alternatives": [
    {
      "image": "string",
      "correct": true,
      "text": "string"
    }
  ],
  "topic": {
    "name": "string",
    "_id": "string"
  },
  "language": "it",
  "questionImages": [
    "string"
  ],
  "questionText": "string",
  "explanationImages": [
    "string"
  ],
  "tags": [
    "string"
  ]
}

```

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|explanationText|string|true|none|none|
|difficulty|number|true|none|none|
|subject|object|true|none|none|
|» name|string|false|none|none|
|» _id|string|true|none|none|
|draft|boolean|false|none|none|
|alternatives|[object]|true|none|none|
|» image|string|false|none|none|
|» correct|boolean|true|none|none|
|» text|string|true|none|none|
|topic|object|true|none|none|
|» name|string|false|none|none|
|» _id|string|true|none|none|
|language|string|true|none|none|
|questionImages|[string]|true|none|none|
|questionText|string|true|none|none|
|explanationImages|[string]|true|none|none|
|tags|[string]|false|none|none|

#### Enumerated Values

|Property|Value|
|---|---|
|language|it|
|language|en|

<h2 id="tocS_EditSubjectModel">EditSubjectModel</h2>
<!-- backwards compatibility -->
<a id="schemaeditsubjectmodel"></a>
<a id="schema_EditSubjectModel"></a>
<a id="tocSeditsubjectmodel"></a>
<a id="tocseditsubjectmodel"></a>

```json
{
  "name": "string"
}

```

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|name|string|true|none|none|

<h2 id="tocS_PoolQuestionPayload">PoolQuestionPayload</h2>
<!-- backwards compatibility -->
<a id="schemapoolquestionpayload"></a>
<a id="schema_PoolQuestionPayload"></a>
<a id="tocSpoolquestionpayload"></a>
<a id="tocspoolquestionpayload"></a>

```json
{
  "addedAt": "string",
  "questionId": "string",
  "subject": {
    "name": "string"
  },
  "addedBy": "string",
  "language": "it",
  "type": "completion",
  "subjectId": "string",
  "difficulty": 0,
  "topicId": "string",
  "__v": 0,
  "poolId": "string",
  "topic": {
    "name": "string"
  },
  "subtopicId": "string",
  "_id": "string",
  "subtopic": {
    "name": "string"
  }
}

```

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|addedAt|string|false|none|none|
|questionId|string|true|none|none|
|subject|object|false|none|none|
|» name|string|true|none|none|
|addedBy|string|true|none|none|
|language|string|true|none|none|
|type|string|true|none|none|
|subjectId|string|true|none|none|
|difficulty|number|false|none|none|
|topicId|string|false|none|none|
|__v|number|false|none|none|
|poolId|string|true|none|none|
|topic|object|false|none|none|
|» name|string|false|none|none|
|subtopicId|string|false|none|none|
|_id|string|true|none|none|
|subtopic|object|false|none|none|
|» name|string|false|none|none|

#### Enumerated Values

|Property|Value|
|---|---|
|language|it|
|language|en|
|type|completion|
|type|alternative|

<h2 id="tocS_EditBrandModel">EditBrandModel</h2>
<!-- backwards compatibility -->
<a id="schemaeditbrandmodel"></a>
<a id="schema_EditBrandModel"></a>
<a id="tocSeditbrandmodel"></a>
<a id="tocseditbrandmodel"></a>

```json
{
  "hostname": "string",
  "languages": [
    {
      "name": "string",
      "lang": "string"
    }
  ],
  "name": "string",
  "socials": [
    {
      "icon": "string",
      "link": "string",
      "name": "string"
    }
  ]
}

```

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|hostname|string|false|none|none|
|languages|[object]|false|none|none|
|» name|string|false|none|none|
|» lang|string|false|none|none|
|name|string|false|none|none|
|socials|[object]|false|none|none|
|» icon|string|false|none|none|
|» link|string|false|none|none|
|» name|string|false|none|none|

<h2 id="tocS_ListQuestionsPayload">ListQuestionsPayload</h2>
<!-- backwards compatibility -->
<a id="schemalistquestionspayload"></a>
<a id="schema_ListQuestionsPayload"></a>
<a id="tocSlistquestionspayload"></a>
<a id="tocslistquestionspayload"></a>

```json
{
  "total": 0,
  "data": [
    {
      "versionCount": 0,
      "subject": {
        "name": "string"
      },
      "language": "it",
      "type": "completion",
      "subjectId": "string",
      "questionText": "string",
      "revisorId": "string",
      "explanationImages": [
        "string"
      ],
      "archived": true,
      "createdAt": "string",
      "approved": true,
      "stats": {
        "correct": 0,
        "answersCount": [
          0
        ],
        "empty": 0,
        "wrong": 0
      },
      "__v": 0,
      "completionAnswers": [
        "string"
      ],
      "subtopic": {
        "name": "string"
      },
      "updatedAt": "string",
      "explanationText": "string",
      "revisor": {
        "email": "string"
      },
      "author": {
        "email": "string"
      },
      "authorId": "string",
      "tags": [
        "string"
      ],
      "difficulty": 0,
      "topicId": "string",
      "topic": {
        "name": "string"
      },
      "alternatives": [
        {
          "image": "string",
          "correct": true,
          "text": "string"
        }
      ],
      "subtopicId": "string",
      "_id": "string",
      "questionImages": [
        "string"
      ],
      "status": "draft"
    }
  ],
  "limit": 0,
  "page": 0
}

```

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|total|number|true|none|none|
|data|[object]|true|none|none|
|» versionCount|number|true|none|none|
|» subject|object|false|none|none|
|»» name|string|true|none|none|
|» language|string|true|none|none|
|» type|string|true|none|none|
|» subjectId|string|true|none|none|
|» questionText|string|true|none|none|
|» revisorId|string|false|none|none|
|» explanationImages|[string]|false|none|none|
|» archived|boolean|true|none|none|
|» createdAt|string|true|none|none|
|» approved|boolean|true|none|none|
|» stats|object|false|none|none|
|»» correct|number|false|none|none|
|»» answersCount|[number]|false|none|none|
|»» empty|number|false|none|none|
|»» wrong|number|false|none|none|
|» __v|number|false|none|none|
|» completionAnswers|[string]|false|none|none|
|» subtopic|object|false|none|none|
|»» name|string|false|none|none|
|» updatedAt|string|true|none|none|
|» explanationText|string|false|none|none|
|» revisor|object|false|none|none|
|»» email|string|false|none|none|
|» author|object|false|none|none|
|»» email|string|true|none|none|
|» authorId|string|true|none|none|
|» tags|[string]|false|none|none|
|» difficulty|number|true|none|none|
|» topicId|string|true|none|none|
|» topic|object|false|none|none|
|»» name|string|true|none|none|
|» alternatives|[object]|false|none|none|
|»» image|string|false|none|none|
|»» correct|boolean|true|none|none|
|»» text|string|false|none|none|
|» subtopicId|string|false|none|none|
|» _id|string|true|none|none|
|» questionImages|[string]|false|none|none|
|» status|string|true|none|none|
|limit|number|true|none|none|
|page|number|true|none|none|

#### Enumerated Values

|Property|Value|
|---|---|
|language|it|
|language|en|
|type|completion|
|type|alternative|
|status|draft|
|status|in_review|
|status|approved|
|status|rejected|

<h2 id="tocS_QuestionStatsPayload">QuestionStatsPayload</h2>
<!-- backwards compatibility -->
<a id="schemaquestionstatspayload"></a>
<a id="schema_QuestionStatsPayload"></a>
<a id="tocSquestionstatspayload"></a>
<a id="tocsquestionstatspayload"></a>

```json
{
  "correct": 0,
  "answersCount": [
    0
  ],
  "wrong": 0,
  "empty": 0
}

```

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|correct|number|false|none|none|
|answersCount|[number]|false|none|none|
|wrong|number|false|none|none|
|empty|number|false|none|none|

<h2 id="tocS_UpdateCommunityRoleModel">UpdateCommunityRoleModel</h2>
<!-- backwards compatibility -->
<a id="schemaupdatecommunityrolemodel"></a>
<a id="schema_UpdateCommunityRoleModel"></a>
<a id="tocSupdatecommunityrolemodel"></a>
<a id="tocsupdatecommunityrolemodel"></a>

```json
{
  "capabilities": [
    {
      "resource": "string",
      "actions": [
        "string"
      ]
    }
  ],
  "displayName": "string",
  "description": "string",
  "rank": 0
}

```

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|capabilities|[object]|false|none|none|
|» resource|string|true|none|none|
|» actions|[string]|true|none|none|
|displayName|string|false|none|none|
|description|string|false|none|none|
|rank|number|false|none|none|

<h2 id="tocS_UpdateCommunityUserModel">UpdateCommunityUserModel</h2>
<!-- backwards compatibility -->
<a id="schemaupdatecommunityusermodel"></a>
<a id="schema_UpdateCommunityUserModel"></a>
<a id="tocSupdatecommunityusermodel"></a>
<a id="tocsupdatecommunityusermodel"></a>

```json
{
  "cognitoId": "string",
  "roleIds": [
    "string"
  ]
}

```

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|cognitoId|string|false|none|none|
|roleIds|[string]|false|none|none|

<h2 id="tocS_UpdateUserModel">UpdateUserModel</h2>
<!-- backwards compatibility -->
<a id="schemaupdateusermodel"></a>
<a id="schema_UpdateUserModel"></a>
<a id="tocSupdateusermodel"></a>
<a id="tocsupdateusermodel"></a>

```json
{
  "cognitoId": "string",
  "givenOrders": [
    {
      "skus": [
        "string"
      ],
      "orderId": "string",
      "status": "Incomplete"
    }
  ],
  "stats": {
    "correct": 0,
    "subjectStats": [
      {
        "correct": 0,
        "subjectId": "string",
        "subjectName": "string",
        "wrong": 0,
        "empty": 0
      }
    ],
    "topicStats": [
      {
        "topicId": "string",
        "correct": 0,
        "topicName": "string",
        "wrong": 0,
        "empty": 0
      }
    ],
    "empty": 0,
    "wrong": 0
  },
  "orders": [
    {
      "skus": [
        "string"
      ],
      "orderId": "string",
      "status": "Incomplete"
    }
  ]
}

```

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|cognitoId|string|false|none|none|
|givenOrders|[object]|false|none|none|
|» skus|[string]|false|none|none|
|» orderId|string|false|none|none|
|» status|string|false|none|none|
|stats|object|false|none|none|
|» correct|number|false|none|none|
|» subjectStats|[object]|false|none|none|
|»» correct|number|false|none|none|
|»» subjectId|string|false|none|none|
|»» subjectName|string|false|none|none|
|»» wrong|number|false|none|none|
|»» empty|number|false|none|none|
|» topicStats|[object]|false|none|none|
|»» topicId|string|false|none|none|
|»» correct|number|false|none|none|
|»» topicName|string|false|none|none|
|»» wrong|number|false|none|none|
|»» empty|number|false|none|none|
|» empty|number|false|none|none|
|» wrong|number|false|none|none|
|orders|[object]|false|none|none|
|» skus|[string]|false|none|none|
|» orderId|string|false|none|none|
|» status|string|false|none|none|

#### Enumerated Values

|Property|Value|
|---|---|
|status|Incomplete|
|status|Pending|
|status|Awaiting Payment|
|status|Awaiting Fulfillment|
|status|Completed|
|status|Cancelled|
|status|Declined|
|status|Refunded|
|status|Disputed|
|status|Manual Verification Required|
|status|Incomplete|
|status|Pending|
|status|Awaiting Payment|
|status|Awaiting Fulfillment|
|status|Completed|
|status|Cancelled|
|status|Declined|
|status|Refunded|
|status|Disputed|
|status|Manual Verification Required|

<h2 id="tocS_AdminNewTestModel">AdminNewTestModel</h2>
<!-- backwards compatibility -->
<a id="schemaadminnewtestmodel"></a>
<a id="schema_AdminNewTestModel"></a>
<a id="tocSadminnewtestmodel"></a>
<a id="tocsadminnewtestmodel"></a>

```json
{
  "syllabus": [
    {
      "baseTopic": "string",
      "baseSubtopic": "string",
      "displayTopic": "string",
      "displaySubtopic": "string",
      "baseSubject": "string",
      "displaySubject": "string"
    }
  ],
  "brands": [
    {
      "name": "string",
      "id": "string"
    }
  ],
  "year": 0,
  "name": "string",
  "defaultScores": {
    "correct": 0,
    "empty": 0,
    "wrong": 0
  }
}

```

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|syllabus|[object]|true|none|none|
|» baseTopic|string|true|none|none|
|» baseSubtopic|string|false|none|none|
|» displayTopic|string|true|none|none|
|» displaySubtopic|string|false|none|none|
|» baseSubject|string|true|none|none|
|» displaySubject|string|true|none|none|
|brands|[object]|true|none|none|
|» name|string|true|none|none|
|» id|string|true|none|none|
|year|number|false|none|none|
|name|string|true|none|none|
|defaultScores|object|true|none|none|
|» correct|number|true|none|none|
|» empty|number|true|none|none|
|» wrong|number|true|none|none|

<h2 id="tocS_CommunityRolePayload">CommunityRolePayload</h2>
<!-- backwards compatibility -->
<a id="schemacommunityrolepayload"></a>
<a id="schema_CommunityRolePayload"></a>
<a id="tocScommunityrolepayload"></a>
<a id="tocscommunityrolepayload"></a>

```json
{
  "createdAt": "string",
  "capabilities": [
    {
      "resource": "string",
      "actions": [
        "string"
      ]
    }
  ],
  "displayName": "string",
  "__v": 0,
  "name": "string",
  "description": "string",
  "rank": 0,
  "_id": "string",
  "updatedAt": "string"
}

```

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|createdAt|string|false|none|none|
|capabilities|[object]|false|none|none|
|» resource|string|true|none|none|
|» actions|[string]|true|none|none|
|displayName|string|true|none|none|
|__v|number|false|none|none|
|name|string|true|none|none|
|description|string|false|none|none|
|rank|number|true|none|none|
|_id|string|true|none|none|
|updatedAt|string|false|none|none|

<h2 id="tocS_UserPayload">UserPayload</h2>
<!-- backwards compatibility -->
<a id="schemauserpayload"></a>
<a id="schema_UserPayload"></a>
<a id="tocSuserpayload"></a>
<a id="tocsuserpayload"></a>

```json
{
  "createdAt": "string",
  "cognitoId": "string",
  "brands": [
    {
      "name": "string",
      "id": "string",
      "hasProfilation": true,
      "favoriteTest": "string"
    }
  ],
  "__v": 0,
  "_id": "string",
  "packages": [
    {
      "id": "string",
      "skuId": "string",
      "skuCode": "string"
    }
  ],
  "updatedAt": "string"
}

```

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|createdAt|string|true|none|none|
|cognitoId|string|true|none|none|
|brands|[object]|false|none|none|
|» name|string|false|none|none|
|» id|string|false|none|none|
|» hasProfilation|boolean|false|none|none|
|» favoriteTest|string|false|none|none|
|__v|number|false|none|none|
|_id|string|true|none|none|
|packages|[object]|false|none|none|
|» id|string|false|none|none|
|» skuId|string|false|none|none|
|» skuCode|string|false|none|none|
|updatedAt|string|true|none|none|

<h2 id="tocS_NewSyllabusModel">NewSyllabusModel</h2>
<!-- backwards compatibility -->
<a id="schemanewsyllabusmodel"></a>
<a id="schema_NewSyllabusModel"></a>
<a id="tocSnewsyllabusmodel"></a>
<a id="tocsnewsyllabusmodel"></a>

```json
{
  "mapping": [
    {
      "displayTopic": "string",
      "displaySubtopic": "string",
      "baseTopicId": "string",
      "displaySubject": "string",
      "baseSubtopicId": "string",
      "baseSubjectId": "string"
    }
  ],
  "brandId": "string",
  "testYear": 0,
  "testName": "string"
}

```

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|mapping|[object]|false|none|none|
|» displayTopic|string|true|none|none|
|» displaySubtopic|string|false|none|none|
|» baseTopicId|string|true|none|none|
|» displaySubject|string|true|none|none|
|» baseSubtopicId|string|false|none|none|
|» baseSubjectId|string|true|none|none|
|brandId|string|true|none|none|
|testYear|number|true|none|none|
|testName|string|true|none|none|

<h2 id="tocS_SubjectPayload">SubjectPayload</h2>
<!-- backwards compatibility -->
<a id="schemasubjectpayload"></a>
<a id="schema_SubjectPayload"></a>
<a id="tocSsubjectpayload"></a>
<a id="tocssubjectpayload"></a>

```json
{
  "createdAt": "string",
  "topics": [
    {
      "name": "string",
      "subtopics": [
        {
          "name": "string",
          "_id": "string"
        }
      ],
      "_id": "string"
    }
  ],
  "__v": 0,
  "name": "string",
  "style": {
    "light": "string",
    "icon": "string",
    "primary": "string"
  },
  "_id": "string",
  "updatedAt": "string"
}

```

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|createdAt|string|false|none|none|
|topics|[object]|false|none|none|
|» name|string|true|none|none|
|» subtopics|[object]|false|none|none|
|»» name|string|true|none|none|
|»» _id|string|true|none|none|
|» _id|string|true|none|none|
|__v|number|false|none|none|
|name|string|true|none|none|
|style|object|false|none|none|
|» light|string|false|none|none|
|» icon|string|false|none|none|
|» primary|string|false|none|none|
|_id|string|true|none|none|
|updatedAt|string|false|none|none|

<h2 id="tocS_AdminEditCollectionSectionModel">AdminEditCollectionSectionModel</h2>
<!-- backwards compatibility -->
<a id="schemaadmineditcollectionsectionmodel"></a>
<a id="schema_AdminEditCollectionSectionModel"></a>
<a id="tocSadmineditcollectionsectionmodel"></a>
<a id="tocsadmineditcollectionsectionmodel"></a>

```json
{
  "maxAttempts": 0,
  "questions": [
    {
      "questionId": "string",
      "points": {
        "correctPoint": 0,
        "wrongPoint": 0,
        "emptyPoint": 0
      }
    }
  ],
  "rules": {
    "duration": 0,
    "pausable": true,
    "extraTime": [
      0
    ]
  }
}

```

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|maxAttempts|integer|false|none|none|
|questions|[object]|true|none|none|
|» questionId|string|true|none|none|
|» points|object|true|none|none|
|»» correctPoint|number|true|none|none|
|»» wrongPoint|number|true|none|none|
|»» emptyPoint|number|true|none|none|
|rules|object|true|none|none|
|» duration|number|false|none|none|
|» pausable|boolean|true|none|none|
|» extraTime|[number]|false|none|none|

<h2 id="tocS_SetPackageActiveModel">SetPackageActiveModel</h2>
<!-- backwards compatibility -->
<a id="schemasetpackageactivemodel"></a>
<a id="schema_SetPackageActiveModel"></a>
<a id="tocSsetpackageactivemodel"></a>
<a id="tocssetpackageactivemodel"></a>

```json
{
  "active": true
}

```

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|active|boolean|true|none|none|

<h2 id="tocS_AdminTestPayload">AdminTestPayload</h2>
<!-- backwards compatibility -->
<a id="schemaadmintestpayload"></a>
<a id="schema_AdminTestPayload"></a>
<a id="tocSadmintestpayload"></a>
<a id="tocsadmintestpayload"></a>

```json
{
  "syllabus": [
    {
      "baseTopic": "string",
      "baseSubtopic": "string",
      "displayTopic": "string",
      "displaySubtopic": "string",
      "baseSubject": "string",
      "displaySubject": "string"
    }
  ],
  "createdAt": "string",
  "brands": [
    {
      "name": "string",
      "id": "string"
    }
  ],
  "year": 0,
  "__v": 0,
  "name": "string",
  "_id": "string",
  "defaultScores": {
    "correct": 0,
    "empty": 0,
    "wrong": 0
  },
  "tags": [
    "string"
  ],
  "updatedAt": "string"
}

```

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|syllabus|[object]|false|none|none|
|» baseTopic|string|true|none|none|
|» baseSubtopic|string|false|none|none|
|» displayTopic|string|true|none|none|
|» displaySubtopic|string|false|none|none|
|» baseSubject|string|true|none|none|
|» displaySubject|string|true|none|none|
|createdAt|string|true|none|none|
|brands|[object]|false|none|none|
|» name|string|true|none|none|
|» id|string|true|none|none|
|year|number|false|none|none|
|__v|number|false|none|none|
|name|string|true|none|none|
|_id|string|true|none|none|
|defaultScores|object|false|none|none|
|» correct|number|true|none|none|
|» empty|number|true|none|none|
|» wrong|number|true|none|none|
|tags|[string]|false|none|none|
|updatedAt|string|true|none|none|

<h2 id="tocS_UserModulesPayload">UserModulesPayload</h2>
<!-- backwards compatibility -->
<a id="schemausermodulespayload"></a>
<a id="schema_UserModulesPayload"></a>
<a id="tocSusermodulespayload"></a>
<a id="tocsusermodulespayload"></a>

```json
[
  {
    "area": "string",
    "createdAt": "string",
    "documents": [
      "string"
    ],
    "brandId": "string",
    "__v": 0,
    "name": "string",
    "_id": "string",
    "sku": [
      "string"
    ],
    "simulations": [
      "string"
    ],
    "updatedAt": "string"
  }
]

```

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|area|string|false|none|none|
|createdAt|string|false|none|none|
|documents|[string]|true|none|none|
|brandId|string|true|none|none|
|__v|number|false|none|none|
|name|string|true|none|none|
|_id|string|true|none|none|
|sku|[string]|true|none|none|
|simulations|[string]|true|none|none|
|updatedAt|string|false|none|none|

<h2 id="tocS_UpdateSyllabusModel">UpdateSyllabusModel</h2>
<!-- backwards compatibility -->
<a id="schemaupdatesyllabusmodel"></a>
<a id="schema_UpdateSyllabusModel"></a>
<a id="tocSupdatesyllabusmodel"></a>
<a id="tocsupdatesyllabusmodel"></a>

```json
{
  "mapping": [
    {
      "displayTopic": "string",
      "displaySubtopic": "string",
      "baseTopicId": "string",
      "displaySubject": "string",
      "baseSubtopicId": "string",
      "baseSubjectId": "string"
    }
  ],
  "brandId": "string",
  "testYear": 0,
  "testName": "string"
}

```

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|mapping|[object]|false|none|none|
|» displayTopic|string|true|none|none|
|» displaySubtopic|string|false|none|none|
|» baseTopicId|string|true|none|none|
|» displaySubject|string|true|none|none|
|» baseSubtopicId|string|false|none|none|
|» baseSubjectId|string|true|none|none|
|brandId|string|false|none|none|
|testYear|number|false|none|none|
|testName|string|false|none|none|

<h2 id="tocS_AdminNewCollectionSectionModel">AdminNewCollectionSectionModel</h2>
<!-- backwards compatibility -->
<a id="schemaadminnewcollectionsectionmodel"></a>
<a id="schema_AdminNewCollectionSectionModel"></a>
<a id="tocSadminnewcollectionsectionmodel"></a>
<a id="tocsadminnewcollectionsectionmodel"></a>

```json
{
  "maxAttempts": 0,
  "questions": [
    {
      "questionId": "string",
      "points": {
        "correctPoint": 0,
        "wrongPoint": 0,
        "emptyPoint": 0
      }
    }
  ],
  "rules": {
    "duration": 0,
    "pausable": true,
    "extraTime": [
      0
    ]
  }
}

```

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|maxAttempts|integer|false|none|none|
|questions|[object]|true|none|none|
|» questionId|string|true|none|none|
|» points|object|true|none|none|
|»» correctPoint|number|true|none|none|
|»» wrongPoint|number|true|none|none|
|»» emptyPoint|number|true|none|none|
|rules|object|true|none|none|
|» duration|number|false|none|none|
|» pausable|boolean|true|none|none|
|» extraTime|[number]|false|none|none|

<h2 id="tocS_ListPoolsPayload">ListPoolsPayload</h2>
<!-- backwards compatibility -->
<a id="schemalistpoolspayload"></a>
<a id="schema_ListPoolsPayload"></a>
<a id="tocSlistpoolspayload"></a>
<a id="tocslistpoolspayload"></a>

```json
{
  "total": 0,
  "data": [
    {
      "totalQuestions": 0,
      "createdAt": "string",
      "questionCountBySubject": [
        {
          "count": 0,
          "subjectId": "string",
          "subjectName": "string"
        }
      ],
      "brands": [
        "string"
      ],
      "questionCountByTopic": [
        {
          "topicId": "string",
          "count": 0,
          "topicName": "string"
        }
      ],
      "name": "string",
      "description": "string",
      "attributes": [
        "string"
      ],
      "_id": "string",
      "status": "active",
      "updatedAt": "string"
    }
  ],
  "limit": 0,
  "page": 0
}

```

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|total|number|true|none|none|
|data|[object]|true|none|none|
|» totalQuestions|number|false|none|none|
|» createdAt|string|false|none|none|
|» questionCountBySubject|[object]|false|none|none|
|»» count|number|false|none|none|
|»» subjectId|string|false|none|none|
|»» subjectName|string|false|none|none|
|» brands|[string]|false|none|none|
|» questionCountByTopic|[object]|false|none|none|
|»» topicId|string|false|none|none|
|»» count|number|false|none|none|
|»» topicName|string|false|none|none|
|» name|string|false|none|none|
|» description|string|false|none|none|
|» attributes|[string]|false|none|none|
|» _id|string|true|none|none|
|» status|string|false|none|none|
|» updatedAt|string|false|none|none|
|limit|number|true|none|none|
|page|number|true|none|none|

#### Enumerated Values

|Property|Value|
|---|---|
|status|active|
|status|inactive|
|status|draft|

<h2 id="tocS_AdminUpdateCollectionStatusModel">AdminUpdateCollectionStatusModel</h2>
<!-- backwards compatibility -->
<a id="schemaadminupdatecollectionstatusmodel"></a>
<a id="schema_AdminUpdateCollectionStatusModel"></a>
<a id="tocSadminupdatecollectionstatusmodel"></a>
<a id="tocsadminupdatecollectionstatusmodel"></a>

```json
{
  "status": "draft"
}

```

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|status|string|true|none|none|

#### Enumerated Values

|Property|Value|
|---|---|
|status|draft|
|status|active|
|status|archived|

<h2 id="tocS_EditPoolModel">EditPoolModel</h2>
<!-- backwards compatibility -->
<a id="schemaeditpoolmodel"></a>
<a id="schema_EditPoolModel"></a>
<a id="tocSeditpoolmodel"></a>
<a id="tocseditpoolmodel"></a>

```json
{
  "brands": [
    "string"
  ],
  "name": "string",
  "description": "string"
}

```

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|brands|[string]|false|none|none|
|name|string|false|none|none|
|description|string|false|none|none|

<h2 id="tocS_ModulesPayload">ModulesPayload</h2>
<!-- backwards compatibility -->
<a id="schemamodulespayload"></a>
<a id="schema_ModulesPayload"></a>
<a id="tocSmodulespayload"></a>
<a id="tocsmodulespayload"></a>

```json
{
  "total": 0,
  "modules": [
    {
      "area": "string",
      "createdAt": "string",
      "documents": [
        "string"
      ],
      "brandId": "string",
      "__v": 0,
      "name": "string",
      "_id": "string",
      "sku": [
        "string"
      ],
      "simulations": [
        "string"
      ],
      "updatedAt": "string"
    }
  ]
}

```

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|total|number|true|none|none|
|modules|[object]|true|none|none|
|» area|string|false|none|none|
|» createdAt|string|false|none|none|
|» documents|[string]|true|none|none|
|» brandId|string|true|none|none|
|» __v|number|false|none|none|
|» name|string|true|none|none|
|» _id|string|true|none|none|
|» sku|[string]|true|none|none|
|» simulations|[string]|true|none|none|
|» updatedAt|string|false|none|none|

<h2 id="tocS_ListPackagesPayload">ListPackagesPayload</h2>
<!-- backwards compatibility -->
<a id="schemalistpackagespayload"></a>
<a id="schema_ListPackagesPayload"></a>
<a id="tocSlistpackagespayload"></a>
<a id="tocslistpackagespayload"></a>

```json
{
  "total": 0,
  "data": [
    {
      "active": true,
      "expiresAt": "string",
      "poolIds": [
        "string"
      ],
      "skuName": "string",
      "createdAt": "string",
      "isFree": true,
      "collectionIds": [
        "string"
      ],
      "__v": 0,
      "name": "string",
      "_id": "string",
      "skuId": "string",
      "skuCode": "string",
      "updatedAt": "string"
    }
  ],
  "limit": 0,
  "page": 0
}

```

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|total|number|true|none|none|
|data|[object]|true|none|none|
|» active|boolean|false|none|none|
|» expiresAt|string|false|none|none|
|» poolIds|[string]|false|none|none|
|» skuName|string|false|none|none|
|» createdAt|string|false|none|none|
|» isFree|boolean|false|none|none|
|» collectionIds|[string]|false|none|none|
|» __v|number|false|none|none|
|» name|string|false|none|none|
|» _id|string|true|none|none|
|» skuId|string|false|none|none|
|» skuCode|string|false|none|none|
|» updatedAt|string|false|none|none|
|limit|number|true|none|none|
|page|number|true|none|none|

<h2 id="tocS_AddPoolQuestionModel">AddPoolQuestionModel</h2>
<!-- backwards compatibility -->
<a id="schemaaddpoolquestionmodel"></a>
<a id="schema_AddPoolQuestionModel"></a>
<a id="tocSaddpoolquestionmodel"></a>
<a id="tocsaddpoolquestionmodel"></a>

```json
{
  "questionId": "string"
}

```

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|questionId|string|true|none|none|

<h2 id="tocS_NewCommunityUserModel">NewCommunityUserModel</h2>
<!-- backwards compatibility -->
<a id="schemanewcommunityusermodel"></a>
<a id="schema_NewCommunityUserModel"></a>
<a id="tocSnewcommunityusermodel"></a>
<a id="tocsnewcommunityusermodel"></a>

```json
{
  "cognitoId": "string",
  "roleIds": [
    "string"
  ]
}

```

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|cognitoId|string|true|none|none|
|roleIds|[string]|false|none|none|

<h2 id="tocS_CommunityUserPayload">CommunityUserPayload</h2>
<!-- backwards compatibility -->
<a id="schemacommunityuserpayload"></a>
<a id="schema_CommunityUserPayload"></a>
<a id="tocScommunityuserpayload"></a>
<a id="tocscommunityuserpayload"></a>

```json
{
  "lastLogin": "string",
  "createdAt": "string",
  "cognitoId": "string",
  "roleIds": [
    "string"
  ],
  "__v": 0,
  "_id": "string",
  "updatedAt": "string"
}

```

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|lastLogin|string|false|none|none|
|createdAt|string|false|none|none|
|cognitoId|string|true|none|none|
|roleIds|[string]|false|none|none|
|__v|number|false|none|none|
|_id|string|true|none|none|
|updatedAt|string|false|none|none|

<h2 id="tocS_AdminCollectionPayload">AdminCollectionPayload</h2>
<!-- backwards compatibility -->
<a id="schemaadmincollectionpayload"></a>
<a id="schema_AdminCollectionPayload"></a>
<a id="tocSadmincollectionpayload"></a>
<a id="tocsadmincollectionpayload"></a>

```json
{
  "brands": [
    {
      "name": "string"
    }
  ],
  "timed": true,
  "type": "exercise",
  "authorId": "string",
  "brandIds": [
    "string"
  ],
  "sections": [
    {
      "maxAttempts": 0,
      "questions": [
        {
          "questionId": "string",
          "points": {
            "correctPoint": 0,
            "wrongPoint": 0,
            "emptyPoint": 0
          }
        }
      ],
      "rules": {
        "duration": 0,
        "pausable": true,
        "extraTime": [
          0
        ]
      },
      "_id": "string"
    }
  ],
  "tags": [
    "string"
  ],
  "archived": true,
  "createdAt": "string",
  "name": "string",
  "testId": "string",
  "attributes": [
    "string"
  ],
  "_id": "string",
  "status": "draft",
  "updatedAt": "string"
}

```

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|brands|[object]|false|none|none|
|» name|string|false|none|none|
|timed|boolean|false|none|none|
|type|string|false|none|none|
|authorId|string|false|none|none|
|brandIds|[string]|false|none|none|
|sections|[object]|false|none|none|
|» maxAttempts|number|false|none|none|
|» questions|[object]|false|none|none|
|»» questionId|string|false|none|none|
|»» points|object|false|none|none|
|»»» correctPoint|number|false|none|none|
|»»» wrongPoint|number|false|none|none|
|»»» emptyPoint|number|false|none|none|
|» rules|object|false|none|none|
|»» duration|number|false|none|none|
|»» pausable|boolean|false|none|none|
|»» extraTime|[number]|false|none|none|
|» _id|string|true|none|none|
|tags|[string]|false|none|none|
|archived|boolean|false|none|none|
|createdAt|string|false|none|none|
|name|string|false|none|none|
|testId|string|false|none|none|
|attributes|[string]|false|none|none|
|_id|string|true|none|none|
|status|string|false|none|none|
|updatedAt|string|false|none|none|

#### Enumerated Values

|Property|Value|
|---|---|
|type|exercise|
|type|simulation|
|type|diagnosis|
|status|draft|
|status|active|
|status|inactive|

<h2 id="tocS_UpdatePoolStatusModel">UpdatePoolStatusModel</h2>
<!-- backwards compatibility -->
<a id="schemaupdatepoolstatusmodel"></a>
<a id="schema_UpdatePoolStatusModel"></a>
<a id="tocSupdatepoolstatusmodel"></a>
<a id="tocsupdatepoolstatusmodel"></a>

```json
{
  "status": "active"
}

```

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|status|string|true|none|none|

#### Enumerated Values

|Property|Value|
|---|---|
|status|active|
|status|inactive|
|status|draft|

<h2 id="tocS_AdminArchiveCollectionModel">AdminArchiveCollectionModel</h2>
<!-- backwards compatibility -->
<a id="schemaadminarchivecollectionmodel"></a>
<a id="schema_AdminArchiveCollectionModel"></a>
<a id="tocSadminarchivecollectionmodel"></a>
<a id="tocsadminarchivecollectionmodel"></a>

```json
{
  "archived": true
}

```

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|archived|boolean|true|none|none|

<h2 id="tocS_PackagePayload">PackagePayload</h2>
<!-- backwards compatibility -->
<a id="schemapackagepayload"></a>
<a id="schema_PackagePayload"></a>
<a id="tocSpackagepayload"></a>
<a id="tocspackagepayload"></a>

```json
{
  "active": true,
  "expiresAt": "string",
  "poolIds": [
    "string"
  ],
  "skuName": "string",
  "createdAt": "string",
  "isFree": true,
  "collectionIds": [
    "string"
  ],
  "__v": 0,
  "name": "string",
  "_id": "string",
  "skuId": "string",
  "skuCode": "string",
  "updatedAt": "string"
}

```

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|active|boolean|false|none|none|
|expiresAt|string|false|none|none|
|poolIds|[string]|false|none|none|
|skuName|string|false|none|none|
|createdAt|string|false|none|none|
|isFree|boolean|false|none|none|
|collectionIds|[string]|false|none|none|
|__v|number|false|none|none|
|name|string|false|none|none|
|_id|string|true|none|none|
|skuId|string|false|none|none|
|skuCode|string|false|none|none|
|updatedAt|string|false|none|none|

<h2 id="tocS_AdminAddCollectionSectionQuestionModel">AdminAddCollectionSectionQuestionModel</h2>
<!-- backwards compatibility -->
<a id="schemaadminaddcollectionsectionquestionmodel"></a>
<a id="schema_AdminAddCollectionSectionQuestionModel"></a>
<a id="tocSadminaddcollectionsectionquestionmodel"></a>
<a id="tocsadminaddcollectionsectionquestionmodel"></a>

```json
{
  "questionId": "string",
  "points": {
    "correctPoint": 0,
    "wrongPoint": 0,
    "emptyPoint": 0
  }
}

```

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|questionId|string|true|none|none|
|points|object|true|none|none|
|» correctPoint|number|true|none|none|
|» wrongPoint|number|true|none|none|
|» emptyPoint|number|true|none|none|

<h2 id="tocS_BrandsPayload">BrandsPayload</h2>
<!-- backwards compatibility -->
<a id="schemabrandspayload"></a>
<a id="schema_BrandsPayload"></a>
<a id="tocSbrandspayload"></a>
<a id="tocsbrandspayload"></a>

```json
[
  {
    "createdAt": "string",
    "hostname": "string",
    "code": "string",
    "languages": [
      {
        "name": "string",
        "_id": "string",
        "lang": "string"
      }
    ],
    "__v": 0,
    "name": "string",
    "_id": "string",
    "socials": [
      {
        "icon": "string",
        "link": "string",
        "name": "string",
        "_id": "string"
      }
    ],
    "updatedAt": "string"
  }
]

```

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|createdAt|string|false|none|none|
|hostname|string|false|none|none|
|code|string|true|none|none|
|languages|[object]|false|none|none|
|» name|string|true|none|none|
|» _id|string|true|none|none|
|» lang|string|true|none|none|
|__v|number|false|none|none|
|name|string|true|none|none|
|_id|string|true|none|none|
|socials|[object]|false|none|none|
|» icon|string|true|none|none|
|» link|string|true|none|none|
|» name|string|true|none|none|
|» _id|string|true|none|none|
|updatedAt|string|false|none|none|

<h2 id="tocS_Empty">Empty</h2>
<!-- backwards compatibility -->
<a id="schemaempty"></a>
<a id="schema_Empty"></a>
<a id="tocSempty"></a>
<a id="tocsempty"></a>

```json
{}

```

Empty Schema

### Properties

*None*

<h2 id="tocS_NewCommunityRoleModel">NewCommunityRoleModel</h2>
<!-- backwards compatibility -->
<a id="schemanewcommunityrolemodel"></a>
<a id="schema_NewCommunityRoleModel"></a>
<a id="tocSnewcommunityrolemodel"></a>
<a id="tocsnewcommunityrolemodel"></a>

```json
{
  "capabilities": [
    {
      "resource": "string",
      "actions": [
        "string"
      ]
    }
  ],
  "displayName": "string",
  "name": "string",
  "description": "string",
  "rank": 0
}

```

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|capabilities|[object]|false|none|none|
|» resource|string|true|none|none|
|» actions|[string]|true|none|none|
|displayName|string|true|none|none|
|name|string|true|none|none|
|description|string|false|none|none|
|rank|number|true|none|none|

<h2 id="tocS_AdminEditCollectionMetadataModel">AdminEditCollectionMetadataModel</h2>
<!-- backwards compatibility -->
<a id="schemaadmineditcollectionmetadatamodel"></a>
<a id="schema_AdminEditCollectionMetadataModel"></a>
<a id="tocSadmineditcollectionmetadatamodel"></a>
<a id="tocsadmineditcollectionmetadatamodel"></a>

```json
{
  "timed": true,
  "name": "string",
  "tags": [
    "string"
  ]
}

```

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|timed|boolean|false|none|none|
|name|string|false|none|none|
|tags|[string]|false|none|none|

<h2 id="tocS_CommunityRolesPayload">CommunityRolesPayload</h2>
<!-- backwards compatibility -->
<a id="schemacommunityrolespayload"></a>
<a id="schema_CommunityRolesPayload"></a>
<a id="tocScommunityrolespayload"></a>
<a id="tocscommunityrolespayload"></a>

```json
{
  "total": 0,
  "data": [
    {
      "createdAt": "string",
      "capabilities": [
        {
          "resource": "string",
          "actions": [
            "string"
          ]
        }
      ],
      "displayName": "string",
      "__v": 0,
      "name": "string",
      "description": "string",
      "rank": 0,
      "_id": "string",
      "updatedAt": "string"
    }
  ],
  "limit": 0,
  "page": 0
}

```

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|total|number|true|none|none|
|data|[object]|true|none|none|
|» createdAt|string|false|none|none|
|» capabilities|[object]|false|none|none|
|»» resource|string|true|none|none|
|»» actions|[string]|true|none|none|
|» displayName|string|true|none|none|
|» __v|number|false|none|none|
|» name|string|true|none|none|
|» description|string|false|none|none|
|» rank|number|true|none|none|
|» _id|string|true|none|none|
|» updatedAt|string|false|none|none|
|limit|number|true|none|none|
|page|number|true|none|none|

<h2 id="tocS_UpdateQuestionModel">UpdateQuestionModel</h2>
<!-- backwards compatibility -->
<a id="schemaupdatequestionmodel"></a>
<a id="schema_UpdateQuestionModel"></a>
<a id="tocSupdatequestionmodel"></a>
<a id="tocsupdatequestionmodel"></a>

```json
{
  "explanationText": "string",
  "revisor": {
    "id": "string",
    "email": "string",
    "username": "string"
  },
  "subject": {
    "name": "string",
    "_id": "string"
  },
  "author": {
    "id": "string",
    "email": "string",
    "username": "string"
  },
  "language": "it",
  "questionText": "string",
  "explanationImages": [
    "string"
  ],
  "tags": [
    "string"
  ],
  "difficulty": 0,
  "approved": true,
  "draft": true,
  "alternatives": [
    {
      "image": "string",
      "correct": true,
      "text": "string"
    }
  ],
  "topic": {
    "name": "string",
    "_id": "string"
  },
  "questionImages": [
    "string"
  ]
}

```

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|explanationText|string|false|none|none|
|revisor|object|false|none|none|
|» id|string|false|none|none|
|» email|string|false|none|none|
|» username|string|false|none|none|
|subject|object|false|none|none|
|» name|string|false|none|none|
|» _id|string|false|none|none|
|author|object|false|none|none|
|» id|string|false|none|none|
|» email|string|false|none|none|
|» username|string|false|none|none|
|language|string|false|none|none|
|questionText|string|false|none|none|
|explanationImages|[string]|false|none|none|
|tags|[string]|false|none|none|
|difficulty|number|false|none|none|
|approved|boolean|false|none|none|
|draft|boolean|false|none|none|
|alternatives|[object]|false|none|none|
|» image|string|false|none|none|
|» correct|boolean|true|none|none|
|» text|string|true|none|none|
|topic|object|false|none|none|
|» name|string|false|none|none|
|» _id|string|false|none|none|
|questionImages|[string]|false|none|none|

#### Enumerated Values

|Property|Value|
|---|---|
|language|it|
|language|en|

<h2 id="tocS_NewPoolModel">NewPoolModel</h2>
<!-- backwards compatibility -->
<a id="schemanewpoolmodel"></a>
<a id="schema_NewPoolModel"></a>
<a id="tocSnewpoolmodel"></a>
<a id="tocsnewpoolmodel"></a>

```json
{
  "brands": [
    "string"
  ],
  "name": "string",
  "description": "string",
  "status": "active"
}

```

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|brands|[string]|true|none|none|
|name|string|true|none|none|
|description|string|false|none|none|
|status|string|false|none|none|

#### Enumerated Values

|Property|Value|
|---|---|
|status|active|
|status|inactive|
|status|draft|

<h2 id="tocS_AdminNewCollectionModel">AdminNewCollectionModel</h2>
<!-- backwards compatibility -->
<a id="schemaadminnewcollectionmodel"></a>
<a id="schema_AdminNewCollectionModel"></a>
<a id="tocSadminnewcollectionmodel"></a>
<a id="tocsadminnewcollectionmodel"></a>

```json
{
  "timed": true,
  "name": "string",
  "testId": "string",
  "type": "simulation",
  "brandIds": [
    "string"
  ],
  "sections": [
    {
      "maxAttempts": 0,
      "questions": [
        {
          "questionId": "string",
          "points": {
            "correctPoint": 0,
            "wrongPoint": 0,
            "emptyPoint": 0
          }
        }
      ],
      "rules": {
        "duration": 0,
        "pausable": true,
        "extraTime": [
          0
        ]
      }
    }
  ],
  "tags": [
    "string"
  ]
}

```

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|timed|boolean|true|none|none|
|name|string|true|none|none|
|testId|string|true|none|none|
|type|string|true|none|none|
|brandIds|[string]|true|none|none|
|sections|[object]|true|none|none|
|» maxAttempts|integer|false|none|none|
|» questions|[object]|true|none|none|
|»» questionId|string|true|none|none|
|»» points|object|true|none|none|
|»»» correctPoint|number|true|none|none|
|»»» wrongPoint|number|true|none|none|
|»»» emptyPoint|number|true|none|none|
|» rules|object|true|none|none|
|»» duration|number|false|none|none|
|»» pausable|boolean|true|none|none|
|»» extraTime|[number]|false|none|none|
|tags|[string]|false|none|none|

#### Enumerated Values

|Property|Value|
|---|---|
|type|simulation|
|type|exercise|

<h2 id="tocS_NewSkuModel">NewSkuModel</h2>
<!-- backwards compatibility -->
<a id="schemanewskumodel"></a>
<a id="schema_NewSkuModel"></a>
<a id="tocSnewskumodel"></a>
<a id="tocsnewskumodel"></a>

```json
{
  "code": "string",
  "brands": [
    {
      "name": "string",
      "id": "string"
    }
  ],
  "name": "string",
  "url": "string"
}

```

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|code|string|true|none|none|
|brands|[object]|true|none|none|
|» name|string|true|none|none|
|» id|string|true|none|none|
|name|string|true|none|none|
|url|string|false|none|none|

<h2 id="tocS_QuestionPayload">QuestionPayload</h2>
<!-- backwards compatibility -->
<a id="schemaquestionpayload"></a>
<a id="schema_QuestionPayload"></a>
<a id="tocSquestionpayload"></a>
<a id="tocsquestionpayload"></a>

```json
{
  "versionCount": 0,
  "subject": {
    "name": "string"
  },
  "language": "it",
  "type": "completion",
  "subjectId": "string",
  "questionText": "string",
  "revisorId": "string",
  "explanationImages": [
    "string"
  ],
  "archived": true,
  "createdAt": "string",
  "approved": true,
  "stats": {
    "correct": 0,
    "answersCount": [
      0
    ],
    "empty": 0,
    "wrong": 0
  },
  "__v": 0,
  "completionAnswers": [
    "string"
  ],
  "subtopic": {
    "name": "string"
  },
  "updatedAt": "string",
  "explanationText": "string",
  "revisor": {
    "email": "string"
  },
  "author": {
    "email": "string"
  },
  "authorId": "string",
  "tags": [
    "string"
  ],
  "difficulty": 0,
  "topicId": "string",
  "topic": {
    "name": "string"
  },
  "alternatives": [
    {
      "image": "string",
      "correct": true,
      "text": "string"
    }
  ],
  "subtopicId": "string",
  "_id": "string",
  "questionImages": [
    "string"
  ],
  "status": "draft"
}

```

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|versionCount|number|true|none|none|
|subject|object|false|none|none|
|» name|string|true|none|none|
|language|string|true|none|none|
|type|string|true|none|none|
|subjectId|string|true|none|none|
|questionText|string|true|none|none|
|revisorId|string|false|none|none|
|explanationImages|[string]|false|none|none|
|archived|boolean|true|none|none|
|createdAt|string|true|none|none|
|approved|boolean|true|none|none|
|stats|object|false|none|none|
|» correct|number|false|none|none|
|» answersCount|[number]|false|none|none|
|» empty|number|false|none|none|
|» wrong|number|false|none|none|
|__v|number|false|none|none|
|completionAnswers|[string]|false|none|none|
|subtopic|object|false|none|none|
|» name|string|false|none|none|
|updatedAt|string|true|none|none|
|explanationText|string|false|none|none|
|revisor|object|false|none|none|
|» email|string|false|none|none|
|author|object|false|none|none|
|» email|string|true|none|none|
|authorId|string|true|none|none|
|tags|[string]|false|none|none|
|difficulty|number|true|none|none|
|topicId|string|true|none|none|
|topic|object|false|none|none|
|» name|string|true|none|none|
|alternatives|[object]|false|none|none|
|» image|string|false|none|none|
|» correct|boolean|true|none|none|
|» text|string|false|none|none|
|subtopicId|string|false|none|none|
|_id|string|true|none|none|
|questionImages|[string]|false|none|none|
|status|string|true|none|none|

#### Enumerated Values

|Property|Value|
|---|---|
|language|it|
|language|en|
|type|completion|
|type|alternative|
|status|draft|
|status|in_review|
|status|approved|
|status|rejected|

<h2 id="tocS_SearchQuestionsModel">SearchQuestionsModel</h2>
<!-- backwards compatibility -->
<a id="schemasearchquestionsmodel"></a>
<a id="schema_SearchQuestionsModel"></a>
<a id="tocSsearchquestionsmodel"></a>
<a id="tocssearchquestionsmodel"></a>

```json
{
  "is_open": true,
  "language": "it",
  "includes": "string",
  "authorId": "string",
  "createdAfter": "string",
  "subjectId": "string",
  "simulations": [
    "string"
  ],
  "difficulty": 0,
  "topicId": "string",
  "search": "string",
  "perPage": 0,
  "page": 0,
  "id": "string",
  "createdBefore": "string"
}

```

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|is_open|boolean|false|none|none|
|language|string|false|none|none|
|includes|string|false|none|none|
|authorId|string|false|none|none|
|createdAfter|string|false|none|none|
|subjectId|string|false|none|none|
|simulations|[string]|false|none|none|
|difficulty|number|false|none|none|
|topicId|string|false|none|none|
|search|string|false|none|none|
|perPage|number|false|none|none|
|page|number|false|none|none|
|id|string|false|none|none|
|createdBefore|string|false|none|none|

#### Enumerated Values

|Property|Value|
|---|---|
|language|it|
|language|en|

<h2 id="tocS_QuestionVersionPayload">QuestionVersionPayload</h2>
<!-- backwards compatibility -->
<a id="schemaquestionversionpayload"></a>
<a id="schema_QuestionVersionPayload"></a>
<a id="tocSquestionversionpayload"></a>
<a id="tocsquestionversionpayload"></a>

```json
{
  "questionId": "string",
  "versionCounter": 0,
  "__v": 0,
  "_id": "string",
  "editMetadata": {
    "editor": {
      "id": "string",
      "email": "string",
      "username": "string"
    },
    "createdAt": "string",
    "changeReason": "string"
  },
  "snapshot": {
    "subject": {
      "name": "string"
    },
    "language": "it",
    "type": "completion",
    "subjectId": "string",
    "questionText": "string",
    "revisorId": "string",
    "explanationImages": [
      "string"
    ],
    "archived": true,
    "createdAt": "string",
    "approved": true,
    "stats": {
      "correct": 0,
      "answersCount": [
        0
      ],
      "empty": 0,
      "wrong": 0
    },
    "completionAnswers": [
      "string"
    ],
    "subtopic": {
      "name": "string"
    },
    "updatedAt": "string",
    "explanationText": "string",
    "revisor": {
      "email": "string"
    },
    "author": {
      "email": "string"
    },
    "authorId": "string",
    "tags": [
      "string"
    ],
    "difficulty": 0,
    "topicId": "string",
    "topic": {
      "name": "string"
    },
    "alternatives": [
      {
        "image": "string",
        "correct": true,
        "text": "string"
      }
    ],
    "subtopicId": "string",
    "questionImages": [
      "string"
    ],
    "status": "string"
  }
}

```

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|questionId|string|true|none|none|
|versionCounter|number|true|none|none|
|__v|number|false|none|none|
|_id|string|true|none|none|
|editMetadata|object|false|none|none|
|» editor|object|false|none|none|
|»» id|string|true|none|none|
|»» email|string|false|none|none|
|»» username|string|false|none|none|
|» createdAt|string|true|none|none|
|» changeReason|string|false|none|none|
|snapshot|object|false|none|none|
|» subject|object|false|none|none|
|»» name|string|true|none|none|
|» language|string|true|none|none|
|» type|string|true|none|none|
|» subjectId|string|true|none|none|
|» questionText|string|true|none|none|
|» revisorId|string|false|none|none|
|» explanationImages|[string]|false|none|none|
|» archived|boolean|false|none|none|
|» createdAt|string|true|none|none|
|» approved|boolean|false|none|none|
|» stats|object|false|none|none|
|»» correct|number|false|none|none|
|»» answersCount|[number]|false|none|none|
|»» empty|number|false|none|none|
|»» wrong|number|false|none|none|
|» completionAnswers|[string]|false|none|none|
|» subtopic|object|false|none|none|
|»» name|string|false|none|none|
|» updatedAt|string|true|none|none|
|» explanationText|string|false|none|none|
|» revisor|object|false|none|none|
|»» email|string|false|none|none|
|» author|object|false|none|none|
|»» email|string|true|none|none|
|» authorId|string|true|none|none|
|» tags|[string]|false|none|none|
|» difficulty|number|true|none|none|
|» topicId|string|true|none|none|
|» topic|object|false|none|none|
|»» name|string|true|none|none|
|» alternatives|[object]|false|none|none|
|»» image|string|false|none|none|
|»» correct|boolean|true|none|none|
|»» text|string|false|none|none|
|» subtopicId|string|false|none|none|
|» questionImages|[string]|false|none|none|
|» status|string|false|none|none|

#### Enumerated Values

|Property|Value|
|---|---|
|language|it|
|language|en|
|type|completion|
|type|alternative|

<h2 id="tocS_AddTopicMethod">AddTopicMethod</h2>
<!-- backwards compatibility -->
<a id="schemaaddtopicmethod"></a>
<a id="schema_AddTopicMethod"></a>
<a id="tocSaddtopicmethod"></a>
<a id="tocsaddtopicmethod"></a>

```json
{
  "name": "string"
}

```

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|name|string|true|none|none|

<h2 id="tocS_UpdateModuleModel">UpdateModuleModel</h2>
<!-- backwards compatibility -->
<a id="schemaupdatemodulemodel"></a>
<a id="schema_UpdateModuleModel"></a>
<a id="tocSupdatemodulemodel"></a>
<a id="tocsupdatemodulemodel"></a>

```json
{
  "documents": [
    "string"
  ],
  "name": "string",
  "sku": [
    "string"
  ],
  "simulations": [
    "string"
  ]
}

```

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|documents|[string]|true|none|none|
|name|string|true|none|none|
|sku|[string]|true|none|none|
|simulations|[string]|true|none|none|

<h2 id="tocS_AdminCollectionStatsPayload">AdminCollectionStatsPayload</h2>
<!-- backwards compatibility -->
<a id="schemaadmincollectionstatspayload"></a>
<a id="schema_AdminCollectionStatsPayload"></a>
<a id="tocSadmincollectionstatspayload"></a>
<a id="tocsadmincollectionstatspayload"></a>

```json
{
  "totalCorrect": 0,
  "totalAttempts": 0,
  "totalWrong": 0,
  "totalEmpty": 0,
  "averageScore": 0
}

```

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|totalCorrect|number|true|none|none|
|totalAttempts|number|true|none|none|
|totalWrong|number|true|none|none|
|totalEmpty|number|true|none|none|
|averageScore|number|true|none|none|

<h2 id="tocS_AdminEditTestModel">AdminEditTestModel</h2>
<!-- backwards compatibility -->
<a id="schemaadminedittestmodel"></a>
<a id="schema_AdminEditTestModel"></a>
<a id="tocSadminedittestmodel"></a>
<a id="tocsadminedittestmodel"></a>

```json
{
  "syllabus": [
    {
      "baseTopic": "string",
      "baseSubtopic": "string",
      "displayTopic": "string",
      "displaySubtopic": "string",
      "baseSubject": "string",
      "displaySubject": "string"
    }
  ],
  "brands": [
    {
      "name": "string",
      "id": "string"
    }
  ],
  "year": 0,
  "name": "string",
  "defaultScores": {
    "correct": 0,
    "empty": 0,
    "wrong": 0
  }
}

```

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|syllabus|[object]|false|none|none|
|» baseTopic|string|true|none|none|
|» baseSubtopic|string|false|none|none|
|» displayTopic|string|true|none|none|
|» displaySubtopic|string|false|none|none|
|» baseSubject|string|true|none|none|
|» displaySubject|string|true|none|none|
|brands|[object]|false|none|none|
|» name|string|true|none|none|
|» id|string|true|none|none|
|year|number|false|none|none|
|name|string|false|none|none|
|defaultScores|object|false|none|none|
|» correct|number|true|none|none|
|» empty|number|true|none|none|
|» wrong|number|true|none|none|

<h2 id="tocS_CommunityUsersPayload">CommunityUsersPayload</h2>
<!-- backwards compatibility -->
<a id="schemacommunityuserspayload"></a>
<a id="schema_CommunityUsersPayload"></a>
<a id="tocScommunityuserspayload"></a>
<a id="tocscommunityuserspayload"></a>

```json
{
  "total": 0,
  "communityUsers": [
    {
      "lastLogin": "string",
      "createdAt": "string",
      "cognitoId": "string",
      "roleIds": [
        "string"
      ],
      "__v": 0,
      "_id": "string",
      "updatedAt": "string"
    }
  ]
}

```

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|total|number|true|none|none|
|communityUsers|[object]|true|none|none|
|» lastLogin|string|false|none|none|
|» createdAt|string|false|none|none|
|» cognitoId|string|true|none|none|
|» roleIds|[string]|false|none|none|
|» __v|number|false|none|none|
|» _id|string|true|none|none|
|» updatedAt|string|false|none|none|

<h2 id="tocS_NewQuestionVersionModel">NewQuestionVersionModel</h2>
<!-- backwards compatibility -->
<a id="schemanewquestionversionmodel"></a>
<a id="schema_NewQuestionVersionModel"></a>
<a id="tocSnewquestionversionmodel"></a>
<a id="tocsnewquestionversionmodel"></a>

```json
{
  "explanationText": "string",
  "changeReason": "string",
  "alternatives": [
    {
      "image": "string",
      "correct": true,
      "text": "string"
    }
  ],
  "questionImages": [
    "string"
  ],
  "questionText": "string",
  "explanationImages": [
    "string"
  ]
}

```

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|explanationText|string|true|none|none|
|changeReason|string|false|none|none|
|alternatives|[object]|true|none|none|
|» image|string|false|none|none|
|» correct|boolean|true|none|none|
|» text|string|true|none|none|
|questionImages|[string]|true|none|none|
|questionText|string|true|none|none|
|explanationImages|[string]|true|none|none|

<h2 id="tocS_ArchiveQuestionModel">ArchiveQuestionModel</h2>
<!-- backwards compatibility -->
<a id="schemaarchivequestionmodel"></a>
<a id="schema_ArchiveQuestionModel"></a>
<a id="tocSarchivequestionmodel"></a>
<a id="tocsarchivequestionmodel"></a>

```json
{
  "archived": true
}

```

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|archived|boolean|true|none|none|

<h2 id="tocS_SubjectsPayload">SubjectsPayload</h2>
<!-- backwards compatibility -->
<a id="schemasubjectspayload"></a>
<a id="schema_SubjectsPayload"></a>
<a id="tocSsubjectspayload"></a>
<a id="tocssubjectspayload"></a>

```json
{
  "total": 0,
  "data": [
    {
      "createdAt": "string",
      "topics": [
        {
          "name": "string",
          "subtopics": [
            {
              "name": "string",
              "_id": "string"
            }
          ],
          "_id": "string"
        }
      ],
      "__v": 0,
      "name": "string",
      "style": {
        "light": "string",
        "icon": "string",
        "primary": "string"
      },
      "_id": "string",
      "updatedAt": "string"
    }
  ],
  "limit": 0,
  "page": 0
}

```

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|total|number|true|none|none|
|data|[object]|true|none|none|
|» createdAt|string|false|none|none|
|» topics|[object]|false|none|none|
|»» name|string|true|none|none|
|»» subtopics|[object]|false|none|none|
|»»» name|string|true|none|none|
|»»» _id|string|true|none|none|
|»» _id|string|true|none|none|
|» __v|number|false|none|none|
|» name|string|true|none|none|
|» style|object|false|none|none|
|»» light|string|false|none|none|
|»» icon|string|false|none|none|
|»» primary|string|false|none|none|
|» _id|string|true|none|none|
|» updatedAt|string|false|none|none|
|limit|number|true|none|none|
|page|number|true|none|none|

<h2 id="tocS_InsertSubjectModel">InsertSubjectModel</h2>
<!-- backwards compatibility -->
<a id="schemainsertsubjectmodel"></a>
<a id="schema_InsertSubjectModel"></a>
<a id="tocSinsertsubjectmodel"></a>
<a id="tocsinsertsubjectmodel"></a>

```json
{
  "name": "string"
}

```

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|name|string|true|none|none|

<h2 id="tocS_QuestionsPayload">QuestionsPayload</h2>
<!-- backwards compatibility -->
<a id="schemaquestionspayload"></a>
<a id="schema_QuestionsPayload"></a>
<a id="tocSquestionspayload"></a>
<a id="tocsquestionspayload"></a>

```json
{
  "total": 0,
  "questions": [
    {
      "versionCount": 0,
      "notes": "string",
      "subject": {
        "name": "string"
      },
      "language": "it",
      "type": "completion",
      "subjectId": "string",
      "questionText": "string",
      "revisorId": "string",
      "explanationImages": [
        "string"
      ],
      "archived": true,
      "createdAt": "string",
      "approved": true,
      "stats": {
        "correct": 0,
        "answersCount": [
          0
        ],
        "empty": 0,
        "wrong": 0
      },
      "completionAnswers": [
        "string"
      ],
      "subtopic": {
        "name": "string"
      },
      "updatedAt": "string",
      "explanationText": "string",
      "revisor": {
        "email": "string"
      },
      "author": {
        "email": "string"
      },
      "authorId": "string",
      "favourite": true,
      "tags": [
        "string"
      ],
      "difficulty": 0,
      "topicId": "string",
      "topic": {
        "name": "string"
      },
      "alternatives": [
        {
          "image": "string",
          "correct": true,
          "text": "string"
        }
      ],
      "subtopicId": "string",
      "_id": "string",
      "questionImages": [
        "string"
      ],
      "status": "draft"
    }
  ]
}

```

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|total|number|true|none|none|
|questions|[object]|true|none|none|
|» versionCount|number|true|none|none|
|» notes|string|false|none|none|
|» subject|object|false|none|none|
|»» name|string|true|none|none|
|» language|string|true|none|none|
|» type|string|true|none|none|
|» subjectId|string|true|none|none|
|» questionText|string|true|none|none|
|» revisorId|string|false|none|none|
|» explanationImages|[string]|false|none|none|
|» archived|boolean|true|none|none|
|» createdAt|string|true|none|none|
|» approved|boolean|true|none|none|
|» stats|object|false|none|none|
|»» correct|number|false|none|none|
|»» answersCount|[number]|false|none|none|
|»» empty|number|false|none|none|
|»» wrong|number|false|none|none|
|» completionAnswers|[string]|false|none|none|
|» subtopic|object|false|none|none|
|»» name|string|false|none|none|
|» updatedAt|string|true|none|none|
|» explanationText|string|false|none|none|
|» revisor|object|false|none|none|
|»» email|string|false|none|none|
|» author|object|false|none|none|
|»» email|string|true|none|none|
|» authorId|string|true|none|none|
|» favourite|boolean|false|none|none|
|» tags|[string]|false|none|none|
|» difficulty|number|true|none|none|
|» topicId|string|true|none|none|
|» topic|object|false|none|none|
|»» name|string|true|none|none|
|» alternatives|[object]|false|none|none|
|»» image|string|false|none|none|
|»» correct|boolean|true|none|none|
|»» text|string|false|none|none|
|» subtopicId|string|false|none|none|
|» _id|string|true|none|none|
|» questionImages|[string]|false|none|none|
|» status|string|true|none|none|

#### Enumerated Values

|Property|Value|
|---|---|
|language|it|
|language|en|
|type|completion|
|type|alternative|
|status|draft|
|status|in_review|
|status|approved|
|status|rejected|

<h2 id="tocS_SyllabiPayload">SyllabiPayload</h2>
<!-- backwards compatibility -->
<a id="schemasyllabipayload"></a>
<a id="schema_SyllabiPayload"></a>
<a id="tocSsyllabipayload"></a>
<a id="tocssyllabipayload"></a>

```json
{
  "total": 0,
  "syllabi": [
    {
      "createdAt": "string",
      "mapping": [
        {
          "displayTopic": "string",
          "displaySubtopic": "string",
          "baseTopicId": "string",
          "displaySubject": "string",
          "baseSubtopicId": "string",
          "baseSubjectId": "string"
        }
      ],
      "brandId": "string",
      "__v": 0,
      "testYear": 0,
      "_id": "string",
      "testName": "string",
      "updatedAt": "string"
    }
  ]
}

```

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|total|number|true|none|none|
|syllabi|[object]|true|none|none|
|» createdAt|string|false|none|none|
|» mapping|[object]|true|none|none|
|»» displayTopic|string|true|none|none|
|»» displaySubtopic|string|false|none|none|
|»» baseTopicId|string|true|none|none|
|»» displaySubject|string|true|none|none|
|»» baseSubtopicId|string|false|none|none|
|»» baseSubjectId|string|true|none|none|
|» brandId|string|true|none|none|
|» __v|number|false|none|none|
|» testYear|number|true|none|none|
|» _id|string|true|none|none|
|» testName|string|true|none|none|
|» updatedAt|string|false|none|none|

<h2 id="tocS_NewModuleModel">NewModuleModel</h2>
<!-- backwards compatibility -->
<a id="schemanewmodulemodel"></a>
<a id="schema_NewModuleModel"></a>
<a id="tocSnewmodulemodel"></a>
<a id="tocsnewmodulemodel"></a>

```json
{
  "documents": [
    "string"
  ],
  "name": "string",
  "sku": [
    "string"
  ],
  "simulations": [
    "string"
  ]
}

```

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|documents|[string]|true|none|none|
|name|string|true|none|none|
|sku|[string]|true|none|none|
|simulations|[string]|true|none|none|

<h2 id="tocS_UpdateSubtopicMethod">UpdateSubtopicMethod</h2>
<!-- backwards compatibility -->
<a id="schemaupdatesubtopicmethod"></a>
<a id="schema_UpdateSubtopicMethod"></a>
<a id="tocSupdatesubtopicmethod"></a>
<a id="tocsupdatesubtopicmethod"></a>

```json
{
  "name": "string"
}

```

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|name|string|true|none|none|

<h2 id="tocS_SkuPayload">SkuPayload</h2>
<!-- backwards compatibility -->
<a id="schemaskupayload"></a>
<a id="schema_SkuPayload"></a>
<a id="tocSskupayload"></a>
<a id="tocsskupayload"></a>

```json
{
  "createdAt": "string",
  "code": "string",
  "brands": [
    {
      "name": "string",
      "id": "string"
    }
  ],
  "__v": 0,
  "name": "string",
  "_id": "string",
  "url": "string",
  "updatedAt": "string"
}

```

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|createdAt|string|false|none|none|
|code|string|true|none|none|
|brands|[object]|false|none|none|
|» name|string|true|none|none|
|» id|string|true|none|none|
|__v|number|false|none|none|
|name|string|true|none|none|
|_id|string|true|none|none|
|url|string|false|none|none|
|updatedAt|string|false|none|none|

<h2 id="tocS_ListPoolQuestionsPayload">ListPoolQuestionsPayload</h2>
<!-- backwards compatibility -->
<a id="schemalistpoolquestionspayload"></a>
<a id="schema_ListPoolQuestionsPayload"></a>
<a id="tocSlistpoolquestionspayload"></a>
<a id="tocslistpoolquestionspayload"></a>

```json
{
  "total": 0,
  "data": [
    {
      "addedAt": "string",
      "questionId": "string",
      "subject": {
        "name": "string"
      },
      "addedBy": "string",
      "language": "it",
      "type": "completion",
      "subjectId": "string",
      "difficulty": 0,
      "topicId": "string",
      "__v": 0,
      "poolId": "string",
      "topic": {
        "name": "string"
      },
      "subtopicId": "string",
      "_id": "string",
      "subtopic": {
        "name": "string"
      }
    }
  ],
  "limit": 0,
  "page": 0
}

```

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|total|number|true|none|none|
|data|[object]|true|none|none|
|» addedAt|string|false|none|none|
|» questionId|string|true|none|none|
|» subject|object|false|none|none|
|»» name|string|true|none|none|
|» addedBy|string|true|none|none|
|» language|string|true|none|none|
|» type|string|true|none|none|
|» subjectId|string|true|none|none|
|» difficulty|number|false|none|none|
|» topicId|string|false|none|none|
|» __v|number|false|none|none|
|» poolId|string|true|none|none|
|» topic|object|false|none|none|
|»» name|string|false|none|none|
|» subtopicId|string|false|none|none|
|» _id|string|true|none|none|
|» subtopic|object|false|none|none|
|»» name|string|false|none|none|
|limit|number|true|none|none|
|page|number|true|none|none|

#### Enumerated Values

|Property|Value|
|---|---|
|language|it|
|language|en|
|type|completion|
|type|alternative|

<h2 id="tocS_EditSkuModel">EditSkuModel</h2>
<!-- backwards compatibility -->
<a id="schemaeditskumodel"></a>
<a id="schema_EditSkuModel"></a>
<a id="tocSeditskumodel"></a>
<a id="tocseditskumodel"></a>

```json
{
  "code": "string",
  "brands": [
    {
      "name": "string",
      "id": "string"
    }
  ],
  "name": "string",
  "url": "string"
}

```

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|code|string|false|none|none|
|brands|[object]|false|none|none|
|» name|string|true|none|none|
|» id|string|true|none|none|
|name|string|false|none|none|
|url|string|false|none|none|

<h2 id="tocS_PoolPayload">PoolPayload</h2>
<!-- backwards compatibility -->
<a id="schemapoolpayload"></a>
<a id="schema_PoolPayload"></a>
<a id="tocSpoolpayload"></a>
<a id="tocspoolpayload"></a>

```json
{
  "totalQuestions": 0,
  "createdAt": "string",
  "questionCountBySubject": [
    {
      "count": 0,
      "subjectId": "string",
      "subjectName": "string"
    }
  ],
  "brands": [
    "string"
  ],
  "questionCountByTopic": [
    {
      "topicId": "string",
      "count": 0,
      "topicName": "string"
    }
  ],
  "name": "string",
  "description": "string",
  "attributes": [
    "string"
  ],
  "_id": "string",
  "status": "active",
  "updatedAt": "string"
}

```

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|totalQuestions|number|false|none|none|
|createdAt|string|false|none|none|
|questionCountBySubject|[object]|false|none|none|
|» count|number|false|none|none|
|» subjectId|string|false|none|none|
|» subjectName|string|false|none|none|
|brands|[string]|false|none|none|
|questionCountByTopic|[object]|false|none|none|
|» topicId|string|false|none|none|
|» count|number|false|none|none|
|» topicName|string|false|none|none|
|name|string|false|none|none|
|description|string|false|none|none|
|attributes|[string]|false|none|none|
|_id|string|true|none|none|
|status|string|false|none|none|
|updatedAt|string|false|none|none|

#### Enumerated Values

|Property|Value|
|---|---|
|status|active|
|status|inactive|
|status|draft|

<h2 id="tocS_SyllabusPayload">SyllabusPayload</h2>
<!-- backwards compatibility -->
<a id="schemasyllabuspayload"></a>
<a id="schema_SyllabusPayload"></a>
<a id="tocSsyllabuspayload"></a>
<a id="tocssyllabuspayload"></a>

```json
{
  "createdAt": "string",
  "mapping": [
    {
      "displayTopic": "string",
      "displaySubtopic": "string",
      "baseTopicId": "string",
      "displaySubject": "string",
      "baseSubtopicId": "string",
      "baseSubjectId": "string"
    }
  ],
  "brandId": "string",
  "__v": 0,
  "testYear": 0,
  "_id": "string",
  "testName": "string",
  "updatedAt": "string"
}

```

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|createdAt|string|false|none|none|
|mapping|[object]|true|none|none|
|» displayTopic|string|true|none|none|
|» displaySubtopic|string|false|none|none|
|» baseTopicId|string|true|none|none|
|» displaySubject|string|true|none|none|
|» baseSubtopicId|string|false|none|none|
|» baseSubjectId|string|true|none|none|
|brandId|string|true|none|none|
|__v|number|false|none|none|
|testYear|number|true|none|none|
|_id|string|true|none|none|
|testName|string|true|none|none|
|updatedAt|string|false|none|none|

<h2 id="tocS_AdminListCollectionsPayload">AdminListCollectionsPayload</h2>
<!-- backwards compatibility -->
<a id="schemaadminlistcollectionspayload"></a>
<a id="schema_AdminListCollectionsPayload"></a>
<a id="tocSadminlistcollectionspayload"></a>
<a id="tocsadminlistcollectionspayload"></a>

```json
{
  "total": 0,
  "data": [
    {
      "brands": [
        {
          "name": "string"
        }
      ],
      "timed": true,
      "type": "exercise",
      "authorId": "string",
      "brandIds": [
        "string"
      ],
      "sections": [
        {
          "maxAttempts": 0,
          "questions": [
            {
              "questionId": "string",
              "points": {
                "correctPoint": 0,
                "wrongPoint": 0,
                "emptyPoint": 0
              }
            }
          ],
          "rules": {
            "duration": 0,
            "pausable": true,
            "extraTime": [
              0
            ]
          },
          "_id": "string"
        }
      ],
      "tags": [
        "string"
      ],
      "archived": true,
      "createdAt": "string",
      "name": "string",
      "testId": "string",
      "attributes": [
        "string"
      ],
      "_id": "string",
      "status": "draft",
      "updatedAt": "string"
    }
  ],
  "limit": 0,
  "page": 0
}

```

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|total|number|true|none|none|
|data|[object]|true|none|none|
|» brands|[object]|false|none|none|
|»» name|string|false|none|none|
|» timed|boolean|false|none|none|
|» type|string|false|none|none|
|» authorId|string|false|none|none|
|» brandIds|[string]|false|none|none|
|» sections|[object]|false|none|none|
|»» maxAttempts|number|false|none|none|
|»» questions|[object]|false|none|none|
|»»» questionId|string|false|none|none|
|»»» points|object|false|none|none|
|»»»» correctPoint|number|false|none|none|
|»»»» wrongPoint|number|false|none|none|
|»»»» emptyPoint|number|false|none|none|
|»» rules|object|false|none|none|
|»»» duration|number|false|none|none|
|»»» pausable|boolean|false|none|none|
|»»» extraTime|[number]|false|none|none|
|»» _id|string|true|none|none|
|» tags|[string]|false|none|none|
|» archived|boolean|false|none|none|
|» createdAt|string|false|none|none|
|» name|string|false|none|none|
|» testId|string|false|none|none|
|» attributes|[string]|false|none|none|
|» _id|string|true|none|none|
|» status|string|false|none|none|
|» updatedAt|string|false|none|none|
|limit|number|true|none|none|
|page|number|true|none|none|

#### Enumerated Values

|Property|Value|
|---|---|
|type|exercise|
|type|simulation|
|type|diagnosis|
|status|draft|
|status|active|
|status|inactive|

