//国际化
var lang = {
    "rule": {
        "required": "不能为空",
        "number": "只能为数字",
        "positiveInteger": "只能为正整数",
        "username": "只能包括字母、数字和下划线",
        "password": "格式不正确",
        "phone": "手机号码输入不正确",
        "mail": "邮箱格式不正确",
        "chinese": "只能填写中文",
        "minlength": "最小长度为",
        "maxlength": "最大长度为",
        "unit": "位",
        "minnumber": "最小值为",
        "maxnumber": "最大值为",
        "twice": "两次",
        "compare": "输入不一致",
        "safelvl": "不安全，请增强",
        "specialchar": "不能包含特殊字符"
    }
};

//Ajax
(function (window, document, undefined) {
    window.Ajax = function (params) {
        /*================
		Model
		================*/
        var defaults = {
            "url": null,
            "type": "get",
            "async": true,
            "dataType": null,
            "context": null,
            "contentType": "application/x-www-form-urlencoded",
            "timeout": 5000,
            /*
            Callbacks:
            onSuccess:function(text)
			onFail:function(Event)
			onProgress:function(position,totalSize)
			onTimeout:function(Event);
			*/
        }
        params = params || {};
        for (var def in defaults) {
            if (params[def] == undefined) {
                params[def] = defaults[def];
            }
        }
        var s = this;
        s.params = params;
        s.xhr = new XMLHttpRequest();
        s.formData = new FormData();

        /*================
		Method
		================*/
        Ajax.jsonpCallback = function (data) {
            if (s.params.onSuccess) s.params.onSuccess(data);
        }
        s.setUrl = function (url) {
            s.params.url = url;
        }
        s.setType = function (type) {
            s.params.type = type;
        }
        s.setOnSuccess = function (fn) {
            s.params.onSuccess = fn;
        }
        s.setOnFail = function (fn) {
            s.params.onFail = fn;
        }
        s.addGetParam = function (name, value) {//为get请求添加参数
            var url = s.params.url;
            url += (url.indexOf("?") == -1 ? "?" : "&");
            url += encodeURIComponent(name) + "=" + encodeURIComponent(value);
            s.params.url = url;
        }
        s.addPostParam = function (name, value) {//为post请求添加参数
            s.formData.append(name, value);
        }
        s.connect = function () {
            if (!s.params.url) return;
            if (s.params.dataType === "jsonp") {//Jsonp
                var url = s.params.url;
                url += (url.indexOf("?") == -1 ? "?" : "&");
                if (s.script) {
                    document.body.removeChild(s.script);
                    s.script = null;
                }
                s.script = document.createElement("script");
                s.script.src = url + "callback=Ajax.jsonpCallback";
                s.script.onerror = s.onScriptError;
                document.body.insertBefore(s.script, document.body.firstChild);
            } else {//非Jsonp
                s.xhr.timeout = s.params.timeout;
                s.xhr.open(s.params.type, s.params.url, s.params.async);
                s.xhr.setRequestHeader("Content-Type", s.params.contentType);
                s.xhr.send(s.formData);
            }
        }
        s.abort = function () {
            s.xhr.abort();
        }
        /*================
		Control
		================*/
        s.onScriptError = function () {
            if (s.params.onFail) s.params.onFail(e);
        }
        s.events = function (detach) {
            var target = s.xhr;
            var action = detach ? "removeEventListener" : "addEventListener";
            //target[action]("readystatechange",s.onReadystateChange,false);
            target[action]("load", s.onLoad, false);
            target[action]("progress", s.onProgress, false);
            target[action]("timeout", s.onTimeout, false);
        }
        //attach、dettach事件
        s.attach = function (event) {
            s.events();
        }
        s.detach = function (event) {
            s.events(true);
        }
        /*s.onReadystateChange=function(e){
			console.log("readyState:"+s.xhr.readyState+
                    ";status:"+s.xhr.status+
                    ";statusText:"+s.xhr.statusText+
                    ";responseText:"+s.xhr.responseText+
                    ";responseXML:"+s.xhr.readyState);
			if(s.xhr.readyState==4){
				if((s.xhr.status>=200 && s.xhr.status<300) || s.xhr.status==304){
	            	if(s.params.onSuccess)s.params.onSuccess(s.xhr.responseText);
	            }else{
	            	if(s.params.onFail)s.params.onFail(e);
	            }
			}
		}*/
        s.onLoad = function (e) {
            if ((s.xhr.status >= 200 && s.xhr.status < 300) || s.xhr.status == 304) {
                if (s.params.onSuccess) s.params.onSuccess(s.xhr.responseText);
            } else {
                if (s.params.onFail) s.params.onFail(e);
            }
        }
        s.onProgress = function (e) {
            if (s.params.onProgress) s.params.onProgress(e.position, e.totalSize);
        }
        s.onTimeout = function (e) {
            if (e.lengthComputable) {
                if (s.params.onTimeout) s.params.onTimeout(e);
            }
        }
        /*================
		Init
		================*/
        s.init = function () {
            s.attach();
            s.connect();
        }
        s.init();
    }
})(window, document, undefined);

//EventUtil 事件函数
(function (window, document, undefined) {
    window.TapSwipe = function (element, type, handler) {
        var s = this;
        s.params = {
            threshold: 0
        }
        /*=========================
          Model
          ===========================*/
        s.touches = {
            direction: 0,
            vertical: 0,
            horizontal: 0,
            startX: 0,
            startY: 0,
            endX: 0,
            endY: 0,
            diffX: 0,
            diffY: 0,
        }
        //s.element,s.type,s.handler;
        s.element = element;
        s.type = type;
        s.handler = handler;
        /*=========================
          Method
          ===========================*/

        /*=========================
          Touch Events
          ===========================*/
        //绑定事件
        s.events = function (detach) {
            var touchTarget = s.element;
            var action = detach ? "removeEventListener" : "addEventListener";
            touchTarget[action]("touchstart", s.onTouchStart, false);
            touchTarget[action]("touchend", s.onTouchEnd, false);
        }
        //attach、dettach事件
        s.attach = function (event) {
            s.events();
        }
        s.detach = function (event) {
            s.events(true);
        }
        /*=========================
          Touch Handler
          ===========================*/
        s.onTouchStart = function (e) {
            s.touches.startX = e.touches[0].clientX;
            s.touches.startY = e.touches[0].clientY;
        }
        s.onTouchEnd = function (e) {
            s.touches.endX = e.changedTouches[0].clientX,
                s.touches.endY = e.changedTouches[0].clientY;
            s.touches.diffX = s.touches.startX - s.touches.endX;
            s.touches.diffY = s.touches.startY - s.touches.endY;
            //单击事件
            if (s.type === "tap" && Math.abs(s.touches.diffX) < 6 && Math.abs(s.touches.diffY) < 6) {
                s.handler(e);
                return;
            }

            /*设置方向*/
            if (s.touches.direction === 0) {//设置滑动方向(-1上下 | 1左右)
                s.touches.direction = Math.abs(s.touches.diffX) > Math.abs(s.touches.diffY) ? 1 : -1;
            }
            if (s.touches.direction === -1) {//设置垂直方向(-1上 | 1下)
                s.touches.vertical = s.touches.diffY < 0 ? 1 : -1;
            }
            if (s.touches.direction === 1) {//设置左右方向(-1左 | 1右)
                s.touches.horizontal = s.touches.diffX < 0 ? 1 : -1;
            }

            /*swipeleft | swiperight | swipedown | swipeup 事件*/
            if (s.type === "swipeup" && s.touches.vertical === -1) {//上
                if (Math.abs(s.touches.diffY) > s.params.threshold) {
                    s.handler(e);
                }
            } else if (s.type === "swipedown" && s.touches.vertical === 1) {//下
                if (Math.abs(s.touches.diffY) > s.params.threshold) {
                    s.handler(e);
                }
            } else if (s.type === "swipeleft" && s.touches.horizontal === -1) {//左
                if (Math.abs(s.touches.diffY) > s.params.threshold) {
                    s.handler(e);
                }
            } else if (s.type === "swiperight" && s.touches.horizontal === 1) {//右
                if (Math.abs(s.touches.diffY) > s.params.threshold) {
                    s.handler(e);
                }
            }

            /*清空方向*/
            s.touches.direction = 0;
        }
        /*=========================
          Init
          ===========================*/
        s.init = function () {
            s.attach();
        }
        s.init();
    }
    var touchEvent = [];
    window.EventUtil = {
        addHandler: function (element, type, handler) {
            //tap | swipeleft | swiperight | swipedown | swipeup 事件
            if (type === "tap" || type === "swipeleft" || type === "swiperight" || type === "swipedown" || type === "swipeup") {
                if (!touchEvent[element]) touchEvent[element] = new TapSwipe(element, type, handler);
                return;
            }
            //系统事件
            if (element.addEventListener) {
                element.addEventListener(type, handler, false);
            } else if (element.attachEvent) {
                element.attachEvent("on" + type, handler);
            } else {
                element["on" + type] = handler;
            }
        },
        removeHandler: function (element, type, handler) {
            //tap、swipeleft、swiperight、swipedown、swipeup
            if (type === "tap" || type === "swipeleft" || type === "swiperight" || type === "swipedown" || type === "swipeup") {
                touchEvent[element].detach();
                return;
            }
            //系统事件
            if (element.removeEventListener) {
                element.removeEventListener(type, handler, false);
            } else if (element.detachEvent) {
                element.detachEvent("on" + type, handler);
            } else {
                element["on" + type] = null;
            }
        },
        preventDefault: function (e) {
            if (e.preventDefault) {
                e.preventDefault();
            } else {
                e.returnValue = false;
            }
        },
        stopPropagation: function (e) {
            if (e.stopPropagation) {
                e.stopPropagation();
            } else {
                e.cancelBubble = true;
            }
        },
        event: function (e) {
            return e ? e : window.e;
        },
        type: function (e) {
            return e.type;
        },
        target: function (e) {
            return e.target || e.srcElement;
        }
    };
})(window, document, undefined);

//Page 单页模式
(function (window, document, undefined) {
    window.Page = function (params) {
        /*=========================
          Model
          ===========================*/
        var defaults = {
            isDisableSameClick: false,//是否禁止重复点击相同按钮
            isTakeHistory: true,//是否添加浏览器历史记录
            buttonAttr: "[data-toggle=page]",
            buttonActiveClass: "active",
            pageClass: "page",
            pageActiveClass: "active",
            defaultAnimation: "slideLeft",
            duration: "300"

            /*callbacks
			onLoad:function(Page)//加载中
			onOpenEnd:function(Page)//开窗完成时动画
			onCloseEnd:function(Page)//关窗完成时动画
			*/
        }

        params = params || {};
        for (var def in defaults) {
            if (params[def] === undefined) {
                params[def] = defaults[def];
            }
        }
        var s = this;
        s.params = params;
        //Btns
        s.buttons = [].slice.call(document.querySelectorAll(s.params.buttonAttr));
        //Pages
        s.pages;
        s.update = function () {
            s.pages = [].slice.call(document.querySelectorAll("." + s.params.pageClass));
            for (var i = 0, page; page = s.pages[i++];) {
                if (!page.getAttribute("data-animation")) {
                    page.setAttribute("data-animation", s.params.defaultAnimation);
                }
                var isActive = page.classList.contains(s.params.pageActiveClass);
                var animation = page.getAttribute("data-animation");
                if (animation == "slideDown") {
                    page.showAnimation = {visibility: "visible", webkitTransform: "translate3d(0,0,0)"};
                    page.hideAnimation = {webkitTransform: "translate3d(0,-100%,0)"};
                    if (!isActive) page.style.webkitTransform = "translate3d(0,-100%,0)";
                } else if (animation == "slideUp") {
                    page.showAnimation = {visibility: "visible", webkitTransform: "translate3d(0,0,0)"};
                    page.hideAnimation = {webkitTransform: "translate3d(0,100%,0)"};
                    if (!isActive) page.style.webkitTransform = "translate3d(0,100%,0)";
                } else if (animation == "fade") {
                    page.showAnimation = {visibility: "visible", opacity: 1};
                    page.hideAnimation = {opacity: 0};
                    if (!isActive) page.style.opacity = 0;
                } else if (animation == "none") {
                    page.showAnimation = {display: "block", noAnimation: true};
                    page.hideAnimation = {display: "none"};
                    if (!isActive) page.style.display = "none";
                } else if (animation == "zoom") {
                    page.showAnimation = {visibility: "visible", webkitTransform: "scale(1,1)"};
                    page.hideAnimation = {webkitTransform: "scale(0,0)"};
                    if (!isActive) page.style.webkitTransform = "scale(0,0)";
                } else if (animation == "slideRight") {
                    page.showAnimation = {visibility: "visible", webkitTransform: "translate3d(0,0,0)"};
                    page.hideAnimation = {webkitTransform: "translate3d(-100%,0,0)"};
                    if (!isActive) page.style.webkitTransform = "translate3d(-100%,0,0)";
                } else if (animation == "slideLeft") {
                    page.showAnimation = {visibility: "visible", webkitTransform: "translate3d(0,0,0)"};
                    page.hideAnimation = {webkitTransform: "translate3d(100%,0,0)"};
                    if (!isActive) page.style.webkitTransform = "translate3d(100%,0,0)";
                }
                //page.style.webkitTransitionProperty="transform,opacity";
                if (animation != "none") {
                    s.durationPage(page);
                }
            }
        }
        s.durationPage = function (page) {
            setTimeout(function () {
                page.style.webkitTransitionDuration = s.params.duration + "ms";
            }, 100);
        }
        s.update();
        //History
        s.history = [];
        /*=========================
          Method
          ===========================*/
        s.historyHasPage = function (pageId) {
            s.history.some(function (n, i, a) {
                return pageId == n;
            })
        }
        s.addHistory = function (pageId) {
            s.history.push(pageId);
            if (s.params.isTakeHistory == false) return;
            try {
                window.history.pushState({href: pageId}, document.title, pageId);
            } catch (err) {
                console.log("请检查您当前运行的环境是否为服务器端");
            }
        }
        s.replaceHistory = function (pageId) {
            //移除最新一条，关闭上一页
            var prePageId = s.history.pop();
            var prePage = document.querySelector(prePageId);
            s.durationHidePage(prePage);
            //添加新记录
            s.history.push(pageId);
            if (s.params.isTakeHistory == false) return;
            try {
                window.history.replaceState({href: pageId}, document.title, pageId);
            } catch (err) {
                console.log("请检查您当前运行的环境是否为服务器端");
            }
        }
        s.removeHistory = function (pageId) {
            s.history = s.history.filter(function (n, i, a) {
                return n != pageId;
            })
        }
        s.isHid = true;
        s.showPage = function (page) {
            s.isRoot = false;
            s.isHid = false;
            //Callback onLoad
            if (s.params.onLoad) s.params.onLoad(s);

            page.classList.add(s.params.pageActiveClass);
            for (var ani in page.showAnimation) {
                page.style[ani] = page.showAnimation[ani];
            }
        }
        s.durationHidePage = function (page) {
            setTimeout(function () {
                s.hidePage(page);
            }, 500);
        }
        s.hidePage = function (page) {
            s.isHid = true;
            page.classList.remove(s.params.pageActiveClass);
            for (var ani in page.hideAnimation) {
                page.style[ani] = page.hideAnimation[ani];
            }
        }
        s.hideAllPage = function (exceptPageId) {
            for (var i = 0, page; page = s.pages[i++];) {
                if (exceptPageId && "#" + page.id == exceptPageId) {
                    continue;
                }
                s.hidePage(page);
            }
        }
        //关窗函数
        s.close = function (pageId, animation) {
            var page = document.getElementById(pageId.substring(1));
            if (animation) {
                page.setAttribute("data-animation", animation);
                s.update();
            }
            //删除对应的历史记录
            s.removeHistory(pageId);
            //隐藏Page
            if (page) s.hidePage(page);
        }
        //开窗函数
        s.open = function (pageId, target, animation) {
            var page = document.getElementById(pageId.substring(1));
            if (animation) {
                page.setAttribute("data-animation", animation);
                s.update();
            }
            //添加历史记录，并修改浏览器地址
            if (target == "_self") {
                s.replaceHistory(pageId);
            } else {
                s.addHistory(pageId);
            }
            //Callback onLoad
            s.targetPageId = pageId;
            s.targetPage = page;
            //显示Page
            s.showPage(page);
        }
        //回退函数
        s.back = function () {
            var targetPageId = null, targetPage = null;
            //如果本地历史记录为空(刷新导致)，而浏览器历史记录不为空，则监听浏览器历史记录
            if (s.history.length == 0 && window.history.state && window.history.state.href) {
                targetPageId = window.history.state.href;
                //console.log("无本地记录，但有浏览器历史记录"+targetPageId);
                targetPage = document.getElementById(targetPageId.substring(1));
                s.hideAllPage(targetPageId);
                //Callback onLoad
                s.targetPageId = targetPageId;
                s.targetPage = targetPage;
                s.showPage(targetPage);
                return;
            }
            if (s.history.length == 0) {
                //console.log("无本地记录，也无浏览器有历史记录");
                s.isRoot = true;//底层标识
                targetPageId = null;
                targetPage = null;
                s.hideAllPage();
            } else {
                //获得最新历史记录，并关闭那个页面
                var pageId = s.history[s.history.length - 1];
                if (pageId) s.close(pageId);
                //获得关闭后的最新历史记录
                targetPageId = s.history[s.history.length - 1];
                if (targetPageId) targetPage = document.getElementById(targetPageId.substring(1));
                //目录是否处于底层
                if (s.history.length == 0) {
                    s.isRoot = true;//底层标识
                    targetPageId = null;
                    targetPage = null;
                    //console.log("目前处于底层");
                }
            }
            //Callback onLoad
            s.targetPage = targetPage;
            s.targetPageId = targetPageId;
            if (s.params.onLoad) s.params.onLoad(s);
        }
        //清空按钮选中样式
        s.activeButton = function (activebtn) {
            s.buttons.forEach(function (btn) {
                btn.classList.remove(s.params.buttonActiveClass);
            })
            activebtn.classList.add(s.params.buttonActiveClass);
        }
        /*=========================
          Control
          ===========================*/
        s.events = function (detach) {
            var action = detach ? "removeEventListener" : "addEventListener";
            //动画监听
            document[action]("webkitTransitionEnd", s.onTransitionEnd, false);
            //hash值监听
            window[action]("popstate", s.onPopstate, false);
            //页面初始化
            window[action]("load", s.onLoad, false);
            //window[action]("hashchange",s.onPopstate,false);
            for (var i = 0, btn; btn = s.buttons[i++];) {
                btn.addEventListener("click", s.onClickBtn, false);
            }
        }
        s.attach = function (event) {
            s.events();
        }
        s.detach = function (event) {
            s.events(true);
        }
        s.onLoad = function (e) {
            if (window.history.state && window.history.state.href) {
                s.targetPageId = window.history.state.href;
                s.targetPage = document.querySelector(s.targetPageId);
                //关闭所有页面
                s.hideAllPage(s.targetPageId);
                //显示hash页面
                s.showPage(s.targetPage);
            }
        }
        s.onClickBtn = function (e) {
            if (s.params.isDisableSameClick) {
                if (e.target.classList.contains(s.params.buttonActiveClass)) return;
                s.activeButton(e.target);
            }
            s.target = e.target;
            var pageId = s.target.getAttribute("href");
            var openType = s.target.getAttribute("target");
            s.open(pageId, openType);
            e.preventDefault();
        }
        s.onPopstate = function (e) {
            //后退
            s.back();
            //console.log("location: " + document.location + ", state: " + JSON.stringify(event.state));
        };
        s.onTransitionEnd = function (e) {
            if (!e.target.classList.contains("page")) return;
            s.targetPage = e.target;
            //隐藏完成
            if (s.isHid) {
                if (s.targetPage.showAnimation.visibility) s.targetPage.style.visibility = "hidden";
                //CallBack onCloseEnd
                if (s.params.onCloseEnd) s.params.onCloseEnd(s);
                return;
            }
            //显示完成
            //CallBack onOpenEnd
            if (s.params.onOpenEnd) s.params.onOpenEnd(s);
        };
        s.init = function () {
            s.attach();
        }
        s.init();
    }
})(window, document, undefined);

//Aside 侧边栏
(function (window, document, undefined) {
    window.Aside = function (container, params) {
        /*=========================
          Model
          ===========================*/
        var defaults = {
            "wrapperClass": "aside-wrapper",
            "leftSide": null,
            "rightSide": null,
            "asideContainerClass": "aside",
            "sides": {"left": null, "right": null},
            "threshold": {"left": 60, "right": 60},

            "duration": 300,
            "isClickMaskHide": true,
            "isDrag": false,
            /*callbacks
            onInit:function(Aside)
            onSlideChangeStart:function(Aside)
            onSlideChange:function(Aside)
            onSlideChangeEnd:function(Aside)
            onClickMask:function(Aside)
            */
        }
        params = params || {};
        for (var def in defaults) {
            if (params[def] === undefined) {
                params[def] = defaults[def];
            }
        }
        //AsideContainer
        var s = this;
        //Params
        s.params = params;
        //Container
        s.container = typeof container == "string" ? document.querySelector(container) : container;
        //Wrapper
        s.wrapper = s.container.querySelector("." + s.params.wrapperClass);
        //Section
        s.section = s.container.querySelector("section");
        //Article
        s.article = s.section.querySelector("article");
        //Mask
        s.createMask = function () {
            var mask = document.createElement("div");
            mask.setAttribute("class", "mask");
            return mask;
        }
        s.mask = s.createMask();
        s.section.appendChild(s.mask);
        //Aside
        s.sides = {"left": null, "right": null}, s.position = null;
        s.update = function () {
            if (s.params.sides["left"]) s.updateAside("left");
            if (s.params.sides["right"]) s.updateAside("right");
        }
        s.updateAside = function (pos) {
            //属性设置
            s.sides[pos] = typeof s.params.sides[pos] == "string" ? s.wrapper.querySelector(s.params.sides[pos]) : s.params.sides[pos];
            if (!s.sides[pos]) return;
            var aside = s.sides[pos];
            //data-position
            aside.setAttribute("data-position", pos);
            //data-transition
            aside.transition = aside.getAttribute("data-transition") || "";
            //width
            aside.width = aside.clientWidth;
            if (pos == "right") aside.width = -aside.width;
            //动画设置
            switch (aside.transition) {
                case "overlay":
                    aside.showTransform = 'translate3d(0,0,0)',
                        aside.hideTransform = 'translate3d(' + -aside.width + 'px,0,0)',
                        aside.elTransform = aside;
                    break;

                case "push":
                    aside.showTransform = 'translate3d(' + aside.width + 'px,0,0)',
                        aside.hideTransform = 'translate3d(0,0,0)',
                        aside.elTransform = s.wrapper;
                    break;

                case "reveal":
                    aside.showTransform = 'translate3d(' + aside.width + 'px,0,0)',
                        aside.hideTransform = 'translate3d(0,0,0)',
                        aside.elTransform = s.section;
                    break;
            }
        }
        s.update();
        s.updateActiveEl = function (aside) {
            if (aside.transition == "overlay") {
                s.activeEl = aside;
            } else if (aside.transition == "push") {
                s.activeEl = s.wrapper;
            } else {
                s.activeEl = s.section;
            }
        }
        /*=========================
          Method
          ===========================*/
        s.showMask = function () {
            s.mask.style.visibility = "visible";
            s.mask.style.opacity = "1";
        }
        s.hideMask = function () {
            s.mask.style.visibility = "hidden";
            s.mask.style.opacity = "0";
        }
        s.transformTarget = function (target, transform, duration) {
            if (!duration) duration = 0;
            target.style.webkitTransitionDuration = duration + "ms";
            target.style.webkitTransform = transform;
        }
        s.isHid = true;
        s.showCallback = null;//显示动画结束后回调
        s.show = function (pos, fn) {
            //设置显示回调
            if (fn) s.showCallback = fn;
            //设置显示侧边
            if (pos) s.position = pos;
            if (!s.sides[s.position]) {
                s.position = null;
                return;
            }
            //记录显示状态
            s.isHid = false;
            //显示侧边栏
            s.sides[s.position].style.visibility = "visible";
            s.showMask();
            s.transformTarget(s.sides[s.position].elTransform, s.sides[s.position].showTransform, s.params.duration);

            //记录触摸值
            s.touches.posX = s.sides[s.position].width;
            //隐藏滚动条
            s.article.style.overflow = "hidden";
        }
        s.hideCallback = null;//隐藏动画结束后回调
        s.hide = function (fn) {
            if (fn) s.hideCallback = fn;
            if (!s.sides[s.position]) {
                s.position = null;
                return;
            }
            //记录显示状态
            s.isHid = true;
            //隐藏侧边栏
            s.hideMask();
            s.transformTarget(s.sides[s.position].elTransform, s.sides[s.position].hideTransform, s.params.duration);

            //记录触摸值
            s.touches.posX = 0;
            //显示滚动条
            s.article.style.overflow = "auto";
        }
        s.setLeftSide = function (argAside) {
            s.params.sides["left"] = argAside;
            s.update();
        }
        s.setRightSide = function (argAside) {
            s.params.sides["right"] = argAside;
            s.update();
        }
        s.clearChange = function () {
            //初始化transform
            if (s.sides[s.position].style.removeProperty) {
                s.sides[s.position].style.removeProperty("transform");
                s.sides[s.position].style.removeProperty("-webkit-transform");
            } else {
                s.sides[s.position].style.removeAttribute("transform");
                s.sides[s.position].style.removeAttribute("-webkit-transform");
            }
            //初始化侧边栏
            s.sides[s.position].style.visibility = "hidden";
            //初始化侧边栏
            s.position = null;
        }
        s.addTransitionDuration = function () {
            s.sides[s.position].style.webkitTransitionDuration = s.params.duration + "ms";
        }
        s.removeTransitionDuration = function () {
            s.sides[s.position].style.webkitTransitionDuration = "0ms";
        }
        /*=========================
          Control
          ===========================*/
        s.preventDefault = function (e) {
            e.preventDefault();
        }
        s.events = function (detach) {
            var touchTarget = s.container;
            var action = detach ? "removeEventListener" : "addEventListener";
            if (s.params.isDrag) {
                touchTarget[action]("touchstart", s.onTouchStart, false);
                touchTarget[action]("touchmove", s.onTouchMove, false);
                touchTarget[action]("touchend", s.onTouchEnd, false);
                touchTarget[action]("touchcancel", s.onTouchEnd, false);
            }
            //clickMask
            s.mask[action]("click", s.onClickMask, false);
            //transitionEnd
            s.wrapper[action]("webkitTransitionEnd", s.onTransitionEnd, false);
        }
        //attach、dettach事件
        s.attach = function (event) {
            s.events();
        }
        s.detach = function (event) {
            s.events(true);
        }
        //Events Handler
        //Touch信息
        s.touches = {
            startX: 0,
            startY: 0,
            currentX: 0,
            currentY: 0,
            endX: 0,
            endY: 0,
            diffX: 0,
            diffY: 0,
            posX: 0,
            direction: null,
            position: null
        };
        s.preventDefault = function (e) {
            e.preventDefault();
        }
        s.stopPropagation = function (e) {
            e.stopPropagation();
        }
        s.onTouchStart = function (e) {
            s.container.addEventListener("touchmove", s.preventDefault, false);
            s.touches.startX = e.touches[0].clientX;
            s.touches.startY = e.touches[0].clientY;
            //Callback
            if (e.target == s.wrapper || e.target == s.section || e.target.getAttribute("data-transition")) {
                s.target = e.target;
                if (s.params.onSlideChangeStart) s.params.onSlideChangeStart(s);
            }
        }
        s.showSide;
        s.onTouchMove = function (e) {
            s.touches.currentX = e.touches[0].clientX;
            s.touches.currentY = e.touches[0].clientY;
            s.touches.diffX = s.touches.startX - s.touches.currentX;
            s.touches.diffY = s.touches.startY - s.touches.currentY;
            //设置滑动方向
            if (s.touches.direction == null) {
                s.touches.direction = Math.abs(s.touches.diffY) - Math.abs(s.touches.diffX) > 0 ? "vertical" : "horizontal";
            }
            if (s.touches.direction == "vertical") {
                s.container.removeEventListener("touchmove", s.preventDefault, false);
                return;
            }
            e.stopPropagation();
            //x轴距离左边的像素，向左为负数，向右为正数
            var moveX = s.touches.posX - s.touches.diffX;
            //侧边显示方向
            if (!s.position) {
                if (moveX < 0) s.position = "right";
                else s.position = "left";
            }
            //拖动方向
            if (s.touches.diffX < 0) s.touches.position = "right";
            else s.touches.position = "left";

            //是否存在此侧边
            if (!s.sides[s.position]) {
                return;
            }

            //设置激活侧边栏
            if (!s.showSide) {
                s.showSide = s.sides[s.position];
            }
            //判断是否是边缘
            if (Math.abs(moveX) > Math.abs(s.showSide.width)) {
                //moveX=s.showSide.width;
                return;
            }
            if (s.position == "left" && moveX < 0) {
                //moveX=0;
                return;
            }
            if (s.position == "right" && moveX > 0) {
                //moveX=0;
                return;
            }

            //移动位置
            s.showSide.style.visibility = "visible";
            /*if(s.showSide.transition=="overlay"){
                var translateX=-(s.showSide.width-moveX);
                s.transformTarget(s.showSide.elTransform,'translate3d('+translateX+'px,0,0)');
            }else if(s.showSide.transition=="push" || !s.showSide.transition || s.showSide.transition=="reveal"){
                s.transformTarget(s.showSide.elTransform,'translate3d('+moveX+'px,0,0)');
            }*/
            var translateX = moveX;
            if (s.showSide.transition == "overlay") translateX = -(s.showSide.width - moveX);
            s.transformTarget(s.showSide.elTransform, 'translate3d(' + translateX + 'px,0,0)');

            if (s.params.onSlideChange) s.params.onSlideChange(s);
        }
        s.onTouchEnd = function (e) {
            var sidePos = s.position;
            var touchPos = s.touches.position;
            /*console.log("侧边栏："+sidePos);
            console.log("您拖动的方向："+touchPos);
            console.log("是否是隐藏状态："+s.isHid);*/

            //展开和收缩
            if (s.touches.direction == "horizontal") {
                var threshold = s.params.threshold[sidePos];//拖动阈值
                if (s.isHid) {//隐藏状态
                    if (Math.abs(s.touches.diffX) > threshold) {
                        s.show(sidePos);
                    } else {
                        s.hide();
                    }
                } else {//已显示状态
                    if (Math.abs(s.touches.diffX) > threshold) {
                        if (sidePos == touchPos) {//拖动方向相同时才隐藏
                            s.hide();
                        }
                    } else {
                        s.show();
                    }
                }
            }

            //清空滑动方向
            s.touches.direction = null;
            s.touches.position = null;
            s.showSide = null;
        }
        s.onClickMask = function (e) {
            s.target = e.target;
            if (s.params.onClickMask) s.params.onClickMask(s);
            if (s.params.isClickMaskHide) {
                s.hide();
            }
            s.preventDefault(e);
        }
        s.setOnClickMask = function (fn) {
            s.params.onClickMask = fn;
        }
        s.onTransitionEnd = function (e) {
            if (s.mask == e.target) return;

            //移除动画
            s.removeTransitionDuration();
            //如果是隐藏状态，清除修改项
            if (s.isHid == true) {
                s.clearChange();
                if (s.hideCallback) s.hideCallback(s);
            } else {
                if (s.showCallback) s.showCallback(s);
            }
            //Callback
            if (e.target == s.wrapper || e.target == s.section || e.target.getAttribute("data-transition")) {
                s.target = e.target;
                if (s.params.onSlideChangeEnd) s.params.onSlideChangeEnd(s);
            }
        }

        function init() {
            s.attach();
            if (s.params.onInit) s.params.onInit(s);
        }

        init();
    }
})(window, document, undefined);

