
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

  async function applyFormatter(formatter, forAllTabs, isTarget) {
    let content = await formatter(await getContext(forAllTabs, isTarget));
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


  async function getContext(forAllTabs, isTarget) {
    let conditions = forAllTabs ? {currentWindow: true} : {active: true, currentWindow: true};
    let tabs = await browser.tabs.query(conditions);
    return Context(tabs.filter(it => isTarget(it.url)));
  }


  let instantFormat = (await browser.storage.sync.get('instantFormat')).instantFormat;
  let forAllTabs = (await browser.storage.sync.get('forAllTabs')).forAllTabs || false;


  let formats = (await browser.storage.sync.get({formats: Defaults.formats})).formats;
  formats.forEach(it => {
    let formatter = tryParse(it.text);
    let isTarget = Common.isTarget(it.targetUrls);

    it.meta = {
      error: !formatter,
      formatter,
      isTarget,
      isValid: function (data) {
        if (!formatter)
          return false;

        if (data.forAllTabs) {
          return data.allTabs && data.allTabs.some(it => isTarget(it.url));
        } else {
          if (data.activeTab && !isTarget(data.activeTab.url))
            return false;
          if (formatter.useContent && !data.available)
            return false;
          return true;
        }
      },
    };
  });


  Vue.component('format-button', {
    template: '#format-button',
    props: ['format'],
    methods: {
      copy: function (fmt) {
        applyFormatter(fmt.meta.formatter, app.forAllTabs, fmt.meta.isTarget);
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
      activeTab: undefined,
      allTabs: undefined,
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
        return applyFormatter(formatter, this.forAllTabs, _ => true);
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


  browser.tabs.query({active: true, currentWindow: true}).then(tabs => {
    let activeTab = tabs[0];
    app.activeTab = activeTab;
    browser.tabs.sendMessage(activeTab.id, {command: 'ping'}).then(onCheckAvailability);
  });

  browser.tabs.query({currentWindow: true}).then(tabs => {
    app.allTabs = tabs;
  });


  chrome.runtime.onMessage.addListener(onCheckAvailability);


  window.copyf = app;
}


main();
