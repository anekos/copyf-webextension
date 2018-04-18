
import Vue from 'vue'

import 'file-loader!bootstrap/dist/css/bootstrap.min.css'


async function main() {
  const source = {
    title: context => context.tab.title,
    url: context => context.tab.url,
  };


  function copyToClipboard(text = "") {
    const once = evt => {
      document.removeEventListener('copy', once, true);
      evt.stopImmediatePropagation();
      evt.preventDefault();
      evt.clipboardData.setData('text/plain', text);
    };

    document.addEventListener('copy', once, true);
    document.execCommand('copy');
  }


  function parse(fmt) {
    let rest = fmt;
    let entries = [];

    while (rest.length) {
      let [m, name, raw1, raw2] = rest.match(/^(?:\$\((.+?)\)|\$(\$)|([^$]+))/);

      (() => {
        if (name)
          return entries.push(source[name] || (_ => '$(' + name + ')'));
        let raw = raw1 || raw2;
        if (raw)
          return entries.push(_ => raw);
        throw 'Failed to parse: ' + m;
      })();

      rest = RegExp.rightContext;
    }

    return (context) => entries.map(entry => entry(context)).join('');
  }

  let defaultFormats = [
    {name: 'default', text: '⟦$(title)⟧ $(url)'},
    {name: 'markdown', text: '[$(title)]($(url))'},
    {name: 'markdown-image', text: '![$(title)]($(url))'},
  ];

  let formats = (await browser.storage.sync.get({formats: defaultFormats})).formats;

  console.log(JSON.stringify(formats));

  const app = new Vue({
    el: '#app',
    data: {
      formats: formats,
      format: ((formats && formats[0]) || defaultFormats[0]).text,
    },
    methods: {
      copy: async function () {
        let tabs = await browser.tabs.query({active: true, currentWindow: true});
        let tab = tabs[0];
        if (!tab)
          return;

        let formatter = parse(this.format);
        let context = {
          tab: tab,
        };
        await copyToClipboard(formatter(context));
        window.close();
      }
    }
  });

  window.copyf = app;
}


main();
