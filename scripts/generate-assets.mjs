import { mkdir, writeFile } from 'node:fs/promises';
const directory = new URL('../public/images/', import.meta.url);
await mkdir(directory, { recursive: true });
// Illustrations vectorielles originales. Aucun appel réseau ni photo tierce.
const defs = `<defs>
  <linearGradient id="rose" x1="0" y1="0" x2="1" y2=".2"><stop stop-color="#b87c7b"/><stop offset=".28" stop-color="#e3b5b0"/><stop offset=".68" stop-color="#dba8a4"/><stop offset="1" stop-color="#b77b7b"/></linearGradient>
  <linearGradient id="cream"><stop stop-color="#bfb09b"/><stop offset=".25" stop-color="#f5ead4"/><stop offset=".7" stop-color="#eee0c5"/><stop offset="1" stop-color="#cabc9f"/></linearGradient>
  <linearGradient id="clay"><stop stop-color="#b97561"/><stop offset=".3" stop-color="#dda38b"/><stop offset=".7" stop-color="#c98b73"/><stop offset="1" stop-color="#a36552"/></linearGradient>
  <linearGradient id="sage"><stop stop-color="#8f9b82"/><stop offset=".3" stop-color="#c3cbb3"/><stop offset=".8" stop-color="#b1bca2"/><stop offset="1" stop-color="#8e9d81"/></linearGradient>
  <linearGradient id="fabric" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#d6b59c"/><stop offset=".5" stop-color="#f0d6b7"/><stop offset="1" stop-color="#c4a486"/></linearGradient>
  <linearGradient id="pouch" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#d3a09d"/><stop offset=".4" stop-color="#e9beba"/><stop offset="1" stop-color="#b67c7c"/></linearGradient>
  <radialGradient id="bg" cx=".35" cy=".2" r=".85"><stop stop-color="#f7ede1"/><stop offset="1" stop-color="#e7d7c7"/></radialGradient>
  <linearGradient id="ground" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#ebc6b7"/><stop offset="1" stop-color="#d4aa99"/></linearGradient>
  <filter id="blur"><feGaussianBlur stdDeviation="13"/></filter>
  <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency=".72" numOctaves="3" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncA type="linear" slope=".035"/></feComponentTransfer><feBlend in="SourceGraphic" mode="multiply"/></filter>
  <clipPath id="pouch-clip"><rect x="166" y="330" width="390" height="252" rx="60"/></clipPath>
</defs>`;
const shadow = (cx, cy, rx, ry) =>
  `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="#6b4934" opacity=".16" filter="url(#blur)"/>`;
