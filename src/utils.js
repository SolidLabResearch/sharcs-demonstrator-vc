import fs from 'fs'
import * as util from 'node:util'
import jsonld from "jsonld";
import {documentLoader} from "./documentloader.js";

export function readJsonFile(path) {
  return JSON.parse(fs.readFileSync(path, 'utf-8'))
}

export function logv2(x) {
  console.log(util.inspect(x,{showHidden: false, depth: null, colors: true}))
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
export async function _frame(doc, frame) {
  const options = {
    documentLoader
  }
  return await jsonld.frame(doc, frame, options)
}