//Counter 动态数字
(function (window, document, undefined) {
    window.Counter = function (counter, params) {
        /*=========================
        Model
        ===========================*/
        var defaults = {
            "fromAttr": "data-from",
            "toAttr": "data-to",
            "durationAttr": "data-duration",
            "defaultDuration": 500,
            "defaultFrom": 0,
            "defaultTo": 0,
            "minMilli": 10
        }
        params = params || {};
        for (var def in defaults) {
            if (params[def] === undefined) {
                params[def] = defaults[def];
            }
        }
        //Counter
        var s = this;

        //Params
        s.params = params;

        //Counter
        s.counter = typeof counter === "string" ? document.querySelector(counter) : counter;
        s.timers = document.querySelectorAll("." + s.params.timerClass);

        //From(开始数字) | To(结束数字) | Duration(执行时长) | Current(当前数字)
        s.from = s.counter.getAttribute(s.params.fromAttr) || s.params.defaultFrom;
        s.to = s.counter.getAttribute(s.params.toAttr) || s.params.defaultTo;
        s.duration = s.counter.getAttribute(s.params.durationAttr) || s.params.defaultDuration;
        s.current = s.from;

        //Diff(差值)
        s.diff = s.to - s.from;

        if (s.diff < 0 || isNaN(s.from) || isNaN(s.to)) {
            console.log("请确定开始时间与结束时间是否输入正确！");
            return;
        }

        //NumFps(递增值)
        s.numFps = 1;

        //Milli(毫秒/帧)
        s.milli = s.duration / s.diff;
        if (s.milli < s.minMilli) {
            s.milli = s.minMilli;
            //总值/执行次数=递增值
            s.numFps = s.diff / (s.duration / s.milli)
        }

        //console.log("差值:"+s.diff+" ;递增:"+s.numFps+" ;毫秒/帧:"+s.milli);

        //Interval
        s.interval;
        /*=========================
          Method
          ===========================*/
        s.play = function () {
            s.interval = window.setInterval(function () {
                s.current = eval(s.current + s.numFps);
                s.counter.innerHTML = s.current;
                if (s.current >= s.to) {
                    s.counter.innerHTML = s.to;
                    clearInterval(s.interval);
                }
            }, s.milli);
        }
        /*=========================
          Control
          ===========================*/
        s.play();
    }
    window.Counters = function (params) {
        var s = this;
        //获得所有元素
        s.counters = document.querySelectorAll(".counter");
        s.counters.counters = [];
        var jsonParams = {};
        if (params) jsonParams = params;
        //实例化所有元素
        for (var i = 0, counter; counter = s.counters[i++];) {
            s.counters.counters[i] = new Counter(counter, jsonParams);
        }
    }
})(window, document, undefined);

//Animate
window.Animate = {
    raf: window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function (callback) {
            window.setTimeout(callback, 1000 / 60);
        },

    caf: window.cancelAnimationFrame ||
        window.webkitCancelAnimationFrame ||
        window.mozCancelAnimationFrame ||
        window.oCancelAnimationFrame ||
        window.msCancelAnimationFrame ||
        function (handler) {
            window.clearTimeout(handler);
        },
    //动画执行一次后销毁
    one: function (el, aniname) {
        var animExpr = new RegExp("\\s{0,}" + aniname, "g");
        if (el.className.match(animExpr)) {
            el.className = el.className.replace(animExpr, "");
        }
        el.className += " " + aniname;
        if (!el.hasEndEvent) {
            el.addEventListener("webkitAnimationEnd", function (e) {
                el.className = el.className.replace(animExpr, "");
            }, false);
            el.hasEndEvent = true;
        }
    },
    //setInterval帧率测试
    testSiFps: function (callback) {
        var fps = 0;
        var si = setInterval(function () {
            fps++;
        }, 1);
        setTimeout(function () {
            //alert("setInterval帧率："+fps);
            if (callback) {
                callback(fps);
            }
            clearInterval(si);
        }, 1000);
    },
    //requestAnimationFrame帧率测试
    testRafFps: function (callback) {
        var fps = 0;

        function fpstest(timestamp) {
            fps++;
            var raf = requestAnimationFrame(fpstest);
            if (timestamp >= 1000) {
                if (callback) {
                    callback(fps);
                }
                cancelAnimationFrame(raf);
            }
        }

        requestAnimationFrame(fpstest);
    }
};

//DateUtil
Date.prototype.compareDate = function (date1, date2) {//类型[Date]
    var t1days = new Date(date1.getFullYear(), date1.getMonth(), 0).getDate();
    var t1 = date1.getFullYear() + date1.getMonth() / 12 + date1.getDate() / t1days / 12;
    var t2days = new Date(date2.getFullYear(), date2.getMonth(), 0).getDate();
    var t2 = date2.getFullYear() + date2.getMonth() / 12 + date2.getDate() / t2days / 12;
    if (t1 == t2) return 0;
    else return t1 > t2;
}
Date.prototype.compareTime = function (time1, time2) {//格式hh:ss,大于返回1,等于返回0,小于返回-1
    var preTime1 = time1.split(":");
    var t1 = Math.abs(-preTime1[0] * 60 - preTime1[1]);
    var preTime2 = time2.split(":");
    var t2 = Math.abs(-preTime2[0] * 60 - preTime2[1]);
    if (t1 == t2) return 0;
    return t1 > t2;
}
Date.prototype.year = function () {
    return this.getFullYear();
}
Date.prototype.month = function () {
    var monthNum = this.getMonth() + 1;
    if (monthNum < 10) {
        monthNum = "0" + monthNum;
    }
    return monthNum;
}
Date.prototype.day = function () {
    var dayNum = this.getDate();
    if (dayNum < 10) {
        dayNum = "0" + dayNum;
    }
    return dayNum;
}
Date.prototype.hour = function () {
    var hourNum = this.getHours();
    if (hourNum < 10) {
        hourNum = "0" + hourNum;
    }
    return hourNum;
}
Date.prototype.minute = function () {
    var minuteNum = this.getMinutes();
    if (minuteNum < 10) {
        minuteNum = "0" + minuteNum;
    }
    return minuteNum;
}
Date.prototype.week = function (date) {//周
    if (date) {
        return new Date(date).getDay();
    }
    return this.getDay();
}
Date.prototype.seconds = function () {
    return this.getSeconds();
}
Date.prototype.milliseconds = function () {//毫秒
    return this.getMilliseconds();
}
Date.prototype.quarter = function () {//季
    return Math.floor((this.getMonth() + 3) / 3);
}
Date.prototype.date = function () {//yy-HH-dd
    return this.getFullYear() + "-" + this.month() + "-" + this.day();
}
Date.prototype.time = function () {//hh:mm
    return this.hour() + ":" + this.minute();
}
Date.prototype.datetime = function () {//yy-HH-dd hh:mm
    return this.date() + " " + this.time();
}
Date.prototype.fulldatetime = function () {//yy-HH-dd hh:mm:ss
    return this.datetime() + ":" + this.getSeconds();
}
Date.prototype.timestamp = function () {//获得现在距1970-1-1的毫秒数
    return this.getTime();
}
Date.prototype.days = function (year, month) {//返回当月共多少天
    if (month && year) {
        return new Date(year, month, 0).getDate();
    }
    return new Date(this.year(), this.month(), 0).getDate();
}
Date.prototype.diff = function (date1, date2) {
    var dateStart = new Date(date1);//开始时间
    var dateEnd = new Date(date2);//结束时间
    var dateDiffTime = dateStart.getTime() - dateEnd.getTime(); //时间差秒
    //计算出相差天数
    var daysDiff = Math.floor(dateDiffTime / (24 * 3600 * 1000));

    //计算出小时数
    var leave1 = dateDiffTime % (24 * 3600 * 1000); //计算天数后剩余的毫秒数
    var hoursDiff = Math.floor(leave1 / (3600 * 1000));

    //计算相差分钟数
    var leave2 = leave1 % (3600 * 1000); //计算小时数后剩余的毫秒数
    var minutesDiff = Math.floor(leave2 / (60 * 1000));

    //计算相差秒数
    var leave3 = leave2 % (60 * 1000); //计算分钟数后剩余的毫秒数
    var secondsDiff = Math.round(leave3 / 1000);

    return daysDiff + " " + hoursDiff + " " + minutesDiff + " " + secondsDiff;
}
Date.prototype.minusday = function (num) {
    var numTimestamp = num * 1000 * 60 * 60 * 24;
    var newdate = new Date();
    newdate.setTime(newdate.getTime() - numTimestamp);
    return newdate.year() + "-" + newdate.month() + "-" + newdate.day();
}
Date.prototype.plusday = function (num) {
    var numTimestamp = num * 1000 * 60 * 60 * 24;
    var newdate = new Date();
    newdate.setTime(newdate.getTime() + numTimestamp);
    return newdate.year() + "-" + newdate.month() + "-" + newdate.day();
}
Date.prototype.expires = function (cacheTime) {//时效性
    if (!cacheTime) return;
    //如果参数是小时
    if (!isNaN(cacheTime)) {
        var numTimestamp = cacheTime * 1000 * 60 * 60;
        var newDate = new Date(this.getTime() + numTimestamp);
        return newDate;
    }

    //如果参数是今天
    if (cacheTime === "today") {
        return new Date(this.plusday(1) + " 00:00:00");
    }

    //如果参数是日期yyyy-MM-dd
    return new Date(cacheTime);
}
Date.prototype.format = function (fmtDate, fmtType) {//格式化日期yyyy-MM-dd hh:mm:ss
    var fmt = "yyyy-MM-dd hh:mm:ss";
    if (fmtType) {
        fmt = fmtType;
    }
    var y, M, d, h, m, s;

    if (fmtDate instanceof Date == true) {
        y = fmtDate.getFullYear();
        M = fmtDate.getMonth() + 1;
        d = fmtDate.getDate();
        h = fmtDate.getHours();
        m = fmtDate.getMinutes();
        s = fmtDate.getSeconds();
    }
    //如果不是Date对象,就用另一种方法处理
    else {
        //匹配年月日yyyy-MM-dd或者yyyy.mm.dd或者yyyy/mm/dd
        var dateExpr = /([1-2][0-9][0-9][0-9])[\.\/-](0?[[1-9]|1[0-2])[\.\/-]([1-3][0-9]|0?[0-9])/
        var dateMatch = dateExpr.exec(fmtDate);
        if (!dateMatch || isNaN(dateMatch[1]) && isNaN(dateMatch[2]) && isNaN(dateMatch[3])) {
            alert("您所要格式化的时期格式不正确");
            return;
        }
        y = dateMatch[1];
        M = dateMatch[2];
        d = dateMatch[3];
        h = "00";
        m = "00";
        s = "00";

        //匹配时分hh:mm
        var timeExpr = /(0?[0-9]|[1-2][0-9]):([1-6][0-9]|0?[0-9])/
        var timeMatch = timeExpr.exec(fmtDate);
        if (timeMatch) {
            h = timeMatch[1] ? timeMatch[1] : "00";
            m = timeMatch[2] ? timeMatch[2] : "00";
            s = "00";
        }

        //匹配时分hh:mm:ss
        var tExpr = /(\d{2}|\d{1}):(\d{2}|\d{1}):(\d{2}|\d{1})/
        var tMatch = tExpr.exec(fmtDate);
        if (tMatch) {
            h = tMatch[1] ? tMatch[1] : "00";
            m = tMatch[2] ? tMatch[2] : "00";
            s = tMatch[3] ? tMatch[3] : "00";
        }
    }

    var dateExprs = {
        "M+": M,
        "d+": d,
        "h+": h,
        "m+": m,
        "s+": s
    };
    if (/(y+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (y + "").substr(4 - RegExp.$1.length));
    }
    for (var k in dateExprs) {
        //"("+ k +")"=(M+)、(d+)、(h+)...
        if (new RegExp("(" + k + ")").test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (dateExprs[k]) : (("00" + dateExprs[k]).substr(("" + dateExprs[k]).length)));
        }
    }
    return fmt;
}

//DB 本地数据库
var DB = (function () {
    function checkManifest() {
        window.addEventListener("updateready", function (e) {
            console.log("离线缓存状态：" + window.applicationCache.status);
            if (window.applicationCache.status == window.applicationCache.UPDATEREADY) {
                window.applicationCache.swapCache();
                if (confirm('发现此manifest文件有更新，是否更新？')) {
                    window.location.reload();
                }
            } else {
                console.log('manifest文件没有变化');
            }
        }, false);
    }

    function setCookie(key, value) {
        var Days = 30;
        var exp = new Date();
        exp.setTime(exp.getTime() + Days * 24 * 60 * 60 * 1000);
        document.cookie = key + "=" + escape(value) + ";expires=" + exp.toGMTString();
    }

    function getCookie(key) {
        var valExpr = new RegExp("(^| )" + key + "=([^;]*)(;|$)");
        var match = valExpr.exec(document.cookie);
        if (match && match[2]) {
            return unescape(match[2]);
        }
        return null;
    }

    function delCookie(key) {
        var exp = new Date();
        exp.setTime(exp.getTime() - 1);
        var val = getCookie(key);
        if (val != null) {
            document.cookie = key + "=" + val + ";expires=" + exp.toGMTString();
        }
    }

    var store = window.localStorage;
    var session = window.sessionStorage;
    if (!store) {
        doc.style.behavior = 'url(#default#userData)'; //保存表单的值
        //console.log("您当前的设备不支持本地数据库localstore");
    }
    return {
        //application cache
        checkManifest: checkManifest,
        /**
         * 保存数据
         *
         * @method set
         * @param key //键
         * @param val //值
         * @return void
         */
        set: function (key, val) {
            if (store) {
                store.setItem(key, val);
            } else {
                setCookie(key, val);
            }
        },
        /**
         * 保存数据
         *
         * @method get
         * @param key //键
         * @return string //返回您所存储的值
         */
        get: function (key) {
            if (store) {
                if (typeof key == "number") {
                    return store.key(key);
                }
                return store.getItem(key);
            } else {
                return getCookie(key);
            }
        },
        /**
         * 删除数据
         *
         * @method del
         * @param key //根据键删除此项
         */
        del: function (key) {
            if (store) {
                store.removeItem(key);
            } else {
                delCookie(key);
            }
        },
        /**
         * 清空数据
         *
         * @method clear
         * @return void
         */
        clear: function () {
            if (store) {
                return store.clear();
            } else {
                alert("抱歉，cookie不可以全部清空!");
            }
        },

        setSession: function (key, value) {
            session.setItem(key, value);
        },
        getSession: function (key) {
            if (typeof key == "number") {
                return session.key(key);
            }
            return session.getItem(key);
        },
        delSession: function (key) {
            session.removeItem(key);
        },
        clearSession: function () {
            session.clear();
        },
        /**
         * 根据请求名称获取值
         *
         * @method getParameter
         * @param argName //参数名称
         * @return string
         */
        getParameter: function (argName) {
            var param = location.search.match(new RegExp("[\?\&]" + argName + "=([^\&]*)(\&?)", "i"));
            return param ? param[1] : param;
        }
    };
})();

//Shake 摇一摇
(function (window, document, undefined) {
    window.Shake = function (params) {
        /*=========================
          Params
          ===========================*/
        var defaults = {
            "shakeThreshold": 3000,
            /*callbacks
			onShook:function(Slider)
			*/
        }
        params = params || {};
        for (var def in defaults) {
            if (params[def] === undefined) {
                params[def] = defaults[def];
            }
        }
        //Shake
        var s = this;
        s.params = params;
        var lastUpdate = 0;//设置最后更新时间，用于对比
        var curShakeX = curShakeY = curShakeZ = lastShakeX = lastShakeY = lastShakeZ = 0;

        /*=========================
          Handler
          ===========================*/
        function deviceMotionHandler(e) {
            var acceleration = e.accelerationIncludingGravity;//获得重力加速
            var curTime = new Date().getTime();//获得当前时间戳
            if ((curTime - lastUpdate) > 100) {
                var diffTime = curTime - lastUpdate;//时间差
                lastUpdate = curTime;
                curShakeX = acceleration.x;//x轴加速度
                curShakeY = acceleration.y;//y轴加速度
                curShakeZ = acceleration.z;//z轴加速度
                var speed = Math.abs(curShakeX + curShakeY + curShakeZ - lastShakeX - lastShakeY - lastShakeZ) / diffTime * 10000;
                if (speed > s.params.shakeThreshold) {
                    if (s.params.onShook) s.params.onShook(s);
                }
                lastShakeX = curShakeX;
                lastShakeY = curShakeY;
                lastShakeZ = curShakeZ;
            }
        }

        if (window.DeviceMotionEvent) {
            window.addEventListener('devicemotion', deviceMotionHandler, false);
        } else {
            console.log('您好，你目前所用的设备好像不支持重力感应哦！');
        }
    }
})(window, document, undefined);

//Dragrefresh 下拉刷新
(function (window, document, undefined) {
    window.Dragrefresh = function (container, params) {
        /*==================
		  Model
		  ==================*/
        var defaults = {
            "isDisableTop": false,
            "isDisableBottom": false,
            "minScrollTop": 0,
            "threshold": 100,
            "thresholdMaxRange": 100,
            "refreshHideTop": 0,
            "duration": 150,
            "timeout": 5000,

            "bottomContainerClass": "loading-more",
            "bottomContainerLoadingClass": "loading",

            /*callbacks
			onRefreshStart:function(Dragrefresh)
			onRefreshEnd:function(Dragrefresh)
			onRefreshTimeout:function(Dragrefresh)
			onScroll:function(Dragrefresh)
			onBottom:function(Dragrefresh)
			*/
        }
        params = params || {};
        for (var def in defaults) {
            if (params[def] === undefined) {
                params[def] = defaults[def];
            }
        }
        var s = this;
        s.params = params;
        //最大拉动值
        s.params.thresholdMax = s.params.threshold + s.params.thresholdMaxRange;
        //Container
        s.container = typeof container == "string" ? document.querySelector(container) : container;
        //创建DOM
        s.createRefresh = function () {
            if (s.topContainer) return;
            s.topContainer = document.createElement("div");
            s.topContainer.setAttribute("class", "dragrefresh box box-middlecenter");
            var iconSvg = '<svg width="1000.6px" height="1000.6px" viewBox="0 0 1000.6 1000.6" xml:space="preserve">' +
                '<path d="M867.4,456.1c-24.1,0-43.8,19.7-43.8,43.8c0,1.5,0.1,3.1,0.3,4.6c-2.2,176.4-147.1,319.6-323.7,319.6 c-178.5,0-323.8-145.3-323.8-323.8s145.3-323.8,323.8-323.8c62.8,0,122.8,17.7,174.4,50.8l-29,52.2c0,0,138.4,2.2,149.2,2.4 c10.8,0.2,14.6-5.6,14.6-5.6s5.1-5.8,2.4-15.5c-2.6-9.7-43.2-162.2-43.2-162.2l-38.5,61.1c-67.3-45.7-146.7-70.1-229.8-70.1 c-226.6,0-411,184.4-411,411s184.4,411,411,411c225.8,0,410.1-183.7,410.9-407.3l0.2-4.2C911.2,475.7,891.6,456.1,867.4,456.1z"/>' +
                '</svg>';
            s.topContainer.innerHTML = iconSvg;
            s.container.appendChild(s.topContainer);
        };
        s.createRefresh();
        s.bottomContainer = null;
        s.createBottomContainer = function () {
            s.bottomContainer = s.container.querySelector("." + s.params.bottomContainerClass);
            if (!s.bottomContainer) {
                s.bottomContainer = document.createElement("div");
                s.bottomContainer.setAttribute("class", s.params.bottomContainerClass);
                var spinnerdiv = document.createElement("div");
                spinnerdiv.setAttribute("class", s.params.bottomContainerLoadingClass);
                s.bottomContainer.appendChild(spinnerdiv);
                s.container.appendChild(s.bottomContainer);
            }
        }
        if (s.params.onBottom) s.createBottomContainer();

        /*==================
		  Mothod
		  ==================*/
        //添加动画
        /*s.addTransition=function(duration){
			if(!duration)duration=s.params.duration;
			s.topContainer.style.webkitTransitionDuration=duration+"ms";
		};*/
        //移除动画
        /*s.removeTransition=function(){
			s.topContainer.style.webkitTransitionDuration="0ms";
		};*/
        //变形
        /*s.transform=function(y,deg){
			if(!y)y=s.touches.posY;
			if(!deg)deg=s.touches.rotateDeg;
			s.topContainer.style.webkitTransform='translate3d(0,' + y + 'px,0) rotate(' + deg + 'deg)';
		}*/
        //旋转,10W毫秒，旋转4万6千度
        s.spinner = function () {
            /*s.addTransition("100000");
			s.transform(null,"46000");*/
            s.topContainer.style.webkitTransitionDuration = "100000ms";
            s.topContainer.style.webkitTransform = 'translate3d(0,' + s.touches.posY + 'px,0) rotate(46000deg)';
        }
        s.delaySpinner = function () {//兼容一些不旋转的问题
            s.topContainer.style.webkitTransitionDuration = "100000ms";
            setTimeout(function () {
                s.topContainer.style.webkitTransform = 'translate3d(0,' + s.touches.posY + 'px,0) rotate(46000deg)';
            }, 100);
        }
        s.cancelSpinner = function () {
            /*s.removeTransition();
			s.transform(null,"0");*/
            s.topContainer.style.webkitTransitionDuration = "0ms";
            s.topContainer.style.webkitTransform = 'translate3d(0,' + s.touches.posY + 'px,0) rotate(0deg)';
        };
        s.isHid = false;
        //隐藏
        s.hide = function () {
            //停止旋转
            s.cancelSpinner();
            //收起
            //s.addTransition();
            s.topContainer.style.webkitTransitionDuration = s.params.duration + "ms";
            s.touches.posY = s.params.refreshHideTop;
            //s.transform(s.touches.posY,s.touches.rotateDeg);
            s.topContainer.style.webkitTransform = 'translate3d(0,' + s.touches.posY + 'px,0) rotate(' + s.touches.rotateDeg + 'deg)';

            s.isHid = true;
        };
        //显示
        s.show = function () {
            s.isHid = false;
            //收到指定位置
            //s.addTransition();
            s.topContainer.style.webkitTransitionDuration = s.params.duration + "ms";
            if (s.touches.posY == s.params.threshold) {//不执行onTransitionEnd的情况，直接旋转
                s.delaySpinner();
            }
            s.touches.posY = s.params.threshold;
            //s.transform(s.touches.posY);
            s.topContainer.style.webkitTransform = 'translate3d(0,' + s.touches.posY + 'px,0) rotate(' + s.touches.rotateDeg + 'deg)';
        }
        //销毁对象
        s.destroyTop = function () {
            s.container.removeChild(s.topContainer);
        }
        s.destroyBottom = function () {
            s.container.removeChild(s.bottomContainer);
        }
        s.destroy = function () {
            s.destroyTop();
            s.destroyBottom();
            //销毁事件
            s.detach();
        }
        //Callback 刷新中
        s.refresh = function () {
            s.show();
            //callback onRefreshStart
            if (s.params.onRefreshStart) {
                s.params.onRefreshStart(s);
            }
            //callback 超时
            if (s.params.onRefreshTimeout) {
                s.timeout = setTimeout(function () {
                    s.params.onRefreshTimeout(s);
                }, s.params.timeout);
            }
        };
        //Callback 刷新完成
        s.refreshComplete = function () {
            //清除超时
            if (s.timeout) window.clearTimeout(s.timeout);
            //收起
            s.hide();
            //callback 刷新结束
            if (s.params.onRefreshEnd) {
                s.params.onRefreshEnd(s);
            }
        }
        //Callback 刷新超时
        s.refreshTimeout = function () {
            s.hide();
            s.params.onRefreshTimeout(s);
        };

        /*==================
		  Controller
		  ==================*/
        s.isRefreshEnd = true;
        s.events = function (detach) {
            var action = detach ? "removeEventListener" : "addEventListener";
            if (s.params.isDisableTop === false) {
                var touchTarget = s.container;
                touchTarget[action]("touchstart", s.onTouchStart, false);
                touchTarget[action]("touchmove", s.onTouchMove, false);
                touchTarget[action]("touchend", s.onTouchEnd, false);
                touchTarget[action]("touchcancel", s.onTouchEnd, false);
                //头部动画监听
                s.topContainer[action]("webkitTransitionEnd", s.onTransitionEnd, false);
            }
            if (s.params.isDisableBottom === false) {
                //绑定底部事件
                if (s.bottomContainer) s.container[action]("scroll", s.onScroll, false);
            }
        }
        //attach、detach事件
        s.attach = function () {
            s.events();
        };
        s.detach = function () {
            s.events(true);
        };

        //Touch信息
        s.touches = {
            direction: 0,
            vertical: 0,
            isTop: true,
            startX: 0,
            startY: 0,
            currentX: 0,
            currentY: 0,
            endX: 0,
            endY: 0,
            diffX: 0,
            diffY: 0,
            posY: 0,
            rotateDeg: 0
        };
        s.preventDefault = function (e) {
            e.preventDefault();
        }
        s.onTouchStart = function (e) {
            if (s.isRefreshEnd === false) return;

            s.container.addEventListener("touchmove", s.preventDefault, false);
            //如果不在顶部，则不触发
            if (s.container.scrollTop > s.params.minScrollTop) s.touches.isTop = false;
            else s.touches.isTop = true;

            //s.removeTransition();
            s.topContainer.style.webkitTransitionDuration = "0ms";

            s.touches.startX = e.touches[0].clientX;
            s.touches.startY = e.touches[0].clientY;
        };

        s.onTouchMove = function (e) {
            if (s.isRefreshEnd === false) return;

            s.touches.currentX = e.touches[0].clientX;
            s.touches.currentY = e.touches[0].clientY;
            s.touches.diffY = s.touches.currentY - s.touches.startY;
            s.touches.diffX = s.touches.startX - s.touches.currentX;

            //设置滑动方向(-1上下 | 1左右)
            if (s.touches.direction === 0) {
                s.touches.direction = Math.abs(s.touches.diffX) > Math.abs(s.touches.diffY) ? 1 : -1;
            }
            //设置垂直方向(-1上 | 1下)
            if (s.touches.direction === -1) {
                s.touches.vertical = s.touches.diffY < 0 ? 1 : -1;
            }

            if (s.touches.vertical == 1 || !s.touches.isTop) {//向上滑动或者不在顶部
                s.container.removeEventListener("touchmove", s.preventDefault, false);
            } else if (s.touches.vertical === -1) {//下拉
                s.touches.posY = s.params.refreshHideTop + s.touches.diffY;
                if (s.touches.posY < s.params.thresholdMax) {
                    s.touches.rotateDeg = s.touches.posY * 2;
                    //s.transform(s.touches.posY,s.touches.rotateDeg);
                    s.topContainer.style.webkitTransform = 'translate3d(0,' + s.touches.posY + 'px,0) rotate(' + s.touches.rotateDeg + 'deg)';
                }
            }
        };
        s.onTouchEnd = function (e) {
            //清除move时记录的方向
            s.touches.direction = 0;
            s.touches.vertical = 0;

            if (s.isRefreshEnd === false) return;

            s.container.removeEventListener("touchmove", s.preventDefault, false);
            if (s.touches.posY != 0) {//下拉情况下
                if (s.touches.posY < s.params.threshold) {//如果小于hold值，则收起刷新
                    s.hide();
                } else {//刷新
                    s.refresh();
                }
                //标识是否刷新结束，防止重复下拉
                s.isRefreshEnd = false;
            }
        };
        s.onTransitionEnd = function (e) {
            if (s.isHid === false) {
                s.spinner();
            } else if (s.isHid === true) {
                s.isRefreshEnd = true;
            }
        }
        s.onScroll = function (e) {
            s.target = e.target;
            if (s.params.onScroll) s.params.onScroll(s);
            if (s.params.onBottom && this.scrollTop + this.clientHeight >= this.scrollHeight) {
                s.params.onBottom(s);
            }
        }
        //主函数
        s.init = function () {
            s.attach();
        };

        s.init();
    };
})(window, document, undefined);

