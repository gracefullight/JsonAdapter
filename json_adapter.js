/**
 * JsonAdapter 1.2
 * EKShin (GracefulLight)
 *
 * v1.0		160918	initialize
 * v1.1		161012	db.format.innerJoin 이너조인 메소드 추가
 * v1.1.1 	161017	db.fill 메소드 textarea에 callback함수 기능 추가
 * v1.2 	161019 	options에 host id를 주면 해당 db로 연결됨
 */
if (typeof jQuery === 'undefined') {
  throw new Error('JsonAdatper requires jQuery');
};
(function (global, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['exports', 'jquery'], factory);
  } else if (typeof exports === 'object' && typeof exports.nodeName !== 'string') {
    factory(exports, require('jquery'));
  } else {
    factory((global.db = global.db || {}), global.$);
  }
}(this, function (db, $) {
  'use strict';
  var debugMode = false;
  var path = adapterPath() + '/json_adapter.php';
  var uploadPath = adapterPath() + '/upload.php';
  var promiseMode = false,
    promiseArray = [];
  var filterArray = [];

  var html5UploadPossible = window.FormData ? true : false;

  db.get = function (p, url) {
    var params = {
      ja_host: p.host,
      ja_type: (p.type === "custom" ? "getDBCust" : "getDBFunc"),
      ja_name: p.name,
      ja_param: p.param,
      ja_paging: p.paging,
      ja_decode: (typeof p.decode === 'boolean' ? p.decode : undefined),
      ja_filter: (filterArray.length > 0 ? filterArray : undefined)
    };
    params = url ? p : params;
    return server('get', params, url);
  };

  db.post = function (p, url) {
    var params = {
      ja_host: p.host,
      ja_type: 'setDBFunc',
      ja_name: p.name,
      ja_param: p.param
    };
    params = url ? p : params;
    return server('post', params, url);
  };

  db.put = function (p, url) {
    var params = {
      ja_host: p.host,
      ja_type: 'setDBFunc',
      ja_name: p.name,
      ja_param: p.param,
      ja_filter: (filterArray.length > 0 ? filterArray : undefined)
    };
    params = url ? p : params;
    return server('put', params, url);
  };

  db.delete = function (p, url) {
    var params = {
      ja_host: p.host,
      ja_type: 'setDBFunc',
      ja_name: p.name,
      ja_param: p.param,
      ja_filter: (filterArray.length > 0 ? filterArray : undefined)
    };
    params = url ? p : params;
    return server('delete', params, url);
  };


  db.promise = {
    /**
     * [start 프로미스 시작]
     */
    start: function () {
      promiseMode = true;
      promiseArray = [];
    },
    /**
     * [end 프로미스 완료]
     * @return {[promise]} [모든 배열의 결과가 반환되었는지]
     */
    end: function () {
      promiseMode = false;
      // $.when.apply($, promiseArray) 가 가능한지 테스트 필요
      return $.when.apply(undefined, promiseArray);
    },
    /**
     * [result 프로미스 결과]
     * @param  {[object]} args [프로미스 객체들]
     * @param  {[boolean]} p    [파싱 여부]
     * @return {[array 또는 boolean]}      [parse 값에 따라서 데이터 셋 또는 결과 T,F 반환]
     */
    result: function (args, parsing) {
      var parse = (typeof parsing === 'boolean') ? parsing : false;

      var successFlag = true;
      var lengthFlag = promiseArray.length === 1;

      var resultArr = [];
      for (var i = 0; i < args.length; i++) {
        var data = lengthFlag ? args[0] : args[i][0];
        var status = lengthFlag ? args[1] : args[i][1];
        var xhr = lengthFlag ? args[2] : args[i][2];
        if (status !== 'success' || !data.code) {
          successFlag = false;
          dbLog('promise error : ' + i);
          dbLog(xhr);
          break;
        }

        if (parse) {
          if (lengthFlag) {
            resultArr.push(args[0]);
          } else {
            resultArr.push(args[i][0]);
          }
        }
      }
      return parse ? resultArr : successFlag;
    },

    /**
     * [set 프로미스 배열 지정]
     * $.ajax를 직접 호출할경우 사용
     * @param {[array]} pArray [프로미스 배열]
     */
    set: function (pArray) {
      if (pArray && Array.isArray(pArray)) {
        dbLog('promise Array setting!!');
        promiseArray = pArray;
      }
    },
  };

  /**
   * [filter dynamic 쿼리를 만듦]
   * @param  {[string]} col  [컬럼명]
   * @param  {[string]} sign [비교타입]
   * @param  {[string]} val  [비교값]
   * @param  {[string]} fmt  [컬럼을 포매팅할 값]
   */
  db.filter = function (col, sign, val, fmt) {
    if (!(col && sign)) {
      return false;
    }

    if (['btw', 'between', 'in', 'i', 'notin', 'ni'].indexOf(sign.toLowerCase()) !== -1) {
      if (!Array.isArray(val)) {
        dbLog('value must be array');
        return false;
      }
    }

    filterArray.push({
      column: col,
      sign: sign,
      value: (val || ""),
      format: (fmt || "")
    });
  };

  db.debug = function (bool) {
    if (typeof bool === 'boolean') {
      debugMode = bool;
    } else if (typeof bool === 'number') {
      debugMode = (bool === 1 ? true : false);
    }
  };

  /**
   * [log 로깅]
   * @param  {[object]} d [데이터]
   * @return {[Function]}     [내부 로깅함수]
   */
  db.log = function (d) {
    return dbLog(d);
  };

  db.file = {
    /**
     * [upload 비동기 파일 업로드]
     * @param  {[object]}   option   [target : 타겟 인풋
     *                             	type : 'image|video|document|excel'
     *                             	size : '최대 사이즈 MB',
     *                             	pixel : image일 경우 {width : 가로 사이즈, height: 세로 사이즈}
     *                             	]
     * @param  {Function} callback [후처리 함수]
     */
    upload: function (option, callback) {
      if (option.folder && option.target) {
        if (html5UploadPossible) {
          $('#' + option.target).on('change', function (e) {
            e.preventDefault();
            e = e.originalEvent;
            var target = e.dataTransfer || e.target;
            var file = target && target.files && target.files[0];

            var formData = new FormData();
            formData.append('file', file);
            formData.append('folder', option.folder);

            if (option.type) {
              formData.append('type', option.type);
            }
            if (option.size) {
              formData.append('size', option.size);
            }
            if (option.pixel) {
              formData.append('width', option.pixel[0]);
              formData.append('height', option.pixel[1]);
            }

            $.ajax({
                url: uploadPath,
                method: 'post',
                data: formData,
                dataType: 'json',
                contentType: false,
                processData: false
              })
              .then(function (result) {
                callback(result);
              });
          });
        } else {
          $('#' + option.target).on('change', function (e) {
            var $input = $(this);
            var t = new Date().getTime();

            var jaTarget = 'JA_Form' + t;
            $input.wrap($('<form/>', {
              id: jaTarget,
              action: uploadPath,
              method: 'post',
              enctype: 'multipart/form-data',
              target: jaTarget
            }));

            var $form = $('#' + jaTarget);
            $form.append(dummyInput('folder', option.folder, t));
            if (option.type) {
              $form.append(dummyInput('type', option.type, t));
            }
            if (option.size) {
              $form.append(dummyInput('size', option.size, t));
            }
            if (option.pixel) {
              $form.append(dummyInput('width', option.pixel[0], t));
              $form.append(dummyInput('height', option.pixel[1], t));
            }

            var $iframe = $('<iframe/>', {
              name: jaTarget,
              style: 'display:none;'
            }).appendTo('body');

            $iframe.load(function () {
              var doc = this.contentWindow ? this.contentWindow.document : (this.contentDocument ? this.contentDocument : this.document);
              var root = doc.documentElement ? doc.documentElement : doc.body;
              var result = root.textContent ? root.textContent : root.innerText;
              callback(JSON.parse(result));

              $input.unwrap($form);
              $('.JA_Dummy' + t).remove();
              $iframe.remove();
            });

            $form.submit();
          });
        }
      } else {
        dbLog('upload parameter error');
      }
    },

    delete: function (file, callback) {
      if (file) {
        // uploatPath에 delete와 post 메소드로 구분해 처리하는 로직을 만들고 싶음
        // $.ajax({
        // 	url:uploadPath,
        // 	method:'delete',
        // 	data:{file : file},
        // 	dataType:'json'
        // }).then(callback(data));
      }
    }
  };

  /**
   * [fill 자동 채우기 함수]
   * @param  {[type]} obj  [데이터]
   * @param  {[type]} opt  [{데이터명 : 콜백함수}]
   * @param  {[type]} bool [true일시 후처리 가능]
   */
  db.fill = function (obj, opt, bool) {
    Object.keys(obj || {}).forEach(function (key) {
      var $k = $('[name="' + key + '"]');
      if ($k.length) {
        switch ($k.get(0).tagName) {
          case 'INPUT':
            var t = $k.attr('type');
            if (t === 'radio' || t === 'checkbox') {
              $k.filter('[value="' + obj[key] + '"]').prop('checked', true);
            } else {
              $k.val(obj[key]);
            }
            break;
          case 'SELECT':
            $k.val(obj[key]);
            break;
          case 'TEXTAREA':
            if (opt && opt[key]) {
              if (bool) {
                opt[key](obj[key]);
              } else {
                $k.val(opt[key](obj[key]));
              }
            } else {
              $k.val(obj[key]);
            }
            break;
          default:
            if (opt && opt[key]) {
              if (bool) {
                opt[key](obj[key]);
              } else {
                $k.html(opt[key](obj[key]));
              }
            } else {
              $k.html(obj[key]);
            }
            break;
        }
      }
    });
  };

  db.format = {
    /**
     * [innerJoin 이너 조인]
     * @param  {[array]} left       [좌측 테이블]
     * @param  {[array]} right      [우측 테이블]
     * @param  {[string]} by        [조인 대상 필드]
     * @param  {[array]} select     [뽑아낼 컬럼]
     * @param  {[integer]} omit     [있을 경우 select 컬럼 제외하고 추출]
     * @return {[array]}            [조인된 데이터]
     */
    innerJoin: function (left, right, by, select, omit) {
      var together = [],
        length = 0;
      if (select) {
        select.forEach(function (x) {
          select[x] = 1;
        });
      }

      function fields(it) {
        var f = {},
          k;
        for (k in it) {
          if (!select) {
            f[k] = 1;
            continue;
          }

          if (omit ? !select[k] : select[k]) {
            f[k] = 1;
          }
        }
        return f;
      }

      function add(it) {
        var pkey = '.' + it[by],
          pobj = {};
        if (!together[pkey]) {
          together[pkey] = pobj;
          together[length++] = pobj;
        }
        pobj = together[pkey];
        for (var k in fields(it)) {
          pobj[k] = it[k];
        }
      }

      left.map(add);
      right.map(add);
      return together;
    }
  };

  function dummyInput(n, v, t) {
    return $('<input/>', {
      type: 'hidden',
      name: n,
      value: v,
      class: 'JA_Dummy' + t
    });
  }

  /**
   * [server ajax 통신]
   * @param  {[string]} method [메소드]
   * @param  {[object]} params [파라미터]
   * @return {[ajax]}       	 [ajax]
   */
  function server(method, params, url) {
    dbLog('JsonAdapter::' + method);
    dbLog(params);
    if (method !== 'get') {
      params = JSON.stringify(params);
    }

    // method는 type의 alias로 1.9부터 추가됨
    var _ajax = $.ajax({
      url: (url || path),
      method: method,
      contentType: 'application/json; charset=UTF-8',
      data: params,
      dataType: 'json',
      headers: {
        'x-ja-callfrom': document.location.href,
        'x-ja-calltime': (Math.round(new Date().getTime() / 1000)),
        'cache-control': 'no-cache'
      }
    });

    if (promiseMode) {
      promiseArray.push(_ajax);
    }

    if (filterArray.length > 0) {
      filterArray = [];
    }

    return _ajax;
  }

  /**
   * [adapterPath 이 스크립트의 현재 위치를 가져온다]
   * @return {[string]} [현재 위치]
   */
  function adapterPath() {
    var script;
    if (document.currentScript) {
      script = document.currentScript.src;
    } else {
      var scripts = document.getElementsByTagName('script');
      script = scripts[scripts.length - 1].src;
    }
    return script.substring(0, script.lastIndexOf('/')) || '/common/adapter';
  }

  function dateFormatter(d) {
    return d.getFullYear() + "." + (d.getMonth() + 1) + "." + d.getDate() + " " + d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds() + "." + d.getMilliseconds();
  }

  function dbLog(msg) {
    if (debugMode) {
      console.log("[" + dateFormatter(new Date()) + "] " + msg);
    }
  }
}));