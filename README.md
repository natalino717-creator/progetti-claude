# Toronero Messina, nuovo sito

Riprogettazione del sito di **Toronero**, ristorante bisteccheria in via La Farina 185 a Messina, costruita sui contenuti del sito attuale [toroneromessina.it](https://toroneromessina.it/).

Sito statico in HTML, CSS e JavaScript, senza dipendenze né build. Si pubblica caricando la cartella su qualsiasi hosting, oppure come pagina in WordPress.

```
index.html               pagina unica, con dati strutturati schema.org/Restaurant
assets/css/style.css     stile (palette e font definiti in :root)
assets/js/menu-data.js   il menu completo: si aggiornano qui piatti e prezzi
assets/js/main.js        interazioni
assets/img/              logo e foto delle sale
```

## Da dove vengono i contenuti

Il sito attuale è una pagina WordPress che mostra soltanto un tour virtuale 3DVista a schermo intero. Tutto il materiale è stato estratto da lì e dai link che contiene:

| Contenuto | Fonte |
| --- | --- |
| Logo "Toronero, amiamo cucinare" | immagini del tour (versione chiara ricolorata per lo sfondo scuro) |
| Testo "Chi siamo" | scheda "Chi siamo" del tour |
| Menu completo, circa 90 voci con prezzi | menu digitale collegato dal tour, [sulmenu.it/toronero/CARTATORO](https://sulmenu.it/toronero/CARTATORO) |
| Foto delle sale | panoramiche a 360° del tour, ritagliate in foto normali |
| Nomi delle sale (ristorante, fumatori, lounge, eventi) | pulsanti del tour |
| Telefoni, email, Instagram, Facebook, Google Maps | link del tour e del menu |
| Tour a 360° | resta disponibile: si apre dal sito in una finestra |

Corretti nel menu alcuni refusi evidenti dell'originale (es. "elamelle" → "e lamelle", "Tatufo" → "Tartufo", "teriyaky" → "teriyaki").

## Cosa c'è di nuovo

- **Hero** con la foto vera del banco carni e della brace, e stato aperto/chiuso in tempo reale.
- **"Leggi i cartellini"**: le carni della cella (Chianina, Rubia Gallega, Wagyu…) come i cartellini appesi in frollatura. Toccandone uno, il menu si filtra sui piatti con quella carne.
- **Menu completo** con ricerca ("pistacchio", "tartare", "Wagyu") e categorie che seguono lo scorrimento.
- **Le sale** con gallerie di foto, **Toronero Events** con la nuova sala eventi.
- **Prenotazione** via WhatsApp o email, con il messaggio già compilato.
- Pulsante "Prenota" sempre visibile su telefono, accessibile da tastiera, SEO locale.

## Da verificare con il locale prima della messa online

- **WhatsApp**: il modulo invia al numero 366 710 2667 (trovato nel menu digitale). Va confermato che quel numero usa WhatsApp.
- **Orari** (tutti i giorni 12–15 e 19:30–23:30) e **posti a sedere** (ristorante 70, fumatori 50, eventi 120): non sono sul sito attuale, vengono da schede pubbliche come TripAdvisor e Pagine Gialle.
- **Sala lounge**: le foto usate sono una stima di quale ambiente del tour sia la lounge.
- **Pizzeria**: il logo del tour dice "Ristorante Bisteccheria Pizzeria", ma il menu digitale non contiene pizze. Se c'è una carta delle pizze, si aggiunge in `menu-data.js`.
- **Foto**: vengono da una fotocamera a 360°, quindi la qualità è discreta. Con foto professionali di piatti e sale il sito fa un ulteriore salto.
