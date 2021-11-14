import { ensureDir } from "https://deno.land/std@0.114.0/fs/ensure_dir.ts";
import { Display } from "../types.ts";
import {
  dirname,
  fromFileUrl,
} from "https://deno.land/std@0.114.0/path/mod.ts";

export async function takeScreenshot(
  filename?: string,
  format?: string,
  index = 0,
): Promise<Uint8Array | string> {
  const file = fromFileUrl(import.meta.url);
  const base = dirname(file);

  const uuid = crypto.randomUUID();
  const path = `${base}/.screenshots`;

  const _index = (index + 1).toString();
  const _format = typeof format !== "undefined" ? format : "png";
  const _filename = typeof filename !== "undefined"
    ? filename
    : `${path}/${uuid}.png`;

  if (typeof filename === "undefined") await ensureDir(path);

  const process = Deno.run({
    cmd: ["screencapture", "-t", _format, "-D", _index, _filename],
    stdout: "piped",
    stderr: "piped",
  });

  await process.output();

  if (typeof filename === "undefined") {
    const uint8Array = await Deno.readFile(_filename);
    await Deno.remove(_filename);
    await Deno.remove(path);
    return uint8Array;
  } else {
    return filename;
  }
}

export async function listDisplays(): Promise<Display[]> {
  const process = Deno.run({
    cmd: ["system_profiler", "SPDisplaysDataType"],
    stdout: "piped",
  });

  const output = await process.output();
  const decoder = new TextDecoder();
  const decoded = decoder.decode(output);

  const displays: Display[] = [];

  const trimmed = decoded.trim();
  const section = trimmed.match(/(?<= \ Displays:\n)[\S\s]+/g)![0];
  const lines = section.split("\n");

  let index = -1;

  lines.forEach((line) => {
    const name = line.match(/\S.+(?=:)/g)![0];

    if (line.substr(0, 10) === "          ") {
      const value = line.match(/(?<=: ).*/g)![0];
      const display = displays[index];

      if (name == "Mirror") display.mirror = value === "Yes";
      if (name == "Online") display.online = value === "Yes";
      if (name == "Main Display") display.primary = value === "Yes";
    } else {
      index += 1;
      displays.push({ name, mirror: false, online: false, primary: false });
    }
  });

  return displays;
}
