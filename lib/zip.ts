import { deflateRawSync } from "node:zlib";

/**
 * Minimal ZIP writer (Phase 4 — template export).
 *
 * Writing the ~90 lines of container format here rather than adding a
 * dependency: the archives this produces are a handful of small text files, so
 * none of what a full library offers (streaming, ZIP64, encryption, reading)
 * is needed, and a build-output format is a poor place to inherit a supply
 * chain from.
 *
 * Produces a standard deflate-compressed archive readable by every unzip tool.
 * Deliberately unsupported: entries over 4 GB (ZIP64), directory entries
 * (implied by paths), and anything non-UTF-8.
 */

export interface ZipEntry {
  /** Path inside the archive, `/`-separated, no leading slash. */
  path: string;
  content: string | Buffer;
  /** Defaults to now. Fixing it makes builds byte-for-byte reproducible. */
  date?: Date;
}

/** CRC-32 (IEEE 802.3), the checksum the ZIP central directory stores. */
const CRC_TABLE = (() => {
  const table = new Int32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[i] = c;
  }
  return table;
})();

function crc32(buf: Buffer): number {
  let c = -1;
  for (let i = 0; i < buf.length; i++) {
    c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ -1) >>> 0;
}

/** MS-DOS packed date/time — the only timestamp the base format carries. */
function dosDateTime(date: Date): { time: number; date: number } {
  const year = Math.max(date.getFullYear(), 1980);
  return {
    time:
      (date.getHours() << 11) |
      (date.getMinutes() << 5) |
      (Math.floor(date.getSeconds() / 2) & 0x1f),
    date: ((year - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate(),
  };
}

/** Strip anything that would let an entry escape the extraction directory. */
function safePath(path: string): string {
  return path
    .replace(/\\/g, "/")
    .split("/")
    .filter((seg) => seg && seg !== "." && seg !== "..")
    .join("/");
}

export function createZip(entries: ZipEntry[]): Buffer {
  const localParts: Buffer[] = [];
  const centralParts: Buffer[] = [];
  let offset = 0;
  let count = 0;

  for (const entry of entries) {
    const path = safePath(entry.path);
    if (!path) continue;

    const nameBuf = Buffer.from(path, "utf8");
    const raw = Buffer.isBuffer(entry.content)
      ? entry.content
      : Buffer.from(entry.content, "utf8");

    const compressed = deflateRawSync(raw);
    // Deflate can inflate tiny or already-random payloads; store those as-is.
    const useDeflate = compressed.length < raw.length;
    const body = useDeflate ? compressed : raw;
    const method = useDeflate ? 8 : 0;

    const crc = crc32(raw);
    const { time, date } = dosDateTime(entry.date ?? new Date());

    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0); // local file header signature
    local.writeUInt16LE(20, 4); // version needed (2.0 — deflate)
    local.writeUInt16LE(0x0800, 6); // flags: bit 11, UTF-8 names
    local.writeUInt16LE(method, 8);
    local.writeUInt16LE(time, 10);
    local.writeUInt16LE(date, 12);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(body.length, 18);
    local.writeUInt32LE(raw.length, 22);
    local.writeUInt16LE(nameBuf.length, 26);
    local.writeUInt16LE(0, 28); // extra field length

    localParts.push(local, nameBuf, body);

    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0); // central directory signature
    central.writeUInt16LE(0x031e, 4); // version made by (UNIX, 3.0)
    central.writeUInt16LE(20, 6);
    central.writeUInt16LE(0x0800, 8);
    central.writeUInt16LE(method, 10);
    central.writeUInt16LE(time, 12);
    central.writeUInt16LE(date, 14);
    central.writeUInt32LE(crc, 16);
    central.writeUInt32LE(body.length, 20);
    central.writeUInt32LE(raw.length, 24);
    central.writeUInt16LE(nameBuf.length, 28);
    central.writeUInt16LE(0, 30); // extra
    central.writeUInt16LE(0, 32); // comment
    central.writeUInt16LE(0, 34); // disk number
    central.writeUInt16LE(0, 36); // internal attributes
    central.writeUInt32LE(0o644 << 16, 38); // external attributes (UNIX mode)
    central.writeUInt32LE(offset, 42); // offset of the local header

    centralParts.push(central, nameBuf);

    offset += local.length + nameBuf.length + body.length;
    count++;
  }

  const centralDirectory = Buffer.concat(centralParts);

  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0); // end of central directory signature
  end.writeUInt16LE(0, 4); // this disk
  end.writeUInt16LE(0, 6); // disk with central directory
  end.writeUInt16LE(count, 8);
  end.writeUInt16LE(count, 10);
  end.writeUInt32LE(centralDirectory.length, 12);
  end.writeUInt32LE(offset, 16);
  end.writeUInt16LE(0, 20); // comment length

  return Buffer.concat([...localParts, centralDirectory, end]);
}
