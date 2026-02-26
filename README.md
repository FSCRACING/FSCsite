# Regole per la Repository del Sito del Team Formula SAE di Catania
1. Finalità della Repository
Obiettivo: Contenere il codice sorgente e la documentazione del sito web del Team, facilitando lo sviluppo collaborativo e mantenendo una struttura chiara e aggiornata.

2. Branching Model
Branch Principale (main): Contiene sempre la versione stabile e pronta per la produzione del sito.

Branch di Sviluppo (develop): Utilizzato per integrare nuove funzionalità e correzioni; successivamente, le modifiche vengono unite nel branch main dopo revisione e testing.

Branch per Feature/Fix: Creare branch dedicati per ogni nuova funzionalità o correzione, utilizzando convenzioni di naming come:

feature/nome-funzionalità

fix/nome-bug

3. Commit e Messaggi
Commit frequenti e chiari: Ogni commit deve essere mirato e includere un messaggio descrittivo che spieghi il cambiamento, ad esempio:

"Aggiunta sezione sponsor"

"Correzione bug menu mobile"

Standard di messaggistica: Seguire un formato coerente per facilitare la lettura della cronologia delle modifiche.

4. Pull Requests e Revisione del Codice
Creazione di Pull Request: Prima di fondere modifiche nei branch develop o main, aprire una pull request.

Revisione: Ogni pull request deve essere revisionata e approvata da almeno un altro membro del team.

Descrizioni dettagliate: Includere nelle pull request una descrizione completa dei cambiamenti, eventuali screenshot o demo, e riferimenti alle issue correlate.

5. Stile del Codice e Best Practices
Coerenza: Seguire le linee guida di stile per i linguaggi utilizzati (HTML, CSS, JavaScript, ecc.).

Linter e Formattazione: Utilizzare strumenti di linting (ad es. ESLint, stylelint) per mantenere un codice uniforme e leggibile.

Struttura organizzata: Mantenere una struttura di cartelle logica che faciliti la navigazione e la manutenzione del progetto.

6. Documentazione
README.md: Aggiornare il file README con istruzioni chiare per l’installazione, l’uso e le modalità di contribuzione.

Commenti: Utilizzare commenti esplicativi nel codice per migliorare la comprensione e la manutenibilità.

Aggiornamenti: Ogni modifica rilevante deve essere accompagnata dall’aggiornamento della documentazione.

7. Gestione dei Problemi (Issues)
Segnalazione Bug e Richieste: Utilizzare la sezione Issues per segnalare errori, richiedere nuove funzionalità o proporre miglioramenti.

Dettaglio e Riproducibilità: Fornire descrizioni dettagliate e, se possibile, i passi per riprodurre eventuali problemi.

Etichettatura: Utilizzare le etichette (labels) per classificare e organizzare le issue in modo efficiente.

8. Sicurezza e Dati Sensibili
Nessun Dato Sensibile: Non inserire credenziali, chiavi API o altri dati riservati nel repository.

.gitignore: Utilizzare il file .gitignore per escludere file e cartelle che contengono informazioni sensibili o non necessarie alla distribuzione.

9. Licenza e Copyright
Licenza: Specificare la licenza del progetto nel file LICENSE e assicurarsi che il codice e i contenuti siano conformi alle normative vigenti.

Attribuzione: Garantire il corretto riconoscimento del lavoro svolto da ciascun collaboratore.

10. Aggiornamenti e Manutenzione
Merge e Rilasci: Effettuare regolarmente merge dal branch develop al branch main dopo approfonditi test e revisioni.

Monitoraggio: Tenere sotto controllo pull request e issues per una rapida risoluzione dei problemi e mantenere la repository aggiornata.

11. Comunicazione e Collaborazione
Canali di Comunicazione: Utilizzare strumenti interni (es. Slack, Discord, email) per discutere idee, dubbi e suggerimenti relativi al progetto.

Collaborazione: Promuovere un ambiente collaborativo, rispettoso e proattivo, in cui ogni contributo viene valutato e apprezzato.


# FSCsite
test