const objects = {
  'gourde-nomade': `${shadow(374, 678, 135, 21)}<g transform="rotate(-8 360 440)">
  <path d="M310 190c0-69 100-69 100 0" fill="none" stroke="#c6938b" stroke-width="14"/>
  <rect x="297" y="170" width="126" height="71" rx="21" fill="#c29b89"/><ellipse cx="360" cy="174" rx="58" ry="10" fill="#d3b49e"/>
  <rect x="267" y="222" width="186" height="423" rx="62" fill="url(#rose)"/><ellipse cx="360" cy="632" rx="62" ry="10" fill="#ac7171" opacity=".35"/>
  <path d="M290 300v260" stroke="#f2cdc4" stroke-width="6" opacity=".35" stroke-linecap="round"/>
  <path d="M280 247c40 12 110 12 160 0" fill="none" stroke="#ecc2ba" opacity=".6"/>
  <text x="360" y="458" fill="#896058" text-anchor="middle" font-family="Georgia,serif" font-size="28" letter-spacing="-2">rosée</text><path d="M347 482h26" stroke="#96665e" opacity=".55"/>
</g>`,
  'vase-aube': `${shadow(364, 685, 155, 22)}<g>
  <path d="m350 305-28-151m36 151 35-186m-40 165-86-113m94 82 85-92" stroke="#9f8666" stroke-width="3" fill="none"/>
  <g fill="#c7ad7d"><ellipse cx="318" cy="138" rx="9" ry="47" transform="rotate(-13 318 138)"/><ellipse cx="397" cy="108" rx="10" ry="52" transform="rotate(13 397 108)"/><ellipse cx="257" cy="160" rx="11" ry="43" transform="rotate(-40 257 160)"/><ellipse cx="450" cy="149" rx="11" ry="39" transform="rotate(45 450 149)"/></g>
  <path d="M302 292h116l-8 96c5 25 102 53 110 127 10 84-58 164-160 164S189 612 201 525c10-79 111-110 110-142Z" fill="url(#clay)"/>
  <ellipse cx="360" cy="293" rx="58" ry="13" fill="#ad715b"/><ellipse cx="360" cy="292" rx="45" ry="7" fill="#775442"/>
  <ellipse cx="360" cy="527" rx="69" ry="82" fill="#e9d3bd"/><path d="M365 449c-54 4-70 133-8 158" fill="none" stroke="#915742" stroke-width="11" opacity=".48"/>
  <path d="M228 509c-25 75 31 134 85 144" stroke="#edb69a" fill="none" stroke-width="4" opacity=".4"/>
</g>`,
  'mug-nuage': `${shadow(360, 640, 184, 23)}<g transform="rotate(-7 360 470)">
  <path d="M492 376c139-48 177 162 56 185l-54-3 2-48 45 5c56-14 49-111-6-99l-42 11Z" fill="url(#cream)" stroke="#c0ad8d" stroke-width="3"/>
  <path d="M198 353c-5 87 4 190 44 243 25 34 188 44 227 7 49-48 50-161 46-250Z" fill="url(#cream)"/>
  <ellipse cx="357" cy="354" rx="160" ry="53" fill="#eddfc4" stroke="#cbbc9e" stroke-width="3"/>
  <ellipse cx="357" cy="356" rx="138" ry="37" fill="#aa8866"/><ellipse cx="357" cy="363" rx="127" ry="28" fill="#79563e"/>
  <path d="M220 414c-2 80 20 150 45 165" fill="none" stroke="#fff6e5" stroke-width="10" opacity=".4"/>
  <path d="M261 465c17-20 23 3 10 11-14 7-14 16 0 27" fill="none" stroke="#bb8d7f" stroke-width="3"/>
  <text x="358" y="521" fill="#ac8b74" text-anchor="middle" font-family="Georgia,serif" font-size="24" letter-spacing="-1">a little pause.</text>
</g>`,
  'pochette-douce': `${shadow(363, 643, 209, 26)}<g transform="rotate(-10 360 460)">
  <path d="M163 373c-13-65 38-94 100-95l203-3c53 4 89 40 90 82v181c0 53-33 78-91 77H245c-63 0-93-34-84-84Z" fill="url(#pouch)"/>
  <path d="m180 336 338-4" fill="none" stroke="#a06f66" stroke-width="8"/>
  <path d="m185 331 325-3" fill="none" stroke="#dfbc9e" stroke-width="4" stroke-dasharray="2 3"/>
  <g clip-path="url(#pouch-clip)" stroke="#b98583" stroke-width="2" opacity=".7">${Array.from({ length: 11 }, (_, i) => `<path d="m${70 + i * 60} 325 300 310m${70 + i * 60} 325-300 310"/>`).join('')}</g>
  <path d="M519 334v35" stroke="#a27d59" stroke-width="4"/><rect x="512" y="362" width="13" height="29" rx="4" fill="#d4b082"/>
  <rect x="316" y="440" width="90" height="51" rx="2" fill="#f4dfc9" transform="rotate(1 360 465)"/><text x="360" y="472" text-anchor="middle" fill="#9d7663" font-family="Georgia,serif" font-size="22">rosée</text>
</g>`,
  'lampe-luna': `${shadow(360, 698, 177, 24)}
  <path d="M320 394h80l-14 214c2 23 51 26 72 51 16 19-36 30-99 30s-111-13-93-32c22-24 71-26 71-50Z" fill="url(#rose)"/>
  <path d="M157 393C161 150 558 150 563 393Z" fill="url(#rose)"/>
  <ellipse cx="360" cy="393" rx="203" ry="29" fill="#b67e7b"/><ellipse cx="360" cy="394" rx="175" ry="16" fill="#f1ceb4"/>
  <path d="M195 338c20-73 91-113 155-123" stroke="#f7d4cb" stroke-width="9" fill="none" opacity=".3" stroke-linecap="round"/>
  <ellipse cx="360" cy="670" rx="89" ry="10" fill="#d5a5a0"/>
  <circle cx="360" cy="642" r="6" fill="#a3716b"/>
  <path d="M443 677c70 5 95 46 161 36" stroke="#a3927f" fill="none" stroke-width="4"/>`,
  'tote-escale': `${shadow(367, 715, 198, 22)}<g transform="rotate(5 360 450)">
  <path d="M254 327V223c0-135 212-135 212 0v104" fill="none" stroke="#c9af8c" stroke-width="28"/>
  <path d="M254 327V223c0-135 212-135 212 0v104" fill="none" stroke="#f1dcbb" stroke-width="20"/>
  <path d="m166 305 389-3-20 354c-3 34-20 46-62 46H239c-39 0-59-16-62-48Z" fill="url(#fabric)"/>
  <path d="m185 319 9 321c0 31 15 44 42 46m298-367-16 320c-2 29-13 41-41 46" fill="none" stroke="#ae9375" stroke-dasharray="3 5" stroke-width="2"/>
  <path d="M252 308v86m210-86v86" stroke="#d3b594" stroke-width="22"/>
  <text x="358" y="514" text-anchor="middle" font-family="Georgia,serif" font-size="48" letter-spacing="-3" fill="#a17766">rosée</text><text x="358" y="546" text-anchor="middle" font-family="Arial,sans-serif" font-size="9" letter-spacing="3" fill="#a17766">LES BELLES IDÉES DU QUOTIDIEN</text>
</g>`,
  'lunchbox-pause': `${shadow(363, 654, 211, 24)}<g transform="rotate(-7 360 460)">
  <rect x="156" y="358" width="410" height="264" rx="47" fill="url(#sage)"/>
  <path d="M160 484c124 23 274 23 402 0" fill="none" stroke="#87917d" stroke-width="4"/>
  <ellipse cx="362" cy="359" rx="205" ry="47" fill="#b9c2aa"/>
  <path d="M162 359c-9-42 43-64 112-64h177c76 0 124 26 114 64l-11 16c-122 40-269 34-384-2Z" fill="#d5c0a0"/>
  <path d="M190 341c105 35 224 42 341 2" stroke="#e5d3b5" fill="none" stroke-width="6"/>
  <path d="m323 304-6 291c1 27 69 31 74 3l8-294" stroke="#e6d4b5" fill="none" stroke-width="37"/>
  <path d="M321 308c27 8 52 8 79 0" stroke="#baa482" fill="none" stroke-width="4"/>
  <text x="453" y="555" fill="#7d8b71" text-anchor="middle" font-family="Georgia,serif" font-size="20">pause.</text>
</g>`,
  'organiseur-accord': `${shadow(363, 657, 227, 22)}<g transform="rotate(-5 360 500)">
  <path d="M134 371 350 308 588 377 582 579 357 652 140 583Z" fill="url(#fabric)"/>
  <path d="M134 371 350 308 588 377 357 448Z" fill="#ecd7b8"/>
  <path d="M158 376 348 324 562 379 358 430Z" fill="#ad9170"/>
  <path d="m348 324 2 105m-98-79 212 61" stroke="#e0c5a1" stroke-width="11"/>
  <path d="m134 371 223 77 231-71m-231 71v204" stroke="#c2a280" fill="none" stroke-width="4"/>
  <path d="m219 365 4-121 13-3 2 120m51-16-5-123 15-1 7 120" stroke="#a38265" fill="none" stroke-width="12"/>
  <path d="m452 371 15-95 22 3-14 98" stroke="#bf9f8b" fill="none" stroke-width="22"/>
</g>`,
};
const backgrounds = {
  'gourde-nomade': '#e9e0d4',
  'vase-aube': '#e4d7c8',
  'mug-nuage': '#e4e5da',
  'pochette-douce': '#eedbd7',
  'lampe-luna': '#e9dbce',
  'tote-escale': '#e4dfd3',
  'lunchbox-pause': '#e6e8dc',
  'organiseur-accord': '#e5d9cb',
};
const shell = (width, height, inner) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${defs}${inner}</svg>`;
for (const [id, object] of Object.entries(objects)) {
  for (let view = 1; view <= 3; view++) {
    const transform =
      view === 2
        ? 'translate(35 20) rotate(9 360 420) scale(.94)'
        : view === 3
          ? 'translate(-80 -105) scale(1.22)'
          : '';
    const scene = `<rect width="720" height="840" fill="${backgrounds[id]}"/><path d="M0 0h720v410C550 360 320 180 0 290Z" fill="#fff" opacity=".12"/><path d="M0 714c190-41 420 38 720-3v129H0Z" fill="#a48064" opacity=".045"/><g transform="${transform}">${object}</g><rect width="720" height="840" fill="transparent" filter="url(#grain)"/>`;
    await writeFile(
      new URL(`${id}-${view}.svg`, directory),
      shell(720, 840, scene),
    );
  }
}
const hero = `<rect width="900" height="900" fill="url(#bg)"/><path d="M120 650V270C120-10 780-10 780 270v380Z" fill="#dfc9b4" opacity=".22"/><path d="M0 619c260-20 566-22 900 6v275H0Z" fill="url(#ground)"/><path d="m0 48 900 415v114L0 161Z" fill="#fff8e5" opacity=".22"/><ellipse cx="597" cy="654" rx="211" ry="41" fill="#ae8470" opacity=".2"/><path d="M426 549h358v124H426Z" fill="#d0b394"/><ellipse cx="605" cy="549" rx="179" ry="33" fill="#e8d5bd"/><ellipse cx="605" cy="671" rx="179" ry="30" fill="#c7a98b"/><g transform="translate(290 -42) scale(.83)">${objects['vase-aube']}</g><g transform="translate(-64 164) scale(.86)">${objects['gourde-nomade']}</g><g transform="translate(262 402) scale(.65)">${objects['mug-nuage']}</g><path d="M-10 801c216-75 619 4 920-61v160H0Z" fill="#efd7c1" opacity=".45"/><rect width="900" height="900" fill="transparent" filter="url(#grain)"/>`;
await writeFile(new URL('hero.svg', directory), shell(900, 900, hero));
const ritual = `<rect width="800" height="640" fill="#d5aaa0"/><path d="M0 0h800v150L0 410Z" fill="#f1d9c0" opacity=".48"/><g transform="translate(28 244) rotate(-13 230 180)"><path d="M30 45h331v217H30Z" fill="#a77e65"/><path d="M43 32h331v217H43Z" fill="#e5d5b5"/><path d="M63 44h303v195H63Z" fill="#f0e5cb"/><text x="215" y="124" text-anchor="middle" font-family="Georgia,serif" font-size="22" fill="#a27f65">the art of</text><text x="215" y="157" text-anchor="middle" font-family="Georgia,serif" font-style="italic" font-size="30" fill="#a27f65">slow mornings</text><path d="M147 185h145" stroke="#b69475"/></g><g transform="translate(234 45) scale(.72)">${objects['mug-nuage']}</g><path d="M633 540c-33-104 15-164 40-214" stroke="#8c8a67" stroke-width="4" fill="none"/><path d="M653 420c-77 8-55-44-38-57 39 6 47 34 38 57Z" fill="#9b9b77"/><g transform="translate(674 318)" fill="#eed4c5"><ellipse ry="32" rx="16"/><ellipse ry="32" rx="16" transform="rotate(72)"/><ellipse ry="32" rx="16" transform="rotate(144)"/><ellipse ry="32" rx="16" transform="rotate(216)"/><ellipse ry="32" rx="16" transform="rotate(288)"/><circle r="10" fill="#bb9570"/></g><rect width="800" height="640" fill="transparent" filter="url(#grain)"/>`;
await writeFile(new URL('ritual.svg', directory), shell(800, 640, ritual));
await writeFile(
  new URL('../public/favicon.svg', import.meta.url),
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="16" fill="#f2dfdb"/><text x="30" y="48" text-anchor="middle" font-family="Georgia,serif" font-size="57" fill="#925066">r</text><text x="49" y="24" text-anchor="middle" font-size="19" fill="#925066">✳</text></svg>`,
);
console.log('26 illustrations SVG et favicon créés.');
