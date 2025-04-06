function attrString (attribs) {
  const buff = []
  for (const key in attribs) {
    buff.push(key + '="' + attribs[key] + '"')
  }
  if (!buff.length) {
    return ''
  }
  return ' ' + buff.join(' ')
}

function stringify (buff, doc) {
  switch (doc.type) {
    case 'text':
      return buff + doc.data
    case 'tag':
    {
      const voidElement = doc.voidElement || (!doc.children.length && doc.attribs['xml:space'] !== 'preserve')
      buff +=
        '<' +
        doc.name +
        (doc.attribs ? attrString(doc.attribs) : '') +
        (voidElement ? '/>' : '>')
      if (voidElement) {
        return buff
      }
      return buff + doc.children.reduce(stringify, '') + '</' + doc.name + '>'
    }
    case 'comment':
      buff += '<!--' + doc.comment + '-->'
      return buff
  }
}

export function stringifyDoc (doc) {
  return doc.reduce(function (token, rootEl) {
    return token + stringify('', rootEl)
  }, '')
}
