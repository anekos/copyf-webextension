
import Bootstrap from 'bootstrap'
import JQuery from 'jquery'
import Vue from 'vue'
import dateFormat from 'dateformat'
import delay  from 'timeout-as-promise'
import draggable from 'vuedraggable'

import Common from './common'
import Defaults from './defaults'
import './polyfill'

import 'file-loader!bootstrap/dist/css/bootstrap.min.css'


async function main() {
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
      clickImport : () => JQuery('input[type="file"]').click(),
      exportStorage: async function (e) {
        await this.saveFormats();

        let object = await browser.storage.sync.get();
        let json = JSON.stringify(object, null, '  ');

        let a = e.target.querySelector('a');
        a.setAttribute('download', 'copyf.' + dateFormat('yyyymmdd-HHMMss') + '.json');
        a.href = URL.createObjectURL(new Blob([json], {type: 'application/json'}));

        a.click();
      },
      importStorage: async (e) => {
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
      },
      newFormat: async function () {
        this.formats.splice(0, 0, Defaults.newFormat);

        JQuery('#format-0 textarea').focus();
        await delay(1);
        JQuery('#format-0 textarea').select();
      },
      saveFormats: Common.saveFormats,
    },
  });


  window.jq = JQuery;
  window.copyf = app;

  let storageSize = await browser.storage.sync.getBytesInUse();
  console.info('Stroage bytes in use', storageSize);
}


main();
