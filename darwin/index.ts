import { ensureDir } from "https://deno.land/std@0.114.0/fs/ensure_dir.ts";
import { Display } from "./types.ts";

export async function takeScreenshot(): Promise<Uint8Array> {
  const uuid = crypto.randomUUID();
  const path = `./.screenshots`;
  const file = `./${path}/${uuid}.png`;

  await ensureDir(".screenshots");

  const process = Deno.run({
    cmd: ["screencapture", file],
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
