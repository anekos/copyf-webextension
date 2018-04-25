
import commandJoin from 'command-join'



function lines(it) {
  return it.join('\n');
}


export default {
  json: it => JSON.stringify(it, null, '  '),

  lines,

  shell: commandJoin,
}


