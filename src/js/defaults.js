
export default {
  formats: [
    {name: 'default', text: '⟦$(title)⟧ $(url)'},
    {name: 'markdown', text: '[$(title)]($(url))'},
    {name: 'markdown-image', text: '![$(title)]($(url))'},
  ],
  newFormat: {
    name: '', text: '$(title) - $(url)'
  }
};