//Emoji 表情管理
(function (window, document, undefined) {
    window.Emoji = {
        icons: {
            "[微笑]": "[weixiao]",
            "[难过]": "[nanguo]",
            "[色]": "[se]",
            "[发呆]": "[fadai]",
            "[酷]": "[cool]",
            "[大哭]": "[daku]",
            "[害羞]": "[haixiu]",

            "[闭嘴]": "[bizui]",
            "[睡觉]": "[shuijiao]",
            "[哭]": "[ku]",
            "[流汗]": "[liuhan]",
            "[发怒]": "[fanu]",
            "[眨眼]": "[zhayan]",
            "[龇牙]": "[ziya]",

            "[惊讶]": "[jingya]",
            "[傲慢]": "[aoman]",
            "[得意]": "[deyi]",
            "[可怜]": "[kelian]",
            "[拜拜]": "[baibai]",
            "[开心]": "[kaixin]",
            "[呕吐]": "[outu]",
            "[奋斗]": "[fendou]",
            "[坏笑]": "[huaixiao]",
            "[尴尬]": "[ganga]",
            "[惊吓]": "[jingxia]",
            "[打哈欠]": "[dahaqian]",
            "[白眼]": "[baiyan]",
            "[鄙视]": "[bishi]",

            "[抽烟]": "[chouyan]",
            "[敲头]": "[qiaotou]",
            "[亲亲]": "[qingqing]",
            "[恭喜]": "[gongxi]",
            "[奸笑]": "[jianxiao]",
            "[骂人]": "[maren]",
            "[糗]": "[qiu]",

            "[伤心]": "[shangxin]",
            "[受委屈]": "[shouweiqu]",
            "[偷笑]": "[touxiao]",
            "[挖鼻孔]": "[wabikong]",
            "[委屈]": "[weiqu]",
            "[问]": "[wen]",
            "[擦汗]": "[cahan]",
            "[左哼哼]": "[zuohengheng]",
            "[右哼哼]": "[youhengheng]",
            "[晕]": "[yun]",
            "[大笑]": "[daxiao]",
            "[吓]": "[xia]",
            "[困]": "[kun]",
            "[嘘]": "[xu]",

            "[加油]": "[jiayou]",
            "[强]": "[qiang]",
            "[我爱你]": "[iloveyou]",
            "[差劲]": "[chajin]",
            "[No]": "[no]",
            "[Ok]": "[ok]",
            "[弱]": "[ruo]",

            "[抱拳]": "[baoquan]",
            "[握手]": "[woshou]",
            "[Yeah]": "[yeah]",
            "[来]": "[lai]",
            "[猪头]": "[zhutou]",
            "[心]": "[xin]",
            "[心碎]": "[xinsui]",
            "[抱抱]": "[baobao]",
            "[红唇]": "[hongchun]",
            "[菜刀]": "[caidao]",
            "[太阳]": "[taiyang]",
            "[夜晚]": "[yewan]",
            "[骷髅]": "[kulou]",
            "[花谢了]": "[huaxiele]",

            "[蛋糕]": "[dangao]",
            "[咖啡]": "[kafei]",
            "[足球]": "[zuqiu]",
            "[骷髅]": "[kulou]",
            "[西瓜]": "[xigua]",
            "[炸弹]": "[zhadan]",
            "[篮球]": "[lanqiu]",

            "[礼物]": "[liwu]",
            "[大便]": "[dabian]",
            "[玫瑰]": "[meigui]",
            "[米饭]": "[mifan]",
            "[瓢虫]": "[piaochong]",
            "[啤酒]": "[pijiu]",
            "[闪电]": "[shandian]",
        },
        parse: function (str) {
            var emojiExpr = /(\[[\u4E00-\u9FA5]*\])/gm;
            var result, parseStr = str;
            while (emojiExpr.exec(str)) {
                if (this.icons[RegExp.$1]) {
                    parseStr = parseStr.replace(RegExp.$1, "<span data-emoji=\"" + this.icons[RegExp.$1] + "\"></span>");
                }
            }
            return parseStr;
        }
    }
})(window, document, undefined);

//SafeLvl 密码安全级别
(function (window, document, undefined) {
    window.SafeLvl = {
        /*字符类型*/
        charMode: function (iN) {
            if (iN >= 48 && iN <= 57) //数字
                return 1;
            if (iN >= 65 && iN <= 90) //大写
                return 2;
            if (iN >= 97 && iN <= 122) //小写
                return 4;
            else
                return 8;
        },
        /*计算密码模式*/
        pwdLvl: function (modeNum) {//
            var lvl = 0;
            for (var i = 0; i < 4; i++) {
                if (modeNum & 1) lvl++;
                modeNum >>>= 1;
            }
            return lvl;
        },
        /*密码强度检测*/
        checkSafe: function (pwdField, lvlField) {
            var val = pwdField.value;
            if (val.length <= 0) {
                lvlField.className = lvlField.className.replace(/lvl[0-3]/, "lvl0");
                return;
            }
            var mode = 0;
            for (var i = 0; i < val.length; i++) {
                mode |= this.charMode(val.charCodeAt(i));
            }
            var safelvl = this.pwdLvl(mode);
            if (lvlField) {
                lvlField.className = lvlField.className.replace(/lvl[0-3]/, "lvl" + safelvl);
            }
            return safelvl;
        }
    }
})(window, document, undefined);

//Formcontrols (require form.safelvl.js)
(function (window, document, undefined) {
    window.Formcontrols = function (params) {
        /*================
		Model
		================*/
        var defaults = {
            rangeTipClass: "range-tooltip",//滑动条弹出框
            numboxClass: "numbox",//数字框
            revealAttr: "[data-input=reveal]",
            clearAttr: "[data-input=clear]",
            safelvlClass: "safelvl"
        }
        params = params || {};
        for (var def in defaults) {
            if (params[def] === undefined) {
                params[def] = defaults[def];
            }
        }
        //Formcontrols
        var s = this;
        //Params
        s.params = params;

        /*================
		Method
		================*/
        s.update = function () {
            s.detach();
            s.attach();
        }
        /*================
		Events
		================*/
        s.events = function (detach) {
            var action = detach ? "removeEventListener" : "addEventListener";
            //开关控件
            var switches = document.querySelectorAll(".switch");

            for (var i = 0, swi; swi = switches[i++];) {
                swi[action]("click", s.onSwitch, false);
            }
            //密码小眼睛
            var reveals = document.querySelectorAll(s.params.revealAttr + " [type=password] + i");
            for (var j = 0, reveal; reveal = reveals[j++];) {
                reveal[action]("click", s.onReveal, false);
            }
            //清除按钮框
            var clears = document.querySelectorAll(s.params.clearAttr + " input");
            var clearIcons = document.querySelectorAll(s.params.clearAttr + " input+i");
            for (var k = 0; k < clears.length; k++) {
                clears[k][action]("input", s.onClear, false);
                if (clearIcons[k]) clearIcons[k][action]("click", s.onClearIcon, false);
            }
            //安全检测框
            var safes = document.querySelectorAll("." + s.params.safelvlClass);
            for (var l = 0, safe; safe = safes[l++];) {
                var safeInput = safe.parentNode.querySelector("input[type]");
                safeInput[action]("input", s.onSafeLvl, false);
            }
            //拖动条
            var ranges = document.querySelectorAll("." + s.params.rangeTipClass + "+input[type=range]");
            for (var m = 0, range; range = ranges[m++];) {
                range[action]("touchstart", s.onRangeStart, false);
                range[action]("touchmove", s.onRangeMove, false);
                range[action]("input", s.onRangeMove, false);
                range[action]("touchend", s.onRangeEnd, false);
            }
            //数字框
            var numboxs = document.querySelectorAll("." + s.params.numboxClass + " input[type=number]");
            for (var n = 0, numbox; numbox = numboxs[n++];) {
                numbox.nextElementSibling[action]("click", s.onNumboxPlus, false);
                numbox.previousElementSibling[action]("click", s.onNumboxMinus, false);
            }
        }
        s.hasEvents = false;
        s.attach = function (event) {
            if (!s.hasEvents) s.events();
        }
        s.detach = function (event) {
            s.events(true);
        }
        /*================
		Events Handler
		================*/
        /*开关控件*/
        s.createHiddenInput = function (name) {
            var hiddenInput = document.createElement("input");
            hiddenInput.setAttribute("type", "hidden");
            if (name) hiddenInput.setAttribute("name", name);
            return hiddenInput;
        }
        s.onSwitch = function (e) {
            var parentNode = this.parentNode;
            var name = this.getAttribute("data-name");
            var onVal = this.getAttribute("data-on-value");
            var offVal = this.getAttribute("data-off-value");
            var hiddenInput = this.nextElementSibling;
            if (hiddenInput && (!hiddenInput.type || hiddenInput.type != "hidden")) hiddenInput = null;
            if (name && !hiddenInput) {
                hiddenInput = s.createHiddenInput(name);
                parentNode.insertBefore(hiddenInput, this.nextSibling);
            }
            if (this.classList.contains("active")) {
                this.classList.remove("active");
                if (hiddenInput) hiddenInput.value = offVal;
            } else {
                this.classList.add("active");
                if (hiddenInput) hiddenInput.value = onVal;
            }
        }
        /*密码小眼睛*/
        s.onReveal = function (e) {
            var pwdInput = this.parentNode.querySelector("input[type]");
            if (this.classList.contains("active")) {
                this.classList.remove("active");
                pwdInput.type = "password";
            } else {
                this.classList.add("active");
                pwdInput.type = "text";
            }
            pwdInput.focus();
        }
        /*清除按钮框*/
        s.onClear = function (e) {
            var clearIcon = this.nextElementSibling;
            if (!clearIcon || clearIcon.tagName != "I") return;
            if (this.value.length > 0) {
                clearIcon.style.display = "block";
            } else {
                clearIcon.style.display = "none";
            }
        }
        s.onClearIcon = function (e) {
            var txtInput = this.parentNode.querySelector("input[type]");
            this.style.display = "none";
            txtInput.value = "";
            txtInput.focus();
        }
        /*安全检测框*/
        s.onSafeLvl = function (e) {
            var lvlField = this.parentNode.querySelector("." + s.params.safelvlClass);
            if (SafeLvl) SafeLvl.checkSafe(this, lvlField);
        }
        /*拖动条*/
        s.showToolTip = function (tooltip, rangeInput) {
            //当前值所占百分比
            var percent = ((rangeInput.value - rangeInput.min) / (rangeInput.max - rangeInput.min)).toFixed(2);

            //距左的位置
            var dragRange = rangeInput.clientWidth * percent;
            var offsetLeft = rangeInput.offsetLeft + dragRange - 10;
            //var currentOffsetLeft=offsetLeft-rangeInput.parentNode.offsetLeft;

            //滑块内部的实际位置
            var currentBallLeft = 28 * percent;

            //当前值的位置-滑块的位置=小球正中间的位置
            var left = offsetLeft - currentBallLeft;
            tooltip.innerHTML = rangeInput.value;
            tooltip.setAttribute("style", "display:block;left:" + left + "px");
        }
        s.rangeTooltip, s.rangeInput;
        s.onRangeStart = function (e) {
            s.rangeTooltip = this.previousElementSibling;
            s.rangeInput = this;
            s.showToolTip(s.rangeTooltip, s.rangeInput);
        }
        s.onRangeMove = function (e) {
            s.showToolTip(s.rangeTooltip, s.rangeInput);
        }
        s.onRangeEnd = function (e) {
            setTimeout(function () {
                s.rangeTooltip.style.display = "none";
            }, 1000);
        }
        //数字框
        s.numboxSum = function (inputNumber, btnPlus, btnMinus, operate) {
            var min = inputNumber.getAttribute("min") || 0;
            var max = inputNumber.getAttribute("max") || 9999;
            var step = inputNumber.getAttribute("step") || 1;

            var result;

            if (operate) {//加运算
                btnMinus.disabled = false;
                result = parseInt(inputNumber.value) + parseInt(step);
                if (result >= max) {
                    result = max;
                    btnPlus.disabled = true;
                }
            } else {//减运算
                btnPlus.disabled = false;
                result = inputNumber.value - step;
                if (result <= min) {
                    result = min;
                    btnMinus.disabled = true;
                }
            }
            inputNumber.value = result;
        }
        s.onNumboxPlus = function (e) {
            var inputNumber = this.previousElementSibling;
            var btnPlus = this;
            var btnMinus = inputNumber.previousElementSibling;
            s.numboxSum(inputNumber, btnPlus, btnMinus, true);
        }
        s.onNumboxMinus = function (e) {
            var inputNumber = this.nextElementSibling;
            var btnPlus = inputNumber.nextElementSibling;
            var btnMinus = this;
            s.numboxSum(inputNumber, btnPlus, btnMinus, false);
        }
        //初始化
        s.init = function () {
            s.attach();
        };
        s.init();
    }
})(window, document, undefined);

