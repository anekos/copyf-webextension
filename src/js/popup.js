
import Vue from 'vue'
import Bootstrap from 'bootstrap'
import DateFormat from 'dateformat'
import pmap from 'p-map'

import Defaults from './defaults.js'
import Source from './source.js'
import Context from './context.js'

import 'file-loader!bootstrap/dist/css/bootstrap.min.css'


async function main() {
  function copyToClipboard(text, complete) {
    const once = evt => {
      document.removeEventListener('copy', once, true);
      evt.stopImmediatePropagation();
      evt.preventDefault();
      evt.clipboardData.setData('text/plain', text);
      complete();
    };

    document.addEventListener('copy', once, true);
    document.execCommand('copy');
  }


  function parse(fmt) {
    let rest = fmt;
    let entries = [];

    while (rest.length) {
      let [m, name1, args1, name2, args2, raw1, raw2] = rest.match(/^(?:\$\{(\S+?)(?:\s+(.+))?\}|\$\((\S+?)(?:\s+(.+))?\)|\$(\$)|([^$]+))/);

      let name = name1 || name2;

      (() => {
        if (name) {
          let args = args1 || args2;
          return entries.push(Source(args)[name] || (_ => '$(' + name + ')'));
        }
        let raw = raw1 || raw2;
        if (raw)
          return entries.push(_ => raw);
        throw 'Failed to parse: ' + m;
      })();

      rest = RegExp.rightContext;
    }

    return context => pmap(entries, (entry) => entry(context), {concurrency: 2}).then(it => it.join(''));
  }


  let formats = (await browser.storage.sync.get({formats: Defaults.formats})).formats;


  const app = new Vue({
    el: '#app',
    data: {
      formats: formats,
    },
    methods: {
      copy: async function (fmt) {
        let tabs = await browser.tabs.query({active: true, currentWindow: true});
        let tab = tabs[0];
        if (!tab)
          return;

        let formatter = parse(fmt.text);
        let content = await formatter(Context(tab));

        copyToClipboard(content, async () => {
          await browser.runtime.sendMessage({command: 'notify', content: 'Copy: ' + content});
          window.close();
        });
      },
      showManager: function () {
        chrome.tabs.create({
          url: chrome.extension.getURL('html/manager.html'),
          active: true,
        });
        window.close();
      },
    },
  });

  window.copyf = app;
}


main();
