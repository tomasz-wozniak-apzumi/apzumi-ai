# Coding

Podstawowa konfiguracja OpenCode dla modeli GitHub Copilot. Wystarczy skopiować pliki z tego katalogu do swojego projektu lub globalnej konfiguracji:

- lokalnie: `opencode.jsonc`
- globalnie: `~/.config/opencode/opencode.jsonc`

## Narzędzia

Ze względu na prywatność, narzędzia `CodeSearch` i `WebSearch` są domyślnie wyłączone. Oprócz włączenia ich w `opencode.jsonc` należy wyeksportować zmienną środwiskową dla _Exa Code API_, aby zadziałały dla modeli zewnętrznych _(z Copilota)_:

```
export OPENCODE_ENABLE_EXA=true
```

_Exa_ to wewnętrzny system przeszukiwania w OpenCode, który pozwala agentowi na znajdowanie aktualnych informacji, dokumentacji, wyników researchu.

- `CodeSearch`: wyszukuje i uzyskuje istotny kontekst dla zadań programistycznych; zapewnia najświeższy kontekst dla bibliotek, SDK oraz interfejsów API.
- `WebSearch`: przeszukuje sieć, wykonuje wyszukiwania w czasie rzeczywistym i potrafi pobierać treści z konkretnych adresów URL.

## Wtyczki

### Path Instructions

Wtyczka automatycznie wstrzykuje instrukcje kodowania specyficzne dla danego kontekstu na podstawie aktualnie czytanych lub edytowanych plików. Przeszukuje projekt pod kątem `*.instructions.md`, analizuje zawarte w nich reguły i dba o to, by były one aktywne wyłącznie dla plików określonych w ich konfiguracji.

1. Utwórz `.opencode/instructions/` w głównym folderze projektu.
2. Utwórz pliki Markdown z rozszerzeniem `.instructions.md` (np. `angular.instructions.md`).
3. Dodaj sekcję YAML frontmatter na górze, aby określić, których plików dotyczą reguły, a następnie wpisz swoje instrukcje:

```md
---
applyTo: "src/app/**/*.ts, src/app/**/*.html"
---

- Use OnPush change detection strategy for all new components.
- Prefer signals over observables for local state.
- Ensure all components have associated unit tests.
```