//Form(require toast.js)
(function (window, document, undefined) {
    window.Form = function (container, params) {
        /*================
		Model
		================*/
        var defaults = {
            formFilterClass: null,//过滤表单元素
            toastParent: document.body,//提示框的父元素

            /*callbacks
			onSuccess:function(Form)
			onFail:function(Form)
			*/
        }
        params = params || {};
        for (var def in defaults) {
            if (params[def] === undefined) {
                params[def] = defaults[def];
            }
        }
        //Form
        var s = this;
        //Params
        s.params = params;
        //Container
        s.container = typeof container == "string" ? document.querySelector(container) : container;
        //表单元素
        s.formElements = [];
        s.updateFormElements = function () {
            s.formElements = [];
            //获取有效的表单元素
            for (var i = 0; i < s.container.elements.length; i++) {
                var field = s.container.elements[i];
                //过滤没有name的表单元素
                if (!field.type || !field.name) {
                    continue;
                }
                //过滤button、reset、submit
                if (field.type == "button" || field.type == "reset" || field.type == "submit") {
                    continue;
                }
                //过滤未选中的checkbox和radio
                if (field.type == "radio" || field.type == "checkbox") {
                    if (!field.checked) {
                        continue;
                    }
                }
                if (s.params.formFilterClass && field.classList.contains(s.params.formFilterClass)) {
                    continue;
                }
                //push到数组里
                s.formElements.push(field);
            }
        };
        s.updateFormElements();
        //添加formElements对象
        s.pushElement = function (el) {
            s.formElements.push(el);
        };
        /*================
		Method
		================*/
        /*表单Json化*/
        s.serializeArray = function () {
            var parts = [], field = null;
            for (var i = 0; i < s.formElements.length; i++) {
                field = s.formElements[i];
                //如果是多选框，则每个值单独一个条目
                if (field.type == "select-one" || field.type == "select-multiple") {
                    for (var j = 0; j < field.options.length; j++) {
                        var option = field.options[j];
                        if (option.selected) {
                            parts.push(field.name + "=" + field.value);
                        }
                    }
                } else {
                    //push到数组里
                    parts.push(field.name + "=" + field.value);
                }
            }
            return parts;
        };
        /*表单序列化*/
        s.serialize = function () {
            //序列化
            var parts = s.serializeArray();
            //获得字符串
            return parts.join("&");
        };
        /*单个元素验证*/
        var ruleExpr = {
            "required": /.+/,//不能为空
            "positiveInteger": /^[1-9]{1,}[0-9]*$/,//正整数
            "username": /^[\w]*$/,//只能包括字母、数字和下划线
            "password": /^[0-9_a-zA-Z-~!@#$]*$/,//密码格式不正确
            "mail": /^(\w+@\w+\.[\.\w]+)?$/,//邮箱格式不正确
            "phone": /^([1][34578][0-9]{9})?$/,//手机号码输入不正确
            "chinese": /^[\u4E00-\u9FA5]*$/,//只能填写中文
            "specialchar": /^([\u4e00-\u9fa5]*|[a-zA-Z0-9]*)$///不能为特殊字符
        }
        s.rule = function (field) {
            var ruleField = field.getAttribute("data-rule-field") || "";
            var rule = field.getAttribute("data-rule").split(" ");
            var value = field.value || "";
            var errorMsg = null;
            for (var i = 0, rulename; rulename = rule[i++];) {
                if (ruleExpr[rulename]) {//正则验证
                    if (!ruleExpr[rulename].test(value)) {
                        errorMsg = ruleField + lang.rule[rulename];
                        break;
                    }
                }
                if (value.length <= 0) {//如果为空
                    break;
                }
                if (rulename.indexOf("minlength") >= 0) {
                    var minlength = rulename.split(":")[1];
                    if (value.length < minlength) {
                        errorMsg = ruleField + lang.rule.minlength + minlength + lang.rule.unit;
                        break;
                    }
                } else if (rulename.indexOf("maxlength") >= 0) {
                    var maxlength = rulename.split(":")[1];
                    if (value.length > maxlength) {
                        errorMsg = ruleField + lang.rule.maxlength + maxlength + lang.rule.unit + "，超出" + eval(value.length - maxlength) + lang.rule.unit;
                        break;
                    }
                } else if (rulename.indexOf("number") >= 0) {
                    if (!Number(value)) {
                        errorMsg = ruleField + lang.rule.number;
                        break;
                    }
                } else if (rulename.indexOf("minnumber") >= 0) {
                    var minnumber = rulename.split(":")[1];
                    if (Number(value) < Number(minnumber)) {
                        errorMsg = ruleField + lang.rule.minnumber + minnumber;
                        break;
                    }
                } else if (rulename.indexOf("maxnumber") >= 0) {
                    var maxnumber = rulename.split(":")[1];
                    if (Number(value) > Number(maxnumber)) {
                        errorMsg = ruleField + lang.rule.maxnumber + maxnumber;
                        break;
                    }
                } else if (rulename.indexOf("compare") >= 0) {
                    var compareElem = document.getElementsByName(rulename.split(":")[1])[0];

                    if (compareElem && compareElem.value && compareElem.value != value) {
                        errorMsg = lang.rule.twice + ruleField + lang.rule.compare;
                        break;
                    }
                } else if (rulename == "safelvl") {
                    var divSafes = document.querySelectorAll(".safelvl");
                    var pattern = /lvl([0-9])/;
                    for (var j = 0, divSafe; divSafe = divSafes[j++];) {
                        var str = divSafe.className;
                        //如果安全等级低于2则返回
                        console.log(pattern.exec(str)[1]);
                        if (pattern.exec(str) && pattern.exec(str)[1] && pattern.exec(str)[1] < 2) {
                            errorMsg = ruleField + lang.rule[rulename];
                            break;
                        }
                        if (errorMsg) break;
                    }
                }
            }
            return errorMsg;
        };
        /*表单验证*/
        s.toast = new Toast("格式不正确", {
            "parent": s.params.toastParent
        });
        s.validate = function () {
            for (var i = 0, field; field = s.formElements[i++];) {
                if (!field.getAttribute("data-rule")) {
                    continue;
                }
                var errormsg = s.rule(field);
                if (errormsg) {
                    s.field = field;
                    s.errormsg = errormsg;
                    s.toast.setText(errormsg);
                    if (s.params.onFail) {
                        s.params.onFail(s);
                    } else {
                        s.toast.show();
                    }
                    //field.focus();
                    return false;
                }
            }
            if (s.params.onSuccess) s.params.onSuccess(s);
            return true;
        };
    }
})(window, document, undefined);

//CountValue 文字计数器
(function (window, document, undefined) {
    window.CountValue = function (field, params) {
        /*================
		Model
		================*/
        var defaults = {
            maxLengthAttr: "data-maxlength",
            defaultMaxLength: 20
            /*
            Callbacks:
            onInput:function(CountValue)
			onInputOut:function(CountValue)//文字超过限制
			onInputIn:function(CountValue)//文字未超过限制
			*/
        }
        params = params || {};
        for (var def in defaults) {
            if (params[def] === undefined) {
                params[def] = defaults[def];
            }
        }
        var s = this;
        //Params
        s.params = params;
        //Field(Element)
        s.field = typeof field === "string" ? document.querySelector(field) : field;
        //Maxlength(Number)
        s.maxLength = s.field.getAttribute(s.params.maxLengthAttr) || s.params.defaultMaxLength;
        /*================
		Method
		================*/
        s.destroy = function () {
            s.detach();
        }
        /*================
		Controller
		================*/
        s.events = function (detach) {
            var action = detach ? "removeEventListener" : "addEventListener";
            if (!s.hasInputEvent) {
                s.field[action]("input", s.onInput, false);
                s.hasInputEvent = true;
            }
        }
        s.attach = function (event) {
            s.events();
        }
        s.detach = function (event) {
            s.events(true);
        }
        s.onInput = function (e) {
            s.target = e.target;
            //Callback
            if (s.params.onInput) s.params.onInput(s);
            if (s.maxLength < s.target.value.length && s.params.onInputOut) {
                if (s.params.onInputOut) s.params.onInputOut(s);
            } else {
                if (s.params.onInputIn) s.params.onInputIn(s);
            }
        }
        //Init
        s.init = function () {
            s.attach();
        }
        s.init();
    }
    window.CountValues = function (params) {
        /*================
		Model
		================*/
        var defaults = {
            fieldClass: "countvalue",
            /*
            Callbacks:
            onInput:function(CountValue)
			onInputOut:function(CountValue)//文字超过限制
			onInputIn:function(CountValue)//文字未超过限制
			*/
        }
        params = params || {};
        for (var def in defaults) {
            if (params[def] === undefined) {
                params[def] = defaults[def];
            }
        }
        var s = this;
        //Params
        s.params = params;
        //获得所有元素
        s.updateFields = function () {
            s.fields = document.querySelectorAll("." + s.params.fieldClass);
        }
        s.updateFields();
        /*================
		Method
		================*/
        //实例化所有元素
        s.loadCountValue = function () {
            for (var i = 0; i < s.fields.length; i++) {
                s.fields[i].countValue = new CountValue(s.fields[i], s.params);
            }
        }
        s.loadCountValue();
        s.destroyCountValue = function () {
            for (var i = 0; i < s.fields.length; i++) {
                s.fields[i].countValue.destroy();
            }
            s.fields = null;
        }
        //更新
        s.update = function () {
            s.destroyCountValue();//清除对象
            s.updateFields();//重新获得DOM
            s.loadCountValue();//重新实例化
        }
    }
})(window, document, undefined);

//Media 多媒体控件
(function (window, document, undefined) {

    window.Media = function (media) {
        /*===========================
	    Model
	    ===========================*/
        var s = this;
        s.media = document.querySelector(media) || new Audio(media);
        /*===========================
	    Method
	    ===========================*/
        s.playAudio = function (loop) {
            s.media.autoplay = true;
            s.media.loop = loop || false;
            s.media.play();
            return s;
        };
        //判断视频加载状态
        s.isReady = function () {
            if (s.media.readyState != 4) {
                console.log("视频尚未加载完成，状态：" + s.media.readyState);
                return false;
            }
            return true;
        };
        //暂停与播放
        s.resume = function () {
            if (s.media.paused) {
                s.media.play();
                return false;
            } else {
                s.media.pause();
                return true;
            }
        };
        //全屏与非全屏，w3c推荐标准，但尚未兼容
        s.fullScreen = function () {
            if (s.media.requestFullscreen) {
                s.media.exitFullscreen();
                return false;
            } else {
                s.media.requestFullscreen();
                return true;
            }
        };
        //播放时间
        s.durationTime = function () {
            if (!s.isReady) return;
            if (arguments.length > 0) {
                s.media.duration = arguments[0];
            }
            return s.media.duration;
        };
        //当前时间
        s.currentTime = function () {
            if (!s.isReady) return;
            if (arguments.length > 0) {
                s.media.currentTime = arguments[0];
            }
            return s.media.currentTime;
        };
        //音量，值为0.0到1.0
        s.volume = function () {
            if (arguments.length > 0) {
                s.media.volume = arguments[0];
            }
            return s.media.volume;
        };
        //音量值大小
        s.volumeLvl = function () {
            var volnumber = s.media.volume;
            if (volnumber == 0) {
                return 0;
            } else if (volnumber > 0 && volnumber < 0.3) {
                return 1;
            } else if (volnumber > 0.3 && volnumber < 0.6) {
                return 2;
            } else if (volnumber > 0.6 && volnumber < 0.9) {
                return 3;
            } else {
                return 4;
            }
        };
        //设置播放速度，默认为1.0秒
        s.rate = function () {
            if (arguments) {
                s.media.defaultPlaybackRate = arguments[0];
            }
            return s.media.defaultPlaybackRate;
        };

        //是否支持此视频
        s.isSupport = function (mediaPostfix) {
            var maybeMedia = "";
            var probablyMedia = "";
            switch (mediaPostfix) {
                //音频
                case "aac":
                    maybeMedia = "audio/mp4", probablyMedia = "audio/mp4; codecs=\"mp4a.40.2\"";
                    break;
                case "mp3":
                    maybeMedia = "audio/mpeg", probablyMedia = "audio/mpeg";
                    break;
                case "vorbis":
                    maybeMedia = "audio/ogg", probablyMedia = "audio/ogg; codecs=\"vorbis\"";
                    break;//后缀通常为ogg
                case "wav":
                    maybeMedia = "audio/wav", probablyMedia = "audio/wav; codecs=\"1\"";
                    break;
                //视频
                case "h.264":
                    maybeMedia = "video/mp4", probablyMedia = "video/mp4; codecs=\"avc1.42E01E, mp4a.40.2\"";
                    break;//后缀通常为mpg4、mp4、mov
                case "theora":
                    maybeMedia = "video/ogg", probablyMedia = "video/ogg; codecs=\"theora\"";
                    break;//后缀通常为ogg
                case "webm":
                    maybeMedia = "video/webm", probablyMedia = "video/webm; codecs=\"vp8, vorbis\"";
                    break;//后缀通常为webm
            }
            if (maybeMedia != "" && probablyMedia != "" && (player.canPlayType(maybeMedia) || player.canPlayType(probablyMedia))) {
                return true;
            }
            return false;
        };
        /*===========================
	    Events
	    ===========================*/
        var event = function (eventname, fn, detach) {
            var action = detach ? "removeEventListener" : "addEventListener";
            s.media[action](eventname, fn, false);
        }
        //因为没有数据不能播放，readyState值为0
        s.onDataunavailable = function (callback, detach) {
            event("dataunavailable", callback, detach);
        };
        //当前帧已下载完成，readyState值为1
        s.onCanshowcurrentframe = function (callback, detach) {
            event("canshowcurrentframe", callback, detach);
        };
        //可以播放时，readyState值为2
        s.onCanplay = function (callback, detach) {
            event("canplay", callback, detach);
        };
        //播放可继续，而且应该不会中断，readyState值为3
        s.onCanplaythrough = function (callback, detach) {
            event("canplaythrough", callback, detach);
        };
        //所有媒体已加载完成，load有可能会被废弃，建议使用canplaythrough
        s.onLoad = function (callback, detach) {
            event("load", callback, detach);
        };
        //媒体的第一帧已加载完成
        s.onLoadeddata = function (callback, detach) {
            event("loadeddata", callback, detach);
        };
        //媒体的元数据已加载完成
        s.onLoadedmetadata = function (callback, detach) {
            event("loadedmetadata", callback, detach);
        };
        //下载已开始
        s.onLoadstart = function (callback, detach) {
            event("loadstart", callback, detach);
        };
        //正在下载
        s.onProgress = function (callback, detach) {
            event("progress", callback, detach);
        };
        //下载中断
        s.onAbort = function (callback, detach) {
            event("abort", callback, detach);
        };
        //浏览器尝试下载，但未接收到数据
        s.onStalled = function (callback, detach) {
            event("stalled", callback, detach);
        };
        //下载发生网络错误
        s.onError = function (callback, detach) {
            event("error", callback, detach);
        };
        //网络连接关闭
        s.onEmptied = function (callback, detach) {
            event("emptied", callback, detach);
        };
        //发生错误阻止了媒体下载
        s.onEmpty = function (callback, detach) {
            event("empty", callback, detach);
        };
        //准备播放
        s.onPlay = function (callback, detach) {
            event("play", callback, detach);
        };
        //正在播放
        s.onPlaying = function (callback, detach) {
            event("playing", callback, detach);
        };
        //当前时间被不合理或意外的方式更新
        s.onTimeupdate = function (callback, detach) {
            event("timeupdate", callback, detach);
        };
        //暂停
        s.onPause = function (callback, detach) {
            event("pause", callback, detach);
        };
        //播放暂停，等待下载更多数据
        s.onWaiting = function (callback, detach) {
            event("pause", callback, detach);
        };
        //媒体已播放至末尾，播放停止
        s.onEnded = function (callback, detach) {
            event("ended", callback, detach);
        };
        //更改音量事件
        s.onVolumechange = function (callback, detach) {
            event("volumechange", callback, detach);
        };
        //更改播放速度事件
        s.onRatechange = function (callback, detach) {
            event("ratechange", callback, detach);
        };
        //搜索结束
        s.onSeeked = function (callback, detach) {
            event("seeked", callback, detach);
        };
        //正在移动到新位置
        s.onSeeking = function (callback, detach) {
            event("seeking", callback, detach);
        };
    };
})(window, document, undefined);

//Clock 时钟控件
(function (window, document, undefined) {
    window.Clock = function (clock, params) {
        /*================
        Model
        =================*/
        var defaults = {
            "hourClass": "clock-hour",
            "minuteClass": "clock-minute",
            "clockAttr": "data-clock"
            /*
            "duration":"500",
            "delay":"0"
            */
        }
        params = params || {};
        for (var def in defaults) {
            if (params[def] === undefined) {
                params[def] = defaults[def];
            }
        }
        var s = this;
        //Params
        s.params = params;
        //Container
        s.clock = typeof clock === "string" ? document.querySelector(clock) : clock;
        s.hour, s.minute, s.time, s.hourDeg, s.minuteDeg;
        /*================
        Method
        =================*/
        s.getHourDeg = function (hour) {
            return hour * 30;
        }
        s.getMinuteDeg = function (minute) {
            return minute * 6;
        }
        s.update = function () {
            s.hour = s.clock.querySelector("." + s.params.hourClass);
            s.minute = s.clock.querySelector("." + s.params.minuteClass);
            s.time = s.clock.getAttribute(s.params.clockAttr);
            if (!s.time || !/\d{1,2}:\d{1,2}/.test(s.time)) {
                console.log("时间格式应为xx:xx");
                return;
            }
            var hourMinute = s.time.split(":");
            s.hourDeg = s.getHourDeg(hourMinute[0]);
            s.minuteDeg = s.getMinuteDeg(hourMinute[1]);
        }
        s.update();
        s.play = function () {
            if (!isNaN(s.params.duration)) s.clock.style.webkitTransitionDuration = s.params.duration + "ms";
            if (!isNaN(s.params.delay)) s.clock.style.webkitTransitionDelay = s.params.delay + "ms";
            s.hour.style.webkitTransform = "rotate(" + s.hourDeg + "deg)";
            s.minute.style.webkitTransform = "rotate(" + s.minuteDeg + "deg)";
        }
        s.play();
    }
    window.Clocks = function (params) {
        var s = this;
        //获得所有元素
        s.clocks = document.querySelectorAll("[data-clock]");
        s.clocks.clocks = [];
        var jsonParams = {};
        if (params) jsonParams = params;
        //实例化所有元素
        for (var i = 0, clock; clock = s.clocks[i++];) {
            s.clocks.clocks[i] = new Clock(clock, jsonParams);
        }
    }
})(window, document, undefined);

//Richeditor 富文本编辑框
var Richeditor = {
    //获取选区
    selection: function () {
        return document.getSelection();
    },
    //获取文本框光标位置
    getTxtCusorPos: function (txt) {
        var cusorPos = -1;
        //非ie
        if (txt.selectionStart) {//非IE浏览器
            cusorPos = txt.selectionStart;
            return cusorPos;
        }
        //讨厌的ie
        if (document.selection && document.selection.createRange) {
            var range = document.selection.createRange();
            range.moveStart("character", -txt.value.length);
            cusorPos = range.text.length;
            return cusorPos;
        }
    },
    //获取光标位置
    getDivCusorPos: function () {
        var cusorPos = 0;// 光标位置
        //非ie
        if (window.getSelection) {
            var selection = window.getSelection();
            //选中区域的“起点”
            /*console.log(selection.anchorNode);
			//选中区域的“结束点”
			console.log(selection.focusNode);
			//“结束点”的偏移量
			console.log(selection.focusOffset);
			//判断是否有选中区域
			console.log(selection.isCollapsed);
			//一般一个页面只有一个range，也有可能是多个range(使用Ctrl健进行多选)
			console.log(selection.rangeCount);*/

            //“起点”的偏移量
            cusorPos = selection.anchorOffset;
            return cusorPos;
        }
        //讨厌的ie
        if (document.selection && document.selection.createRange) {
            var range = document.selection.createRange();
            var srcele = range.parentElement();
            var copy = document.body.createTextRange();
            copy.moveToElementText(srcele);
            for (cusorPos = 0; copy.compareEndPoints("StartToStart", range) < 0; cusorPos++) {
                copy.moveStart("character", 1);
            }
            return cusorPos;
        }
    },
    //只支持高级浏览器
    selectionPos: function (classname) {
        var selection = window.getSelection();
        var cursorOffset = 0;
        document.onselectionchange = function (e) {
            if (e.target.activeElement.className == classname) {
                cursorOffset = selection.anchorOffset;
            }
        }
        return cursorOffset;
    },
    /**
     * 确定命令是否已经激活
     *
     * @method isenable
     * @param commandName (命令名称，如：backcolor)
     * @return boolean
     */
    isenable: function (commandName) {
        return document.queryCommandEnabled(commandName);
    },
    backgroundcolor: function (color) {
        document.execCommand("backcolor", false, color);
    },
    bold: function () {
        document.execCommand("bold", false, null);
    },
    italic: function () {
        document.execCommand("italic", false, null);
    },
    underline: function () {
        document.execCommand("underline", false, null);
    },
    copy: function () {
        document.execCommand("copy", false, null);
    },
    selectall: function () {
        document.execCommand("selectall", false, null);
    },
    cut: function () {
        document.execCommand("cut", false, null);
    },
    paste: function () {
        document.execCommand("paste", false, null);
    },
    del: function () {
        document.execCommand("delete", false, null);
    },
    link: function (url) {
        document.execCommand("createlink", false, url);
    },
    unlink: function () {
        document.execCommand("unlink", false, null);
    },
    fontname: function (fontName) {
        document.execCommand("fontname", false, fontName);
    },
    fontsize: function (fontSize) {
        if (fontSize) {
            document.execCommand("fontsize", false, fontSize);
            return;
        }
        return document.queryCommandValue("fontsize");
    },
    fontcolor: function (fontColor) {
        document.execCommand("forecolor", false, fontColor);
    },
    format: function (tag) {
        document.execCommand("formatblock", false, tag);
    },
    unformat: function () {
        document.execCommand("removeformat", false, null);
    },
    indent: function () {
        document.execCommand("indent", false, null);
    },
    outdent: function () {
        document.execCommand("outdent", false, null);
    },
    hr: function () {
        document.execCommand("inserthorzizontalrule", false, null);
    },
    img: function (url) {
        document.execCommand("insertimage", false, url);
    },
    ol: function () {
        document.execCommand("insertorderedlist", false, null);
    },
    ul: function () {
        document.execCommand("insertunorderedlist", false, null);
    },
    p: function () {
        document.execCommand("insertparagraph", false, null);
    },
    center: function () {
        document.execCommand("justifycenter", false, null);
    },
    left: function () {
        document.execCommand("justifyleft", false, null);
    },
    right: function () {
        document.execCommand("justifyright", false, null);
    },
    //设置光标位置
    setCaretPosition: function (elem, caretPos) {
        if (elem != null) {
            if (elem.createTextRange) {
                var range = elem.createTextRange();
                range.move('character', caretPos);
                range.select();
            } else {
                if (elem.selectionStart) {
                    elem.focus();
                    elem.setSelectionRange(caretPos, caretPos);
                } else
                    elem.focus();
            }
        }
    },
    isEnter: function () {
        //监听键盘输入
        window.addEventListener("keydown", function (e) {
            keynum = e.which || e.keyCode;
            if (keynum == "13") {
                return true;
            }
            return false;
        }, false);
    },
    queryInput: function (queryExtend, queryCollapse) {
        var winHeight = window.innerHeight, currentWinHeight = window.innerHeight;
        var listenerInput;//监听输入框
        listenerInput = setInterval(function (e) {
            currentWinHeight = window.innerHeight;
            //获得输入法高度
            if (DB.get("queryInputHeight") && DB.get("queryInputHeight") > 0) {
                console.log("读取数据库queryInputHeight:" + DB.get("inputHeight"));
                this.inputHeight = DB.get("queryInputHeight");
                clearInterval(listenerInput);
            } else {
                this.inputHeight = winHeight - currentWinHeight;
                console.log("注入数据库queryInputHeight:" + inputHeight);
                DB.set("queryInputHeight", inputHeight);
            }
            //判断输入法是否收缩
            if (winHeight == currentWinHeight) {
                if (queryCollapse) {
                    queryCollapse.call(this, e);
                }
                clearInterval(listenerInput);
            } else {
                if (queryExtend) {
                    queryExtend.call(this, e);
                }
            }
        }, 500);
    },
};

//Richinput 带表情输入框 (require slider.js)
(function (window, document, undefined) {
    window.Richinput = function (container, params) {
        /*=========================
          Params
          ===========================*/
        var defaults = {
            "maskClass": "mask",
            "emojiBoxClass": "emoji",
            "sliderParam": {
                "pagination": ".slider-pagination"
            }
        }
        params = params || {};
        for (var def in defaults) {
            if (params[def] === undefined) {
                params[def] = defaults[def];
            }
        }
        //Richinput
        var s = this;

        //Params
        s.params = params;

        //Container
        s.container = typeof container == "string" ? document.querySelector(container) : container;
        if (!s.container) return;

        //Slider
        s.slider;

        //Mask Div
        s.mask = document.querySelector(container + "+." + s.params.maskClass);

        //表情容器
        s.emojiBox = s.container.querySelector("." + s.params.emojiBoxClass);

        //Textarea Form
        s.textarea = s.container.querySelector("textarea");

        //辅助计算textarea高度的pre和preSpan
        var pre = s.container.querySelector("pre");
        var preSpan = pre.querySelector("span");

        //pre.style.width=s.textarea.clientWidth+"px";
        s.textarea.style.height = pre.clientHeight + "px";

        /*=========================
          Method
          ===========================*/

        //插入表情
        function insertFace(objFace) {
            var emojiName = objFace.getAttribute("alt");
            //var emojiSrc=objFace.getAttribute("data-emoji-src");
            var editText = s.textarea.value;
            var editTextBefore = editText.substr(0, cursorOffset);
            var editTextAfter = editText.substr(cursorOffset, editText.length);
            var editTextInsert = emojiName;
            cursorOffset = cursorOffset + emojiName.length;
            s.textarea.value = editTextBefore + editTextInsert + editTextAfter;
        }

        /*=========================
          Events Listener
          ===========================*/
        //遮罩层添加点击事件
        s.mask.addEventListener("click", function (e) {
            s.container.classList.remove("active");
            //s.container.className=s.container.className.replace(/\s{1,}active/,"");
            s.textarea.blur();
        }, false);

        //获得光标位置
        var cursorOffset = 0;
        document.onselectionchange = function (e) {
            if (Object.prototype.toString.call(e.target.activeElement) == "[object HTMLTextAreaElement]") {
                //计算textarea高度
                preSpan.innerText = s.textarea.value;
                s.textarea.style.height = pre.clientHeight + "px";
                //获得光标位置
                cursorOffset = s.textarea.selectionStart;
            }
        }
        s.textarea.addEventListener("input", function (e) {
            //计算textarea高度
            preSpan.innerText = s.textarea.value;
            s.textarea.style.height = pre.clientHeight + "px";
            //获得光标位置
            cursorOffset = s.textarea.selectionStart;
        }, false);
        //点击input框
        s.textarea.addEventListener("click", function (e) {
            s.container.classList.add("active");
            if (!s.slider) {
                s.slider = new Slider(container + " ." + s.params.emojiBoxClass, s.params.sliderParam);
            }
        }, false);

        //点击表情
        s.emojiBox.addEventListener("click", function (e) {
            if (e.target.getAttribute("data-emoji")) {
                insertFace(e.target);
            }
            s.textarea.focus();
            Richeditor.setCaretPosition(s.textarea, cursorOffset);
        }, false);
    }
})(window, document, undefined);


//Slider 滑动控件
(function (window, document, undefined) {

    window.Slider = function (container, params) {
        /*=========================
          Model
          ===========================*/
        var defaults = {
            pagination: null,
            autoplay: false,
            slidesPerView: 1,
            threshold: "50",
            duration: "300",

            //loop
            loop: false,
            slideDuplicateClass: 'slider-slide-duplicate',

            //dom class
            wrapperClass: "slider-wrapper",
            slideClass: "slider-slide",
            slideActiveClass: "active",
            bulletClass: "bullet",
            bulletActiveClass: "active"

            /*callbacks
			onInit:function(Slider)
			onSlideChangeStart:function(Slider)
			onSlideChange:function(Slider)
			onSlideChangeEnd:function(Slider)
			*/
        }
        params = params || {};
        for (var def in defaults) {
            if (params[def] === undefined) {
                params[def] = defaults[def];
            }
        }
        //Slider
        var s = this;

        //Params
        s.params = params;

        //Container
        s.container = typeof container == "string" ? document.querySelector(container) : container;
        s.container.width = s.container.clientWidth;
        //Wrapper
        s.wrapper = document.querySelector(container + " > ." + s.params.wrapperClass);
        // s.wrapper=s.container.querySelector(":scope > ."+s.params.wrapperClass);
        //Slides
        s.slides = document.querySelectorAll(container + " > ." + s.params.wrapperClass + " > ." + s.params.slideClass + "");
        // s.slides=s.wrapper.querySelectorAll(":scope > ."+s.params.slideClass);
        if (s.slides.length <= 0) {
            return;
        }
        //Method
        /*=========================
          Pagination
          ===========================*/
        s.createPagination = function () {
            if (!s.params.pagination) return;
            s.paginationContainer = document.querySelector(container + " > " + s.params.pagination);
            //s.paginationContainer = s.container.querySelector(":scope > "+s.params.pagination);

            s.bullets = [];
            s.paginationContainer.innerHTML = "";
            s.numberOfBullets = s.params.loop ? s.slides.length - s.params.slidesPerView * 2 : s.slides.length;
            for (var i = 0; i < s.numberOfBullets; i++) {
                var bullet = document.createElement("span");
                bullet.setAttribute("class", s.params.bulletClass);
                s.paginationContainer.appendChild(bullet);
                s.bullets.push(bullet);
            }
            //s.bullets = s.paginationContainer.querySelectorAll(":scope > "+s.params.bulletClass);
        };
        /*=========================
          Classes
          ===========================*/
        s.updateClasses = function () {
            //Slide
            for (var i = 0; i < s.slides.length; i++) {
                s.slides[i].className = s.slides[i].className.replace(/\s{1,}active/, "");
            }
            s.slides[s.index].className += " " + s.params.slideActiveClass;

            // Pagination
            var index = s.index;
            if (s.params.loop) {
                if (s.index >= s.params.slidesPerView && s.index <= s.slides.length - 1 - s.params.slidesPerView) {
                    //console.log("原稿处");
                    index = Math.abs(s.index - s.params.slidesPerView);
                } else {
                    //console.log("左右复稿处");
                    index = Math.abs(s.numberOfBullets - Math.abs(s.index - s.params.slidesPerView));
                }
            }
            if (!s.paginationContainer) return;
            for (var i = 0; i < s.bullets.length; i++) {
                s.bullets[i].className = s.bullets[i].className.replace(/\s{1,}active/, "");
            }
            s.bullets[index].className += " " + s.params.bulletActiveClass;
        };
        /*=========================
          Slides
          ===========================*/
        s.updateSlides = function () {
            s.slides = document.querySelectorAll(container + " > ." + s.params.wrapperClass + " > ." + s.params.slideClass + "");
            //s.slides=s.wrapper.querySelectorAll(":scope > ."+s.params.slideClass);
        };
        /*=========================
          Container Size
          ===========================*/
        s.updateContainerSize = function () {
            //Slide width
            s.container.width = s.container.clientWidth;
            s.width = Math.floor(s.container.width / s.params.slidesPerView);

            //设置wrapper宽度
            s.wrapper.width = s.width * s.slides.length;
            s.wrapper.style.width = s.wrapper.width + "px";

            //设置单个slide宽度
            [].slice.call(s.slides).forEach(function (n, i, a) {
                n.style.width = s.width + "px";
            });

            //Slide height
            s.height = s.container.clientHeight ? s.container.clientHeight : s.wrapper.clientHeight;
            [].slice.call(s.slides).forEach(function (n, i, a) {
                n.style.height = s.height + "px";
            });

            if (s.height) s.container.style.height = s.height + "px";

            //更新active index
            s.updateClasses();

            //如果有循环的话
            if (s.params.loop) {
                s.params.duration = 0;
                moveToIndex();
                s.params.duration = defaults.duration;
            }
        };

        /*=========================
          Loop
          ===========================*/
        s.createLoop = function () {
            if (!s.params.loop) return;
            if (s.params.slidesPerView > s.slides.length) return;
            var prependSlides = [], appendSlides = [], i;
            [].slice.call(s.slides).forEach(function (n, i, a) {
                if (i < s.params.slidesPerView) appendSlides.push(n);
                if (i < s.slides.length && i >= s.slides.length - s.params.slidesPerView) prependSlides.push(n);
            });
            for (i = 0; i < appendSlides.length; i++) {
                s.wrapper.appendChild(appendSlides[i].cloneNode(true)).classList.add(s.params.slideDuplicateClass);
            }
            for (i = prependSlides.length - 1; i >= 0; i--) {
                s.wrapper.insertBefore(prependSlides[i].cloneNode(true), s.wrapper.firstElementChild).classList.add(s.params.slideDuplicateClass);
            }
            s.index = s.params.slidesPerView;
        };
        s.destroyLoop = function () {
            s.params.loop = null;
            var slideDuplicate = s.wrapper.querySelectorAll('.' + s.params.slideDuplicateClass);
            for (var i = 0, slideDu; slideDu = slideDuplicate[i++];) {
                s.wrapper.removeChild(slideDu);
            }
        };
        //Controller
        /*=========================
          Touch Events
          ===========================*/
        //绑定事件
        s.events = function (detach) {
            var touchTarget = s.container;
            var action = detach ? "removeEventListener" : "addEventListener";
            touchTarget[action]("touchstart", s.onTouchStart, false);
            touchTarget[action]("touchmove", s.onTouchMove, false);
            touchTarget[action]("touchend", s.onTouchEnd, false);
            touchTarget[action]("touchcancel", s.onTouchEnd, false);
        }
        //attach、dettach事件
        s.attach = function (event) {
            s.events();
        }
        s.detach = function (event) {
            s.events(true);
        }
        /*=========================
          Touch Handler
          ===========================*/
        //Touch信息
        s.touches = {
            startX: 0,
            startY: 0,
            currentX: 0,
            currentY: 0,
            endX: 0,
            endY: 0,
            diffX: 0,
            diffY: 0,
            posX: 0,
            direction: null
        };
        //索引
        s.index = 0;

        function preventDefault(e) {
            e.preventDefault();
        }

        s.onTouchStart = function (e) {
            s.container.addEventListener("touchmove", preventDefault, false);
            s.touches.startX = e.touches[0].clientX;
            s.touches.startY = e.touches[0].clientY;
            //关闭自动播放
            s.stopAutoplay();
            //runCallBack
            s.target = s.slides[s.index];
            if (s.params.onSlideChangeStart) s.params.onSlideChangeStart(s);
        };
        s.onTouchMove = function (e) {
            s.touches.currentX = e.touches[0].clientX;
            s.touches.currentY = e.touches[0].clientY;
            s.touches.diffX = s.touches.startX - s.touches.currentX;
            s.touches.diffY = s.touches.startY - s.touches.currentY;
            //runCallBack
            if (s.params.onSlideChange) s.params.onSlideChange(s);
            //设置滑动方向
            if (s.touches.direction == null) {
                s.touches.direction = Math.abs(s.touches.diffY) - Math.abs(s.touches.diffX) > 0 ? "vertical" : "horizontal";
            }
            if (s.touches.direction == "vertical") {
                s.container.removeEventListener("touchmove", preventDefault, false);
                return;
            }
            e.stopPropagation();
            //x轴距离左边的像素，向左为负数，向右为正数
            var moveX = s.touches.posX - s.touches.diffX;
            //判断是否是边缘
            if (moveX > 0 || -moveX + s.container.width >= s.wrapper.width) {
                return;
            }
            //s.wrapper.style.left=moveX+"px";
            s.wrapper.style.webkitTransform = 'translate3d(' + moveX + 'px,0px,0px)';
        };
        s.onTouchEnd = function (e) {
            //s.container.removeEventListener("touchmove",preventDefault,false);
            //左右拉动
            if (s.touches.direction == "horizontal") {
                //左右拉动
                if (s.touches.diffX > s.params.threshold) {
                    //下一页
                    s.index++;
                } else if (s.touches.diffX < -s.params.threshold) {
                    //上一页
                    s.index--;
                }
                s.slideTo();
            }
            //清空滑动方向
            s.touches.direction = null;
            //开启自动播放
            s.startAutoplay();
        };
        /*=========================
          Autoplay
          ===========================*/
        s.startAutoplay = function () {
            if (!s.params.autoplay) return;
            s.autoplayer = window.setInterval(function () {
                s.index++;
                if (s.index >= s.slides.length) {
                    s.index = 0;
                }
                s.slideTo(s.index);
            }, s.params["autoplay"]);
        };

        s.stopAutoplay = function (internal) {
            if (s.autoplayer) {
                window.clearInterval(s.autoplayer);
            }
        };

        /*=========================
          Method
          ===========================*/
        function moveToIndex() {
            s.wrapper.style.webkitTransitionDuration = s.params.duration + "ms";
            s.touches.posX = -s.index * s.width;
            //s.wrapper.style.left=s.touches.posX+"px";
            s.wrapper.style.webkitTransform = 'translate3d(' + s.touches.posX + 'px,0px,0px)';
        }

        s.slideTo = function (slideIndex) {
            if (slideIndex >= 0) {
                s.index = slideIndex;
            }
            //索引不能小于0
            if (s.index < 0) {
                s.index = 0;
            }
            //索引不能大于slide总数
            if (s.index > s.slides.length - 1) {
                s.index = s.slides.length - 1;
            }
            //一页多屏，索引不能露出空白区域
            if (s.params.slidesPerView > 1 && s.index > s.slides.length - params.slidesPerView) {
                s.index = s.slides.length - s.params.slidesPerView;
            }

            //更新class
            s.updateClasses();
            //移动至index
            moveToIndex();
            setTimeout(function () {
                s.wrapper.style.webkitTransitionDuration = "0ms";
                //runCallBack
                s.target = s.slides[s.index];
                if (s.params.onSlideChangeEnd) s.params.onSlideChangeEnd(s);
                //循环的情况
                if (s.params.loop) {
                    if (s.touches.posX == 0) {
                        s.index = s.slides.length - s.params.slidesPerView * 2;
                        //console.log("最左侧，应跳转到："+s.index);
                        s.params.duration = 0;
                        moveToIndex();
                        s.params.duration = defaults.duration;
                        return;
                    }
                    if (-s.touches.posX + s.container.width >= s.wrapper.width) {
                        s.index = s.params.slidesPerView;
                        //console.log("最右侧，应跳转到："+s.index);
                        s.params.duration = 0;
                        moveToIndex();
                        s.params.duration = defaults.duration;
                        return;
                    }
                }
            }, s.params.duration);
        };

        //主函数
        s.init = function () {
            if (s.params.loop) s.createLoop();
            s.updateSlides();
            if (s.params.pagination) s.createPagination();
            s.updateContainerSize();
            s.attach();
            if (s.params.autoplay) s.startAutoplay();
            //runCallBack
            s.target = s.slides[s.index];
            if (s.params.onInit) s.params.onInit(s);
        }
        //执行主函数
        s.init();
        // Return slider instance
        return s;
    }
    Slider.prototype = {
        support: {
            touch: (function () {
                return 'ontouchstart' in window
            })(),
            animationend: (function () {
                return 'onanimationend' in window
            })(),
            transitionend: (function () {
                return 'ontransitionend' in window
            })(),
        }
    }
})(window, document, undefined);

//Type 类型判断
(function (window, document, undefined) {

    window.Type = {};
    var t = Type;
    /*====================
	动态添加方法Method:isString | isBoolean | isNumber | isArray | isObject | isHTMLElement
	=====================*/
    for (var i = 0, type; type = ["String", "Boolean", "Number", "Array", "Object", "HTMLElement", "Function"][i++];) {
        (function (type) {
            t["is" + type] = function (obj) {
                if (type == "HTMLElement" && Object.prototype.toString.call(obj).indexOf("HTML")) {
                    return true;
                }
                return Object.prototype.toString.call(obj) === "[object " + type + "]";
            }
        })(type);
    }
    /*====================
	Other Method
	=====================*/
    t.isJson = function (obj) {
        if (!obj) {
            return false;
        }
        if (this.isObject(obj)) {
            try {
                JSON.stringify(obj);
                return true;
            } catch (e) {
                return false;
            }
        } else if (this.isString(obj)) {
            try {
                JSON.parse(obj);
                return true;
            } catch (e) {
                return false;
            }
        } else {
            return false;
        }
    },
        t.isQueryId = function (id) {
            var idExpr = /^#([\w-]*)$/;
            var match = idExpr.exec(id);
            if (match && match.length > 0) {
                return match[1];
            }
            return false;
        },
        t.isQueryClass = function (classname) {
            var classExpr = /^\.([\w-]*)$/;
            var match = classExpr.exec(classname);
            if (match && match.length > 0) {
                return match[1];
            }
            return false;
        },
        t.isId = function (id) {
            if (typeof id === "string" && document.getElementById(id)) {
                return true;
            }
            return false;
        },
        t.isClass = function (classname) {
            if (typeof classname === "string" && document.getElementsByClassName(classname)) {
                return true;
            }
            return false;
        },
        t.isTag = function (str) {
            var tagExpr = /^<(\w+)\s*.*\/\w*>$/im;
            var match = tagExpr.exec(str);
            if (match && match.length > 0) {
                return true;
            }
            return false;
        },
        t.hasEvent = function (element, strEvent) {
            return (document.all(element)[strEvent] == null) ? false : true
        }
})(window, document, undefined);

//Calendar 日历 | CalendarUtil 日历工具箱
(function (window, document, undefined) {

    window.Calendar = function (container, params) {
        /*================
		Model
		================*/
        var defaults = {
            "viewType": "month",//值为month|week
            "defaultActiveDate": new Date(),
            "disableBeforeDate": null,
            "disableAfterDate": null,
            "activeDate": null,
            "threshold": "50",
            "duration": "300",
            "dayHeight": "50",
            "isYTouch": true,//是否允许上下滑动
            //DOM
            "calendarClass": "calendar",
            "disableClass": "calendar-disable",

            "headerClass": "calendar-header",
            "titleClass": "calendar-title",
            "prevClass": "calendar-prev",
            "nextClass": "calendar-next",
            "prevHTML": "&lt;",
            "nextHTML": "&gt;",

            "weeksClass": "calendar-weeks",
            "weekClass": "calendar-week",

            "wrapperClass": "calendar-wrapper",
            "wrapperXClass": "calendar-wrapper-x",
            "wrapperYClass": "calendar-wrapper-y",
            "monthClass": "calendar-month",
            "monthRowClass": "calendar-monthrow",
            "dayClass": "calendar-day",
            "dayNumClass": "calendar-daynum",

            //状态
            "currentClass": "calendar-current",
            "notcurrentClass": "calendar-notcurrent",
            "todayClass": "calendar-today",
            "activeClass": "calendar-active",

            /*
            Callbacks:
            onClick:function(Calendar)
            onChange:function(Calendar)
			*/
        }
        params = params || {};
        for (var def in defaults) {
            if (params[def] == undefined) {
                params[def] = defaults[def];
            }
        }
        var s = this;
        s.params = params;
        s.params.wrapperHeight = s.params.dayHeight * 6;
        //禁止修改默认值
        Object.defineProperty(s.params, "defaultActiveDate", {
            enumerable: true,
            configurable: true,
            writable: false
        })

        //今天和选中天
        s.today = new Date(), s.activeDate = null;
        //日历工具箱
        if (s.params.activeDate) {//如果有选中天，则初始化为选中天
            s.calendarUtil = new CalendarUtil(s.params.activeDate);
            s.activeDate = s.params.activeDate;
        } else {//否则，则初始化为默认天
            s.calendarUtil = new CalendarUtil(s.params.defaultActiveDate);
        }
        //Container
        s.container = typeof container == "string" ? document.querySelector(container) : container;
        s.container.width = s.container.clientWidth;
        //Header
        s.header, s.title, s.prev, s.next;
        //Week
        s.weekContainer, s.weeks = [];
        //Wrapper
        s.wrapper, s.wrapperX, s.wrapperY, s.months = new Array(3), s.days = [];
        //Touch信息
        s.touches = {
            startX: 0,
            startY: 0,
            currentX: 0,
            currentY: 0,
            endX: 0,
            endY: 0,
            diffX: 0,
            diffY: 0,
            posX: 0,
            posY: 0,
            maxPosY: s.params.wrapperHeight - s.params.dayHeight,
            h: s.params.wrapperHeight,
            direction: 0,
            horizontal: 0,
            vertical: 0
        };
        //Header
        s.createHeader = function () {
            var header = document.createElement("div");
            header.setAttribute("class", s.params.headerClass);
            return header;
        }
        s.createPrev = function () {
            var prev = document.createElement("div");
            prev.setAttribute("class", s.params.prevClass);
            prev.innerHTML = s.params.prevHTML;
            return prev;
        }
        s.createNext = function () {
            var next = document.createElement("div");
            next.setAttribute("class", s.params.nextClass);
            next.innerHTML = s.params.nextHTML;
            return next;
        }
        s.createTitle = function () {
            var title = document.createElement("div");
            title.setAttribute("class", s.params.titleClass);
            return title;
        }
        //WeekContainer
        s.createWeekContainer = function () {
            var weekContainer = document.createElement("div");
            weekContainer.setAttribute("class", s.params.weeksClass);

            var weekNames = ["日", "一", "二", "三", "四", "五", "六"];
            for (var i = 0, weekName; weekName = weekNames[i++];) {
                var week = document.createElement("div");
                week.setAttribute("class", s.params.weekClass);
                week.innerHTML = weekName;
                weekContainer.appendChild(week);
                s.weeks.push(week);
            }

            return weekContainer;
        }
        //Wrapper
        s.createWrapper = function () {
            var wrapper = document.createElement("div");
            wrapper.setAttribute("class", s.params.wrapperClass);
            return wrapper;
        }
        s.createWrapperY = function () {
            var wrapperY = document.createElement("div");
            wrapperY.setAttribute("class", s.params.wrapperYClass);
            return wrapperY;
        }
        s.createWrapperX = function () {
            var wrapperX = document.createElement("div");
            wrapperX.setAttribute("class", s.params.wrapperXClass);
            wrapperX.width = s.container.width * 3;
            /*wrapperX.width=s.container.width*3;
			wrapperX.style.width=wrapperX.width+"px";*/
            for (var i = 0; i < 3; i++) {
                s.months[i] = document.createElement("div");
                s.months[i].setAttribute("class", s.params.monthClass);
                s.months[i].style.width = s.container.width + "px";
                wrapperX.appendChild(s.months[i]);
            }
            return wrapperX;
        }
        s.createDays = function () {
            for (var i = 0; i < 3; i++) {//注入到月

                for (var j = 0; j < 6; j++) {//注入行

                    var monthRow = document.createElement("div");
                    monthRow.setAttribute("class", s.params.monthRowClass);

                    for (var k = 0; k < 7; k++) {//注入到星期

                        var day = document.createElement("div");
                        day.setAttribute("class", s.params.dayClass);
                        day.style.height = s.params.dayHeight + "px";
                        day.style.lineHeight = s.params.dayHeight + "px";
                        var dayNum = document.createElement("div");
                        dayNum.setAttribute("class", s.params.dayNumClass);

                        day.appendChild(dayNum);
                        monthRow.appendChild(day);

                        s.days.push(dayNum);
                    }
                    s.months[i].appendChild(monthRow);
                }
            }
        }
        //创建DOM
        s.create = function () {
            //创建头部
            if (s.container.querySelector("." + s.params.headerClass)) {
                s.header = s.container.querySelector("." + s.params.headerClass);
                s.prev = s.container.querySelector("." + s.params.prevClass);
                s.next = s.container.querySelector("." + s.params.nextClass);
                s.title = s.container.querySelector("." + s.params.titleClass);
            } else {
                s.header = s.createHeader();
                s.prev = s.createPrev();
                s.next = s.createNext();
                s.title = s.createTitle();

                s.header.appendChild(s.prev);
                s.header.appendChild(s.title);
                s.header.appendChild(s.next);
                s.container.appendChild(s.header);
            }
            //创建周
            if (s.container.querySelector("." + s.params.weeksClass)) {
                s.weekContainer = s.container.querySelector("." + s.params.weeksClass);
            } else {
                s.weekContainer = s.createWeekContainer();

                s.container.appendChild(s.weekContainer);
            }
            //创建主体
            s.wrapper = s.createWrapper();
            s.wrapperX = s.createWrapperX();
            s.wrapperY = s.createWrapperY();
            s.wrapperY.appendChild(s.wrapperX);
            s.wrapper.appendChild(s.wrapperY);
            s.container.appendChild(s.wrapper);
            s.createDays();
        }
        s.create();
        /*================
		Method
		================*/
        //容器操作类
        s.addDuration = function () {
            s.wrapper.style.webkitTransitionDuration = s.params.duration + "ms";
            s.wrapperY.style.webkitTransitionDuration = s.params.duration + "ms";
            s.wrapperX.style.webkitTransitionDuration = s.params.duration + "ms";
        }
        s.removeDuration = function () {
            s.wrapper.style.webkitTransitionDuration = "0ms";
            s.wrapperY.style.webkitTransitionDuration = "0ms";
            s.wrapperX.style.webkitTransitionDuration = "0ms";
        }
        s.updateTranslateX = function () {
            s.removeDuration();
            s.touches.posX = -s.container.width;
            s.wrapperX.style.webkitTransform = "translateX(" + s.touches.posX + "px)";
        }
        s.updateContainerHeight = function () {//更新高度
            if (s.params.viewType === "month") {//展开
                s.touches.h = s.params.wrapperHeight;
            } else if (s.params.viewType === "week") {//收缩
                s.touches.h = s.params.dayHeight;
            }
            s.wrapper.style.height = s.touches.h + 'px';
            s.wrapperY.style.webkitTransform = "translateY(-" + s.touches.posY + "px)";
        }
        s.updateContainerWidth = function () {//更新宽度
            s.container.width = s.container.clientWidth;
            s.wrapperX.width = s.wrapperX.clientWidth;
            /*s.wrapperX.width=s.container.width*3;
			s.wrapperX.style.width=s.wrapperX.width.width+"px";*/
            for (var i = 0; i < 3; i++) {
                s.months[i].style.width = s.container.width + "px";
            }
        }
        s.updateContainerSize = function () {
            s.updateContainerHeight();
            s.updateContainerWidth();
            s.updateTranslateX();
        }
        s.updateClasses = function () {
            //更新容器尺寸
            s.updateContainerHeight();
            //位置还原
            s.updateTranslateX();
        }
        s.updateClasses();
        //左右滑动
        s.slideXTo = function (index) {
            s.touches.posX = -s.container.width * index;
            s.addDuration();
            s.wrapperX.style.webkitTransform = 'translateX(' + s.touches.posX + 'px)';
            //刷新数据
            if (index === 0) {//上一页
                if (s.params.viewType === "month") {
                    s.calendarUtil.activePrevMonth();
                } else if (s.params.viewType === "week") {
                    s.wrapperY.style.webkitTransitionDuration = "0ms";
                    s.calendarUtil.activePrevWeek();
                }
                s.draw();
            } else if (index === 2) {//下一页
                if (s.params.viewType === "month") {
                    s.calendarUtil.activeNextMonth();
                } else if (s.params.viewType === "week") {
                    s.wrapperY.style.webkitTransitionDuration = "0ms";
                    s.calendarUtil.activeNextWeek();
                }
                s.draw();
            }
        }
        //上下滑动
        s.dragY = function (heightY) {
            s.wrapper.style.height = heightY + 'px';
            var translateY = s.params.wrapperHeight - heightY;
            if (translateY <= s.touches.maxPosY) {
                s.wrapperY.style.webkitTransform = "translateY(-" + translateY + "px)";
            }
        }
        s.slideYTo = function (index) {
            s.addDuration();
            if (index === 1) {//展开
                s.params.viewType = "month";
                s.touches.posY = 0;
                s.draw();
            } else if (index === -1) {//收缩
                s.params.viewType = "week";
                s.touches.posY = s.touches.maxPosY;
                s.draw();
            } else {
                s.dragY(s.touches.h);
            }
        }
        //绘制日历
        var today = new Date();
        s.isToday = function (date) {
            if (date.getDate() == today.getDate() && date.getMonth() == today.getMonth() && date.getFullYear() == today.getFullYear()) return true;
            return false;
        }
        s.data = [];
        s.updateData = function () {
            s.data = s.calendarUtil.getCalendarData();
            s.data.activeIndex = s.calendarUtil.activeIndex;
            var activeRowIndex = s.calendarUtil.activeRowIndex;
            if (s.params.viewType === "week") {
                s.touches.maxPosY = activeRowIndex * s.params.dayHeight;
                s.touches.posY = s.touches.maxPosY;
                var prevWeek = s.calendarUtil.getPrevWeek();
                var nextWeek = s.calendarUtil.getNextWeek();
                var start1 = activeRowIndex * 7;
                var start2 = start1 + 84;
                //上周
                for (var i = 0, datIndex1 = start1; i < 7; i++) {
                    s.data[datIndex1] = prevWeek[i];
                    datIndex1++;
                }
                //下周
                for (var j = 0, datIndex2 = start2; j < 7; j++) {
                    s.data[datIndex2] = nextWeek[j];
                    datIndex2++;
                }
            }
        }
        s.drawHeader = function () {
            var activeDate = s.calendarUtil.activeDate;
            //注入头部数据
            s.title.innerHTML = activeDate.getFullYear() + "-" + activeDate.month() + "-" + activeDate.day();
        }
        s.draw = function () {
            s.updateData();
            //注入头部
            s.drawHeader();
            //注入身体
            var activeIndex = s.data.activeIndex;
            var activeRowIndex = s.data.activeRowIndex;
            for (var i = 0; i < s.days.length; i++) {
                s.days[i].innerHTML = s.data[i].getDate();
                //index
                s.days[i].index = i;
                //class
                s.days[i].className = s.params.dayNumClass;
                //class-currentClass
                if (s.data[i].isCurrent) s.days[i].classList.add(s.params.currentClass);
                else s.days[i].classList.add(s.params.notcurrentClass);
                //class-todayClass
                if (s.isToday(s.data[i])) s.days[i].classList.add(s.params.todayClass);
                //class-activeClass
                if (i == activeIndex && s.activeDate) s.days[i].classList.add(s.params.activeClass);
                //禁用日期
                if (s.params.disableBeforeDate && s.data[i].setHours(0, 0, 0, 0) < s.params.disableBeforeDate.setHours(0, 0, 0, 0)) {
                    s.days[i].classList.add(s.params.disableClass);
                }
                if (s.params.disableAfterDate && s.data[i].setHours(0, 0, 0, 0) > s.params.disableAfterDate.setHours(0, 0, 0, 0)) {
                    s.days[i].classList.add(s.params.disableClass);
                }
            }
            s.updateContainerHeight();
            if (s.activeDate) s.activeDate = s.calendarUtil.activeDate;
            //Callback onChange
            if (s.params.onChange) s.params.onChange(s);
        }
        s.draw();
        s.activeDay = function (target) {
            for (var i = 0; i < s.days.length; i++) {
                s.days[i].classList.remove(s.params.activeClass);
            }
            //选中日期
            s.activeDate = s.data[target.index];
            s.calendarUtil.setActiveDate(s.activeDate);
            //重新绘制
            s.draw();

            //target.classList.add(s.params.activeClass);
            //s.drawHeader();
        }
        s.showMonth = function () {
            s.slideYTo(1);
        }
        s.showWeek = function () {
            s.slideYTo(-1);
        }
        s.showToday = function () {
            s.calendarUtil.setActiveDate(s.today);
            s.draw();
        }
        s.reset = function () {
            //选中日期
            s.activeDate = s.params.activeDate;
            s.calendarUtil.setActiveDate(s.params.defaultActiveDate);
            //重新绘制
            s.draw();
        }
        /*================
		Control
		================*/
        s.events = function (detach) {
            var action = detach ? "removeEventListener" : "addEventListener";
            s.wrapper[action]("touchstart", s.onTouchStart, false);
            s.wrapper[action]("touchmove", s.onTouchMove, false);
            s.wrapper[action]("touchend", s.onTouchEnd, false);
            s.wrapper[action]("touchcancel", s.onTouchEnd, false);
            s.wrapper[action]("webkitTransitionEnd", s.onTransitionEnd, false);
            s.wrapper[action]("click", s.onClick, false);

            s.prev[action]("click", s.onClickPrev, false);
            s.next[action]("click", s.onClickNext, false);
        }
        //attach、dettach事件
        s.attach = function (event) {
            s.events();
        }
        s.detach = function (event) {
            s.events(true);
        }
        s.preventDefault = function (e) {
            e.preventDefault();
        }
        //Event Handler
        s.onClickPrev = function (e) {
            s.slideXTo(0);
        }
        s.onClickNext = function (e) {
            s.slideXTo(2);
        }
        s.onClick = function (e) {
            s.target = e.target;
            //禁用状态
            if (e.target.classList.contains(s.params.disableClass)) return;

            if (e.target.classList.contains(s.params.dayNumClass)) s.activeDay(e.target);
            //Callback onClick
            if (s.params.onClick) s.params.onClick(s);
        }
        s.onTouchStart = function (e) {
            s.container.addEventListener("touchmove", s.preventDefault, false);
            s.touches.startX = e.touches[0].clientX;
            s.touches.startY = e.touches[0].clientY;
        };
        s.onTouchMove = function (e) {
            s.touches.currentX = e.touches[0].clientX;
            s.touches.currentY = e.touches[0].clientY;
            s.touches.diffX = s.touches.startX - s.touches.currentX;
            s.touches.diffY = s.touches.startY - s.touches.currentY;

            //设置滑动方向(-1上下 | 1左右)
            if (s.touches.direction === 0) {
                s.touches.direction = Math.abs(s.touches.diffX) > Math.abs(s.touches.diffY) ? 1 : -1;
            }

            if (s.touches.direction === 1) {//左右滑动
                var moveX = s.touches.posX - s.touches.diffX;
                if (moveX < 0 && Math.abs(moveX - s.container.width) < s.wrapperX.width) {//判断是否是边缘
                    s.touches.horizontal = moveX < s.touches.posX ? 1 : -1;//设置方向(左右)
                    s.wrapperX.style.webkitTransform = 'translateX(' + moveX + 'px)';
                }
            } else if (s.touches.direction === -1) {//上下滑动
                if (s.params.isYTouch === true) {//允许Y滑动的情况下
                    var heightY = s.touches.h - s.touches.diffY;
                    if (heightY > s.params.dayHeight && heightY < s.params.wrapperHeight) {//判断是否是边缘
                        s.touches.vertical = heightY > s.touches.h ? 1 : -1;//设置方向(上下)
                        s.dragY(heightY);
                    }
                } else {
                    s.container.removeEventListener("touchmove", s.preventDefault, false);
                }
            }
        };
        s.onTouchEnd = function (e) {
            if (s.touches.direction === 1) {//左右滑动

                if (Math.abs(s.touches.diffX) < s.params.threshold) s.touches.horizontal = 0;
                if (s.touches.horizontal === 1) s.slideXTo(2); //下一页
                else if (s.touches.horizontal === -1) s.slideXTo(0);//上一页
                else s.slideXTo(1);//还原当前页

            } else if (s.touches.direction === -1) {//上下滑动
                if (s.params.isYTouch === true) {//允许Y滑动的情况下
                    if (Math.abs(s.touches.diffY) < s.params.threshold) s.touches.vertical = 0;
                    if (s.touches.vertical === 1) s.slideYTo(1);//展开
                    else if (s.touches.vertical === -1) s.slideYTo(-1);//收缩
                    else s.slideYTo(0);//还原当前页
                }
            }

            //清空滑动方向
            s.touches.direction = 0;
            s.touches.horizontal = 0;
            s.touches.vertical = 0;
        };
        s.onTransitionEnd = function (e) {
            //还原位置
            s.updateTranslateX();
        }
        /*================
		Init
		================*/
        s.init = function () {
            s.attach();
        }
        s.init();
    };

    window.CalendarUtil = function (activeDate) {
        /*================
        Model
        ================*/
        var s = this;
        s.weekMilliSecound = 7 * 24 * 60 * 60 * 1000;
        s.dayMilliSecound = 24 * 60 * 60 * 1000;
        //选中日期
        s.activeDate = activeDate ? new Date(activeDate) : new Date();
        //周视图
        s.midWeek = [], s.prevWeek = [], s.nextWeek = [], s.tempWeek = [];

        s.createWeeks = function () {
            for (var i = 0; i < 7; i++) {
                s.midWeek.push(new Date());
                s.prevWeek.push(new Date());
                s.nextWeek.push(new Date());
                s.tempWeek.push(new Date());
            }
        }
        s.createWeeks();
        //月视图
        s.midMonth = [], s.prevMonth = [], s.nextMonth = [], s.tempMonth = [];
        s.createMonths = function () {
            for (var i = 0; i < 42; i++) {
                s.midMonth.push(new Date());
                s.prevMonth.push(new Date());
                s.nextMonth.push(new Date());
                s.tempMonth.push(new Date());
            }
        }
        s.createMonths();
        /*================
        Method
        ================*/
        //日期比较
        s.compareDate = function (date1, date2) {
            var t1days = new Date(date1.getFullYear(), date1.getMonth(), 0).getDate();
            var t1 = date1.getFullYear() + date1.getMonth() / 12 + date1.getDate() / t1days / 12;
            var t2days = new Date(date2.getFullYear(), date2.getMonth(), 0).getDate();
            var t2 = date2.getFullYear() + date2.getMonth() / 12 + date2.getDate() / t2days / 12;
            if (t1 == t2) return 0;
            else return t1 > t2;
        }
        //周视图
        s.updateWeekByDate = function (date, week) {
            var day = date.getDay();
            var startDayMs = date.getTime() - s.dayMilliSecound * day;
            if (!week) {
                week = s.tempWeek;
            }
            week[0].setTime(startDayMs);
            for (var i = 1; i < 7; i++) {
                week[i].setTime(week[i - 1].getTime() + s.dayMilliSecound);
            }
            return week;
        }
        s.getMidWeek = function () {//获得本周
            return s.updateWeekByDate(s.activeDate, s.midWeek);
        }
        s.getPrevWeek = function () {//获得上周
            var prevWeekDateMs = s.activeDate.getTime() - s.weekMilliSecound;
            return s.updateWeekByDate(new Date(prevWeekDateMs), s.prevWeek);
        }
        s.getNextWeek = function () {//获得下周
            var nextWeekDateMs = s.activeDate.getTime() + s.weekMilliSecound;
            return s.updateWeekByDate(new Date(nextWeekDateMs), s.nextWeek);
        }
        //月视图
        s.currentMonth = null;
        s.activeIndex = null;
        s.activeRowIndex = null;
        s.updateMonthByDate = function (date, month) {
            //1日
            var firstDay = new Date();
            firstDay.setTime(date.getTime() - s.dayMilliSecound * (date.getDate() - 1));
            var firstDayIndex = firstDay.getDay();

            //31日
            var monthDays = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
            var lastDayIndex = firstDayIndex + monthDays;

            //起始日
            var startDayMs = firstDay.getTime() - s.dayMilliSecound * firstDayIndex;

            if (!month) {
                month = s.tempMonth;
            }

            //生成月
            for (var i = 0; i < 42; i++) {
                if (i == 0) month[0].setTime(startDayMs);
                else month[i].setTime(month[i - 1].getTime() + s.dayMilliSecound);
                //设置选中项
                if (s.currentMonth === "midMonth" && s.compareDate(month[i], date) === 0) {
                    s.activeIndex = i + 42;
                    s.activeRowIndex = Math.floor(i / 7);
                }

                //设置当月标识isCurrent
                month[i].isCurrent = false;
                if (i >= firstDayIndex && i < lastDayIndex) month[i].isCurrent = true;
            }
            return month;
        }
        s.getPrevMonth = function () {//获得上月
            s.currentMonth = "prevMonth";

            var prevDate = new Date();
            prevDate.setMonth(s.activeDate.getMonth() - 1);
            return s.updateMonthByDate(prevDate, s.prevMonth);
        }
        s.getMidMonth = function () {//获得本月
            s.currentMonth = "midMonth";

            return s.updateMonthByDate(s.activeDate, s.midMonth);
        }
        s.getNextMonth = function () {//获得下月
            s.currentMonth = "nextMonth";

            var nextDate = new Date();
            nextDate.setMonth(s.activeDate.getMonth() + 1);
            return s.updateMonthByDate(nextDate, s.nextMonth);
        }
        s.getCalendarData = function () {
            return s.getPrevMonth().concat(s.getMidMonth()).concat(s.getNextMonth());
        }
        //设置选中日期
        s.setActiveDate = function (activeDate) {
            s.activeDate.setTime(activeDate.getTime());
        }
        s.activePrevWeek = function () {
            var ms = s.activeDate.getTime() - s.weekMilliSecound;
            s.activeDate.setTime(ms);
        }
        s.activeNextWeek = function () {
            var ms = s.activeDate.getTime() + s.weekMilliSecound;
            s.activeDate.setTime(ms);
        }
        s.activePrevMonth = function () {
            var tempDate = new Date(s.activeDate);
            tempDate.setMonth(s.activeDate.getMonth() - 1);
            if (s.activeDate.getMonth() === tempDate.getMonth()) {
                tempDate = new Date(tempDate.getFullYear(), tempDate.getMonth(), 0);
            }
            s.activeDate = tempDate;
        }
        s.activeNextMonth = function () {
            var tempDate = new Date(s.activeDate);
            tempDate.setMonth(s.activeDate.getMonth() + 1);
            if (s.activeDate.getMonth() === tempDate.getMonth() - 2) {
                tempDate = new Date(tempDate.getFullYear(), tempDate.getMonth(), 0);
            }
            s.activeDate = tempDate;
        }
        /*其它工具*/
        //推前天数
        s.getBeforeDays = function (beforenum) {
            var days = [];
            for (var i = 1; i <= beforenum; i++) {
                days.push(new Date(s.activeDate.getTime() - i * s.dayMilliSecound));
            }
            return days;
        }
        //推前月
        s.getBeforeMonths = function (beforenum) {
            var months = [];
            var tempDate = new Date(s.activeDate.getFullYear(), s.activeDate.getMonth());
            for (var i = 1; i <= beforenum; i++) {
                var tempDate2 = new Date();
                tempDate2.setMonth(tempDate.getMonth() - i);
                months.push(tempDate2);
            }
            return months;
        }
        //推前周
        s.getBeforeWeeks = function (beforenum) {
            var weeks = new Array(beforenum);
            for (var i = 0; i < beforenum; i++) {
                weeks[i] = [];
                for (var j = 0; j < 7; j++) {
                    weeks[i].push(new Date());
                }
                var prevWeekDateMs = s.activeDate.getTime() - s.weekMilliSecound * (i + 1);
                s.updateWeekByDate(new Date(prevWeekDateMs), weeks[i]);
            }
            return weeks;
        }
        //分秒向上档位
        s.ceilMinute = function (minute, space) {
            var percentNum = Math.ceil(minute / space);
            percentNum = minute % space == 0 ? parseInt(percentNum) + 1 : percentNum;
            var result = percentNum * space;
            if (result >= 60) result = 0;
            return result;
        }
    };
})(window, document, undefined);

//Alert 提示框
(function (window, document, undefined) {

    window.Alert = function (msg, params) {
        /*================
		Model
		================*/
        var defaults = {
            overflowContainer: document.body,
            parent: document.body,
            maskClass: "mask",
            alertClass: "alert",
            handlerClass: "alert-handler",
            title: "提示",
            buttonOk: "确定",
            buttonCancel: "取消",
            isClickMaskHide: false
            /*
            Callbacks:
            onClick:function(Alert)
			onClickOk:function(Alert)
			onClickCancel:function(Alert)
			onClickMask:function(Alert)
			*/
        }
        params = params || {};
        for (var def in defaults) {
            if (params[def] == undefined) {
                params[def] = defaults[def];
            }
        }
        var s = this;
        s.params = params;
        //Parent | OverflowContainer
        s.parent = typeof s.params.parent == "string" ? document.querySelector(s.params.parent) : s.params.parent;
        s.overflowContainer = typeof s.params.overflowContainer == "string" ? document.querySelector(s.params.overflowContainer) : s.params.overflowContainer;
        //Alert | Mask
        s.alert, s.mask;
        //Mask
        s.createMask = function () {
            var mask = document.createElement("div");
            mask.setAttribute("class", s.params.maskClass);
            return mask;
        }
        //Alert
        s.createButtonCancel = function () {
            var buttonCancel = document.createElement("a");
            buttonCancel.innerHTML = s.params.buttonCancel;
            return buttonCancel;
        }
        s.createAlert = function () {
            var alert = document.createElement("div");
            alert.setAttribute("class", s.params.alertClass);

            alert.content = document.createElement("label");
            alert.content.innerHTML = msg;

            alert.handler = document.createElement("div");
            alert.handler.setAttribute("class", s.params.handlerClass);

            //如果有取消按钮
            if (s.params.onClickCancel) {
                alert.buttonCancel = s.createButtonCancel();
                alert.handler.appendChild(alert.buttonCancel);
            }
            alert.buttonOk = document.createElement("a");
            alert.buttonOk.innerHTML = s.params.buttonOk;

            alert.handler.appendChild(alert.buttonOk);

            if (s.params.title) {
                alert.caption = document.createElement("h1");
                alert.caption.innerHTML = s.params.title;
                alert.appendChild(alert.caption);
            }

            alert.appendChild(alert.content);
            alert.appendChild(alert.handler);

            return alert;
        }
        s.create = function () {
            s.mask = s.createMask();
            s.alert = s.createAlert();
            s.parent.appendChild(s.mask);
            s.parent.appendChild(s.alert);
        }
        s.create();
        /*================
		Method
		================*/
        s.showMask = function () {
            s.mask.style.visibility = "visible";
            s.mask.style.opacity = "1";
        }
        s.hideMask = function () {
            s.mask.style.opacity = "0";
        }
        s.destroyMask = function () {
            s.parent.removeChild(s.mask);
        }
        s.showAlert = function () {
            s.alert.style.visibility = "visible";
            s.alert.style.opacity = "1";
        }
        s.hideAlert = function () {
            s.alert.style.opacity = "0";
        }
        s.destroyAlert = function () {
            s.parent.removeChild(s.alert);
        }
        s.isHid = true;
        s.hide = function () {
            s.isHid = true;
            //显示遮罩
            s.hideMask();
            //显示弹出框
            s.hideAlert();
            //显示滚动条
            if (s.overflowContainer)
                s.overflowContainer.style.overflow = "auto";
        };
        s.show = function () {
            s.isHid = false;
            //显示遮罩
            s.showMask();
            //显示弹出框
            s.showAlert();
            //禁用滚动条
            if (s.overflowContainer)
                s.overflowContainer.style.overflow = "hidden";
        };
        s.destroy = function () {
            //移动事件监听
            s.detach();
            //移除遮罩
            s.destroyMask();
            //移除弹出框
            s.destroyAlert();
            s = null;
        };
        //动态设置
        s.setText = function (msg) {
            s.alert.content.innerHTML = msg;
        };
        s.setOnClick = function (fn) {
            s.params.onClick = fn;
        }
        s.setOnClickOk = function (fn) {
            s.params.onClickOk = fn;
        }
        s.setOnClickCancel = function (fn) {
            //如果没有取消按钮，创建一个
            if (!s.params.onClickCancel) {
                s.alert.buttonCancel = s.createButtonCancel();
                s.alert.handler.insertBefore(s.alert.buttonCancel, s.alert.buttonOk);
            }
            s.params.onClickCancel = fn;
        }
        /*================
		Control
		================*/
        s.events = function (detach) {
            var touchTarget = s.alert;
            var action = detach ? "removeEventListener" : "addEventListener";
            touchTarget[action]("click", s.onClick, false);
            touchTarget[action]("webkitTransitionEnd", s.onTransitionEnd, false);
            //遮罩
            s.mask[action]("click", s.onClickMask, false);
        }
        //attach、dettach事件
        s.attach = function (event) {
            s.events();
        }
        s.detach = function (event) {
            s.events(true);
        }
        s.onClick = function (e) {
            s.target = e.target;

            if (s.params.onClick) s.params.onClick(s);

            if (e.target == s.alert.buttonOk) {
                if (s.params.onClickOk) s.params.onClickOk(s);
                else s.hide();
            } else if (s.alert.buttonCancel && e.target == s.alert.buttonCancel) {
                if (s.params.onClickCancel) s.params.onClickCancel(s);
                else s.hide();
            }
        }
        s.setOnClick = function (fn) {
            s.params.onClick = fn;
        }
        s.onClickMask = function (e) {
            s.target = e.target;
            if (s.params.onClickMask) s.params.onClickMask(s);
            if (s.params.isClickMaskHide) s.hide();
        }
        s.setOnClickMask = function (fn) {
            s.params.onClickMask = fn;
        }
        s.onTransitionEnd = function (e) {
            if (s.isHid) {
                s.alert.style.visibility = "hidden";
                s.mask.style.visibility = "hidden";
            }
        }
        /*================
		Init
		================*/
        s.init = function () {
            s.attach();
        }
        s.init();
    }
})(window, document, undefined);

//Actionsheet
(function (window, document, undefined) {

    window.Actionsheet = function (params) {
        /*================
		Model
		================*/
        var defaults = {
            overflowContainer: document.body,
            parent: document.body,
            maskClass: "mask",
            actionsheetClass: "actionsheet",
            groupClass: "actionsheet-group",
            buttonCancelClass: "actionsheet-cancel",
            buttonCancel: "取消",
            isClickMaskHide: true,
            data: []
            /*
            Callbacks:
            option.onClick:function(Actionsheet)
			onClickCancel:function(Actionsheet)
			onClickMask:function(Actionsheet)
			*/
        }
        params = params || {};
        for (var def in defaults) {
            if (params[def] == undefined) {
                params[def] = defaults[def];
            }
        }
        var s = this;
        s.params = params;
        //Parent | OverflowContainer
        s.parent = typeof s.params.parent == "string" ? document.querySelector(s.params.parent) : s.params.parent;
        s.overflowContainer = typeof s.params.overflowContainer == "string" ? document.querySelector(s.params.overflowContainer) : s.params.overflowContainer;
        //Actionsheet | Mask
        s.actionsheet, s.mask;
        //Mask
        s.createMask = function () {
            var mask = document.createElement("div");
            mask.setAttribute("class", s.params.maskClass);
            return mask;
        }
        //Actionsheet
        s.createActionsheet = function () {
            var actionsheet = document.createElement("div");
            actionsheet.setAttribute("class", s.params.actionsheetClass);

            actionsheet.group = document.createElement("div");
            actionsheet.group.setAttribute("class", s.params.groupClass);

            s.updateData(actionsheet);

            actionsheet.appendChild(actionsheet.group);
            //创建取消按钮
            if (s.params.buttonCancel) {
                actionsheet.buttonCancel = document.createElement("a");
                actionsheet.buttonCancel.setAttribute("class", s.params.buttonCancelClass);
                actionsheet.buttonCancel.innerHTML = s.params.buttonCancel;

                actionsheet.appendChild(actionsheet.buttonCancel);
            }
            return actionsheet;
        }
        s.updateData = function (actionsheet) {
            actionsheet.group.innerHTML = "";
            actionsheet.options = [];
            for (var i = 0, dat; dat = s.params.data[i++];) {
                var option = document.createElement("a");
                option.innerHTML = dat.text;
                option.onClick = dat.handler;
                actionsheet.options.push(option);
                actionsheet.group.appendChild(option);
            }
        }
        s.create = function () {
            s.mask = s.createMask();
            s.actionsheet = s.createActionsheet();
            s.parent.appendChild(s.mask);
            s.parent.appendChild(s.actionsheet);
        }
        s.create();
        //设置数据
        s.setData = function (data) {
            s.params.data = data;
            if (s.actionsheet) s.updateData(s.actionsheet);
            else s.createActionsheet();
        }

        /*================
		Method
		================*/
        s.showMask = function () {
            s.mask.style.visibility = "visible";
            s.mask.style.opacity = "1";
        }
        s.hideMask = function () {
            s.mask.style.opacity = "0";
        }
        s.destroyMask = function () {
            s.parent.removeChild(s.mask);
        }
        s.showActionsheet = function () {
            s.actionsheet.style.webkitTransform = "translate3d(0,0,0)";
        }
        s.hideActionsheet = function () {
            s.actionsheet.style.webkitTransform = "translate3d(0,100%,0)";
        }
        s.destroyActionsheet = function () {
            s.parent.removeChild(s.actionsheet);
        }

        s.isHid = true;
        s.hide = function () {
            s.isHid = true;
            //显示遮罩
            s.hideMask();
            //显示弹出框
            s.hideActionsheet();
            //显示滚动条
            s.overflowContainer.style.overflow = "auto";
        };
        s.show = function () {
            s.isHid = false;
            //显示遮罩
            s.showMask();
            //显示弹出框
            s.showActionsheet();
            //禁用滚动条
            s.overflowContainer.style.overflow = "hidden";
        };
        s.destroy = function () {
            //移动事件监听
            s.detach();
            //移除遮罩
            s.destroyMask();
            //移除弹出框
            s.destroyActionsheet();
            s = null;
        };
        /*================
		Control
		================*/
        s.events = function (detach) {
            var touchTarget = s.actionsheet;
            var action = detach ? "removeEventListener" : "addEventListener";
            touchTarget[action]("click", s.onClick, false);
            touchTarget[action]("webkitTransitionEnd", s.onTransitionEnd, false);
            //遮罩
            s.mask[action]("click", s.onClickMask, false);
        }
        //attach、dettach事件
        s.attach = function (event) {
            s.events();
        }
        s.detach = function (event) {
            s.events(true);
        }
        s.onClick = function (e) {
            s.target = e.target;
            //点击容器
            if (s.params.onClick) s.params.onClick(s);
            //点击项
            var options = s.actionsheet.options;
            for (var i = 0, opt; opt = options[i++];) {
                if (opt == s.target) {
                    //Callback
                    opt.onClick(s);
                    return;
                }
            }
            //点击取消按钮
            if (s.params.onClickCancel && s.actionsheet.buttonCancel == s.target) {
                s.params.onClickCancel(s);
                return;
            }
            s.hide();
        };
        s.setOnClick = function (fn) {
            s.params.onClick = fn;
        }
        s.onClickMask = function (e) {
            s.target = e.target;
            if (s.params.onClickMask) s.params.onClickMask(s);
            if (s.params.isClickMaskHide) s.hide();
        }
        s.setOnClickMask = function (fn) {
            s.params.onClickMask = fn;
        }
        s.onTransitionEnd = function (e) {
            if (s.isHid) {
                s.mask.style.visibility = "hidden";
            }
        }
        /*================
		Init
		================*/
        s.init = function () {
            s.attach();
        }
        s.init();
    }
})(window, document, undefined);

//Toast 提示框
(function (window, document, undefined) {

    window.Toast = function (msg, params) {
        /*================
		Model
		================*/
        var defaults = {
            parent: document.body,
            toastBoxClass: "toast-box",
            toastClass: "toast",

            showAnimateClass: "toast-show",
            hideAnimateClass: "toast-hide"
            //"delay":1000,
            /*callbacks
            onShowed(Toast)//显示动画结束后回调
            onHid(Toast)//隐藏动画结束后回调
            */
        }
        params = params || {};
        for (var def in defaults) {
            if (params[def] == undefined) {
                params[def] = defaults[def];
            }
        }
        var msg = msg || "";
        var s = this;
        s.params = params;
        s.parent = typeof s.params.parent == "string" ? document.querySelector(s.params.parent) : s.params.parent;
        s.toastBox, s.toast;
        s.createToastBox = function () {
            var toastBox = document.createElement("div");
            toastBox.setAttribute("class", s.params.toastBoxClass);
            return toastBox;
        }
        s.createToast = function () {
            var toast = document.createElement("div");
            toast.setAttribute("class", s.params.toastClass);
            if (msg) toast.innerHTML = msg;
            return toast;
        }
        s.create = function () {
            s.toastBox = s.createToastBox();
            s.toast = s.createToast();
            s.toastBox.appendChild(s.toast);
            s.parent.appendChild(s.toastBox);
        }
        s.create();

        /*================
		Method
		================*/
        s.setText = function (msg) {
            s.toast.innerHTML = msg;
        };
        s.isHid = true;
        s.disableShow = false;//允许show点击
        s.hide = function () {
            s.isHid = true;
            s.disableShow = true;//禁止show点击
            s.toastBox.classList.remove(s.params.showAnimateClass);
            s.toastBox.classList.add(s.params.hideAnimateClass);
            //s.toastBox.style.webkitTransform='translate3d(0,150px,0)';
        };
        s.show = function () {
            if (s.isHid == false || s.disableShow == true) {
                return;
            }
            s.isHid = false;
            s.toastBox.classList.add(s.params.showAnimateClass);
            //s.toastBox.style.webkitTransform='translate3d(0,0,0)';
        };
        s.destroy = function () {
            s.detach();
            s.parent.removeChild(s.toastBox);
            s.toastBox = null;
        };
        /*================
		Controller
		================*/
        s.events = function (detach) {
            var target = s.toastBox;
            var action = detach ? "removeEventListener" : "addEventListener";
            //target[action]("webkitTransitionEnd",s.onTransitionEnd,false);
            target[action]("webkitAnimationEnd", s.onAnimationEnd, false);
        }
        s.attach = function () {
            s.events();
        }
        s.detach = function () {
            s.events(false);
        }
        //Events Handler
        /*s.onTransitionEnd=function(){
			if(s.isHid){//已隐藏状态
				if(s.delayer)window.clearTimeout(s.delayer);
			}else{//已显示状态
				s.delayer=setTimeout(function(){
					s.hide();
				}, s.params.delay);
			}
		}*/
        s.onAnimationEnd = function () {
            if (s.isHid) {//已隐藏状态
                s.disableShow = false;//解禁show点击
                s.toastBox.classList.remove("toast-hide");
                //CallBack onHid
                if (s.params.onHid) s.params.onHid(s);
            } else {//已显示状态
                s.hide();
                if (s.params.onShowed) s.params.onShowed(s);
            }
        }
        /*================
		Init
		================*/
        s.init = function () {
            s.attach();
        }
        s.init();
    }
})(window, document, undefined);

//Prompt 提示框
(function (window, document, undefined) {

    window.Prompt = function (msg, params) {
        /*================
		Model
		================*/
        var defaults = {
            parent: document.body,
            promptClass: "prompt",
            delay: 1000
        }
        params = params || {};
        for (var def in defaults) {
            if (params[def] == undefined) {
                params[def] = defaults[def];
            }
        }
        var msg = msg || "";
        var s = this;
        s.params = params;
        //Parent
        s.parent = typeof s.params.parent == "string" ? document.querySelector(s.params.parent) : s.params.parent;
        //创建容器
        s.prompt = null;
        s.createContainer = function () {
            if (s.prompt) return;
            s.prompt = document.createElement("div");
            s.prompt.setAttribute("class", s.params.promptClass);
            s.prompt.innerHTML = msg;
            s.params.parent.appendChild(s.prompt);
        }
        s.createContainer();
        /*================
		Method
		================*/
        s.setText = function (msg) {
            s.prompt.innerHTML = msg;
        };
        s.isHid = true;
        s.hide = function (fn) {
            s.isHid = true;
            s.prompt.style.opacity = "0";
        };
        s.show = function (fn) {
            s.isHid = false;
            s.prompt.style.visibility = "visible";
            s.prompt.style.opacity = "1";
        };

        /*================
		Controller
		================*/
        s.events = function (detach) {
            var target = s.prompt;
            var action = detach ? "removeEventListener" : "addEventListener";
            target[action]("webkitTransitionEnd", s.onTransitionEnd, false);
        }
        s.attach = function () {
            s.events();
        }
        s.detach = function () {
            s.events(false);
        }
        //Events Handler
        s.onTransitionEnd = function () {
            if (s.isHid) {
                s.prompt.style.visibility = "hidden";
                if (s.delayer) window.clearTimeout(s.delayer);
            } else {
                //延迟时间后自动消失
                s.delayer = setTimeout(function () {
                    s.hide();
                }, s.params.delay);
            }
        }

        /*================
		Init
		================*/
        s.init = function () {
            s.attach();
        }
        s.init();
    }
})(window, document, undefined);

//Dialog 自定义弹出框
(function (window, document, undefined) {
    window.Dialog = function (wrapper, params) {
        /*=========================
          Model
          ===========================*/
        var defaults = {
            overflowContainer: document.body,
            dialogClass: "dialog",
            maskClass: "mask",
            position: null,
            defaultPosition: "middle",
            css: {},
            maskCss: {},
            duration: 300,
            isClickMaskHide: true
            /*callbacks
            onClick:function(Dialog)
            onClickMask:function(Dialog)
            onTransitionEnd:function(Dialog)
            onShowed(Dialog)//显示动画结束后回调
            onHid(Dialog)//隐藏动画结束后回调
            */
        }
        params = params || {};
        for (var def in defaults) {
            if (params[def] === undefined) {
                params[def] = defaults[def];
            }
        }
        //Dialog
        var s = this;

        //Params
        s.params = params;
        //Mask
        s.mask;
        //Dialog(外层生成的包裹容器)
        s.dialog;
        //Wrapper(源容器)
        s.wrapper = typeof wrapper == "string" ? document.querySelector(wrapper) : wrapper;
        if (!s.wrapper) return;
        //Parent(父容器，为了方便在源容器处插入包裹容器)
        s.parent = s.wrapper.parentNode;
        //OverflowContainer
        s.overflowContainer = typeof s.params.overflowContainer == "string" ? document.querySelector(s.params.overflowContainer) : s.params.overflowContainer;

        //Mask
        s.createMask = function () {
            var mask = document.createElement("div");
            mask.setAttribute("class", s.params.maskClass);
            return mask;
        }
        //ContainerBox
        s.createContainerBox = function () {
            var dialog = document.createElement("div");
            dialog.setAttribute("class", s.params.dialogClass);
            return dialog;
        }
        s.create = function () {
            //插入Dialog
            s.dialog = s.createContainerBox();
            s.parent.insertBefore(s.dialog, s.wrapper);
            s.dialog.appendChild(s.wrapper);
            //插入遮罩
            s.mask = s.createMask();
            s.parent.insertBefore(s.mask, s.dialog);
        }
        s.create();

        s.update = function () {
            s.wrapper.style.display = "block";
            s.dialog.setAttribute("style", "");
            if (s.params.position) {
                s.dialog.setAttribute("data-position", s.params.position);
            } else if (s.dialog.getAttribute("data-position")) {
                s.params.position = s.dialog.getAttribute("data-position");
            } else {
                s.params.position = s.params.defaultPosition;
                s.dialog.setAttribute("data-position", s.params.position);
            }
            //Dialog Css
            for (var c in s.params.css) {
                s.dialog.style[c] = s.params.css[c];
            }
            //Mask Css
            for (var maskc in s.params.maskCss) {
                s.mask.style[maskc] = s.params.maskCss[maskc];
            }
            switch (s.params.position) {
                case "top":
                case "top-right":
                    s.dialog.showAnimation = {webkitTransform: "translate3d(0,0,0)"},
                        s.dialog.hideAnimation = {webkitTransform: "translate3d(0,-100%,0)"},
                        s.dialog.style.webkitTransform = "translate3d(0,-100%,0)";
                    break;
                case "top-center":
                    s.dialog.showAnimation = {webkitTransform: "translate3d(-50%,0,0)"},
                        s.dialog.hideAnimation = {webkitTransform: "translate3d(-50%,-100%,0)"},
                        s.dialog.style.webkitTransform = "translate3d(-50%,-100%,0)";
                    break;

                case "bottom":
                case "bottom-right":
                    s.dialog.showAnimation = {webkitTransform: "translate3d(0,0,0)"},
                        s.dialog.hideAnimation = {webkitTransform: "translate3d(0,100%,0)"},
                        s.dialog.style.webkitTransform = "translate3d(0,100%,0)";
                    break;
                case "bottom-center":
                    s.dialog.showAnimation = {webkitTransform: "translate3d(-50%,0,0)"},
                        s.dialog.hideAnimation = {webkitTransform: "translate3d(-50%,100%,0)"},
                        s.dialog.style.webkitTransform = "translate3d(-50%,100%,0)";
                    break;

                case "left":
                case "left-bottom":
                    s.dialog.showAnimation = {webkitTransform: "translate3d(0,0,0)"},
                        s.dialog.hideAnimation = {webkitTransform: "translate3d(-100%,0,0)"},
                        s.dialog.style.webkitTransform = "translate3d(-100%,0,0)";
                    break;
                case "left-middle":
                    s.dialog.showAnimation = {webkitTransform: "translate3d(0,-50%,0)"},
                        s.dialog.hideAnimation = {webkitTransform: "translate3d(-100%,-50%,0)"},
                        s.dialog.style.webkitTransform = "translate3d(-100%,-50%,0)";
                    break;

                case "right":
                case "right-bottom":
                    s.dialog.showAnimation = {webkitTransform: "translate3d(0,0,0)"},
                        s.dialog.hideAnimation = {webkitTransform: "translate3d(100%,0,0)"},
                        s.dialog.style.webkitTransform = "translate3d(100%,0,0)";
                    break;

                case "right-middle":
                    s.dialog.showAnimation = {webkitTransform: "translate3d(0,-50%,0)"},
                        s.dialog.hideAnimation = {webkitTransform: "translate3d(100%,-50%,0)"},
                        s.dialog.style.webkitTransform = "translate3d(100%,-50%,0)";
                    break;

                default:
                    s.dialog.showAnimation = {opacity: 1},
                        s.dialog.hideAnimation = {opacity: 0},
                        s.dialog.style.opacity = 0;
                    break;
            }
            //设置动画毫秒数
            s.dialog.style.webkitTransitionDuration = s.params.duration + "ms";
        }
        s.update();
        /*=========================
          Method
          ===========================*/
        s.showMask = function () {
            s.mask.style.visibility = "visible";
            s.mask.style.opacity = "1";
        }
        s.hideMask = function () {
            s.mask.style.opacity = "0";
        }
        s.destroyMask = function () {
            s.parent.removeChild(s.mask);
        }
        s.showDialog = function () {
            s.dialog.style.visibility = "visible";
            for (var ani in s.dialog.showAnimation) {
                s.dialog.style[ani] = s.dialog.showAnimation[ani];
            }
        }
        s.hideDialog = function () {
            for (var ani in s.dialog.hideAnimation) {
                s.dialog.style[ani] = s.dialog.hideAnimation[ani];
            }
        }
        s.destroyDialog = function () {
            s.parent.removeChild(s.dialog);
        }
        s.isHid = true;
        s.show = function (fn) {
            s.isHid = false;
            s.showMask();
            s.showDialog();
            if (fn) s.params.onShowed = fn;
            //禁用滚动条
            if (s.overflowContainer)
                s.overflowContainer.style.overflow = "hidden";
        }
        s.hide = function (fn) {
            s.isHid = true;
            s.hideMask();
            s.hideDialog();
            if (fn) s.params.onHid = fn;
            //显示滚动条
            if (s.overflowContainer)
                s.overflowContainer.style.overflow = "auto";
        }
        s.destroy = function () {
            s.destroyMask();
            s.destroyDialog();
        }
        //设置位置
        s.setPosition = function (pos) {
            s.params.position = pos;
            s.update();
        }
        /*================
        Control
        ================*/
        s.events = function (detach) {
            var touchTarget = s.dialog;
            var action = detach ? "removeEventListener" : "addEventListener";
            touchTarget[action]("click", s.onClick, false);
            touchTarget[action]("webkitTransitionEnd", s.onTransitionEnd, false);
            //遮罩
            s.mask[action]("click", s.onClickMask, false);
        }
        //attach、dettach事件
        s.attach = function (event) {
            s.events();
        }
        s.detach = function (event) {
            s.events(true);
        }
        s.onClick = function (e) {
            s.target = e.target;
            if (s.params.onClick) s.params.onClick(s);
        }
        s.setOnClick = function (fn) {
            s.params.onClick = fn;
        }
        s.onClickMask = function (e) {
            s.target = e.target;
            if (s.params.onClickMask) s.params.onClickMask(s);
            if (s.params.isClickMaskHide) s.hide();
        }
        s.setOnClickMask = function (fn) {
            s.params.onClickMask = fn;
        }
        s.onTransitionEnd = function (e) {
            s.target = e.target;
            if (s.params.onTransitionEnd) s.params.onTransitionEnd(s);
            if (s.isHid) {
                s.dialog.style.visibility = "hidden";
                s.mask.style.visibility = "hidden";
                if (s.params.onHid) s.params.onHid(s);
            } else {
                if (s.params.onShowed) s.params.onShowed(s);
            }
        }

        s.init = function () {
            s.attach();
        }
        s.init();
    }
})(window, document, undefined);

//Scrollpicker 滚动选择器
(function (window, document, undefined) {
    window.Scrollpicker = function (params) {
        /*=========================
          Model
          ===========================*/
        var defaults = {
            parent: document.body,
            //picker:null,
            pickerClass: "scrollpicker",
            pickerActiveClass: "active",
            headerClass: "scrollpicker-header",
            headerDoneClass: "scrollpicker-done",
            headerDoneText: "完成",
            headerCancelClass: "scrollpicker-cancel",
            headerCancelText: "取消",
            wrapperClass: "scrollpicker-wrapper",
            layerClass: "scrollpicker-layer",
            layerFrameClass: 'scrollpicker-layer-frame',
            layerFrameHTML: '<div class="scrollpicker-layer-frame"></div>',
            slotsClass: "scrollpicker-slots",
            slotClass: "scrollpicker-slot",
            lockClass: "lock",
            slotActiveClass: "active",
            slotListActiveClass: "active",
            cellHeight: 44,
            friction: 0.002,//摩擦力
            bounceRange: 44,//弹性值
            isClickMaskHide: true,
            isCascade: false,//是否清除后面的值
            defaultValues: [{'key': null, 'value': '----'}]

            /*callbacks
            onClickCancel:function(Scrollpicker)
            onClickDone:function(Scrollpicker)
            onScrollStart:function(Scrollpicker)
            onScroll:function(Scrollpicker)
            onScrollEnd:function(Scrollpicker)
            onTransitionEnd:function(Scrollpicker)
            onShowed(Scrollpicker)//显示动画结束后回调
            onHid(Scrollpicker)//隐藏动画结束后回调
            */
        }
        params = params || {};
        for (var def in defaults) {
            if (params[def] === undefined) {
                params[def] = defaults[def];
            }
        }
        //Scrollpicker
        var s = this;

        //Params
        s.params = params;
        //Dom元素
        s.parent = typeof s.params.parent == "string" ? document.querySelector(s.params.parent) : s.params.parent;
        s.picker, s.mask, s.header, s.wrapper, s.slotbox, s.layer, s.headerDone, s.headerCancel;
        //槽元素与其值
        s.slots = [], s.slots.col = 0, s.activeOptions = [], s.activeOption = {};
        //是否渲染
        //s.isRendered=false;
        //修改Param
        s.setIsClickMaskHide = function (bool) {
            s.params.isClickMaskHide = bool;
        }
        s.setOnClickDone = function (callback) {
            s.params.onClickDone = callback;
        }
        s.setOnClickCancel = function (callback) {
            s.params.onClickCancel = callback;
        }
        //新建Container
        s.createPicker = function () {
            var picker = document.createElement("div")
            picker.setAttribute("class", s.params.pickerClass);
            return picker;
        }
        //新建Header
        s.createHeader = function () {
            var header = document.createElement("div");
            header.setAttribute("class", s.params.headerClass);
            return header;
        }
        //新建Header按钮
        s.createHeaderDone = function () {
            var headerDone = document.createElement("a");
            headerDone.setAttribute("class", s.params.headerDoneClass);
            headerDone.innerHTML = s.params.headerDoneText;
            return headerDone;
        }
        s.createHeaderCancel = function () {
            var headerCancel = document.createElement("a");
            headerCancel.setAttribute("class", s.params.headerCancelClass);
            headerCancel.innerHTML = s.params.headerCancelText;
            return headerCancel;
        }
        //新建Wrapper
        s.createWrapper = function () {
            var wrapper = document.createElement("div");
            wrapper.setAttribute("class", s.params.wrapperClass);
            return wrapper;
        }
        //新建Slotbox
        s.createSlotbox = function () {
            var slotbox = document.createElement("div");
            slotbox.setAttribute("class", s.params.slotsClass);
            return slotbox;
        }
        //新建Layer
        s.createLayer = function () {
            var layer = document.createElement("div");
            layer.setAttribute("class", s.params.layerClass);
            layer.innerHTML = s.params.layerFrameHTML;
            return layer;
        }
        //新建Mask
        s.createMask = function () {
            var mask = document.createElement("div");
            mask.setAttribute("class", "mask");
            return mask;
        }
        //新建一行List
        s.createLi = function (value, classes) {
            var li = document.createElement("li");
            li.setAttribute("class", classes);
            li.innerHTML = value;
            return li;
        }
        //创建DOM
        s.create = function () {
            /*if(s.params.picker){
                s.picker=typeof picker=="string"?document.querySelector(picker):picker;
                s.mask=s.picker.previousElementSibling;
                s.header=s.picker.querySelector("."+s.params.headerClass);
                s.headerDone=s.picker.querySelector("."+s.params.headerDoneClass);
                s.headerCancel=s.picker.querySelector("."+s.params.headerCancelClass);
                s.wrapper=s.picker.querySelector("."+s.params.wrapperClass);
                s.slotbox=s.picker.querySelector("."+s.params.slotsClass);
                s.layer=s.picker.querySelector("."+s.params.layerClass);
            }else{*/
            s.picker = s.createPicker();
            s.mask = s.createMask();
            s.header = s.createHeader();
            s.headerDone = s.createHeaderDone();
            s.headerCancel = s.createHeaderCancel();
            s.wrapper = s.createWrapper();
            s.slotbox = s.createSlotbox();
            s.layer = s.createLayer();

            s.header.appendChild(s.headerCancel);
            s.header.appendChild(s.headerDone);

            s.wrapper.appendChild(s.slotbox);
            s.wrapper.appendChild(s.layer);

            s.picker.appendChild(s.header);
            s.picker.appendChild(s.wrapper);

            s.parent.appendChild(s.mask);
            s.parent.appendChild(s.picker);
            /*}*/
        }
        s.create();
        /*=========================
          Method
          ===========================*/
        //修改默认value
        s.setDefaultValue = function (slot, value) {
            slot.defaultValue = value;
        }
        //修改默认key
        s.setDefaultKey = function (slot, key) {
            slot.defaultKey = key;
        }
        //添加一列
        s.addSlot = function (values, classes, defaultValue, defaultKey) {
            if (!classes) {
                classes = '';
            }
            //设置属性
            var slot = document.createElement("ul");
            slot.setAttribute("class", s.params.slotClass + " " + classes);
            slot.values = values;
            slot.defaultValue = defaultValue;
            slot.defaultKey = defaultKey;
            slot.col = s.slots.col;
            //判断是否有锁定
            if (classes.indexOf(s.params.lockClass) >= 0) slot.isLock = true;
            else slot.isLock = false;
            //渲染
            s.slots.col++;
            s.renderSlot(slot);
            s.slotbox.appendChild(slot);
            //添加到集合里
            s.slots.push(slot);
        }
        //替换一列
        s.replaceSlot = function (col, values, classes, defaultValue, defaultKey) {
            //设置属性
            var slot = s.slots[col];
            slot.setAttribute("class", s.params.slotClass + " " + classes);
            slot.values = values;
            slot.defaultValue = defaultValue;
            slot.defaultKey = defaultKey;
            //清空此列
            s.clearSlot(slot);
            //重新渲染
            s.renderSlot(slot);
            if (s.params.isCascade) clearAfterSlot(col);
        }
        //修改一列
        s.mergeSlot = function (col, values) {
            //设置属性
            var slot = s.slots[col];
            slot.values = values;
            //更新此列
            s.renderSlot(slot);
        }

        //清空下列
        function clearAfterSlot(col) {
            var nextCol = ++col;
            var nextSlot = s.slots[nextCol];
            if (nextSlot) {
                nextSlot.innerHTML = "<li>" + s.params.defaultValues[0].value + "</li>"
                s.updateSlot(nextSlot);
                clearAfterSlot(nextCol);
                //设置选中项
                s.activeOptions[nextCol] = s.params.defaultValues[0];
            }
        }

        //清空一列
        s.clearSlot = function (slot) {
            //初始化一列值
            slot.activeIndex = null;
            slot.defaultIndex = null;
        }
        //渲染一列
        s.renderSlot = function (slot) {
            slot.innerHTML = "";
            slot["list"] = [];
            var col = slot.col;
            var values = slot.values;
            //设置默认value或者默认key
            var compareDefaultType = "value";
            var compareDefaultValue = slot.defaultValue;
            if (slot.defaultKey) {//如果设置了key比较，则优先比较key值
                compareDefaultType = "key";
                compareDefaultValue = slot.defaultKey;
            }
            //选中项不能超过总项数
            if (slot.activeIndex && slot.activeIndex >= values.length - 1) {
                slot.activeIndex = values.length - 1;
            }
            //渲染
            for (var i = 0, rowData; rowData = values[i]; i++) {
                //获得activeIndex
                if (compareDefaultValue && compareDefaultValue == rowData[compareDefaultType]) {
                    if (!slot.activeIndex) {
                        slot.activeIndex = i;
                    }
                    slot.defaultIndex = i;
                } else {
                    if (!slot.activeIndex) {
                        slot.activeIndex = 0;
                    }
                    slot.defaultIndex = 0;
                }

                //添加到选中项
                var li, liClasses = "";
                if (i == slot.activeIndex) {
                    liClasses = "active";
                    s.activeOptions[col] = rowData;
                }

                li = s.createLi(rowData["value"], liClasses);
                slot.appendChild(li);
                slot["list"].push(li);
            }
            //更新此列
            s.updateSlot(slot);
        }
        //更新DOM数据，获得所有槽和槽内list列表
        s.updateSlot = function (slot) {
            //slot["list"]=[].slice.call(slot.querySelectorAll("li"));
            slot["defaultPosY"] = -slot.defaultIndex * s.params.cellHeight;
            slot["activePosY"] = -slot.activeIndex * s.params.cellHeight;
            slot["posY"] = slot["activePosY"];
            slot["minPosY"] = 0;
            slot["maxPosY"] = -(slot["list"].length - 1) * s.params.cellHeight;
            slot["minBouncePosY"] = s.params.bounceRange;
            slot["maxBouncePosY"] = slot["maxPosY"] - s.params.bounceRange;
            slot.style.webkitTransform = 'translate3d(0px,' + slot["activePosY"] + 'px,0px)';
            slot["list"].forEach(function (n, i, arr) {
                n.className = "";
                if (i == slot.activeIndex) {
                    n.className = "active";
                }
            });
        }
        s.updateSlots = function () {
            //s.slots=[].slice.call(s.picker.querySelectorAll("."+s.params.slotClass));
            s.slots.forEach(function (n, i, a) {
                s.updateSlot(n);
            });
        }
        s.isHid = true;
        //显示
        s.show = function () {
            s.isHid = false;
            /*if(s.isRendered==false){
                s.attach();
            }*/
            s.mask.style.visibility = "visible";
            s.mask.style.opacity = "1";
            //s.picker.style.webkitTransform='translate3d(0px,0px,0px)';
            s.picker.classList.add(s.params.pickerActiveClass);
        }
        //隐藏
        s.hide = function () {
            s.isHid = true;
            s.mask.style.opacity = "0";
            s.mask.style.visibility = "hidden";
            //s.picker.style.webkitTransform='translate3d(0px,100%,0px)';
            s.picker.classList.remove(s.params.pickerActiveClass);
        }
        //重置
        s.reset = function () {
            //清空指向
            s.slots = [];
            s.slots.col = 0;
            //清空数据
            //s.isRendered=false;
            s.slotbox.innerHTML = "";
        }
        //清除
        s.destroy = function () {
            s.detach();
            s.parent.removeChild(s.mask);
            s.parent.removeChild(s.picker);
        }

        s.slotPosY = function (slot, posY) {
            slot.style.webkitTransform = 'translate3d(0px,' + posY + 'px,0px)';
        }
        s.updateActiveSlot = function (xPos) {
            var xPos = xPos || 0;
            var slotPos = 0;
            for (var i = 0; i < s.slots.length; i++) {
                slotPos += s.slots[i].clientWidth;
                if (xPos < slotPos) {
                    s.activeSlot = s.slots[i];
                    s.activeSlotIndex = i;
                    break;
                }
            }
        }
        //计算惯性时间与坐标，返回距离和时间
        s.getInertance = function (distance, duration, friction) {
            //使用公式算出惯性执行时间与距离
            var newDuration = (2 * distance / duration) / friction;
            var newDistance = -(friction / 2) * (newDuration * newDuration);
            //如果惯性执行时间为负值，则为向上拖动
            if (newDuration < 0) {
                newDuration = -newDuration;
                newDistance = -newDistance;
            }
            return {distance: newDistance, duration: newDuration}
        }
        var isTransitionEnd = true;//有时候原坐标和目标坐标相同时，不会执行transition事件，用此值来记录是否执行的状态
        //滚动至
        s.scrollTo = function (slot, posY, duration) {
            slot.posY = posY;
            if (duration == 0 || duration) {
                var duration = duration;
            } else {
                duration = 100;
            }
            if (posY > slot.minBouncePosY) {
                slot.posY = slot.minBouncePosY;
                duration = s.sideDuration(posY, slot.minBouncePosY, duration);//计算新的执行时间
            } else if (posY < slot.maxBouncePosY) {
                slot.posY = slot.maxBouncePosY;
                duration = s.sideDuration(posY, slot.maxBouncePosY, duration);//计算新的执行时间
            }
            slot.style.webkitTransitionDuration = duration + "ms";
            slot.style.webkitTransform = 'translate3d(0px,' + slot.posY + 'px,0px)';
            //如果不执行onTransitionEnd
            if (isTransitionEnd == false || duration == 0) {
                var e = {};
                e.target = slot;
                s.onTransitionEnd(e);
                isTransitionEnd = true;
            }
        }
        //计算超出边缘时新的时间
        s.sideDuration = function (posY, bouncePosY, duration) {
            return Math.round(duration / (posY / bouncePosY));
        }
        //更新列表激活状态
        s.updateActiveList = function (slot, posY) {
            var index = -Math.round((posY - s.params.cellHeight * 2) / s.params.cellHeight) - 2;
            slot.list.forEach(function (n, i, a) {
                n.classList.remove("active");
                if (i == index) {
                    n.classList.add("active");
                    //s.activeNode=n;
                }
            });
            //添加到激活项
            s.activeOption = s.slots[slot.col].values[index];
            s.activeOptions[slot.col] = s.activeOption;
            //设置选中项
            s.slots[slot.col].activeIndex = index;
        }
        //位置矫正
        s.posCorrect = function (slot) {
            slot.style.webkitTransitionDuration = '500ms';
            var remainder = slot.posY % s.params.cellHeight;
            if (remainder != 0) {
                //算出比例
                var divided = Math.round(slot.posY / s.params.cellHeight);
                //对准位置
                var top = s.params.cellHeight * divided;
                slot.posY = top;
                slot.style.webkitTransform = 'translate3d(0px,' + top + 'px,0px)';
            }
            s.updateActiveList(slot, slot.posY);
            //动画时间回0
            slot.style.webkitTransitionDuration = '0ms';
            //Callback
            if (s.params.onScrollEnd) s.params.onScrollEnd(s);
        }
        /*=========================
          Control
          ===========================*/
        s.events = function (detach) {
            var touchTarget = s.layer;
            var action = detach ? "removeEventListener" : "addEventListener";
            touchTarget[action]("touchstart", s.onTouchStart, false);
            touchTarget[action]("touchmove", s.onTouchMove, false);
            touchTarget[action]("touchend", s.onTouchEnd, false);
            touchTarget[action]("touchcancel", s.onTouchEnd, false);
            //preventDefault
            s.mask[action]("touchmove", preventDefault, false);
            s.header[action]("touchmove", preventDefault, false);
            touchTarget[action]("touchmove", preventDefault, false);
            //transitionEnd
            s.picker[action]("webkitTransitionEnd", s.onTransitionEnd, false);
            //mask
            s.mask[action]("click", s.onClickMask, false);
            //确定和取消按钮
            if (s.params.onClickDone) s.headerDone[action]("click", s.onClickDone, false);
            if (s.params.onClickCancel) s.headerCancel[action]("click", s.onClickCancel, false);
        }
        //attach、dettach事件
        s.attach = function (event) {
            s.events();
        }
        s.detach = function (event) {
            s.events(true);
        }

        function preventDefault(e) {
            e.preventDefault();
        }

        //Mask
        s.onClickMask = function (e) {
            if (s.params.isClickMaskHide === true) s.hide();
        }
        //Done|Cancel
        s.onClickDone = function (e) {
            s.target = e.target;
            s.params.onClickDone(s);
        }
        s.onClickCancel = function (e) {
            s.target = e.target;
            s.params.onClickCancel(s);
        }

        s.touches = {
            startX: 0,
            startY: 0,
            currentX: 0,
            currentY: 0,
            endX: 0,
            endY: 0,
            startTimeStamp: 0,
            duration: 0,
            diffX: 0,
            diffY: 0,
            direction: null
        };
        //触摸事件
        s.onTouchStart = function (e) {
            //s.layer.addEventListener("touchmove",preventDefault,false);
            s.touches.startX = e.touches[0].clientX;
            s.touches.startY = e.touches[0].clientY;
            //寻找当前点击的槽
            s.updateActiveSlot(s.touches.startX);
            //记录点击时间
            s.touches.startTimeStamp = e.timeStamp;
            //Callback
            if (s.params.onScrollStart) s.params.onScrollStart(s);
        }
        s.onTouchMove = function (e) {
            if (s.activeSlot && s.activeSlot.isLock) return;
            s.touches.currentY = e.touches[0].clientY;
            s.touches.diffY = s.touches.startY - s.touches.currentY;
            s.activeSlot.moveY = s.activeSlot.posY - s.touches.diffY;
            if (s.activeSlot.moveY > s.activeSlot.minBouncePosY) {
                s.activeSlot.moveY = s.activeSlot.minBouncePosY;
            } else if (s.activeSlot.moveY < s.activeSlot.maxBouncePosY) {
                s.activeSlot.moveY = s.activeSlot.maxBouncePosY;
            }
            s.activeSlot.style.webkitTransform = 'translate3d(0px,' + s.activeSlot.moveY + 'px,0px)';
            s.updateActiveList(s.activeSlot, s.activeSlot.moveY);

            //Callback
            if (s.params.onScroll) s.params.onScroll(s);
        }
        s.onTouchEnd = function (e) {
            if (s.activeSlot.isLock) return;
            //判断是否是tap
            s.touches.endX = e.changedTouches[0].clientX;
            s.touches.endY = e.changedTouches[0].clientY;
            s.touches.diffX = s.touches.startX - s.touches.endX;
            s.touches.diffY = s.touches.startY - s.touches.endY;
            if (Math.abs(s.touches.diffX) < 6 && Math.abs(s.touches.diffY) < 6) {
                return;
            }
            //设置当前坐标值
            s.activeSlot.posY = s.activeSlot.moveY;
            //计算拖动时间
            s.touches.duration = e.timeStamp - s.touches.startTimeStamp;
            //惯性值计算
            var inertance = s.getInertance(s.touches.diffY, s.touches.duration, s.params.friction);
            //惯性Y坐标
            var newPosY = s.activeSlot.posY + inertance.distance;
            //如果原坐标和目标坐标相同，则不执行transitionEnd
            if (s.activeSlot.moveY == s.activeSlot.minBouncePosY || s.activeSlot.moveY == s.activeSlot.maxBouncePosY) {
                isTransitionEnd = false;
            }
            //滚动到指定位置
            s.scrollTo(s.activeSlot, newPosY, inertance.duration);
        }
        //惯性滚动结束后
        s.onTransitionEnd = function (e) {
            var target = e.target;
            if (s.params.onTransitionEnd) s.params.onTransitionEnd(s);

            if (target.classList.contains(s.params.slotClass)) {//slot
                if (target.posY > 0) {
                    target.posY = 0;
                } else if (target.posY < target.maxPosY) {
                    target.posY = target.maxPosY;
                }
                target.style.webkitTransform = 'translate3d(0px,' + target.posY + 'px,0px)';
                //位置矫正
                s.posCorrect(target);
            } else if (target.classList.contains(s.params.pickerClass)) {
                if (s.isHid) {
                    if (s.params.onHid) s.params.onHid(s);
                } else {
                    if (s.params.onShowed) s.params.onShowed(s);
                }
            }
        }
        s.onLoad = function () {
            if (s.params.onLoad) s.params.onLoad(s);
        }

        function init() {
            /*if(s.params.picker){
                s.attach();
            }*/
            s.attach();
            //s.onLoad();
        }

        init();
    }
})(window, document, undefined);

//SpDate 扩展scrollpicker日期控件 (require scrollpikcer.js)
(function (window, document, undefined) {
    window.SpDate = function (params) {
        /*================
	    Model
	    ==================*/
        var defaults = {
            "parent": document.body,
            "viewType": "date",//"date","month","time","datetime"
            "isSimpleYear": false,
            "yearsData": null,
            "monthsData": null,
            "daysData": null,
            "hoursData": null,
            "minutesData": null,

            "yearClass": null,
            "monthClass": null,
            "dayClass": null,
            "hourClass": null,
            "minuteClass": null,

            "defaultYear": null,
            "defaultMonth": null,
            "defaultDay": null,
            "defaultHour": null,
            "defaultMinute": null,

            "minYear": 1950,
            "maxYear": 2050,

            "yyUnit": "年",
            "MMUnit": "月",
            "ddUnit": "日",
            "hhUnit": "时",
            "mmUnit": "分",

            isClickMaskHide: true,

            /*callbacks
			onClickDone:function(Scrollpicker)
			onClickCancel:function(Scrollpicker)
			onTransitionEnd:function(Scrollpicker)
            onShowed(Scrollpicker)//显示动画结束后回调
            onHid(Scrollpicker)//隐藏动画结束后回调
			*/
        }
        params = params || {};
        for (var def in defaults) {
            if (params[def] === undefined) {
                params[def] = defaults[def];
            }
        }
        //SpDate
        var s = this;

        //Params
        s.params = params;

        //Date
        s.date;
        s.updateDetault = function () {
            s.date = new Date();
            //默认值
            if (!s.params.defaultYear) s.params.defaultYear = s.date.getFullYear();
            if (!s.params.defaultMonth) s.params.defaultMonth = s.date.getMonth() + 1;
            if (!s.params.defaultDay) s.params.defaultDay = s.date.getDate();
            if (!s.params.defaultHour) s.params.defaultHour = s.date.getHours();
            if (!s.params.defaultMinute) s.params.defaultMinute = s.date.getMinutes();
        }
        s.updateDetault();
        //设置默认值
        s.setDefaultYear = function (year) {
            s.params.defaultYear = year;
        }
        s.setDefaultMonth = function (monthKey) {
            s.params.defaultMonth = monthKey;
        }
        s.setDefaultDay = function (dayKey) {
            s.params.defaultDay = dayKey;
        }
        s.setDefaultHour = function (hourKey) {
            s.params.defaultHour = hourKey;
        }
        s.setDefaultMinute = function (minuteKey) {
            s.params.defaultMinute = minuteKey;
        }
        //年
        s.years = [];
        if (s.params.yearsData) {
            s.years = s.params.yearsData;
        } else {
            for (var y = s.params.minYear; y <= s.params.maxYear; y++) {
                s.years.push({
                    "key": y,
                    "value": s.params.isSimpleYear ? y.toString().substring(2, 4) + s.params.yyUnit : y + s.params.yyUnit,
                    "flag": "date"
                });
            }
        }
        //月
        s.months = [];
        if (s.params.monthsData) {
            s.months = s.params.monthsData;
        } else {
            for (var m = 1; m <= 12; m++) {
                s.months.push({"key": m, "value": m + s.params.MMUnit, "flag": "date"});
            }
        }
        //日
        s.days = [];
        var currentMaxday = new Date(s.date.getFullYear(), s.date.getMonth() + 1, 0).getDate();
        if (s.params.daysData) {
            s.days = s.params.daysData;
        } else {
            for (var d = 1; d <= currentMaxday; d++) {
                s.days.push({"key": d, "value": d + s.params.ddUnit, "flag": "date"});
            }
        }

        function replaceDays(maxDay) {
            s.days = [];
            for (var d = 1; d <= maxDay; d++) {
                s.days.push({"key": d, "value": d + s.params.ddUnit, "flag": "date"});
            }
        }

        //时
        s.hours = [];
        if (s.params.daysData) {
            s.hours = s.params.hoursData;
        } else {
            for (var hour = 0; hour <= 23; hour++) {
                if (hour < 10) hour = "0" + hour;
                s.hours.push({"key": hour, "value": hour + s.params.hhUnit, "flag": "time"});
            }
        }

        //分
        s.minutes = [];
        if (s.params.minutesData) {
            s.minutes = s.params.minutesData;
        } else {
            for (var minute = 1; minute <= 60; minute++) {
                s.minutes.push({"key": minute, "value": minute + s.params.mmUnit, "flag": "time"});
            }
        }

        /*================
	    Method
	    ==================*/
        s.show = function () {
            s.scrollpicker.show();
        }
        s.getActiveText = function (activeData) {
            var activeText = "";
            var dateArr = [];
            var timeArr = [];
            activeData.forEach(function (n, i, a) {
                if (n["flag"] == "date") dateArr.push(n);
                else if (n["flag"] == "time") timeArr.push(n);
                else timeArr.push(n);
            });
            dateArr.forEach(function (n, i, a) {
                if (i == dateArr.length - 1) {
                    activeText += n["key"];
                } else {
                    activeText += n["key"] + "-";
                }
            })
            if (activeText != "") {
                activeText += " ";
            }
            timeArr.forEach(function (n, i, a) {
                if (i == timeArr.length - 1) {
                    activeText += n["key"];
                } else {
                    activeText += n["key"] + ":";
                }
            })
            return activeText;
        }
        s.setOnClickDone = function (fn) {
            s.params.onClickDone = fn;
        }
        s.setOnClickCancel = function (fn) {
            s.params.onClickCancel = fn;
        }
        /*================
	    Control
	    ==================*/
        //滑动面板初始化
        s.scrollpicker = new Scrollpicker({
            parent: s.params.parent,
            isClickMaskHide: s.params.isClickMaskHide,
            "onClickDone": function (e) {
                e.activeText = s.getActiveText(e.activeOptions);
                if (s.params.onClickDone) s.params.onClickDone(e);
            },
            "onClickCancel": function (e) {
                e.activeText = s.getActiveText(e.activeOptions);
                if (s.params.onClickCancel) s.params.onClickCancel(e);
                else e.hide();
                //还原为初始状态
                //e.updateSlots()
                //清空数据再注入
                /*e.reset();
	            addSlot();*/
            },
            "onScrollEnd": function (e) {
                if ((s.params.viewType == "date" || s.params.viewType == "datetime") && e.activeSlotIndex != 2) {
                    var year = e.activeOptions[0]["key"];
                    var month = e.activeOptions[1]["key"];
                    var maxDay = new Date(year, month, 0).getDate();
                    replaceDays(maxDay);//更新总天数
                    renderDay();//渲染天
                }
            },
            "onTransitionEnd": function (e) {
                if (s.params.onTransitionEnd) s.params.onTransitionEnd(e);
            },
            "onShowed": function (e) {
                if (s.params.onShowed) s.params.onShowed(e);
            },
            "onHid": function (e) {
                if (s.params.onHid) s.params.onHid(e);
            }
        });

        function renderDay() {
            s.scrollpicker.mergeSlot(2, s.days);//修改第三项
        }

        //添加数据
        function addMonthSlot() {
            s.scrollpicker.addSlot(s.years, s.params.yearClass, '', s.params.defaultYear);
            s.scrollpicker.addSlot(s.months, s.params.monthClass, '', s.params.defaultMonth);
        }

        function addDateSlot() {
            addMonthSlot();
            s.scrollpicker.addSlot(s.days, s.params.dayClass, '', s.params.defaultDay);
        }

        function addTimeSlot() {
            s.scrollpicker.addSlot(s.hours, s.params.hourClass, '', s.params.defaultHour);
            s.scrollpicker.addSlot(s.minutes, s.params.minuteClass, '', s.params.defaultMinute);
        }

        function addDateTime() {
            addDateSlot();
            addTimeSlot()
        }

        function initSlots() {
            switch (s.params.viewType) {
                case "date":
                    addDateSlot();
                    break;
                case "month":
                    addMonthSlot();
                    break;
                case "time":
                    addTimeSlot();
                    break;
                case "datetime":
                    addDateTime();
                    break;
            }
        }

        s.update = function () {
            s.scrollpicker.reset();
            initSlots();
        }
        s.init = function () {
            initSlots();
        }
        s.init();
    }
})(window, document, undefined);

//SpCity 扩展scrollpicker地区控件 (require scrollpikcer.js)
(function (window, document, undefined) {
    window.SpCity = function (params) {
        /*================
	    Model
	    ==================*/
        var defaults = {
            parent: document.body,
            viewType: "city",//"city","area"
            data: null,
            defaultValue: "----",
            provinceClass: "",
            cityClass: "",
            areaClass: "",

            isClickMaskHide: true,

            onScrollStart: null,
            onScroll: null
            /*callbacks
			onClickDone:function(Scrollpicker)
			onClickCancel:function(Scrollpicker)
			onTransitionEnd:function(Scrollpicker)
            onShowed(Scrollpicker)//显示动画结束后回调
            onHid(Scrollpicker)//隐藏动画结束后回调
            onScrollStart:function(Scrollpicker)
            onScroll:function(Scrollpicker)
            onScrollEnd:function(Scrollpicker)
			*/
        }
        params = params || {};
        for (var def in defaults) {
            if (params[def] === undefined) {
                params[def] = defaults[def];
            }
        }
        //SpCity
        var s = this;

        //Params
        s.params = params;

        //Data
        s.data = s.params.data;
        if (!s.data) return;

        //初始化数据
        var province = [], city = [];
        s.data.forEach(function (n, i, a) {
            province.push(n);
            if (i == 0) {
                city = n.children;
            }
        })
        /*================
	    Method
	    ==================*/
        s.show = function () {
            s.scrollpicker.show();
        }
        s.getActiveText = function (activeData) {
            var activeText = "";
            var cityArr = activeData.filter(function (n, i, a) {
                return n["value"] != s.params.defaultValue;
            });
            cityArr.forEach(function (n, i, a) {
                if (i == cityArr.length - 1) {
                    activeText += n["value"];
                } else {
                    activeText += n["value"] + "-";
                }
            })
            return activeText;
        }
        s.setOnClickDone = function (fn) {
            s.params.onClickDone = fn;
        }
        s.setOnClickCancel = function (fn) {
            s.params.onClickCancel = fn;
        }
        /*================
	    Control
	    ==================*/
        //初始化滚动控件
        var activeSlotIndex = "unknow";//记录锁定滚动
        s.scrollpicker = new Scrollpicker({
            "parent": s.params.parent,
            "isClickMaskHide": s.params.isClickMaskHide,
            "isCascade": true,//是否开启级联更新
            "onClickDone": function (e) {
                e.activeText = s.getActiveText(e.activeOptions);
                if (s.params.onClickDone) s.params.onClickDone(e);
            },
            "onClickCancel": function (e) {
                e.activeText = s.getActiveText(e.activeOptions);
                if (s.params.onClickCancel) s.params.onClickCancel(e);
                else e.hide();
            },
            onScrollStart: function (e) {
                if (activeSlotIndex == "unknow") {
                    activeSlotIndex = e.activeSlotIndex;//开始锁定滚动
                    for (var i = 0, slot; slot = e.slots[i++];) {
                        slot.isLock = true;
                    }
                    e.slots[activeSlotIndex].isLock = false;
                }
            },
            onScroll: s.params.onScroll,
            onScrollEnd: function (e) {
                console.log(1);
                renderAfter(activeSlotIndex);
                activeSlotIndex = "unknow";//解除锁定滚动
                function renderAfter(index) {
                    //获得当前选中数据
                    var nextSlotIndex = index + 1;
                    var slot = e.slots[index];
                    var activeIndex = slot.activeIndex;
                    var childrenData = slot.values[activeIndex].children;
                    if (s.params.viewType == "city") {
                        if (nextSlotIndex >= 2) {
                            return;
                        }
                    }
                    //如果有子级
                    if (childrenData) {
                        //修改下一列数据
                        e.replaceSlot(nextSlotIndex, childrenData, 'text-center citycol');
                        //递归
                        renderAfter(nextSlotIndex);
                    }
                }

                //Callback
                if (s.params.onScrollEnd) s.params.onScrollEnd(e);
            },
            onTransitionEnd: function (e) {
                if (s.params.onTransitionEnd) s.params.onTransitionEnd(e);
            },
            onShowed: function (e) {
                if (s.params.onShowed) s.params.onShowed(e);
            },
            onHid: function (e) {
                if (s.params.onHid) s.params.onHid(e);
            }
        });

        function initSlots() {
            s.scrollpicker.addSlot(province, s.params.provinceClass);
            s.scrollpicker.addSlot(city, s.params.cityClass);
            if (s.params.viewType == "area") {
                s.scrollpicker.addSlot([{'key': '-', 'value': s.params.defaultValue}], s.params.areaClass);
            }
        }

        s.init = function () {
            initSlots();
        }
        s.init();
    }
})(window, document, undefined);

//Tree 树结构
(function (window, document, undefined) {
    window.Tree = function (container, params) {
        /*=========================
      Model
      ===========================*/
        var defaults = {
            selectedContainer: null,
            selectedContainerActiveClass: "active",
            barButtonClass: "tree-bar-button",
            removeButtonClass: "tree-btnremove",
            addButtonClass: "tree-btnadd",
            extandClass: "extand",
            collapseClass: "collapse",
            treeClass: "tree",
            liconClass: "tree-licon",
            riconClass: "tree-ricon",
            ticonClass: "tree-ticon",
            rightClass: "tree-right",
            titleClass: "tree-title",
            dataId: "data-id",
            dataPrevId: "data-previd",
            dataName: "data-name",
            lineClass: "tree-line",
            lineActiveClass: "active"
            /*callbacks
        onTap:function(Tree)
        onTapLastChild:function(Tree)
        onClickTreebar:function(Tree)
        onClickTreebarDel:function(Tree)
        */
        }
        params = params || {};
        for (var def in defaults) {
            if (params[def] === undefined) {
                params[def] = defaults[def];
            }
        }
        //Tree
        var s = this;

        //Params
        s.params = params;

        //Container
        s.container = typeof container == "string" ? document.querySelector(container) : container;
        if (!s.container) return;

        //SelectedContainer
        if (s.params.selectedContainer) {
            s.selectedContainer = typeof s.params.selectedContainer == "string" ? document.querySelector(s.params.selectedContainer) : s.params.selectedContainer;
        }

        //SelectedContainer
        if (s.params.selectedContainer) {
            s.selectedContainer = typeof s.params.selectedContainer == "string" ? document.querySelector(s.params.selectedContainer) : s.params.selectedContainer;
        }

        //SelectedEl
        s.selected = {};

        /*=========================
      Method
      ===========================*/
        //Json是否为空
        s.isEmptyJson = function (json) {
            var temp = "";
            for (var j in json) {
                temp += j;
            }
            if (temp === "") return true;
            return false;
        }
        //删除选中项
        s.removeSelected = function (id) {
            //如果是人员
            var options = s.selectedContainer.querySelectorAll("[" + s.params.dataPrevId + "='" + id + "']");
            if (options.length > 0) {
                for (var i = 0, opt; opt = options[i++];) {
                    delete s.selected[opt.getAttribute(s.params.dataId)];
                    s.selectedContainer.removeChild(opt);
                }
            } else {//如果是部门
                if (s.selected[id]) delete s.selected[id];
                var option = s.selectedContainer.querySelector("[" + s.params.dataId + "='" + id + "']");
                if (option) s.selectedContainer.removeChild(option);
            }
        }
        //点击树结构添加选中
        s.addSelected = function (elLine) {
            //删除子级
            var elLi = elLine.parentNode;
            var elLines = elLi.querySelectorAll("." + s.params.lineClass);
            for (var i = 0, el; el = elLines[i++];) {
                //移除active
                el.classList.remove(s.params.lineActiveClass);
                //删除选中项
                var elId = el.getAttribute(s.params.dataId);
                s.removeSelected(elId);
            }
            //显示点击级
            var elLine = elLines[0];
            elLine.classList.add(s.params.lineActiveClass);

            var id = elLine.getAttribute(s.params.dataId);
            var prevId = elLine.getAttribute(s.params.dataPrevId);
            var name = elLine.getAttribute(s.params.dataName);

            var elOption = s.createSelectedOption(id, name, prevId);
            s.selectedContainer.appendChild(elOption);

            s.selected[id] = elLine;
            s.showSelected();
        }
        //异步添加节点
        s.hasSelectOption = function (dataId, dataPrevId) {
            //判断树中是否存在此ID
            var prevNode = s.container.querySelector("[" + s.params.dataId + "='" + dataPrevId + "']");
            if (!prevNode) {
                return false;
            }

            //判断选中列表是否存在
            if (s.selected[dataId] || s.selected[dataPrevId]) {
                return true;
            }

            //向上查询是否已添加到选中项
            while (!prevNode.classList.contains(s.params.treeClass) && prevNode.tagName != "BODY") {
                prevNode = prevNode.parentNode;
                var siblingNode = prevNode.previousElementSibling;
                if (siblingNode && siblingNode.getAttribute(s.params.dataId)) {
                    var prevId = siblingNode.getAttribute(s.params.dataId);
                    if (s.selected[prevId]) {
                        return true;
                    }
                }
            }

            //经过以上过滤，仍然未找到存在于选中项的迹象，说明没有存在于选中列表中
            return false;
        }
        s.addSelectNode = function (node) {
            var elId = node.getAttribute(s.params.dataId);
            var elPrevId = node.getAttribute(s.params.dataPrevId);
            var elName = node.getAttribute(s.params.dataName);
            if (!elPrevId) {
                alert("Tree.addSelectNode:没有找到dataPrevId");
                return;
            }
            if (s.hasSelectOption(elId, elPrevId)) {
                console.log("Tree.addSelectNode:已经选中了");
            } else {
                //当前节点选中
                node.classList.add(s.params.lineActiveClass);
                //树结构中对应节点选中
                var treeSameNode = s.container.querySelector("[" + s.params.dataId + "='" + elId + "']");
                if (treeSameNode) treeSameNode.classList.add(s.params.lineActiveClass);

                //创建选中项
                var elOption = s.createSelectedOption(elId, elName, elPrevId);
                s.selectedContainer.appendChild(elOption);
                //添加选中
                s.selected[elId] = node;
                s.showSelected();
            }
        }
        //显示选中项
        s.showSelected = function () {
            s.selectedContainer.classList.add(s.params.selectedContainerActiveClass);
        }
        //隐藏选中项
        s.hideSelected = function () {
            s.selectedContainer.classList.remove(s.params.selectedContainerActiveClass);
        }
        //创建选中项
        s.createSelectedOption = function (id, name, prevId) {
            //var span='<span class="mark-grayscale" data-id="'+treeID+'" data-name="'+treeName+'">'+treeName+'<a class="icon-clear-fill delete-selection"></a></span>';
            var option = document.createElement("span");
            option.setAttribute("class", s.params.barButtonClass);
            option.setAttribute(s.params.dataId, id);
            if (prevId) option.setAttribute(s.params.dataPrevId, prevId);
            option.setAttribute(s.params.dataName, name);
            var optionHTML = '<label>' + name + '</label><a class="' + s.params.removeButtonClass + '"></a>';
            option.innerHTML = optionHTML;
            return option;
        }
        /*=========================
      Events
      ===========================*/
        //绑定事件
        s.events = function (detach) {
            var action = detach ? "removeEventListener" : "addEventListener";
            //树结构
            s.container[action]("touchstart", s.onTouchStart, false);
            s.container[action]("touchend", s.onTouchEnd, false);
            //选中容器
            if (s.selectedContainer) {
                s.selectedContainer[action]("click", s.onTapTreebar, false);
            }
        }
        //attach、dettach事件
        s.attach = function (event) {
            s.events();
        }
        s.detach = function (event) {
            s.events(true);
        }
        /*=========================
      Event Handler
      ===========================*/
        //Tap
        s.touches = {
            startX: 0,
            startY: 0,
            endX: 0,
            endY: 0,
            diffX: 0,
            diffY: 0,
        };
        s.onTouchStart = function (e) {
            s.touches.startX = e.touches[0].clientX;
            s.touches.startY = e.touches[0].clientY;
        }
        s.onTouchEnd = function (e) {
            s.touches.endX = e.changedTouches[0].clientX,
                s.touches.endY = e.changedTouches[0].clientY;
            s.touches.diffX = s.touches.startX - s.touches.endX;
            s.touches.diffY = s.touches.startY - s.touches.endY;
            //单击事件
            if (Math.abs(s.touches.diffX) < 6 && Math.abs(s.touches.diffY) < 6) {
                s.onTapTree(e);
            }
        }
        //点击树
        s.onTapTree = function (e) {
            //点击树
            s.targetLi, s.targetLine, s.target = e.target;

            if (s.target.classList.contains(s.params.lineClass)) {//点击二级
                s.targetLine = s.target;
                s.targetLi = s.target.parentNode;
            } else if (s.target.classList.contains(s.params.liconClass) ||
                s.target.classList.contains(s.params.riconClass) ||
                s.target.classList.contains(s.params.ticonClass) ||
                s.target.classList.contains(s.params.rightClass) ||
                s.target.classList.contains(s.params.titleClass)) {//点击三级
                s.targetLine = s.target.parentNode;
                s.targetLi = s.target.parentNode.parentNode;
            }

            if (s.target.classList.contains(s.params.addButtonClass)) {//点击添加
                s.onClickAddBtn(s.targetLine);
            } else {//点击其它元素
                //Callback onTapLastChild(点击底层)
                if (!s.targetLine.nextElementSibling && s.params.onTapLastChild) s.params.onTapLastChild(s);
                //展开与收缩
                s.targetLine.classList.toggle(s.params.extandClass);
            }
            //Callback onTap
            if (s.params.onTap) s.params.onTap(s);
        }
        //点击树bar
        s.onTapTreebar = function (e) {
            if (e.target.classList.contains(s.params.removeButtonClass)) {
                s.onClickRemoveBtn(e);
            }
            //Callback onTapLastChild(点击底层)
            s.target = e.target;
            if (s.params.onClickTreebar) s.params.onClickTreebar(s);
        }
        //点击添加按钮
        s.onClickAddBtn = function (elLine) {
            s.addSelected(elLine);
        }

        //点击删除按钮
        s.onClickRemoveBtn = function (e) {
            s.option = e.target.parentNode;

            //Callback onTapLastChild(点击底层)
            s.target = e.target;
            if (s.params.onClickTreebarDel) s.params.onClickTreebarDel(s);

            var id = s.option.getAttribute(s.params.dataId);
            var elLine = s.container.querySelector("[" + s.params.dataId + "='" + id + "']");
            //选中容器删除选中项
            s.removeSelected(id);

            //移除active
            if (elLine) elLine.classList.remove(s.params.lineActiveClass);

            //如果为空，则隐藏选中容器
            if (s.isEmptyJson(s.selected)) {
                s.hideSelected();
            }
        }

        //主函数
        s.init = function () {
            s.attach();
        }
        s.init();
    }
})(window, document, undefined);

//Indexbar 索引控件
(function (window, document, undefined) {
    window.Indexbar = function (container, params) {
        /*=========================
          Params
          ===========================*/
        var defaults = {
            "indexbarClass": "indexbar",
            "indexbarActiveClass": "active",
            "indexActiveClass": "active",
            "toolTipClass": "indexbar-tooltip",
            "indexlistClass": "indexlist"
        }
        params = params || {};
        for (var def in defaults) {
            if (params[def] === undefined) {
                params[def] = defaults[def];
            }
        }
        //Indexbar
        var s = this;

        //Params
        s.params = params;

        //Container
        s.container = typeof container == "string" ? document.querySelector(container) : container;
        if (!s.container) return;

        //IndexList
        s.indexList = s.container.querySelector("." + s.params.indexlistClass);

        //IndexbarContainer
        s.indexBar, s.toolTip;
        s.createIndexBar = function () {
            var indexBar = document.createElement("div")
            indexBar.setAttribute("class", s.params.indexbarClass);
            return indexBar;
        }
        var arrIndexChar = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "G", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];
        s.createIndexs = function () {
            var indexs = [];
            arrIndexChar.forEach(function (n, i, a) {
                var indexChar = document.createElement("a");
                indexChar.innerHTML = n;
                indexs.push(indexChar);
            });
            return indexs;
        }
        s.createToolTip = function () {
            var toolTip = document.createElement("div")
            toolTip.setAttribute("class", s.params.toolTipClass);
            return toolTip;
        }
        s.create = function () {
            s.indexBar = s.createIndexBar();
            s.indexs = s.createIndexs();
            s.indexs.forEach(function (n, i, a) {
                s.indexBar.appendChild(n);
            });
            s.toolTip = s.createToolTip();
            s.container.appendChild(s.indexBar);
            s.container.appendChild(s.toolTip);
        }
        s.create();

        //Indexs
        s.indexs = s.indexBar.querySelectorAll("a");
        s.updateContainerSize = function () {
            s.indexHeight = s.indexBar.clientHeight / s.indexs.length;
            [].slice.call(s.indexs).forEach(function (n, i, a) {
                n.style.height = s.indexHeight + "px";
                n.style.lineHeight = s.indexHeight + "px";
            })
        }
        s.updateContainerSize();

        //Tooltip
        s.tooltip = s.indexBar.parentNode.querySelector("." + s.params.toolTipClass);


        //Controller
        /*=========================
          Touch Events
          ===========================*/
        //body事件绑定
        var touchTarget = s.container;
        s.events = function (detach) {
            var action = detach ? "removeEventListener" : "addEventListener";
            touchTarget[action]("touchmove", s.onTouchMove, false);
            touchTarget[action]("touchend", s.onTouchEnd, false);
            touchTarget[action]("touchcancel", s.onTouchEnd, false);
        }
        //attach、dettach事件
        s.attach = function (event) {
            s.events();
        }
        s.detach = function (event) {
            s.events(true);
        }
        /*=========================
          Touch Handler
          ===========================*/
        //Touch信息
        s.touches = {
            startX: 0,
            startY: 0,
            currentX: 0,
            currentY: 0,
            endX: 0,
            endY: 0
        };

        //索引
        function preventDefault(e) {
            e.preventDefault();
        }

        s.onTouchMove = function (e) {
            s.touches.currentY = e.touches[0].clientY;
            s.goIndex(s.touches.currentY);
        };
        s.onTouchEnd = function (e) {
            touchTarget.removeEventListener("touchmove", preventDefault, false);
            s.detach();
            //移除激活indexbar
            s.indexBar.classList.remove(s.params.indexbarActiveClass);
        };
        s.indexBar.addEventListener("touchstart", function (e) {
            touchTarget.addEventListener("touchmove", preventDefault, false);
            s.touches.startX = e.touches[0].clientX;
            s.touches.startY = e.touches[0].clientY;
            //给body绑定触摸事件
            s.attach();
            //滚动到指定位置
            s.goIndex(s.touches.startY);
            //激活indexbar
            s.indexBar.classList.add(s.params.indexbarActiveClass);
        }, false);
        /*=========================
          Method
          ===========================*/
        s.indexHTML = "A";
        s.goIndex = function (y) {
            //修改文字
            s.index = document.elementFromPoint(s.touches.startX, y);
            if (!s.index.parentNode || s.index.parentNode != s.indexBar) return;
            s.indexHTML = s.index.innerHTML;
            s.tooltip.innerHTML = s.indexHTML;
            s.indexLI = s.container.querySelector('[data-index=' + s.indexHTML + ']');
            //移动位置
            if (s.indexLI) s.indexList.scrollTop = s.indexLI.offsetTop - s.indexList.offsetTop;
        }
    }
})(window, document, undefined);

