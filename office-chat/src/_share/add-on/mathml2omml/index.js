import { parse, stringifyDoc } from './parse-stringify'
import { walker } from './walker.js'

class MML2OMML {
  constructor (mmlString) {
    this.inString = mmlString
    this.inXML = parse(mmlString)
    this.outXML = false
    this.outString = false
  }

  run () {
    const outXML = {}
    walker({ children: this.inXML, type: 'root' }, outXML)
    this.outXML = outXML
  }

  getResult () {
    this.outString = stringifyDoc([this.outXML])
    return this.outString
  }
}

export const mml2omml = function (mmlString) {
  const converter = new MML2OMML(mmlString)
  converter.run()
  return converter.getResult()
}
