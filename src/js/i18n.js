
import Vue from 'vue'
import VueI18n from 'vue-i18n'

import Messages from './messages'



Vue.use(VueI18n);

let locale = chrome.i18n.getUILanguage().replace(/-.*/g, '');


export default new VueI18n({locale, messages: Messages});
