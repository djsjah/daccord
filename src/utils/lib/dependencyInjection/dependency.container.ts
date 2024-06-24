import DependencyContainerType from './dependency.type';

class DependencyContainer {
  private depContainer: DependencyContainerType = {};

  public registerInstance(key: string, instance: any): void {
    this.depContainer[key] = instance;
  }

  public getInstance<T>(key: string): T {
    return this.depContainer[key] as T;
  }
}
const dependencyContainer = new DependencyContainer();
export default dependencyContainer;
