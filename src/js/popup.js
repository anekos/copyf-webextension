
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

  async function applyFormatter(formatter) {
    let content = await formatter(context);
    console.log('Copy content' + content);

    copyToClipboard(content, async () => {
      if (100 < content.length)
        content = content.slice(0, 50) + ' ... ' + content.slice(-50);
      await browser.runtime.sendMessage({command: 'notify', content: 'Copy: ' + content});
      window.close();
    });
  }


  function tryParse(format) {
    try {
      return Parse(format)
    } catch (e) {
      return false
    }
  }


  let formats = (await browser.storage.sync.get({formats: Defaults.formats})).formats;
  let instantFormat = (await browser.storage.sync.get('instantFormat')).instantFormat;

  let tabs = await browser.tabs.query({active: true, currentWindow: true});
  let tab = tabs[0];

  let context = Context(tab);


  Vue.component('format-button', {
    template: '#format-button',
    props: ['caption', 'formatter', 'available'],
    methods: {
      copy: formatter => applyFormatter(formatter),
    }
  });

  const app = new Vue({
    el: '#app',
    i18n,
    components: {
      draggable,
    },
    data: {
      available: false,
      formats: formats,
      instantFormat,
    },
    watch: {
      formats: Common.saveFormats,
    },
    methods: {
      applyInstantFormat: async function (e) {
        let format = Parse(e.target.value);
        await browser.storage.sync.set({instantFormat: format});
        return applyFormatter(format);
      },
      parse: tryParse,
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
