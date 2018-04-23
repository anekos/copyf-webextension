
import Vue from 'vue'
import Bootstrap from 'bootstrap'
import DateFormat from 'dateformat'
import draggable from 'vuedraggable'

import Common from './common.js'
import Context from './context.js'
import Defaults from './defaults.js'
import Parse from './parse.js'
import Polyfill from './polyfill.js'

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


  let formats = (await browser.storage.sync.get({formats: Defaults.formats})).formats;


  const app = new Vue({
    el: '#app',
    components: {
      draggable,
    },
    data: {
      formats: formats,
    },
    watch: {
      formats: Common.saveFormats,
    },
    methods: {
      copy: async function (fmt) {
        let tabs = await browser.tabs.query({active: true, currentWindow: true});
        let tab = tabs[0];
        if (!tab)
          return;

        let formatter = Parse(fmt.text);
        let content = await formatter(Context(tab));
        console.log('Copy content' + content);

        copyToClipboard(content, async () => {
          if (100 < content.length)
            content = content.slice(0, 50) + ' ... ' + content.slice(-50);
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
