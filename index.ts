import { Display } from "./types.ts";

const platform = Deno.build.os;
const functions = await import(`./${platform}/index.ts`);

export class Screenshot {
  async takeScreenshot(): Promise<Uint8Array> {
    return await functions.takeScreenshot();
  }

  async listDisplays(): Promise<Display> {
    return await functions.listDisplays();
  }
}
