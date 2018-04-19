
import Vue from 'vue'
import JQuery from 'jquery'
import Bootstrap from 'bootstrap'
import delay  from 'timeout-as-promise'
import draggable from 'vuedraggable'
import Defaults from './defaults.js'

import 'file-loader!bootstrap/dist/css/bootstrap.min.css'


async function main() {
  let formats = (await browser.storage.sync.get({formats: Defaults.formats})).formats;


  let saveFormats = async function () {
    console.log('Save formats', JSON.parse(JSON.stringify(this.formats)));
    browser.storage.sync.set({formats: this.formats})
  };


  const app = new Vue({
    el: '#app',
    components: {
      draggable,
    },
    data: {
      formats: formats,
    },
    watch: {
      formats: saveFormats,
    },
    methods: {
      newFormat: async function () {
        this.formats.splice(0, 0, Defaults.newFormat);

        JQuery('#format-0 textarea').focus();
        await delay(1);
        JQuery('#format-0 textarea').select();
      },
      saveFormats,
      exportStorage: async function () {
        await this.saveFormats();
        let object = await browser.storage.sync.get();
        let json = JSON.stringify(object, null, '  ');
        window.open('data:application/json,' + encodeURIComponent(json));
      },
      click: function () {
        JQuery('input[type="file"]').click();
      },
      importStorage: async function (e) {
        let file = e.target.files[0];
        if (!file)
          return;
        let reader = new FileReader();
        reader.onload = async () => {
          await browser.storage.sync.clear();
          browser.storage.sync.set(JSON.parse(reader.result));
          document.location.href = document.location.href;
        };
        reader.readAsText(file);
      }
    },
  });

  window.jq = JQuery;
  window.copyf = app;
}


main();
