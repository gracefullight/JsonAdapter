# JSON ADAPTER

## 이건 뭐죠?
* Client단에서 Backend Language에 종속되지 않고 하나의 JavaScript 소스만으로 Database까지를 다룰 수 있습니다.
* ES5 이하의 자잘한 홈페이지 튜닝 이슈를 빠르게 쳐낼 수 있습니다.
* Frontend - Backend를 디자이너도 혼자 처리할 수 있게 하는 게 목적입니다.
* 템플릿 엔진과 함께라면 더 빠른 개발 속도를 낼 수 있습니다.

## 현재까지 지원하는 언어
* PHP 
* Classic ASP
* .NET
* JSP

## 종속성
jQuery


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

## PROMISE
비동기 쿼리 결과를 순차적으로 반환합니다.

``` js
db.promise.start();

db.get();
db.get();
db.get();

db.promise.end()
.then(function(responses) {
  console.log(responses);

});

// responses
// response의 배열입니다.

db.promise.result() // true or false
```

## JOIN
두개의 쿼리 결과를 해당 컬럼을 기준으로 LEFT JOIN 합니다.

``` js
db.join(data, data2, 'column')
.then(function(response) {
  console.log(response);
});

// response
```


# 보완점
* CSRF 공격에 대한 보안
* Long polling
* PHP의 경우 mysql, mysqli, pdo 연결 모두 지원

