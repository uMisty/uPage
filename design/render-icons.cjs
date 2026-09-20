// Requires sharp; run with node design/render-icons.cjs.
const fs = require('node:fs/promises');
const path = require('node:path');
const sharp = require('sharp');
const root = path.resolve(__dirname, '..');
async function main() {
  const logo = await fs.readFile(path.join(root, 'public/assets/upage-icon.svg'));
  const favicon = await fs.readFile(path.join(root, 'public/favicon.svg'));
  await sharp(logo).resize(512, 512).png().toFile(path.join(root, 'public/assets/upage-icon.png'));
  await sharp(logo).resize(180, 180).flatten({ background: '#2853E8' }).png().toFile(path.join(root, 'public/apple-touch-icon.png'));
  const sizes = [16, 32, 48];
  const images = await Promise.all(sizes.map(size => sharp(favicon).resize(size, size).png().toBuffer()));
  const header = Buffer.alloc(6 + 16 * sizes.length);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(sizes.length, 4);
  let offset = header.length;
  images.forEach((data, i) => {
    const entry = 6 + i * 16;
    header[entry] = sizes[i]; header[entry + 1] = sizes[i];
    header.writeUInt16LE(1, entry + 4); header.writeUInt16LE(32, entry + 6);
    header.writeUInt32LE(data.length, entry + 8); header.writeUInt32LE(offset, entry + 12);
    offset += data.length;
  });
  await fs.writeFile(path.join(root, 'public/favicon.ico'), Buffer.concat([header, ...images]));
  const embed = (data, x, y, size) => `<image x="${x}" y="${y}" width="${size}" height="${size}" href="data:image/svg+xml;base64,${data.toString('base64')}"/>`;
  const board = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="720" viewBox="0 0 1200 720">
    <rect width="1200" height="720" fill="#F5F3ED"/>
    <g font-family="Segoe UI, Arial, sans-serif" fill="#242822">
      <text x="64" y="76" font-size="20" letter-spacing="3">uPAGE / IDENTITY</text>
      <text x="64" y="139" font-size="44" font-weight="650">A page of your own.</text>
      <path d="M64 174H1136" stroke="#D5D8CF"/>
      ${embed(logo, 88, 220, 248)}
      <text x="88" y="524" font-size="22">01 / Project icon</text>
      <text x="88" y="555" font-size="16" fill="#71766C">Your page. Your work. Your everyday.</text>
      <rect x="424" y="220" width="320" height="248" rx="20" fill="#E8EAE3"/>
      ${embed(favicon, 520, 272, 128)}
      <text x="424" y="524" font-size="22">02 / Browser favicon</text>
      <text x="424" y="555" font-size="16" fill="#71766C">Simplified silhouette for small sizes.</text>
      <rect x="800" y="220" width="336" height="112" rx="16" fill="#E8EAE3"/>
      <rect x="816" y="246" width="304" height="54" rx="10" fill="#FFFFFF"/>
      ${embed(favicon, 833, 263, 20)}
      <text x="868" y="279" font-size="16">uPage · Personal space</text>
      <rect x="800" y="356" width="336" height="112" rx="16" fill="#242822"/>
      ${embed(favicon, 832, 397, 16)}${embed(favicon, 885, 389, 32)}${embed(favicon, 956, 381, 48)}
      <text x="1030" y="414" font-size="14" fill="#F5F3ED">16 / 32 / 48</text>
      <text x="800" y="524" font-size="22">03 / At home in a tab</text>
      <text x="800" y="555" font-size="16" fill="#71766C">Clear on light and dark browser chrome.</text>
      <path d="M64 614H1136" stroke="#D5D8CF"/>
      <circle cx="76" cy="662" r="12" fill="#2853E8"/><text x="100" y="668" font-size="16">#2853E8</text>
      <circle cx="252" cy="662" r="12" fill="#F5F3ED" stroke="#D5D8CF"/><text x="276" y="668" font-size="16">#F5F3ED</text>
      <text x="845" y="668" font-size="16">u + page / Original vector artwork</text>
    </g>
  </svg>`;
  await fs.writeFile(path.join(__dirname, 'upage-icons.svg'), board);
  await sharp(Buffer.from(board)).png().toFile(path.join(__dirname, 'upage-icons.png'));
}
main().catch(error => { console.error(error); process.exitCode = 1; });
