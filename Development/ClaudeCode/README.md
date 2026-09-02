# Claude Code

Gotowa konfiguracja `.claude/` dla [Claude Code](https://claude.ai/code) — skille, CLAUDE.md i dokumentacja projektu.

## Spis treści

- [Instalacja przez marketplace](#instalacja-przez-marketplace)
- [Instalacja manualna](#instalacja-manualna)
- [Telemetria — Langfuse (OBOWIĄZKOWE)](#telemetria--langfuse-obowiązkowe)
- [Skille](#skille)
  - [Design](#design-design-skillsapzumi)
  - [Git](#git-git-skillsapzumi)
  - [Development](#development-dev-skillsapzumi)
  - [Meta](#meta-meta-skillsapzumi)
  - [Łańcuch skilli](#łańcuch-skilli)
- [Hooki](#hooki)
  - [Auto code-review](#auto-code-review-code-review-hooksapzumi)
  - [Wymuszenie ponytail](#wymuszenie-ponytail-dev-skillsapzumi)
  - [Wymuszona ewaluacja skilli](#wymuszona-ewaluacja-skilli-skill-forced-eval-hookapzumi)
- [LSP](#lsp)
- [MCP i Tool Search](#mcp-i-tool-search)
- [Dokumentacja](#dokumentacja)
- [Koncepcje Claude Code](#koncepcje-claude-code)
  - [Skille](#skille-1)
  - [Subagenty](#subagenty)
  - [Hooki](#hooki-1)
  - [Czego użyć — kiedy?](#czego-użyć-i-kiedy)
- [Zaawansowana konfiguracja](#zaawansowana-konfiguracja)
  - [Skill listing budget](#skill-listing-budget)
  - [Sandboxing](#sandboxing)

---

## Instalacja przez marketplace

Skille są instalowane jako pluginy pogrupowane tematycznie. Aktualizacje pobierasz ręcznie przez `/plugin marketplace update` lub automatycznie przy starcie Claude Code, jeśli masz ustawiony `GITHUB_TOKEN` w środowisku.

**Wymaganie:** dostęp do repozytorium `Apzumi-com/apzumi-ai` na GitHubie.

```bash
# 1. Zaloguj się do GitHub (jeśli jeszcze nie)
gh auth login

# 2. Dodaj marketplace
claude plugin marketplace add Apzumi-com/apzumi-ai

# 3. Zainstaluj wybrane grupy pluginów
claude plugin install design-skills@apzumi   # grilling, grill-me, grill-with-docs, to-spec, to-tickets, domain-modeling, adr, codebase-design
claude plugin install git-skills@apzumi      # git-workflow, commit, resolving-merge-conflicts
claude plugin install dev-skills@apzumi      # ponytail-review, ponytail-audit, ponytail-debt, tdd, improve-codebase-architecture, diagnosing-bugs, implement, full-code-review + hooki wymuszające ponytail
claude plugin install meta-skills@apzumi      # hook-creator, skill-creator, handoff
claude plugin install code-review-hooks@apzumi  # auto-trigger /full-code-review po sesji z edycjami
claude plugin install skill-forced-eval-hook@apzumi  # wymuszona ewaluacja skilli przy każdym promptcie
```

Lub z poziomu Claude Code:

```
/plugin marketplace add Apzumi-com/apzumi-ai
/plugin install design-skills@apzumi
/plugin install git-skills@apzumi
/plugin install dev-skills@apzumi
/plugin install meta-skills@apzumi
/plugin install code-review-hooks@apzumi
/plugin install skill-forced-eval-hook@apzumi
```

---

## Instalacja manualna

Skopiuj katalog `.claude/` do swojego projektu lub do `~/.claude/` (konfiguracja globalna):

```bash
# lokalnie (tylko jeden projekt)
cp -r .claude/ /twój-projekt/.claude/

# globalnie (wszystkie projekty)
cp -r .claude/ ~/.claude/
```

> [!TIP]
> Skille i CLAUDE.md z `.claude/` możesz łączyć — skopiuj tylko te elementy, których faktycznie potrzebujesz.

> [!NOTE]
> Blok reguł z `CLAUDE.md` (Core Behavior Rules, Change Safety Rules itd.) trzymaj w **jednym miejscu** — globalnie (`~/.claude/CLAUDE.md`) **albo** w projekcie. Jeśli trafi w oba, reguły załadują się do kontekstu podwójnie w każdej sesji, a po aktualizacji szablonu kopie zaczną się rozjeżdżać.
>
> Sprawdzony podział: reguły ogólne globalnie (aktywne w każdym projekcie), a w projektowym `CLAUDE.md` wyłącznie sekcje specyficzne dla projektu — Commands, Architecture, Gotchas, Domain Knowledge, Repository Etiquette.

---

## Telemetria — Langfuse (OBOWIĄZKOWE)

> [!IMPORTANT]
> Plugin wymagany od wszystkich pracowników używających Claude Code — telemetria wewnętrzna na potrzeby ISO.

Plugin: [langfuse/Claude-Observability-Plugin](https://github.com/langfuse/Claude-Observability-Plugin)

**Wymaganie wstępne:** Python 3.10+ z `pip install "langfuse>=4.0,<5"` lub `uv` (wtedy SDK instaluje się automatycznie).

**Instalacja:**

```bash
claude plugin marketplace add langfuse/Claude-Observability-Plugin
claude plugin install langfuse-observability@langfuse-observability
```

Po instalacji zrestartuj Claude Code.

**Konfiguracja** — plugin zapyta o klucze przy pierwszym uruchomieniu, albo wpisz ręcznie do `.claude/settings.json`:

```json
{
  "env": {
    "LANGFUSE_SECRET_KEY": "<zapytaj Sebastiana Zarzyckiego>",
    "LANGFUSE_PUBLIC_KEY": "pk-lf-8c2cfdd4-b03e-4c51-8a20-6a2be425156e",
    "LANGFUSE_BASE_URL": "https://cloud.langfuse.com",
    "LANGFUSE_USER_ID": "Imię Nazwisko"
  }
}
```

`LANGFUSE_SECRET_KEY` jest przechowywany w keychain systemowym — po wartość zgłoś się do **Sebastiana Zarzyckiego**.

**Claude Code Desktop — dodatkowa konfiguracja:**

> [!WARNING]
> W Claude Code Desktop plugin ładuje się w inny sposób niż w CLI i tworzy pod spodem profil `@inline` o innej nazwie — nie widzi konfigu bazowego profilu i nie ma dostępu do systemowego Keychaina (scopowanego pod dokładną nazwę pluginu), więc nie odczyta z niego `LANGFUSE_SECRET_KEY`. Rozwiązanie: dodać w `.claude/settings.json` sekcję `pluginConfigs` z profilem `langfuse-observability@inline` i wpisać w niej wszystkie cztery parametry jawnie. Szczegóły: [langfuse/claude-observability-plugin#12](https://github.com/langfuse/claude-observability-plugin/issues/12).

```json
{
  "enabledPlugins": {
    "langfuse-observability@langfuse-observability": true
  },
  "extraKnownMarketplaces": {
    "langfuse-observability": {
      "source": {
        "source": "github",
        "repo": "langfuse/Claude-Observability-Plugin"
      }
    }
  },
  "pluginConfigs": {
    "langfuse-observability@inline": {
      "options": {
        "LANGFUSE_SECRET_KEY": "<zapytaj Sebastiana Zarzyckiego>",
        "LANGFUSE_PUBLIC_KEY": "pk-lf-8c2cfdd4-b03e-4c51-8a20-6a2be425156e",
        "LANGFUSE_BASE_URL": "https://cloud.langfuse.com",
        "LANGFUSE_USER_ID": "Imię Nazwisko"
      }
    }
  }
}
```

Po aktualizacji configu poproś Sebastiana Zarzyckiego o potwierdzenie, że logi zaczęły się pojawiać w Langfuse.

---

## Skille

Skille to instrukcje ładowane na żądanie poprzez komendę `/` — nie zapychają kontekstu sesji, dopóki ich nie wywołasz.

### Design (`design-skills@apzumi`)

| Skill             | Opis                                                                                                                                                                     | Zależy od                     |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------- |
| `grilling`        | Krótki prompt wymuszający głębsze przemyślenie przed pisaniem kodu                                                                                                       | —                             |
| `grill-me`        | Przeprowadza sesję grillowania pomysłu lub planu przed implementacją                                                                                                     | `grilling`                    |
| `grill-with-docs` | Jak `grill-me`, ale aktualizuje model dziedziny i ADRy w trakcie rozmowy                                                                                                 | `grilling`, `domain-modeling` |
| `to-spec`         | Zamienia bieżącą rozmowę w spec i zapisuje go w `.scratch/` — bez wywiadu, sama synteza                                                                            | `grill-with-docs`             |
| `to-tickets`      | Rozbija spec lub plan na tickety tracer-bullet (pionowe plastry) z krawędziami blokującymi — plik na ticket w `.scratch/`                                                | `to-spec`                     |
| `domain-modeling` | Buduje model dziedziny i słownik pojęć (_ubiquitous language_)                                                                                                           | `adr`                         |
| `adr`             | Tworzy, przegląda i aktualizuje Architecture Decision Records                                                                                                            | –                             |
| `codebase-design` | Wspólny słownik projektowania głębokich modułów: interfejs, głębokość, szew, adapter, lokalność — ładowany przez inne skille lub bezpośrednio przy projektowaniu modułów | —                             |

### Git (`git-skills@apzumi`)

| Skill                       | Opis                                                                     | Zależy od      |
| --------------------------- | ------------------------------------------------------------------------ | -------------- |
| `git-workflow`              | Obsługuje operacje Git z wymuszeniem Conventional Commits                | —              |
| `commit`                    | Grupuje zmiany w logiczne commity wg specyfikacji _Conventional Commits_ | `git-workflow` |
| `resolving-merge-conflicts` | Prowadzi przez rozwiązywanie konfliktów merge/rebase krok po kroku       | —              |

### Development (`dev-skills@apzumi`)

| Skill                           | Opis                                                                                                                                                       | Zależy od                                        |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| `ponytail`                      | Zanim dodasz linię, zdejmij dwie — YAGNI, reuse, root cause, zero boilerplate. Nie jest rejestrowany jako skill — wstrzykiwany hookiem, patrz [Wymuszenie ponytail](#wymuszenie-ponytail-dev-skillsapzumi) | —                                                |
| `ponytail-review`               | Code review skoncentrowany na over-engineeringu — co wywalić, czym zastąpić                                                                                | —                                                |
| `ponytail-audit`                | Jak `ponytail-review`, ale audyt całego repo zamiast diffa — ranking cięć od największego                                                                  | —                                                |
| `ponytail-debt`                 | Zbiera komentarze `ponytail:` z całego repo w jeden rejestr długu — ceiling, upgrade path, oznaczenie wpisów bez triggera                                   | —                                                |
| `tdd`                           | Prowadzi przez cykl red-green-refactor przy budowaniu funkcji lub naprawianiu bugów                                                                        | `codebase-design`                                |
| `improve-codebase-architecture` | Skanuje kod w poszukiwaniu miejsc do pogłębienia i generuje raport HTML                                                                                    | `grilling`, `domain-modeling`, `codebase-design` |
| `diagnosing-bugs`               | Pętla diagnostyczna dla trudnych bugów i regresji wydajności                                                                                               | `improve-codebase-architecture`                  |
| `implement`                     | Implementuje tickety ze `.scratch/` test-first (`/tdd`) z bramką weryfikacji przed odhaczeniem, potem `/full-code-review` — bez samodzielnego commitowania | `tdd`, `full-code-review`, `git-workflow`        |
| `full-code-review`              | Profesjonalny code review lokalnych zmian lub zdalnych PR-ów — poprawność, zgodność ze specem (FR/SC), reuse, konwencje, bezpieczeństwo                    | —                                                |

### Meta (`meta-skills@apzumi`)

| Skill           | Opis                                                                               | Zależy od |
| --------------- | ---------------------------------------------------------------------------------- | --------- |
| `hook-creator`  | Tworzy i konfiguruje hooki Claude Code dla automatyzacji zdarzeń cyklu życia sesji | —         |
| `skill-creator` | Tworzy, modyfikuje i mierzy skuteczność nowych skilli                              | —         |
| `handoff`       | Kompresuje bieżącą sesję do dokumentu przekazania dla kolejnego agenta             | —         |

### Łańcuch skilli

> [!NOTE]
> Dla projektów, które **nie** używają OpenSpec — ten ma własny flow (`openspec/changes/`, komendy `/opsx:*`). Wybierz jeden z dwóch.

Skille z grup Design i Development układają się w łańcuch. Stan między sesjami niosą pliki, nie rozmowa: `docs/glossary.md` i `docs/adr/` (domena) oraz `.scratch/<feature>/` (spec i tickety).

```
/grill-with-docs    wywiad aż do wspólnego zrozumienia; zapisuje docs/glossary.md i docs/adr/
   │
   ├── zmieści się w jednej sesji? ──► /implement ──► /full-code-review
   │
   ▼ praca na wiele sesji
/to-spec            spec z numerowanymi wymaganiami  → .scratch/<feature>/spec.md
/to-tickets         tickety tracer-bullet + blokery        → .scratch/<feature>/issues/
/implement          ticket po tickecie, /clear między nimi; nie commituje
/full-code-review   poprawność + zgodność ze specem (cytuje FR/SC)
```

Spec i tickety pomiń, gdy całość mieści się w jednym oknie kontekstu — to narzędzie na pracę wielosesyjną, nie obowiązkowy rytuał.

W specu wymagania dostają stabilne ID: **`FR-NNN`** (_Functional Requirement_) — zachowanie, które system MUST/SHOULD mieć; **`SC-NNN`** (_Success Criteria_) — mierzalny efekt potwierdzający, że funkcja działa. Tickety deklarują, które ID realizują, a `/full-code-review` cytuje je zamiast dopasowywać prozę.

## Hooki

### Auto code-review (`code-review-hooks@apzumi`)

Automatycznie uruchamia `/full-code-review` (skill z `dev-skills@apzumi`) po zakończeniu sesji, w której Claude edytował pliki.

**Działanie:**

| Zdarzenie      | Akcja                                                                                                                   |
| -------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `SessionStart` | Usuwa stare flagi `/tmp/claude-code-changes-*` (starsze niż 1 dzień)                                                    |
| `PostToolUse`  | Po każdym `Edit` lub `Write` tworzy plik flagi `/tmp/claude-code-changes-<session_id>`                                  |
| `Stop`         | Jeśli flaga istnieje — usuwa ją i wywołuje ponowne przebudzenie sesji z komunikatem do uruchomienia `/full-code-review` |

### Wymuszenie ponytail (`dev-skills@apzumi`)

`ponytail` jest skillem — jego wywołanie zależy od tego, czy model uzna dopasowanie na podstawie `description`. W praktyce to zawodne: przy konkretnym zadaniu model zwykle wybiera skill specyficzny dla domeny (np. `tdd`, `forms`) i nie dokłada obok niego ogólnego `ponytail`. Plugin dokłada więc hooki, które wstrzykują treść `ponytail/SKILL.md` jako kontekst bezwarunkowo, bez polegania na routing modelu.

| Zdarzenie                                     | Akcja                                                                                    |
| --------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `SessionStart` (startup/resume/clear/compact) | Wstrzykuje ruleset `ponytail` jako `additionalContext` na starcie/wznowieniu sesji       |
| `SubagentStart`                               | Propaguje ten sam kontekst do subagentów (kontekst z `SessionStart` do nich nie dociera) |

Wstrzyknięty przez `SessionStart` kontekst zostaje w historii sesji do najbliższego `startup`/`resume`/`clear`/`compact` — dokładnie tych zdarzeń, które od nowa uruchamiają hook — więc nie ma potrzeby powtarzać go na `UserPromptSubmit` przy każdej turze (upstream robi to tylko dla Qodera, który w ogóle nie ma zdarzenia `SessionStart`).

`ponytail/SKILL.md` pozostaje wyłącznie jako źródło treści dla hooków i **nie jest listowany w `skills` pluginu**. To celowe: skill widoczny na liście `<available_skills>` model może dodatkowo wywołać przez `Skill()` (`user-invocable: false` blokuje tylko `/ponytail` dla użytkownika, nie samo narzędzie), a w połączeniu z [wymuszoną ewaluacją skilli](#wymuszona-ewaluacja-skilli-skill-forced-eval-hookapzumi) — której opis `ponytail` pasuje do dowolnego zadania kodowego — ten sam ruleset ładował się do kontekstu dwa razy.

### Wymuszona ewaluacja skilli (`skill-forced-eval-hook@apzumi`)

Wstrzykuje na starcie każdego promptu instrukcję, która wymusza na Claude jawną ewaluację każdego dostępnego skilla (YES/NO + powód), a następnie wywołanie `Skill()` dla dopasowanych **zanim** przejdzie do implementacji. Rozwiązuje ten sam problem co wymuszenie ponytail — model bywa zawodny w samodzielnym doborze skilli na podstawie `description` — ale robi to uniwersalnie dla wszystkich skilli, nie tylko `ponytail`.

| Zdarzenie          | Akcja                                                                         |
| ------------------ | ----------------------------------------------------------------------------- |
| `UserPromptSubmit` | Wstrzykuje sekwencję EVALUATE → ACTIVATE → IMPLEMENT jako kontekst do promptu |

> [!NOTE]
> Hook odpala się przy **każdym** promptcie i każe wyliczyć werdykt dla wszystkich dostępnych skilli — to właśnie daje niezawodność aktywacji, ale dokłada narzut tokenów i latencji w każdej turze. Rozważ włączenie go tylko tam, gdzie zależy Ci na twardym wymuszeniu.

---

## LSP

Language Server Protocol daje Claude Code semantyczną nawigację po kodzie zamiast przeszukiwania tekstu.

**Dostępne operacje:** `goToDefinition`, `findReferences`, `hover`, `documentSymbol`, `workspaceSymbol`, `goToImplementation`, `incomingCalls`/`outgoingCalls`.

### Włączanie

**1. Zainstaluj language server** dla swojego języka:

```bash
npm i -g typescript typescript-language-server  # TypeScript
npm i -g pyright                                # Python
brew install jdtls                              # Java (macOS)
brew install kotlin-language-server             # Kotlin (macOS)
xcode-select --install                          # Swift — SourceKit-LSP wbudowany w Xcode CLT
```

**2. Zainstaluj plugin LSP:**

```bash
claude plugin marketplace update claude-plugins-official
claude plugin install typescript-lsp   # TypeScript
claude plugin install pyright-lsp      # Python
claude plugin install jdtls-lsp        # Java
claude plugin install kotlin-lsp       # Kotlin
claude plugin install sourcekit-lsp    # Swift
```

Sprawdź status (musi być `enabled`):

```bash
claude plugin list
```

Lub ustaw ręcznie w `~/.claude/settings.json`:

```json
{
  "enabledPlugins": {
    "pyright-lsp@claude-plugins-official": true
  }
}
```

**3. Zrestartuj Claude Code** — server inicjalizuje się dopiero po pełnym restarcie.

### Priorytetyzacja LSP w CLAUDE.md

Dodaj do `~/.claude/CLAUDE.md`, żeby Claude preferował LSP nad Grep/Glob/Read:

```
Prefer LSP over Grep/Glob/Read for code navigation:
- Use goToDefinition, findReferences, workspaceSymbol
- Check LSP diagnostics and fix errors before proceeding
```

### Najczęstsze problemy

- Plugin zainstalowany, ale wyłączony — sprawdź `claude plugin list`
- Language server niedostępny w `$PATH` — sprawdź `which typescript-language-server` / `which jdtls`

---

## MCP i Tool Search

Claude Code próbuje być „inteligentny" i sam decyduje, co załadować — przez co wymuszenie skilli i narzędzi MCP bywa trudne. Sam zapis w `CLAUDE.md` często nie wystarcza: przy konkretnym zadaniu model wybiera skill specyficzny dla domeny i nie dokłada obok niego ogólnego (np. `angular-developer`), a jeśli czuje się pewny swojej wiedzy, przypomnienie z długiego dokumentu odbija jako „znam to, pominę".

### Dlaczego narzędzia MCP nie odpalają

Od Claude Code 2.1.x domyślnie działa **Tool Search**: żeby ograniczyć zużycie kontekstu, definicje narzędzi MCP są **odraczane**. Na starcie sesji do kontekstu trafiają wyłącznie **gołe nazwy narzędzi** i instrukcje serwera — bez schematów, opisów i „trigger phrases". Pełny schemat danego narzędzia ładuje się dopiero wtedy, gdy model wywoła `ToolSearch`.

W praktyce oznacza to, że `mcp__angular-cli__get_best_practices` jest dla modelu tylko ciągiem znaków na liście. Serwer łączy się poprawnie (zero błędów w historii), ale bez dodatkowego kroku `ToolSearch` model nigdy nie pozna, do czego to narzędzie służy — więc go nie użyje.

### Co z tym zrobić

**1. `alwaysLoad: true` na serwerze MCP** — wymusza załadowanie schematów wszystkich narzędzi danego serwera na starcie sesji, z pominięciem odraczania przez Tool Search (Claude Code 2.1.121+):

```json
{
  "mcpServers": {
    "angular-cli": {
      "command": "npx",
      "args": ["-y", "@angular/cli", "mcp"],
      "alwaysLoad": true
    }
  }
}
```

> [!NOTE]
> `alwaysLoad: true` blokuje start sesji do czasu połączenia z serwerem (limit 5 s), bo schematy muszą być gotowe zanim zbuduje się pierwszy prompt. Pojedyncze narzędzie można też wymusić przez `"anthropic/alwaysLoad": true` w jego polu `_meta`.

**2. Globalne wyłączenie Tool Search** przez zmienną `ENABLE_TOOL_SEARCH` — jeśli chcesz, żeby wszystkie serwery MCP ładowały schematy z góry:

```json
{
  "env": {
    "ENABLE_TOOL_SEARCH": "false"
  }
}
```

| Wartość        | Zachowanie                                                        |
| -------------- | ----------------------------------------------------------------- |
| (nieustawione) | domyślnie — narzędzia odraczane, ładowane na żądanie              |
| `true`         | wszystkie narzędzia odraczane                                     |
| `auto`         | ładuje z góry, jeśli narzędzia zmieszczą się w 10% okna kontekstu |
| `auto:N`       | jak `auto`, ale z własnym progiem procentowym (np. `auto:5`)      |
| `false`        | wszystkie narzędzia ładowane z góry — Tool Search wyłączony       |

> [!WARNING]
> `false` ładuje schematy wszystkich narzędzi MCP do kontekstu na starcie — przy wielu serwerach potrafi to zjeść znaczną część okna. `alwaysLoad` na wybranym serwerze jest zwykle bezpieczniejszy niż globalne wyłączenie.

**3. Dla skilli — hook przypominający w `SessionStart`.** Krótki, dedykowany blok wstrzyknięty osobnym punktem (nie zlany z blokiem reguł w `CLAUDE.md`) ma realnie większą szansę przełożyć się na działanie. Dokładnie tak działają pluginy [Wymuszenie ponytail](#wymuszenie-ponytail-dev-skillsapzumi) i [Wymuszona ewaluacja skilli](#wymuszona-ewaluacja-skilli-skill-forced-eval-hookapzumi) — użyj ich jako wzorca dla własnych skilli, które muszą się aktywować bezwarunkowo.

---

## Dokumentacja

Katalog `docs/` zawiera szablony dokumentacji projektu:

| Plik               | Opis                                                                    |
| ------------------ | ----------------------------------------------------------------------- |
| `docs/glossary.md` | Przykładowy słownik pojęć — zastąp przykłady terminami swojego projektu |
| `docs/adr/`        | Szablon i wytyczne do pisania ADRów                                     |

## Koncepcje Claude Code

### Skille

Skille to instrukcje przechowywane w `.claude/skills/<nazwa>/SKILL.md` z YAML frontmatterem. Ładowane są na żądanie — agent wybiera skill na podstawie pola `description`. Nie zapychają kontekstu, dopóki ich nie wywołasz.

**Frontmatter — kluczowe pola:**

```yaml
---
name: skill-name
description: Kiedy Claude powinien automatycznie wywołać ten skill
disable-model-invocation: true # wyłącza auto-wykrywanie; skill tylko przez /
user-invocable: true # dostępny jako /skill-name
allowed-tools: Bash(gh *), Read # ogranicz narzędzia do konkretnych wzorców
context: fork # izolowany kontekst (jak subagent)
agent: Explore # deleguj do konkretnego subagenta
model: haiku # nadpisz model dla tego skilla
effort: low|medium|high # poziom rozumowania
paths: # aktywuj tylko dla wybranych plików
  - "src/**/*.ts"
---
```

> [!NOTE]
> **`paths` nie wstrzykuje automatycznie pełnej treści skilla.** Skille z tym polem startują sesję jako „warunkowe" — ich `description` nie jest widoczne w kontekście, dopóki nic ich nie aktywuje. Gdy Claude odczyta, edytuje lub zapisuje plik pasujący do wzorca, skill trafia do listy dostępnych skilli — tak jak zwykłe, bezwarunkowe skille — a Claude wciąż samodzielnie decyduje (na bazie `description`), czy go wywołać. Pełna treść `SKILL.md` ładuje się dopiero przy faktycznym wywołaniu, nie w momencie samego dopasowania ścieżki.

**Dynamiczne wstrzykiwanie kontekstu** — komendy powłoki wykonywane przed wysłaniem do modelu:

```markdown
## Kontekst PR

- Diff: !`gh pr diff`
- Komentarze: !`gh pr view --comments`
```

**Struktura katalogu skilla:**

```
skills/<grupa>/nazwa/
├── SKILL.md          # wymagany — główne instrukcje
├── template.md       # szablon do wypełnienia przez Claude
├── examples/         # przykładowe outputy
└── scripts/          # skrypty pomocnicze
```

**Zasięg skilli** (priorytet: user > projekt):

| Lokalizacja           | Ścieżka                                                                 |
| --------------------- | ----------------------------------------------------------------------- |
| Globalna (użytkownik) | `~/.claude/skills/<nazwa>/SKILL.md`                                     |
| Lokalna (projekt)     | `.claude/skills/<nazwa>/SKILL.md`                                       |
| Plugin                | `<plugin>/skills/<grupa>/<nazwa>/SKILL.md` — wywoływana jako `/<nazwa>` |

Kiedy używać skilla:

- powtarzalne zadania i konwencje zespołowe
- generowanie szablonów i konwersje plików
- wiedza dziedzinowa dostępna w wielu sesjach

---

### Subagenty

Subagenty to izolowane instancje AI działające we własnym oknie kontekstu (`.claude/agents/<nazwa>.md`). Wyniki zwracają tylko jako podsumowanie — szczegółowy output nie trafia do głównej sesji.

**Wbudowane typy:**

| Agent             | Model        | Narzędzia    | Zastosowanie                 |
| ----------------- | ------------ | ------------ | ---------------------------- |
| `Explore`         | Haiku        | tylko odczyt | szybkie przeszukiwanie kodu  |
| `Plan`            | dziedziczony | tylko odczyt | analiza przed trybem plan    |
| `General-purpose` | dziedziczony | wszystkie    | złożone zadania wieloetapowe |

**Konfiguracja własnego subagenta:**

```yaml
---
name: security-reviewer
description: Kiedy Claude powinien użyć tego agenta automatycznie
tools: Read, Grep, Glob, Bash # dozwolone narzędzia
disallowedTools: Edit, Write # zablokowane narzędzia
model: sonnet # nadpisz model
permissionMode: bypassPermissions # default|acceptEdits|auto|bypassPermissions|plan
skills: # skille wstrzykiwane na starcie (pełna treść)
  - api-conventions
  - error-handling-patterns
mcpServers: # podpięte serwery MCP
  - server-name
maxTurns: 10 # limit iteracji
isolation: worktree # izolowane drzewo git
---
```

**Sposoby wywołania:**

```
@agent-name opis zadania     # bezpośrednie wywołanie w sesji
claude --agent <nazwa>       # z CLI
/fork opis zadania           # fork bieżącej sesji (eksperymentalne)
```

Kiedy używać subagenta:

- zadanie generuje dużo szumu niepotrzebnego w głównym kontekście
- praca wieloetapowa z pętlami walidacji
- równoległa analiza wielu plików lub niezależnych zadań

---

### Hooki

Hooki to skrypty wykonywane deterministycznie w określonych punktach cyklu życia sesji. Działają na poziomie systemu — niezależnie od tego, jak model zinterpretuje prompt.

**Cykl życia — wszystkie zdarzenia:**

| Zdarzenie            | Blokuje? | Dopuszczalne wartości `matcher`                                       | Opis                                                               |
| -------------------- | :------: | --------------------------------------------------------------------- | ------------------------------------------------------------------ |
| `UserPromptSubmit`   |   tak    | —                                                                     | przed przetworzeniem promptu przez Claude                          |
| `PreToolUse`         |   tak    | `Bash`, `Edit`, `Write`, `Read`, `Glob`, `Grep`, `WebFetch`, `mcp__*` | główny punkt bezpieczeństwa przed wykonaniem narzędzia             |
| `PostToolUse`        |   nie    | jak wyżej                                                             | po pomyślnym wykonaniu narzędzia                                   |
| `PostToolUseFailure` |   nie    | jak wyżej                                                             | po błędzie narzędzia                                               |
| `PermissionRequest`  |   tak    | jak wyżej                                                             | pojawia się dialog uprawnień — można auto-zatwierdzić lub odrzucić |
| `Stop`               |   tak    | —                                                                     | główny agent kończy pracę; można wymusić kontynuację               |
| `SubagentStart`      |   nie    | `Bash`, `Explore`, `Plan`                                             | subagent startuje                                                  |
| `SubagentStop`       |   tak    | —                                                                     | subagent kończy pracę                                              |
| `SessionStart`       |   nie    | `startup`, `resume`, `compact`, `clear`                               | sesja rozpoczyna się lub wznawia                                   |
| `SessionEnd`         |   nie    | `clear`, `logout`, `other`                                            | sesja kończy się                                                   |
| `PreCompact`         |   nie    | `manual`, `auto`                                                      | przed kompresją kontekstu — np. backup transkryptów                |
| `Notification`       |   nie    | `permission_prompt`, `idle_prompt`                                    | Claude wysyła powiadomienie                                        |

**Struktura JSON na stdin** (co hook dostaje od Claude):

```json
{
  "session_id": "abc123",
  "cwd": "/twój-projekt",
  "hook_event_name": "PreToolUse",
  "tool_name": "Bash",
  "tool_input": {
    "command": "rm -rf node_modules"
  }
}
```

**Opcjonalny JSON output** (decyzja zwracana przez hook na stdout):

```json
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "allow",
    "permissionDecisionReason": "operacja tylko do odczytu, bezpieczna"
  }
}
```

Wartości `permissionDecision`: `"allow"` pomija dialog, `"deny"` blokuje wywołanie, `"ask"` pokazuje standardowy dialog.

**Typy hooków:**

| Typ       | Mechanizm                          | Zastosowanie                       |
| --------- | ---------------------------------- | ---------------------------------- |
| `command` | skrypt powłoki (JSON na stdin)     | formatowanie, linting, blokowanie  |
| `prompt`  | jednorazowa ewaluacja przez LLM    | semantyczna walidacja (wolniejsze) |
| `agent`   | subagent z narzędziami (do 50 tur) | wieloetapowa weryfikacja           |

**Kody wyjścia:**

| Kod            | Zachowanie                                                |
| -------------- | --------------------------------------------------------- |
| `0`            | sukces; stdout parsowany jako JSON z decyzją              |
| `2`            | blokuje akcję; stderr przekazany do Claude                |
| `1` (lub inny) | kontynuuje z ostrzeżeniem; pierwsza linia stderr widoczna |

**Przykład — auto-formatowanie Prettier po każdej edycji pliku:**

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "jq -r '.tool_input.file_path' | xargs npx prettier --write 2>/dev/null; exit 0"
          }
        ]
      }
    ]
  }
}
```

**Matchery:**

- Wartość złożona wyłącznie z liter/cyfr/`_` → dopasowanie dokładne: `"Bash"`, `"Edit|Write"`
- Pozostałe znaki → regex JS: `"^Notebook"`, `"mcp__memory__.*"`
- Pominięcie matchera → dopasowanie wszystkich wywołań narzędzi dla danego eventu
- Matchery są **case-sensitive**: `"bash"` nie pasuje do `Bash`

**Wydajność skryptów** (utrzymuj hooki poniżej 100 ms):

| Język   | Start       | Kiedy używać                                |
| ------- | ----------- | ------------------------------------------- |
| Bash    | ~10–20 ms   | proste sprawdzenia, operacje na plikach     |
| Node.js | ~50–100 ms  | manipulacja JSON, wywołania HTTP            |
| Python  | ~200–400 ms | złożona logika — tylko dla rzadkich eventów |

**Dobre praktyki:**

- Używaj `PostToolUse` do reakcji (formatter po edycji), `PreToolUse` do prewencji (blokada przed wykonaniem)
- Zawsze kończ `exit 0`, chyba że świadomie blokujesz (`exit 2`)
- Hook `Stop` może wpaść w pętlę nieskończoną — sprawdzaj `stop_hook_active` w JSON stdin i wychodź z `0`, gdy jest `true`
- Testuj hook ręcznie: `echo '{"tool_name":"Bash","tool_input":{"command":"ls"}}' | ./hook.sh`
- Użyj `async: true` dla długich hooków, które nie muszą blokować

**Zasięg hooków:**

| Plik                          | Zasięg                                    |
| ----------------------------- | ----------------------------------------- |
| `~/.claude/settings.json`     | wszystkie projekty                        |
| `.claude/settings.json`       | pojedynczy projekt (współdzielony w repo) |
| `.claude/settings.local.json` | pojedynczy projekt (nie commitowany)      |

Kiedy używać hooka:

- wymuszenie reguł bezpieczeństwa bez polegania na modelu
- automatyczne formatowanie/linting po każdej edycji
- centralne logowanie akcji agenta

---

### Czego użyć i kiedy?

| Scenariusz                                        | Użyj                     | Dlaczego                                             |
| ------------------------------------------------- | ------------------------ | ---------------------------------------------------- |
| "Preferuj Bun zamiast npm"                        | **CLAUDE.md**            | preferencja, nie twarda reguła                       |
| "Trasy API mają ten wzorzec"                      | **`.claude/rules/`**     | kontekstowe wskazówki dla modelu                     |
| "Dostęp do naszego Jira / zewnętrznego API"       | **MCP server**           | integracja z zewnętrzną usługą                       |
| "Zawsze formatuj pliki po zapisie"                | **Hook** (`PostToolUse`) | musi zadziałać zawsze, bez wyjątków                  |
| "Nigdy nie modyfikuj `.env`"                      | **Hook** (`PreToolUse`)  | twarda blokada, nie sugestia                         |
| "Loguj każdą komendę do pliku audytu"             | **Hook** (`PostToolUse`) | efekt uboczny transparentny dla Claude               |
| "Sprawdź testy przed zakończeniem sesji"          | **Hook** (`Stop`)        | brama wymuszająca jakość                             |
| "Konwertuj plik PDF/DOCX do Markdown"             | **Skill**                | prosta konwersja wejście→wyjście, wielokrotne użycie |
| "Stosuj nasze konwencje commitów"                 | **Skill**                | powtarzalny workflow, wiedza dziedzinowa             |
| "Uruchom `/deploy` aby wdrożyć"                   | **Skill**                | powtarzalny, nazwany workflow                        |
| "Przeanalizuj dokumentację i zaproponuj refaktor" | **Subagent**             | wieloetapowe rozumowanie, izolowany kontekst         |
| "Zrób code review wielu plików"                   | **Subagent**             | głęboka analiza bez zaśmiecania głównej sesji        |
| "Równolegle zbadaj dwa niezależne problemy"       | **Subagent**             | równoległość, oddzielne okna kontekstu               |

**W skrócie:**

- Sugestia → **CLAUDE.md**
- Wymóg niepodlegający dyskusji → **Hook**
- Zewnętrzna usługa → **MCP**
- Prosta konwersja lub powtarzalny workflow → **Skill** _(zacznij tu domyślnie)_
- Wieloetapowe rozumowanie lub izolowany kontekst → **Subagent**

---

## Zaawansowana konfiguracja

### Skill listing budget

Ukryty mechanizm w Claude Code 2.1.129+ ograniczający liczbę skilli wyświetlanych w systemowym prompcie. Dwa ustawienia kontrolują budżet:

| Ustawienie                   | Domyślnie   | Opis                                                                           |
| ---------------------------- | ----------- | ------------------------------------------------------------------------------ |
| `skillListingBudgetFraction` | `0.01` (1%) | Limit metadanych skilli jako procent okna kontekstu — przy 200K ≈ 2000 tokenów |
| `skillListingMaxDescChars`   | `1536`      | Maksymalna długość opisu pojedynczego skilla                                   |

**Praktyczny limit:** przy domyślnych ustawieniach i modelu 200K — ok. **15 skilli** zanim część opisów zniknie. Przy 1M — 75–125 skilli.

**Sposoby na przekroczenie limitu:** wyłącz nieużywane skille (`/skills`), skróć opisy do 100–150 znaków z kluczowymi słowami na początku, lub podnieś `skillListingBudgetFraction`.

Aktualny stan budżetu i listę skilli, które zmieściły się w limicie, sprawdzisz poleceniem `/doctor`.

### Sandboxing

Mechanizm bezpieczeństwa oparty na kernelu — izoluje procesy Claude Code na poziomie OS, zastępując podejście oparte wyłącznie na aprobatach użytkownika.

**Dwa filary:**

- **Izolacja systemu plików** — zapis ograniczony do bieżącego katalogu; odczyt całego dysku dozwolony.
- **Izolacja sieci** — ruch przez proxy blokujący nieautoryzowane domeny.

**Wsparcie platformowe:**

| Platforma    | Implementacja                 |
| ------------ | ----------------------------- |
| macOS        | Wbudowany framework Seatbelt  |
| Linux / WSL2 | Wymaga `bubblewrap` + `socat` |
| WSL1         | Nieobsługiwane                |

**Tryby:** `auto-allow` (komendy bash bez zatwierdzeń, piaskownica nadal aktywna) i `regular` (ręczna aprobata każdej komendy). Konfiguracja w `settings.json`: pola `mode`, `allowedDomains`, `allowUnsandboxedCommands`.

**Ograniczenia:** domain fronting może ominąć filtr sieci; zbyt szerokie uprawnienia do gniazd Unix mogą przyznać dostęp do całego systemu.
