import { addScriptlevel } from './ooml/index.js'
import * as mathmlHandlers from './mathml/index.js'

export function walker (element, targetParent, previousSibling = false, nextSibling = false, ancestors = []) {
  if (!previousSibling && ['m:deg', 'm:den', 'm:e', 'm:fName', 'm:lim', 'm:num', 'm:sub', 'm:sup'].includes(targetParent.name)) {
    // We are walking through the first element within one of the
    // elements where an <m:argPr> might occur. The <m:argPr> can specify
    // the scriptlevel, but it only makes sense if there is some content.
    // The fact that we are here means that there is at least one content item.
    // So we will check whether to add the m:rPr.
    // For possible parent types, see
    // https://docs.microsoft.com/en-us/dotnet/api/documentformat.openxml.math.argumentproperties?view=openxml-2.8.1#remarks
    addScriptlevel(targetParent, ancestors)
  }
  let targetElement
  const nameOrType = element.name || element.type
  if (mathmlHandlers[nameOrType]) {
    targetElement = mathmlHandlers[nameOrType](
      element,
      targetParent,
      previousSibling,
      nextSibling,
      ancestors
    )
  } else {
    if (nameOrType && nameOrType !== 'root') {
      console.warn(`Type not supported: ${nameOrType}`)
    }

    targetElement = targetParent
  }

  if (!targetElement) {
    // Target element hasn't been assigned, so don't handle children.
    return
  }
  if (element.children?.length) {
    ancestors = [...ancestors]
    ancestors.unshift(element)
    for (let i = 0; i < element.children.length; i++) {
      walker(
        element.children[i],
        targetElement,
        element.children[i - 1],
        element.children[i + 1],
        ancestors
      )
    }
  }
}
