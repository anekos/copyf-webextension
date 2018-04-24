
import Bootstrap from 'bootstrap'
import Vue from 'vue'
import VueI18n from 'vue-i18n'
import draggable from 'vuedraggable'

import './polyfill'
import Common from './common'
import Context from './context'
import Defaults from './defaults'
import Parse from './parse'
import i18n from './i18n'

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

  function onCheckAvailability(message) {
    if (message === 'pong')
      app.available = true;
  }


  let formats = (await browser.storage.sync.get({formats: Defaults.formats})).formats;


  let tabs = await browser.tabs.query({active: true, currentWindow: true});
  let tab = tabs[0];

  let context = Context(tab);

  const app = new Vue({
    el: '#app',
    i18n,
    components: {
      draggable,
    },
    data: {
      available: false,
      formats: formats,
    },
    watch: {
      formats: Common.saveFormats,
    },
    methods: {
      parse: Parse,
      copy: async fmt => {
        let formatter = Parse(fmt.text);
        let content = await formatter(context);
        console.log('Copy content' + content);

        copyToClipboard(content, async () => {
          if (100 < content.length)
            content = content.slice(0, 50) + ' ... ' + content.slice(-50);
          await browser.runtime.sendMessage({command: 'notify', content: 'Copy: ' + content});
          window.close();
        });
      },
      showManager: () => {
        chrome.tabs.create({
          url: chrome.extension.getURL('html/manager.html'),
          active: true,
        });
        window.close();
      },
    },
  });

  browser.tabs.sendMessage(context.tab.id, {command: 'ping'}).then(onCheckAvailability);
  chrome.runtime.onMessage.addListener(onCheckAvailability);

  window.copyf = app;
}


main();
