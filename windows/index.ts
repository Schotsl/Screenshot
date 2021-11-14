import { ensureDir } from "https://cdn.deno.land/std/versions/0.114.0/raw/fs/ensure_dir.ts";
import { Display } from "../types.ts";

import dirname from "https://x.nest.land/denoname@0.8.2/mod/dirname.ts";

export async function takeScreenshot(): Promise<Uint8Array> {
  const uuid = crypto.randomUUID();
  const path = `./.screenshots`;
  const file = `./${path}/${uuid}.png`;

  await ensureDir(".screenshots");

  const process = Deno.run({
    cmd: ["./windows/capture_1.3.2.bat", file],
    stdout: "piped",
    stderr: "piped",
  });

  await process.output();
  const uint8Array = await Deno.readFile(file);

  await Deno.remove(file);
  await Deno.remove(path);

  return uint8Array;
}

export async function listDisplays(): Promise<Display[]> {
  const directory = dirname(import.meta);
  const process = Deno.run({
    cmd: [`${directory}capture_1.3.2.bat`, "/list"],
    stdout: "piped",
  });

  const output = await process.output();
  const decoder = new TextDecoder();
  const decoded = decoder.decode(output);

  const displays: Display[] = [];

  const trimmed = decoded.trim();
  const lines = trimmed.split("\n");

  lines.shift();

  lines.forEach((line) => {
    const values = line.split(";");

    const name = values[0].substr(4, values[0].length);
    const mirror = false;
    const online = true;
    const primary = parseInt(values[1]) >= 0 &&
      parseInt(values[2]) >= 0 &&
      parseInt(values[3]) >= 0 &&
      parseInt(values[4]) >= 0;

    displays.push({
      name,
      mirror,
      online,
      primary,
    });
  });

  return displays;
}
