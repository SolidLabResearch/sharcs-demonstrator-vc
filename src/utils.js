import fs from 'fs'
import * as util from 'node:util'
import jsonld from "jsonld";
import {documentLoader as defaultDocumentLoader} from "./documentloader.js";

export function readJsonFile(path) {
  return JSON.parse(fs.readFileSync(path, 'utf-8'))
}

export function logv2(obj, tag = undefined) {
  if(!!tag)
    console.log(tag, util.inspect(obj,{showHidden: false, depth: null, colors: true}))
  else
    console.log(util.inspect(obj,{showHidden: false, depth: null, colors: true}))

}

export function redactControllerDoc(doc) {
  let redactedDoc = JSON.parse(JSON.stringify(doc));
  delete redactedDoc.verificationMethod.secretKeyMultibase
  return redactedDoc
}

/**
 * Apply JSON-LD Frame
 * @param doc
 * @param frame
 * @returns {Promise<*>}
 * @private
 */
export async function _frame(doc, frame, documentLoader = undefined)
{
  if(documentLoader===undefined)
    documentLoader = defaultDocumentLoader

  const options = {
    documentLoader
  }
  return await jsonld.frame(doc, frame, options)
}

export function clone(obj) {
  return JSON.parse(JSON.stringify(obj))
}
