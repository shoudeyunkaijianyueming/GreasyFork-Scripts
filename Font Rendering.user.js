/* jshint esversion: 6 */
// ==UserScript==
// @name            字体渲染（自用脚本）
// @namespace       https://openuserjs.org/users/t3xtf0rm4tgmail.com
// @version         2021.04.01.3
// @icon            https://github.githubassets.com/favicons/favicon.svg
// @description     让每个页面的字体变得有质感，默认使用苹方字体，附加字体描边、字体阴影、字体平滑等效果，自用脚本不处理外部需求。
// @supportURL      https://github.com/F9y4ng/GreasyFork-Scripts/issues
// @author          F9y4ng
// @include         *
// @grant           none
// @compatible      Chrome 兼容TamperMonkey, ViolentMonkey
// @compatible      Firefox 兼容Greasemonkey, TamperMonkey, ViolentMonkey
// @compatible      Opera 兼容TamperMonkey, ViolentMonkey
// @compatible      Safari 兼容Tampermonkey • Safari
// @license         GPL-3.0-only
// @create          2020-11-24
// @copyright       2020-2021, F9y4ng
// @run-at          document-start
// ==/UserScript==

(function () {
  'use strict';

  /* 你可以自定义以下内容 */

  let stroke_r = 0.04; // 字体描边：建议控制在0~1.0之间，关闭描边为0，默认0.04
  let shadow_r = 2; // 字体阴影：建议控制在1~8之间，关闭阴影为0，默认2
  const smooth_i = 1; // 字体平滑，默认开启，关闭为0
  const shadow_c = `rgba(136,136,136,0.4)`; // 阴影颜色：建议#888，或 rgba(136,136,136,0.8) 或依喜好修改，currentcolor为原字体颜色（慎用）
  const cssfun = `:not(input):not(textarea):not(i):not(em):not(pre):not(code):not([class*="icon"]):not(.fa):not([class*="logo"]):not(.mi):not([class*="code"]):not(.fb-close)`; // 可以继续添加需要屏蔽的标签或classname

  /* 请勿修改以下代码 */

  const isdebug = false;
  const debug = isdebug ? console.log.bind(console) : () => {};
  let shadow = '';
  shadow_r = parseFloat(shadow_r);
  if (!isNaN(shadow_r) && shadow_r !== 0) {
    shadow = `text-shadow:
    -1px 1px ${shadow_r}px ${shadow_c},
    1px 1px ${shadow_r}px ${shadow_c},
    1px -1px ${shadow_r}px ${shadow_c},
    -1px -1px ${shadow_r}px ${shadow_c} !important;`;
  }
  let stroke = '';
  stroke_r = parseFloat(stroke_r);
  if (!isNaN(stroke_r) && stroke_r > 0 && stroke_r <= 1.0) {
    stroke = `
    text-stroke: ${stroke_r}px !important;
    -webkit-text-stroke: ${stroke_r}px !important;
    -webkit-text-stroke: initial;
    text-fill-color: currentcolor;
    -webkit-text-fill-color: currentcolor;
    `;
  }
  let smoothing = '';
  if (smooth_i) {
    smoothing = `
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    `;
  }
  const tshadow = `
  ${cssfun} {
      ${shadow}
      font-family: "PingFang SC","Microsoft YaHei",sans-serif!important;
      ${stroke}
      ${smoothing}
  }`;

  addStyle(tshadow, 'Font_Rendering', 'head');

  if (location.host.includes('.baidu.com')) {
    const callback = () => {
      if (document.querySelector('.Font_Rendering')) {
        debug('//-> found with selector ["Font_Rendering"]');
      } else {
        addStyle(tshadow, 'Font_Rendering', 'head');
      }
    };
    const opts = { childList: true, subtree: true };
    new MutationObserver(callback).observe(document, opts);
  }

  function addStyle(css, className, addToTarget, isReload, initType) {
    RAFInterval(
      () => {
        let addTo = document.querySelector(addToTarget);
        if (typeof addToTarget === 'undefined') {
          addTo = document.head || document.body || document.documentElement || document;
        }
        isReload = isReload || false;
        initType = initType || 'text/css';
        if (typeof addToTarget === 'undefined' || (typeof addToTarget !== 'undefined' && document.querySelector(addToTarget) !== null)) {
          if (isReload === true) {
            safeRemove(`.${className}`);
          } else if (isReload === false && document.querySelector(`.${className}`) !== null) {
            return true;
          }
          const cssNode = document.createElement('style');
          if (className !== null) {
            cssNode.className = className;
          }
          cssNode.setAttribute('type', initType);
          cssNode.innerHTML = css;
          try {
            addTo.appendChild(cssNode);
          } catch (e) {
            debug(`//-> ${e.name}`);
          }
          return true;
        }
      },
      200,
      true
    );
  }

  function safeRemove(Css) {
    safeFunction(() => {
      const removeNodes = document.querySelectorAll(Css);
      for (let i = 0; i < removeNodes.length; i++) {
        removeNodes[i].remove();
      }
    });
  }

  function safeFunction(func) {
    try {
      func();
    } catch (e) {
      debug(`//-> ${e.name}`);
    }
  }

  function RAFInterval(callback, period, runNow) {
    const needCount = (period / 1000) * 60;
    let times = 0;
    if (runNow === true) {
      const shouldFinish = callback();
      if (shouldFinish) {
        return;
      }
    }

    function step() {
      if (times < needCount) {
        times++;
        requestAnimationFrame(step);
      } else {
        const shouldFinish = callback() || false;
        if (!shouldFinish) {
          times = 0;
          requestAnimationFrame(step);
        } else {
          return;
        }
      }
    }
    requestAnimationFrame(step);
  }
})();
