# JSON ADAPTER
- [JSON ADAPTER](#json-adapter)
  - [이건 뭐죠?](#%EC%9D%B4%EA%B1%B4-%EB%AD%90%EC%A3%A0)
  - [현재까지 지원하는 언어](#%ED%98%84%EC%9E%AC%EA%B9%8C%EC%A7%80-%EC%A7%80%EC%9B%90%ED%95%98%EB%8A%94-%EC%96%B8%EC%96%B4)
  - [종속성](#%EC%A2%85%EC%86%8D%EC%84%B1)
- [사용법](#%EC%82%AC%EC%9A%A9%EB%B2%95)
  - [GET](#get)
  - [POST](#post)
  - [PUT](#put)
  - [DELETE](#delete)
  - [FILTER](#filter)
  - [PROMISE](#promise)
  - [FILE](#file)
  - [FILL](#fill)
  - [FORMAT](#format)
- [보완점](#%EB%B3%B4%EC%99%84%EC%A0%90)

## 이건 뭐죠?
* Client단에서 Backend Language에 종속되지 않고 하나의 JavaScript 소스만으로 Database까지를 다룰 수 있습니다.
* ES5 이하의 자잘한 홈페이지 튜닝 이슈를 빠르게 쳐낼 수 있습니다.
* Frontend - Backend를 디자이너도 혼자 처리할 수 있게 하는 게 목적입니다.
* 템플릿 엔진과 함께라면 더 빠른 개발 속도를 낼 수 있습니다.
* Mybatis의 형식을 차용해 JS와 XML에 쿼리만 넣으면 됩니다.

## 현재까지 지원하는 언어
* PHP (완벽한 호환)
* Classic ASP (프로미스 기능 없음)
* .NET (일반적인 쿼리 호출 기능)
* JSP (일반적인 쿼리 호출 기능)

## 종속성
jQuery > 1.9

# 사용법
db라는 전역 namespace를 사용합니다.
모든 Request는 [jQuery deferred Object](https://api.jquery.com/jquery.deferred/)를 반환합니다.

## GET
이 메소드는 SELECT 쿼리만 실행 가능합니다.

``` js
db.get({
  name: '',
  param: [],
  paging: true
})
.then(function(response){
  console.log(response);
});

// response
```

## POST
이 메소드는 INSERT 쿼리만 실행 가능합니다.

``` js
db.post({
  name: '',
  param: [],
})
.then(function(response) {
  console.log(response);
});

// response
```

## PUT
이 메소드는 UPDATE 쿼리만 실행 가능합니다.

``` js
db.put({
  name: '',
  param: [],
})
.then(function(response) {
  console.log(response);
});

// response
```

## DELETE
이 메소드는 DELETE 쿼리만 실행 가능합니다.

``` js
db.delete({
  name: '',
  param: [],
})
.then(function(response) {
  console.log(response);
});

// response
```

## FILTER
이 메소드는 쿼리에 조건을 추가합니다.
중첩으로 사용이 가능합니다.

``` js
db.filter('created_at', 'lt', Date.now(), 'DATE')
db.filter('code', 'eq', code)
db.filter('content', 'like', content)

// get, post 등의 쿼리 실행 메소드가 실행되면 filter 큐는 초기화됩니다
db.get({
  name: '',
  param: []
})
.then(function(response) {

})
```

## PROMISE
비동기 쿼리 결과를 순차적으로 반환합니다.

``` js
db.promise.start();

db.get();
db.get();
db.get();

db.promise.end()
.then(function() {
  // responses
  // response의 배열입니다.
  if (db.promise.result(arguments)) {
    // 모든 트랜잭션이 성공시
  }
})

```

## FILE
비동기 파일 업로드를 지원합니다. 
HTML5 file upload가 사용가능하면 나이스한 방법으로 업로드되고, 아닐 경우 [jQuery Form Plugin](http://malsup.com/jquery/form/)를 생각하시면 됩니다.

``` js
db.file.upload({
  type: 'image', // 서버사이드에서 파일의 mimeTypes와 확장자를 둘 다 체크합니다. image|video|document|excel
  target: 'file upload할 element id or class',
  folder: '/upload/doc/', // 업로드 대상 폴더로 필히 지정해줘야합니다
  size: 30, // MB 단위로 업로드할 파일 사이즈를 체크합니다
  pixel: [300, 400] // 최대 픽셀을 지정합니다
}, function(result) {
  if (result.code) {
    // result.data 로 업로드 된 파일 정보를 받을 수 있습니다
  } else {

  }
})
```

## FILL
`INPUT, SELECT, CHECKBOX, RADIO, TEXTAREA`에 데이터를 넣어줍니다.

``` js
db.fill(data, {
  fieldName: function(value) {
    // 필드명에 들어가는 값을 후킹해 원하는 포맷으로 변경시킬 수 있습니다.
    return Number(value) === 1 ? '11' : '22'
  }
})
```

## FORMAT
두개의 쿼리 결과를 해당 컬럼을 기준으로 INNER JOIN 합니다.

``` js
var response = db.format.innerJoin(data, data2, 'column')

// response
```

# 보완점
* CSRF 공격에 대한 보안
* Long polling
* PHP의 경우 mysql, mysqli, pdo 연결 모두 지원