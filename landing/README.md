# Landing oldal – GitHub Pages publikálás

Ez a mappa egy statikus, magyar nyelvű landing oldalt tartalmaz (`index.html`, `styles.css`, `script.js`).

## Mailchimp beállítás
1. Mailchimp > Audience > Signup forms > Embedded forms.
2. Másold ki az űrlap `action` URL-jét (https://...list-manage.com/subscribe/post?u=...&id=...).
3. Az `index.html`-ben cseréld a `action="https://YOUR_DC.list-manage.com/subscribe/post?u=YOUR_U&id=YOUR_ID"` részt a sajátodra.
4. A honeypot mező nevét is cseréld (`b_YOUR_U_YOUR_ID`).

## GitHub Pages publikálás (repo gyökérből)
1. Hozz létre egy új GitHub repót.
2. A `landing` mappa tartalmát tedd a repo gyökerébe (vagy a `docs/` mappába – lásd lejjebb).
3. Commit + push.
4. GitHub > Settings > Pages: Source: `Deploy from a branch`, Branch: `main`, Folder: `/ (root)`.
5. Várj 1-2 percet, majd nyisd meg az oldalt: `https://<felhasznalonev>.github.io/<repo>/`.

## Alternatíva: `docs/` mappából
- Ha a repó más fájlokat is tartalmaz, tedd a landinget `docs/` alá és Pages-ben a `docs` mappát válaszd.

## .nojekyll
- A gyökérben lévő `.nojekyll` fájl tiltja a Jekyll feldolgozást. Statikus fájloknál hasznos.

## OG kép
- Az `index.html` `og:image` meta `./og-image.png`-ra mutat. Helyezz ide egy 1200×630-as képet ugyanilyen néven, vagy töröld ezt a sort, ha nem használod.

## Lokális előnézet
```bash
python3 -m http.server 8080 --directory .
```
Majd: `http://localhost:8080`.