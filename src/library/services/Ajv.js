import Ajv from 'ajv';

const ajv = new Ajv({
  unknownFormats: 'ignore',
  formats: {
    int8: (v) => {
      const value = parseInt(v, 10);
      return !isNaN(value) && value >= -128 && value <= 127;
    },
    int16: (v) => {
      const value = parseInt(v, 10);
      return !isNaN(value) && value >= -32768 && value <= 32767;
    }
  }
});

export default ajv;