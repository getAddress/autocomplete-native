import { Options } from "./Options";
declare function autocomplete(id: string, api_key: string, options?: Partial<Options>): HTMLInputElement | undefined;
declare function destroy(): void;
export { autocomplete, destroy, Options };
