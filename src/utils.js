import fs from 'fs'
import * as util from 'node:util'
import jsonld from "jsonld";
import {documentLoader as defaultDocumentLoader} from "./documentloader.js";

export function readJsonFile(path) {
  return JSON.parse(fs.readFileSync(path, 'utf-8'))
}

export function writeJsonFile(path, data) {
  fs.writeFileSync(path, JSON.stringify(data, null, 2))
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

export function getNestedAttribute(obj, path) {
  return path.reduce((acc, key) => (acc && acc[key] !== undefined) ? acc[key] : undefined, obj);
}

export function setNestedAttribute(obj, path, value) {
  path.reduce((acc, key, idx) => {
    if (idx === path.length - 1) {
      acc[key] = value;
    } else {
      if (!acc[key]) acc[key] = {};  // Create the object if it doesn't exist
      return acc[key];
    }
  }, obj);
}

export function extractElementsBetweenBrackets(input) {
  // Use regular expression to find all matches within square brackets
  const regex = /\['([^']*)'\]|\[(\d+)\]/g;
  let matches;
  const results = [];

  // Iterate over all matches
  while ((matches = regex.exec(input)) !== null) {
    // Add either the quoted string or the number (whichever is matched)
    results.push(matches[1] || matches[2]);
  }

  return results;
}
