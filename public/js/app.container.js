class DI {
  static #instances = {};

  static getInstance(instanceName) {
    return this.#instances[instanceName];
  }

  static registerInstance(instanceName, instance) {
    return (this.#instances[instanceName] = instance);
  }
}
export default DI;
