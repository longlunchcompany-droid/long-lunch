# Long Lunch – nettsiden

Åpne `index.html` i nettleseren for å se siden. Alt ligger i denne mappen, og siden fungerer uten noe ekstra oppsett.

## Filer

- `index.html` – forsiden: hero, Collection No. 1, «The Small Print», kolleksjoner, om oss, nyhetsbrev
- `product.html` – produktsiden. Den viser riktig plakat ut fra lenken: `product.html?p=stay`, `?p=oyster`, `?p=ace`, `?p=cheers`, `?p=table`, `?p=swim`
- `css/style.css` – farger, skrifter, layout og «rommene» plakatene henger i. Fargene står øverst.
- `js/site.js` – priser, frakt, hvilket rom hver plakat vises i, rekkefølgen i rutenettet og handlekurven
- `js/posters.js` – de seks plakatene: tittel, tekst og selve kunstverket (SVG)

## Endre priser

Øverst i `js/site.js`:

- `print` = pris uten ramme, `framed` = pris med ramme (kr inkl. mva)
- `SHIPPING = 79` og `FREE_SHIPPING_FROM = 999`

## Rommene plakatene vises i

I `js/site.js` under `STAGING` bestemmer du hvordan hver plakat vises:

- `type`: `table` (kafébord ovenfra), `window` (vindu­slys), `tape` (teipet på veggen), `ledge` (bildehylle), `clip` (klype på flisvegg), `floor` (lent mot veggen), `sun` (skarp ettermiddagssol)
- `wall`: veggfargen
- `frame`: `none`, `black` eller `oak`

`LAYOUT` styrer plassen i rutenettet på forsiden og de små håndskrevne notatene.

## Ny kolleksjon

Når Collection No. 2 er klar: legg plakatene inn i `js/posters.js`, gi dem et rom i `STAGING`, og bytt ut «In the studio»-kortet i `index.html` med et ekte kolleksjonskort. Hver kolleksjon kan ha sin egen fargepalett (se `palette` og `coll-dots` i `index.html`).

## Dine detaljer

Øverst i `js/site.js` finner du `SITE`. E-posten (longlunchcompany@gmail.com) er fylt inn. Legg til lenker til Instagram og Pinterest der når du har dem. Det som står tomt, vises ikke på siden, så det finnes ingen døde lenker. E-posten står også i footeren («Email us»), på hjelpesiden og i meldingen på handlekurven. Bytter du adresse, søk etter longlunchcompany@gmail.com i alle filene.

## Sider

- `index.html` – forsiden
- `product.html` – én side for alle plakatene (`product.html?p=stay` osv.)
- `cart.html` – handlekurven. Den husker varene i den besøkendes nettleser.
- `help.html` – frakt, retur og kontakt

## Dette må fylles inn

Søk etter klammeparenteser i filene:

- `[YOUR NAME]` på forsiden
- `[PRINT PARTNER]`, `[PAPER SPEC]`, `[SHIPPING TIMES]`, `[RETURN POLICY]`

## Dette er ikke koblet til ennå

- **Betaling:** handlekurven fungerer, men «Go to checkout» kan ikke ta imot penger ennå. Til det trenger du en butikkplattform, for eksempel Shopify med Gelato.
- **Søk:** siden har ingen søkefunksjon. Med seks plakater trengs det ikke ennå; butikkplattformen har søk når det blir aktuelt.
- **Nyhetsbrev:** skjemaet viser en takkemelding, men lagrer ikke e-posten. Koble det til Shopify Email, Klaviyo, Mailchimp eller lignende.

## Bevegelse og tilgjengelighet

Plakatene glir inn når du blar, og med mus kan du holde over en plakat for å se den forstørret. Har besøkende slått av animasjoner i systemet sitt, står alt stille.

## Publisere på GitHub Pages

1. Lag et nytt repository på github.com.
2. Last opp alt som ligger i denne mappen (index.html skal ligge øverst, ikke inni en undermappe).
3. Gå til Settings → Pages, velg «Deploy from a branch», branch `main` og mappe `/ (root)`, og trykk Save.
4. Etter et minutt eller to ligger siden på `https://brukernavn.github.io/repo-navn/`.

Alt fungerer der: plakatene, størrelse og ramme, prisene, filtrene og handlekurven. Det eneste som ikke virker er selve betalingen, fordi GitHub Pages bare viser filer og ikke kan ta imot penger.