//Loading
(function (window, document, undefined) {

    window.Loading = function (params) {
        /*================
		Model
		================*/
        var defaults = {
            parent: document.body,
            loadContainer: null,
            mask: null,
            maskClass: "mask",
            loadingContainerClass: "loading-box",
            loadingClass: "loading",
            isClickMaskHide: false
            /*
            Callbacks:
            onClick:function(Loading)
			*/
        }
        params = params || {};
        for (var def in defaults) {
            if (params[def] == undefined) {
                params[def] = defaults[def];
            }
        }
        var s = this;
        s.params = params;
        s.parent = typeof s.params.parent == "string" ? document.querySelector(s.params.parent) : s.params.parent;
        s.mask, s.loadingContainer;
        //Mask
        s.createMask = function () {
            var mask = document.createElement("div");
            mask.setAttribute("class", s.params.maskClass);
            return mask;
        }
        //LoadingBox
        s.createLoadingBox = function () {
            var loadingContainer = document.createElement("div");
            loadingContainer.setAttribute("class", s.params.loadingContainerClass);

            loadingContainer.loading = document.createElement("div");
            loadingContainer.loading.setAttribute("class", s.params.loadingClass);

            loadingContainer.appendChild(loadingContainer.loading);

            return loadingContainer;
        }
        s.create = function () {
            if (s.params.loadContainer) {
                s.loadingContainer = typeof s.params.loadContainer == "string" ? document.querySelector(s.params.loadContainer) : s.params.loadContainer;
            } else {
                s.loadingContainer = s.createLoadingBox();
                s.parent.appendChild(s.loadingContainer);
            }

            if (s.params.mask) {
                s.mask = typeof s.params.mask == "string" ? document.querySelector(s.params.mask) : s.params.mask;
            } else {
                s.mask = s.createMask();
                s.parent.insertBefore(s.mask, s.loadingContainer);
            }
        }
        s.create();
        if (!s.mask || !s.loadingContainer) return;
        /*================
		Method
		================*/
        s.showMask = function () {
            s.mask.style.visibility = "visible";
            s.mask.style.opacity = "1";
        }
        s.hideMask = function () {
            s.mask.style.opacity = "0";
        }
        s.destroyMask = function () {
            s.parent.removeChild(s.mask);
        }
        s.showLoading = function () {
            s.loadingContainer.style.visibility = "visible";
            s.loadingContainer.style.opacity = "1";
        }
        s.hideLoading = function () {
            s.loadingContainer.style.opacity = "0";
        }
        s.destroyLoading = function () {
            s.parent.removeChild(s.loadingContainer);
        }
        s.isHid = true;
        s.hide = function () {
            s.isHid = true;
            //显示遮罩
            s.hideMask();
            //显示弹出框
            s.hideLoading();
        };
        s.show = function () {
            s.isHid = false;
            //显示遮罩
            s.showMask();
            //显示弹出框
            s.showLoading();
        };
        s.destroy = function () {
            //移动事件监听
            s.detach();
            //移除遮罩
            s.destroyMask();
            //移除弹出框
            s.destroyLoading();
            s = null;
        };
        //动态设置
        s.setOnClick = function (fn) {
            s.params.onClick = fn;
        }
        /*================
		Control
		================*/
        s.events = function (detach) {
            var touchTarget = s.loadingContainer;
            var action = detach ? "removeEventListener" : "addEventListener";
            touchTarget[action]("click", s.onClick, false);
            touchTarget[action]("webkitTransitionEnd", s.onTransitionEnd, false);
            //遮罩
            s.mask[action]("click", s.onClickMask, false);
        }
        //attach、dettach事件
        s.attach = function (event) {
            s.events();
        }
        s.detach = function (event) {
            s.events(true);
        }
        s.onClick = function (e) {
            s.target = e.target;
            if (s.params.onClick) s.params.onClick(s);
        }
        s.onClickMask = function () {
            if (s.params.isClickMaskHide) s.hide();
        }
        s.onTransitionEnd = function (e) {
            if (s.isHid) {
                s.loadingContainer.style.visibility = "hidden";
                s.mask.style.visibility = "hidden";
            }
        }
        /*================
		Init
		================*/
        s.init = function () {
            s.attach();
        }
        s.init();
    }
})(window, document, undefined);

