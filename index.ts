import { Display, Options } from "./types.ts";

const platform = Deno.build.os;
const functions = await import(`./${platform}/index.ts`);

export class Screenshot {
  public displays: Display[] = [];

  async getScreenshot(options: Options = {}): Promise<Uint8Array> {
    // Default to 0 if no display name has been provided
    const index = options.display ? await this.getIndex(options.display) : 0;

    return await functions.takeScreenshot(
      options.filename,
      options.format,
      index,
    );
  }

  async getDisplays(): Promise<Array<Display>> {
    // Store the displays in memory for display index lookup
    this.displays = await functions.listDisplays();

    return this.displays;
  }

  private async getIndex(display: string): Promise<number> {
    // Load the displays if they haven't been loaded before
    if (this.displays.length === 0) {
      await this.getDisplays();
    }

    // Find the display by its name and return the index
    for (let i = 0; i < this.displays.length; i++) {
      if (this.displays[i].name === display) {
        return i;
      }
    }

    // Throw a error if no display is found
    throw Error(`There is no ${display} display`);
  }
}
