declare namespace cache {
  export function init(): void;

  export function get(key: string): any;

  export function save(key: string, value: any): void;

  export function remove(key: string): void;

  export function cacheRedirectUrl(req: any, res: any, next: (...args: any) => void): void;
}