//Timepart 时间段
(function (window, document, undefined) {
    window.Timepart = function (container, params) {
        /*================
		Model
		================*/
        var defaults = {
            toastParent: document.body,//提示框的父元素
            partAttr: "data-num",
            partActiveClass: "active",
            partDisableClass: "disable",

            msgErrorClickDisable: "不能选择禁用时间",
            msgErrorOverDisable: "不能跨选禁用段时间",
            /*
            Callbacks:
            onOneClick:function(Timepart)
			onTwoClick:function(Timepart)
			onThreeClick:function(Timepart)
			*/
        }
        params = params || {};
        for (var def in defaults) {
            if (params[def] == undefined) {
                params[def] = defaults[def];
            }
        }
        var s = this;
        //Params
        s.params = params;
        //Container
        s.container = typeof container == "string" ? document.querySelector(container) : container;
        //Toast
        s.toast = new Toast("", {
            "parent": s.params.toastParent
        });
        s.clickCount = 0;
        s.selected = [];
        s.parts = [];
        s.updateParts = function () {
            s.parts = [].slice.call(document.querySelectorAll("[" + s.params.partAttr + "]"));
        }
        s.updateParts();
        /*================
		Method
		================*/
        s.activeParts = function (num1, num2) {
            //序号排序
            if (parseInt(num1) > parseInt(s.selected[1])) {
                var temp = num1;
                num1 = num2;
                num2 = temp;
            }
            var startNum = num1;
            var endNum = num2;
            //选中
            for (var i = startNum - 1; i < endNum; i++) {
                //如果跨选禁用段时间
                if (s.parts[i].classList.contains(s.params.partDisableClass)) {
                    s.toast.setText(s.params.msgErrorOverDisable);
                    s.toast.show();
                    s.clearActiveParts();
                    return;
                }
                s.parts[i].classList.add(s.params.partActiveClass);
            }
        }
        s.clearActiveParts = function () {
            s.clickCount = 0;
            s.selected = [];
            for (var i = 0, part; part = s.parts[i++];) {
                part.classList.remove(s.params.partActiveClass);
            }
        }
        s.disableParts = function (num1, num2) {
            //序号排序
            if (parseInt(num1) > parseInt(s.selected[1])) {
                var temp = num1;
                num1 = num2;
                num2 = temp;
            }
            var startNum = num1;
            var endNum = num2;
            //禁用
            for (var i = startNum - 1; i < endNum; i++) {
                s.parts[i].classList.remove(s.params.partActiveClass);
                s.parts[i].classList.add(s.params.partDisableClass);
            }
        }
        s.clearDisableParts = function () {
            for (var i = 0, part; part = s.parts[i++];) {
                part.classList.remove(s.params.partDisableClass);
            }
        }
        /*================
		Events
		================*/
        s.events = function (detach) {
            var target = s.container;
            var action = detach ? "removeEventListener" : "addEventListener";
            target[action]("click", s.onClickContainer, false);
        }
        //attach、dettach事件
        s.attach = function (event) {
            s.events();
        }
        s.detach = function (event) {
            s.events(true);
        }
        /*================
		Events Handler
		================*/
        s.onClickContainer = function (e) {
            if (e.target.getAttribute(s.params.partAttr)) {//点击part
                s.onClickPart(e);
            }
        }
        s.onClickPart = function (e) {
            var target = e.target;
            if (target.classList.contains(s.params.partDisableClass)) {//如果点击了禁用
                if (s.params.msgErrorClickDisable) {
                    s.toast.setText(s.params.msgErrorClickDisable);
                    s.toast.show();
                }
                return;
            }

            //记录点击次数
            s.clickCount++;
            var num = target.getAttribute(s.params.partAttr);

            if (s.clickCount == 3) {//如果点击了三次
                s.clearActiveParts();
                return;
            }
            if (s.clickCount == 1) {//如果点击了一次
                s.selected[0] = num;
                target.classList.add(s.params.partActiveClass);
                console.log("点击第一次：" + s.selected);
            } else if (s.clickCount == 2) {//如果点击了两次
                s.selected[1] = num;
                s.activeParts(s.selected[0], s.selected[1]);
                console.log("点击第二次：" + s.selected);
            }
        }
        /*================
		Init
		================*/
        s.init = function () {
            s.attach();
        }
        s.init();
    }
})(window, document, undefined);

