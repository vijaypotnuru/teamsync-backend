export const getEnv = (key: string, defaultValue: string = ""): string => {
  const value = process.env[key];
  // console.log("key", key, "value", value, "defaultValue", defaultValue);
  if (value === undefined) {
    if (defaultValue) {
      return defaultValue;
    }
    throw new Error(`Enviroment variable ${key} is not set`);
  }
  return value;
};
