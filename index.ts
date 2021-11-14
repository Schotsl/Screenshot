import { Display, Options } from "./types.ts";

const platform = Deno.build.os;
const functions = await import(`./${platform}/index.ts`);

export class Screenshot {
  public displays: Display[] = [];

  async takeScreenshot(options: Options = {}): Promise<Uint8Array> {
    if (this.displays.length === 0) await this.listDisplays();

    let index = null;

    if (options.display) {
      for (let i = 0; i < this.displays.length; i++) {
        if (this.displays[i].name === options.display) {
          index = i;
        }
      }

      if (index === null) {
        throw Error(`There is no ${options.display} display`);
      }
    }

    return await functions.takeScreenshot(
      options.filename,
      options.format,
      index,
    );
  }

  async listDisplays(): Promise<Array<Display>> {
    this.displays = await functions.listDisplays();
    return this.displays;
  }
}