📚 Szczegóły na oficjalnym repozytorium: [opencode-path-instructions](https://github.com/klocus/opencode-path-instructions)

### Weave

[Weave](https://tryweave.io/) wprowadza orkiestrację wieloagentową do Twojego procesu programowania. Zamiast jednego agenta ogólnego przeznaczenia, otrzymujesz 8 wyspecjalizowanych agentów, którzy ze sobą współpracują — planują pracę, recenzują plany, wykonują zadania krok po kroku, przeprowadzają audyty bezpieczeństwa i nie tylko.

**Gdy OpenCode uruchomi się z załadowanym Weave, upewnij się, że wszystko działa:**

- Selektor agentów — Otwórz selektor agentów (lub wpisz wzmiankę z `@`). Na liście powinny pojawić się `Loom`, `Tapestry`, `Shuttle` i inne, obok pozostałych agentów.
- Komenda `/start-work` — Wpisz `/` w polu wprowadzania promptu. Na liście komend powinno pojawić się `start-work`. Jest to komenda, która rozpoczyna/kontynuuje realizację planu.

#### Agenty

| Agent        | Rola                                                            | Tryb     | Narzędzia                |
| ------------ | --------------------------------------------------------------- | -------- | ------------------------ |
| **Loom**     | Koordynator — planuje zadania, deleguje pracę                   | primary  | Full                     |
| **Tapestry** | Wykonawca — realizuje punkty planu                              | primary  | Full (no subagents)      |
| **Shuttle**  | Specjalista dziedzinowy — praca w konkretnych obszarach         | all      | Full                     |
| **Pattern**  | Planista — tworzy pliki planów `.md`                            | subagent | Guarded (`.weave/` only) |
| **Thread**   | Eksplorator kodu — szybkie wyszukiwanie i analiza               | subagent | Read-only                |
| **Spindle**  | Badacz — dokumentacja i wyszukiwanie w sieci                    | subagent | Read-only                |
| **Weft**     | Recenzent/audytor — zatwierdza lub odrzuca pracę                | subagent | Read-only                |
| **Warp**     | Audytor bezpieczeństwa — zgłasza luki i naruszenia specyfikacji | subagent | Read-only                |

#### Korzystanie

1. Skopiuj plik `weave-opencode.jsonc` do:
   - lokalnie: `.opencode/weave-opencode.jsonc`
   - globalnie: `~/.config/opencode/weave-opencode.jsonc`
2. Wybierz agenta **Loom** _(Tab)_ i opisz swoje zadanie.

Loom przeanalizuje zapytanie, oceni jego złożoność i stwierdzi, czy jest to zadanie wieloetapowe, które wymaga ustrukturyzowanego planu, czy proste, które może od razu zrealizować.

- Złożone zadania deleguje do agenta _Pattern_, aby przeanalizował bazę kodu i przygotowało plan.
  - _Pattern_ analizuje kod źródłowy _(poprzez Thread)_, sprawdza odpowiednią dokumentację _(poprzez Spindle)_ i generuje ustrukturyzowany plik planu w lokalizacji `.weave/plans/add-search.md`. Plan ten zawiera zadania z checkboxami.
  - Zanim rozpocznie się realizacja, _Loom_ przekazuje plan do _Weft_ w celu sprawdzenia jego jakości.
  - Gdy plan zostanie zatwierdzony, uruchom `/star-work`. _Tapestry_ przejmuje kontrolę. Odczytuje plan i wykonuje każde zadanie po kolei.
- Proste zadania są obsługiwane bezpośrednio przez _Loom_ lub delegowane do _Shuttle_.

#### Konfiguracja

📚 Weave można dostosować do swojego projektu i osobistych preferencji. Szczegóły znajdziesz w [oficjalnej dokumentacji](https://tryweave.io/docs/guide/).

### RTK (opcjonalnie)

[RTK](https://github.com/rtk-ai/rtk) filtruje i kompresuje wyniki poleceń _(outputy systemowe z konsoli)_, zanim trafią do kontekstu LLM. Potrafi zmniejszyć zużycie tokenów o 60-90% przy typowych poleceniach deweloperskich. Sprawia to, że kontekst sesji nie jest tak zapchany i automatyczne skondensowanie sesji (`compaction`) nastąpi później.

#### Instalacja

Homebrew:

```
brew install rtk
```

CURL:

```
curl -fsSL https://raw.githubusercontent.com/rtk-ai/rtk/refs/heads/master/install.sh | sh
```

Cargo:

```
cargo install --git https://github.com/rtk-ai/rtk
```

Następnie należy dodać plugin do OpenCode:

```
rtk init -g --opencode
```

### DCP (opcjonalnie)

[DCP](https://github.com/Opencode-DCP/opencode-dynamic-context-pruning) automatycznie zmniejsza użycie tokenów, usuwając przestarzałe wyniki narzędzi z historii konwersacji. Zmniejsza to kontekst sesji, co sprawia, że model będzie rzadziej się gubił podczas pracy, ponieważ “zanieczyszczenia” kontekstu zostają usuwane na bieżąco. Automatyczne skondensowanie sesji również powinno nastąpić znacznie później.

#### Instalacja

```
opencode plugin @tarquinen/opencode-dcp@latest --global
```

## Polecenia

### `commit`

Analizuje bieżące zmiany, grupuje je w logiczne commity i zatwierdza każdą grupę zgodnie ze specyfikacją _Conventional Commits_. Automatycznie wykrywa ID ticketa z argumentów lub nazwy brancha, pomija sekrety i notatki lokalne, a na branchu integrującym tworzy branch feature przed commitowaniem. Flaga `--no-branch` wyłącza to zachowanie.

```
/commit               # analizuje zmiany i commituje
/commit XYZ-123       # ustawia scope ticketa XYZ-123
/commit --dry         # podgląd bez commitowania
/commit XYZ-123 --dry # podgląd z wymuszonym ticketem
/commit --no-branch   # commituje na bieżącym branchu
```

### `simplify`

Przegląda bieżące zmiany pod kątem ponownego użycia istniejącego kodu, jakości oraz wydajności, a następnie poprawia znalezione problemy. Uruchamia równolegle trzy przeglądy: wykrywanie duplikacji i brakującego reuse, wyszukiwanie hacky patternów oraz analizę zbędnej pracy lub nieefektywności.

```
/simplify # przegląda i upraszcza bieżące zmiany
```

### `grill-me`

Uruchamia sesję grillowania pomysłu, planu lub projektu, żeby doprecyzować założenia przed implementacją.

```
/grill-me plan migracji do event sourcingu
```

### `grill-with-docs`

Uruchamia grillowanie jak wyżej, ale dodatkowo pilnuje modelu domeny i dokumentacji decyzji, gdy w trakcie rozmowy się krystalizują.

```
/grill-with-docs model rozliczeń dla subskrypcji
```

## Umiejętności

### `adr`

Tworzy nowy wpis ADR – _Architecture Decision Record_.

### `code-review`

Instruuje agenta, jak przeprowadzać profesjonalne i wnikliwe przeglądy kodu, zarówno w środowisku lokalnym, jak i dla zdalnych Pull Requestów.

### `grilling`

Trzyzdaniowe polecenie, które zmusza do głębszego przemyślenia sprawy, zanim powstanie jakikolwiek kod.

### `improve-codebase-architecture`

Analizuje Twój kod, szukając niejasności:

- Gdzie zrozumienie jednej koncepcji wymaga skakania między wieloma małymi plikami?
- Gdzie czyste funkcje zostały wyodrębnione tylko dla testowalności, ale prawdziwe błędy ukrywają się w sposobie ich wywoływania?
- Gdzie ściśle powiązane moduły stwarzają ryzyko integracji?

Następnie przedstawia kandydatów do pogłębienia - szanse na przekształcenie płytkich modułów w głębsze.

### `write-command`

Służy do tworzenia nowych `/poleceń`.

### `write-instruction`

Służy do tworzenia nowych instrukcji.

### `write-skill`

Skillocepcja. Służy do tworzenia nowych skilli.
