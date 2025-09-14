# Revelation – SanctumOS

SanctumOS ist ein konzeptionelles Betriebssystem, das vollständig in der **Revelex**‑Sprache implementiert wurde. Es zeigt, wie die Sprache verwendet werden kann, um alles von niedrigstufigen Kernel‑Funktionen bis zu Benutzerprogrammen, Ledger‑Integration und Quanten-Randomisierung auszudrücken.

Das Projekt ist in Module unter dem Namespace `sanctumos` gegliedert. Jede Datei enthält nicht nur den Code, sondern auch umfangreiche Kommentare, die erklären, **was** die Komponente tut, **warum** sie gebraucht wird und **wieso** sie genau so gestaltet wurde. Das System ist **contract‑first** und **audit‑fähig**: jedes Subsystem verwendet `ethos { require … ensure … invariant … }`, um Vor- und Nachbedingungen zu erzwingen, und `reflect { trace … }`, um strukturierte Spuren auszugeben.

## Build-Hinweise

Wenn Sie über einen Revelex‑Compiler verfügen, können Sie das System mit folgendem Kommando bauen:
Da Revelex zur Zeit eine konzeptionelle Sprache ist, gibt es keinen binären Kernel in diesem Archiv. Die Dateien dienen als Spezifikation, wie ein solches System geschrieben sein könnte.

## Verzeichnisübersicht

- **kernel/main.rlx** – Einstiegspunkt des Betriebssystems. Initialisiert die Kern‑Services, Speicherverwaltung, den Scheduler und startet den ersten Prozess.
- **kernel/scheduler.rlx** – Einfacher Round‑Robin‑Scheduler zur Verwaltung von Prozessen und Threads.
- **kernel/memory.rlx** – Speicherverwaltungsprimitiven: Seiten‑Allokation, Heap‑Management und Zugriffsschutz.
- **kernel/filesystem.rlx** – Minimales Dateisystem (SanctumFS) mit Inodes, Verzeichnissen und Dateien.
- **kernel/network.rlx** – Rudimentäres Netzwerk (SanctumNet) mit Paketstrukturen, Senden/Empfangen und Vertragsprüfungen.
- **kernel/security.rlx** – Sicherheitsprimitive, Prozessfähigkeiten und Integration in das Blxain‑Ledger zur Protokollierung.
- **kernel/tangle.rlx** – Integration eines DAG‑Ledgers zur Aufzeichnung von Systemereignissen im Tangle (blockloses Ledger).
- **kernel/quantum.rlx** – Demonstriert die Integration mit qRetvm für Quanten-Randomisierung.
- **kernel/device.rlx** – Geräteschicht mit Konsole und Loopback-Netzwerkgerät.
- **kernel/ipc.rlx** – Einfaches Inter‑Process‑Communication‑System über Channels.
- **userland/shell.rlx** – Ein einfacher Befehlsinterpreter im Benutzerraum.
- **userland/demo.rlx** – Beispielprogramm für Datei‑I/O, Netzwerk und Quantenfunktionen.

Jede Datei enthält umfangreiche Erläuterungen zu Designentscheidungen.
