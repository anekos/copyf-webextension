
import pmap from 'p-map'

import Finisher from './finisher'
import Modifier from './modifier'
import Source from './source'



function parseName(n) {
  let [nameAndMods, finisherName] = n.split('#', 2);
  let [name, mods] = parseModifier(nameAndMods);
  if (finisherName && !Finisher[finisherName])
    throw 'Invalid finisher: ' + finisherName;
  return [name, mods, Finisher[finisherName] || Finisher.lines];
}


function parseModifier(name) {
  let parts = name.split('|');

  if (parts.length <= 1)
    return [name, it => it];

  let entries = parts.slice(1).map(it => Modifier[it]);
  let invalids = entries.filter(it => !it);
  if (0 < invalids.length)
    throw 'Invalid modifier name: ' + invalids.join('|');

  return [
    parts[0],
    value => entries.reduce((acc, it) => it(acc), value)
  ];
}



export default fmt => {
  let rest = fmt;
  let entries = [];
  let useContent = false;

  while (rest.length) {
    let [m, name1, args1, name2, args2, raw1, raw2] = rest.match(/^(?:\$\{(\S+?)(?:\s+(.+))?\}|\$\((\S+?)(?:\s+(.+))?\)|\$(\$)|([^$]+))/);
    rest = RegExp.rightContext;

    let name = name1 || name2;

    (() => {
      if (name) {
        let [_name, modifier, finisher] = parseName(name);
        let args = args1 || args2;
        let source = Source(args)[_name];
        useContent = useContent || source.useContent;
        return entries.push(source ? (it => source(it).then(modifier).then(finisher)) : (_ => '$(' + name + ')'));
      }
      let raw = raw1 || raw2;
      if (raw)
        return entries.push(_ => raw);
      throw 'Failed to parse: ' + m;
    })();
  }

  let result = context => pmap(entries, entry => entry(context), {concurrency: 10}).then(it => it.join(''));
  result.useContent = useContent;

  return result;
}
