
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

  let entries = parts.slice(1).map(it => {
    if (!Modifier[it])
      throw 'Invalid modifier: ' + it;
    return Modifier[it];
  });

  return [
    parts[0],
    value => entries.reduce((acc, it) => it(acc), value)
  ];
}


function failSafe(ifFailed, f) {
  return (...args) => f.apply(null, args).then(it => it, _ => ifFailed);
}


export default fmt => {
  let rest = fmt;
  let entries = [];
  let useContent = false;

  while (rest && rest.length) {
    let matched = rest.match(/^(?:\$\{(\S+?)(?:\s+(.+))?\}|\$\((\S+?)(?:\s+(.+))?\)|(\$\$)|([^$]+|\$$))/);
    if (!matched)
        return entries.push(_ => rest);

    let [whole, name1, args1, name2, args2, dollar, raw] = matched;
    rest = RegExp.rightContext;

    let name = name1 || name2;

    (() => {
      if (name) {
        let [_name, modifier, finisher] = parseName(name);
        let args = args1 || args2;
        let source = Source(args, _name);
        if (!source)
          throw 'Invalid source: ' + _name;
        useContent = useContent || source.useContent;
        return entries.push(
          source ? ((context, tab) => source(context, tab).then(modifier).then(finisher))
                 : (_ => Promise.resolve('$(' + name + ')'))
        );
      }
      if (dollar) {
        return entries.push(_ => Promise.resolve('$'));
      }
      if (raw)
        return entries.push(_ => Promise.resolve(raw));

      throw 'Failed to parse: ' + whole;
    })();
  }

  let result = async context => {
    return pmap(
      context.tabs,
      tab => pmap(
        entries,
        failSafe('', entry => entry(context, tab)),
        {concurrency: 10}).then(it => it.join('')),
      {concurrency: 10}
    ).then(it => it.join('\n'));
  }
  result.useContent = useContent;

  return result;
}
