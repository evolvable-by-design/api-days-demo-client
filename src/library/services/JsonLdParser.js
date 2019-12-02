import { mapObject } from '../../app/utils/javascriptUtils'; 

export const findContext = (document) => document['@context'];

export const getAllReplacementsToDo = (context) => {
  const vocabularies = Object.entries(context)
    .filter(([key, value]) => 
      typeof value === 'string'
      && (value.startsWith('http://') || value.startsWith('https://'))
    )
    .reduce((res, [key, value]) => { 
      res[key] = value;
      return res;
    }, {})

  return vocabularies;
}

export const findSemanticWithKeyMappings = (document) => {
  const context = findContext(document);
  const vocabularies = getAllReplacementsToDo(context);

  const alias = mapObject(context, (key, value) => {
    const strToCompare = value instanceof Object ? value['@id'] : value;

    const vocabName = strToCompare.split(':')[0];
    const vocabUrl = vocabularies[vocabName];
    if (vocabUrl) {
      return [key, strToCompare.replace(`${vocabName}:`, vocabUrl)];
    } else {
      return undefined;
    }
  });

  return Object.entries({...alias, ...vocabularies})
    .reduce((acc, [key, value]) => {
      const accValue = acc[value]
      if (accValue === undefined) {
        acc[value] = key
      } else if (typeof accValue === 'string') {
        acc[value] = [accValue, key]
      } else {
        acc[value] = [...accValue, key]
      }
      return acc
    })
}

export const replaceAllVocab = (document) => {
  const replacements = getAllReplacementsToDo(findContext(document));
  return replaceInObject(Object.assign({}, document), replacements);
}

export const replaceAllId = (document) => {
  const replacements = getAllReplacementsToDo(findContext(document));
  return replaceIdInObject(Object.assign({}, document), replacements);
}

const replaceId = (value, replacements) => {
  if (value instanceof Array) {
    return replaceIdInArray(value, replacements);
  } else if (typeof value === 'string') {
    return replaceInString(value, replacements);
  } else {
    return value;
  }
}

const searchForReplacement = (value, replacements) => {
  if (value instanceof Object && !(value instanceof Array)) {
    return replaceIdInObject(value, replacements)
  } else {
    return value;
  }
}

const replaceIdInObject = (object, replacements) =>
  mapObject(object, (key, value) =>
    (key === '@id' || key === '@type' || key === '@relation')
      ? [key, replaceId(value, replacements)]
      : [key, searchForReplacement(value, replacements)]
  );

const replaceIdInArray = (array, replacements) => 
  array.map(value => replaceId(value, replacements));

const replace = (value, replacements) => {
  if (value instanceof Object) {
    return replaceInObject(value, replacements);
  } else if (value instanceof Array) {
    return replaceInArray(value, replacements);
  } else if (typeof value === 'string') {
    return replaceInString(value, replacements);
  } else {
    return value;
  }
}

const replaceInObject = (object, replacements) =>
  mapObject(object, (key, value) => [key, replace(value, replacements)])

const replaceInArray = (array, replacements) => 
  array.map(value => replace(value, replacements));

const replaceInString = (value, replacements) => {
  const eventualVocabName = value.split(':')[0];
  const eventualVocabFound = replacements[eventualVocabName];
  if (eventualVocabFound) {
    return value.replace(`${eventualVocabName}:`, eventualVocabFound);
  }

  // no replacement found
  return value;
}