import fs from 'fs'
import * as util from 'node:util'
import jsonld from "jsonld";
import {documentLoader as defaultDocumentLoader, documentLoaderAll} from "./documentloader.js";
import walkJson from "json-tree-walker";
import {CONTEXTS_ATHUMI} from "./resources/contexts/index.js";
import {CONTEXTS, DATA_INTEGRITY_CONTEXT} from "./resources/contexts/contexts.js";

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

export function matchVariableAssignments(frame) {
  const nestedStrings = []
  const matchedVariableAssignments = []
  walkJson.json(frame, {
    // 'undefined' handles nulls
    undefined: (key, value, parentType, metaData) => nullKeys.push([key, metaData]),
    object: (key, _value, _parentType, metaData) => walkJson.concatPathMeta(key, metaData),
    array: (key, _value, _parentType, metaData) => walkJson.concatPathMeta(key, metaData),
    number: (key, value, parentType, metaData) => walkJson.concatPathMeta(key, metaData),
    boolean: (key, value, parentType, metaData) => walkJson.concatPathMeta(key, metaData),
    string: (key, value, _parentType, metaData) => {
      const finalPath = walkJson.concatPathMeta(key, metaData);
      nestedStrings.push(`${finalPath}: ${value}`);
      // Detect variable assignments (_:X, _:Y, and _:Z)
      if (value.toString().match('_:[X|Y|Z]'))
        matchedVariableAssignments.push({
          key,
          value,
          parentPath: metaData,
          finalPath,
          pathElements: extractElementsBetweenBrackets(finalPath)
        })
    }
  })
  return matchedVariableAssignments
}

/**
 * Expands the given document and subsequently compacts it using the Athumi & Data Integrity contexts.
 * @param doc
 * @returns {Promise<*>}
 */
export async function athumiSpecificPreprocessing(doc) {
  const options = {documentLoader: documentLoaderAll}
  // 1. Expand (expands every shorthand by its IRI)
  doc = await jsonld.expand(doc, options)
  // 2. Compact using Athumi & Data Integrity contexts
  const _ctx = {
    ...CONTEXTS_ATHUMI["https://www.w3.org/2018/credentials/v1"]['@context'],
    ...CONTEXTS[DATA_INTEGRITY_CONTEXT]['@context']
  }
  doc = await jsonld.compact(doc, _ctx, options)
  return doc;
}
