import SemanticData from './SemanticData';

import { mapObject } from "../../app/utils/javascriptUtils";

export class SemanticComponentBuilder {

  constructor(forType, component, requiredData, optionalData, toIgnoreData, errorHandler) {
    this.forType = forType;
    this.component = component;
    this.requiredData = requiredData || {};
    this.optionalData = optionalData || {}; 
    this.toIgnoreData = toIgnoreData || {};
    this.errorHandler = errorHandler;
  }

  canDisplay(type) {
    if (this.forType instanceof Array) {
      return this.forType.includes(type)
    } else {
      return this.forType === type
    }
  }

  // Returns a react component
  build() {
    return (props) => {
      if (!(props.value instanceof SemanticData)) {
        if (props.value !== undefined) {
          console.error('[ERROR] SemanticComponent.render({value}) must be passed an instance of SemanticData')
        }
        return null
      }

      props.value.resetReadCounter()
      const [requiredData, missingData] = this._getRequired(props.value)
      if (Object.keys(missingData).length !== 0) {
        return this.errorHandler({missingData})
      }

      const optionalData = this._getOptionals(props.value)

      // TODO: support ignoredData + semanticData is temporary, it should disappear
      return this.component({ ...props, ...requiredData, ...optionalData, semanticData: props.value })
    }
  }

  _getRequired(semanticData) {
    const result = mapObject(this.requiredData, (key, semanticKey) => {
      return [key, semanticData.getValue(semanticKey)]
    });
    const missingData = Object.entries(result).filter(([key, value]) => value === undefined).map(([key, value]) => key);
    return [result, missingData];
  }

  _getOptionals(semanticData) {
    return mapObject(this.optionalData, (key, semanticKey) => {
      const value = semanticData.getValue(semanticKey)
      return value ? [key, value] : [undefined, undefined]
    })
  }

}

export default SemanticComponentBuilder

