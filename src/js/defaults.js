
import uuidv1 from 'uuid/v1'


export default {
  formats: [
    {name: 'default', text: '⟦$(title)⟧ $(url)'},
    {name: 'links', text: '$(property|shrink href a)'},
    {name: 'quote', text: '"$(selected)" ⟦$(title)⟧ $(url)'},
    {name: 'markdown', text: '[$(title)]($(url))'},
    {name: 'markdown-image', text: '![$(title)]($(url))'},
  ],
  get newFormat() {
    return {
      name: '',
      text: '$(title) - $(url)',
      meta: {
        uuid: uuidv1()
      },
    }
  }
};
