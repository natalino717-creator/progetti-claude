# Toronero Messina, nuovo sito

Riprogettazione completa del sito di **Toronero**, ristorante steak house, pizzeria e sala eventi in via La Farina 185 a Messina.

Sito statico in HTML, CSS e JavaScript, senza dipendenze né build. Si pubblica caricando la cartella su qualsiasi hosting, compresi Netlify, Vercel e GitHub Pages.

```
index.html            pagina unica, con dati strutturati schema.org/Restaurant per Google
assets/css/style.css  stile (palette e font definiti in :root)
assets/js/main.js     interazioni
```

Per vederlo in locale basta aprire `index.html` nel browser.

## Cosa contiene

- **Hero** con il motto del locale, "Amiamo cucinare", braci animate e stato *aperto/chiuso* calcolato in tempo reale sull'ora di Messina.
- **"Scegli dal toro"**: schema dei tagli bovini interattivo, che spiega ogni taglio e il piatto che ne nasce.
- **Menu** a schede: brace, forno a legna, cucina.
- **Le sale**: pianta schematica in cui ogni punto è un posto a sedere (pizzeria 120, sala eventi 120, ristorante 70, sala fumatori 50).
- **Eventi**: compleanni, lauree, anniversari, cene aziendali.
- **Rais**: la sede di pesce in via Consolare Pompea.
- **Prenotazioni**: modulo che prepara un'email a `toronerosrl@gmail.com`, più telefono e link a UnTavolo.
- Accessibile (navigazione da tastiera, `prefers-reduced-motion`), responsive e ottimizzato per la SEO locale.

## Da verificare con il locale prima della messa online

Il sito originale non era raggiungibile dall'ambiente di sviluppo. I contenuti vengono da schede pubbliche: TripAdvisor, Facebook, Pagine Gialle, UnTavolo, Sluurpy, Restaurant Guru, MeStyle e Celiachia Italia.

- **Prezzi**: confermati solo quelli presenti nelle schede. Controfiletto di scottona €24; pizze Margherita €8, Caprese €10, Capricciosa €12, Pistacia €14, Bronte €15, Burrata €15. Gli altri piatti mostrano "in sala" o "al peso".
- **Ingredienti delle pizze** speciali (Pistacia, Bronte, Burrata): le descrizioni sono generiche.
- **Orari**: tutti i giorni 12:00–15:00 e 19:30–23:30, come da schede pubbliche.
- **Rais**: indirizzo via Consolare Pompea 59/83 e 50 coperti. Va verificato se è aperto tutto l'anno o solo in estate.
- **Foto**: il sito è costruito su tipografia e illustrazione. Con le foto reali di sale e piatti si può aggiungere una galleria.
- **Logo**: il marchio con le corna è provvisorio e va sostituito con quello ufficiale.
- **Instagram, WhatsApp, P.IVA**: da aggiungere se disponibili.