// @koala-prepend "data.lang.js"
// @koala-prepend "ajax.js"
// @koala-prepend "eventutil.js"
// @koala-prepend "page.js"
// @koala-prepend "aside.js"
// @koala-prepend "counter.js"
// @koala-prepend "animate.js"
// @koala-prepend "dateutil.js"
// @koala-prepend "db.js"
// @koala-prepend "shake.js"
// @koala-prepend "dragrefresh.js"
// @koala-prepend "emoji.js"
// @koala-prepend "form.safelvl.js"
// @koala-prepend "form.controls.js"
// @koala-prepend "form.js"
// @koala-prepend "countvalue.js"
// @koala-prepend "media.js"
// @koala-prepend "clock.js"
// @koala-prepend "richeditor.js"
// @koala-prepend "richinput.js"
// @koala-prepend "slider.js"
// @koala-prepend "type.js"
// @koala-prepend "calendar.js"
// @koala-prepend "alert.js"
// @koala-prepend "actionsheet.js"
// @koala-prepend "toast.js"
// @koala-prepend "prompt.js"
// @koala-prepend "dialog.js"
// @koala-prepend "scrollpicker.js"
// @koala-prepend "scrollpicker.date.js"
// @koala-prepend "scrollpicker.city.js"
// @koala-prepend "tree.js"
// @koala-prepend "indexbar.js"
// @koala-prepend "loading.js"
// @koala-prepend "timepart.js"