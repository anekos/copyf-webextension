
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

  async function applyFormatter(formatter, forAllTabs) {
    let content = await formatter(await getContext(forAllTabs));
    console.log('Copy content', content);

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
      console.log(e);
      return false
    }
  }


  async function getContext(forAllTabs) {
    let conditions = forAllTabs ? {currentWindow: true} : {active: true, currentWindow: true};
    let tabs = await browser.tabs.query(conditions);
    return Context(tabs);
  }


  let formats = (await browser.storage.sync.get({formats: Defaults.formats})).formats;
  let instantFormat = (await browser.storage.sync.get('instantFormat')).instantFormat;

  let activeTab = (await browser.tabs.query({active: true, currentWindow: true}))[0];

  let forAllTabs = (await browser.storage.sync.get('forAllTabs')).forAllTabs || false;


  Vue.component('format-button', {
    template: '#format-button',
    props: ['caption', 'formatter', 'available', 'forAllTabs'],
    methods: {
      copy: function (formatter) {
        applyFormatter(formatter, this.forAllTabs);
      },
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
      forAllTabs,
      formats: formats,
      instantFormat,
    },
    watch: {
      formats: Common.saveFormats,
      forAllTabs: (newValue, oldValue) => browser.storage.sync.set({forAllTabs: newValue}),
    },
    methods: {
      applyInstantFormat: async function (e) {
        let format = e.target.value;
        let formatter = Parse(format);
        await browser.storage.sync.set({instantFormat: format});
        return applyFormatter(formatter, this.forAllTabs);
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

  browser.tabs.sendMessage(activeTab.id, {command: 'ping'}).then(onCheckAvailability);
  chrome.runtime.onMessage.addListener(onCheckAvailability);

  window.copyf = app;
}


main();
