# OpenCode

OpenCode to bezpłatne, open source'owe, często aktualizowane narzędzie, które umożliwia podłączenie wielu różnych providerów LLM, a w tym GitHub Copilot. Automatycznie włącza należyte LSP _(daje feedback agentowi AI, jeżeli po edycji pliku jest jakiś błąd lub niespójność z linterem)_ oraz formattery kodu.

Do wyboru wersja CLI (TUI), webowa oraz desktopowa. Pobrać można je [tutaj](https://opencode.ai/download).

## Gotowce

W katalogu tego repozytorium znajdziesz gotowe konfiguracje, skille, instrukcje itd.

## Przygotowanie CLI

> [!NOTE]
> _Pomiń tę sekcję, jeżeli korzystasz z wersji desktopowej._

Interfejs TUI _(terminal user interface)_ OpenCode wymaga obsługi true color i pełnego Unicode.

**Twoje opcje:**

- [Warp](https://www.warp.dev/agents/opencode) (wieloplatformowy, integruje się z OpenCode CLI) ⭐ [[docs]](https://docs.warp.dev/agent-platform/cli-agents/opencode/#setting-up-notifications)
- WezTerm (wieloplatformowy)
- Alacritty (wieloplatformowy, bardzo szybki)
- Ghostty (Linux i macOS)
- Kitty (Linux i macOS)

Domyślny `Terminal.app` na macOS działa, ale stracisz część efektów wizualnych.

### Instalacja

```bash
curl -fsSL https://opencode.ai/install | bash

# lub przez menedżery pakietów:
brew install anomalyco/tap/opencode
npm install -g opencode-ai
pnpm install -g opencode-ai

# Windows:
choco install opencode
scoop install opencode
```

### Pierwsze uruchomienie

```bash
cd ~/projekty/moj-projekt
opencode
```

Następnie w TUI:

```
/connect
```

i wybierz _Github Copilot_.

## Plik konfiguracyjny

Po instalacji, należy otworzyć plik `~/.config/opencode/opencode.json` _(globalny)_ lub utworzyć `opencode.json` w roocie projektu _(lokalny)_.

> [!TIP]
> W katalogu tego repozytorium znajdziesz gotową, podstawową konfigurację.

### Uprawnienia

Należy dostosować zakres uprawnień, jakie agent może wykonywać sam, jakie są zabronione, a o jakie powinien pytać. Zalecane jest ustawienie ask przy takich uprawnieniach jak edycja plików i wykonywanie komend bash. Podczas pracy w sesji i tak będziemy mogli ustawić pełną autonomiczność agenta, np. przy prostszych zadaniach.

📚 Dokumentacja: [Permissions](https://opencode.ai/docs/permissions/)

💡 Przykład:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "permission": {
    "*": "allow", <-- domyślnie zezwala na wszystko, oprócz reguł poniżej
    "doom_loop": "ask",
    "edit": "ask",
    "external_directory": "ask",
    "bash": {
      "*": "ask", <-- domyślnie pyta o wszystko oprócz wykonywania skryptów NPM
      "npm run *": "allow"
    }
  }
}
```

### Wtyczki

Wtyczki umożliwiają rozszerzenie OpenCode poprzez podłączenie się do różnych zdarzeń i dostosowanie zachowania.

📚 Dokumentacja: [Plugins](https://opencode.ai/docs/plugins/)

### MCP

MCP, czyli Model Context Protocol, to otwarty protokół standaryzujący komunikację agentów AI z zewnętrznymi narzędziami, API i danymi. Nigdy nie należy przesadzać z ich liczbą, ponieważ każde MCP dodaje to kontekstu narzędzia, z których agent może skorzystać oraz ich długie opisy, by agent wiedział, jak z tych narzędzi korzystać. Używamy tylko tych MCP, które faktycznie pomagają i są przydatne. 2-5 podpiętych MCP to odpowiedni zakres.

📚 Dokumentacja: [MCP servers](https://opencode.ai/docs/mcp-servers/)

## AGENTS.md

Najważniejszy plik, który jest ładowany zawsze na początku sesji i działa jako zestaw instrukcji dla agentów AI.

Umieść go w głównym katalogu repozytorium i wraz ze swoim zespołem poprawiajcie go, ulepszajcie, by agent dostarczał jak najlepsze rezultaty.

📚 Dokumentacja: [Rules](https://opencode.ai/docs/rules/)

### Co powinien zawierać?

- Opisuje, jak **budować, testować i uruchamiać** Twój projekt
- Wyjaśnia wzorce architektoniczne i konwencje
- Wymienia zewnętrzne usługi, zmienne środowiskowe lub dokumenty projektowe
- Dostarcza słownictwo specyficzne dla domeny i zasady stylu kodu

| Kategoria         | Przykład                                                                                                          |
| ----------------- | ----------------------------------------------------------------------------------------------------------------- |
| Code style        | ”Use arrow functions, not function declarations”, “Prefer early returns over nested conditionals”                 |
| Testing           | ”Every new endpoint needs integration tests”, “Use factories, not fixtures for test data”                         |
| Architecture      | ”Services go in src/services with matching interfaces”, “All data queries use the repository pattern”   |
| Tooling           | ”Run `npm run verify` before marking any task complete”, “Deploy with `scripts/deploy.sh`, never manual commands” |
| Mistakes to avoid | ”Never commit `.env` files”, “Don’t use any! type annotations”                                                    |

### Struktura i składnia

`AGENTS.md` to zwykły Markdown; nagłówki dostarczają wskazówek semantycznych.

Agenty rozpoznają:

- Nagłówki najwyższego poziomu (`#`) jako sekcje
- Listy punktowane dla poleceń lub reguł
- Kod w tekście (`\``) dla dokładnych poleceń, nazw plików, zmiennych środowiskowych
- Linki do dokumentów zewnętrznych _(GitHub, Figma, Confluence…)_

> [!IMPORTANT]
> Jako że ten plik jest ładowany przy każdej sesji, powinien zawierać tylko i wyłącznie najistotniejsze zasady! Uwzględnij tylko to, na czym Tobie w przyszłości będzie zależało – zwięzłość jest lepsza niż pliki o długości encyklopedii. Najlepiej by miał maksymalnie 150-200 linijek.

Zaawansowane LLM-y mogą przestrzegać około 150-200 instrukcji, przy czym wydajność pogarsza się wraz ze wzrostem ich liczby. Więcej wskazówek o pisaniu dobrych zasad znajdziesz tutaj: [Writing a good CLAUDE.md](https://www.humanlayer.dev/blog/writing-a-good-claude-md).

### Gdy coś idzie nie tak...

Podobnie jak w przypadku każdej pracy deweloperskiej, zadania agenta czasami wymagają korekty. Najczęściej jest to interwencja w postaci prompta, ale czasem należy zmienić treść AGENTS.md.

Jeśli widzisz, że agent nie trzyma się instrukcji z tego pliku, to spróbuj inaczej je sformułować i zacząć sesję od nowa.

### Przykład

```md
# Project Guidelines

## Testing

- Run `npm test` before completing any feature
- New features need unit tests
- API changes need integration tests

## Code Style

- Use TypeScript strict mode
- Prefer composition over inheritance
- Keep functions under 20 lines

## Common Commands

- Lint: `npm run lint:fix`
- Test: `npm test`
- Build: `npm run build`
```

## SKILL.md

Skille to instrukcje dla agentów AI, definiowane w plikach SKILL.md _(z YAML frontmatterem: name, description)_.​ Ładowane są on-demand poprzez tool `skill` z lokalizacji repo/global (np. `.opencode/skills/<name>/SKILL.md`).

Agenci widzą listę tych instrukcji i **wybierają je po opisie**.​ Jest to istotne, ponieważ w przeciwieństwie do `AGENTS.md` nie ładują ich wszystkich jednocześnie, co nie zapycha tak kontekstu.

Umożliwiają spersonalizowane zadania _(np. git-workflow)_ z kontrolą uprawnień _(allow/deny/ask)_.

📚 Dokumentacja: [Agent Skills](https://opencode.ai/docs/skills/)

### Ewaluacja opisów skilli

Plugin [opencode-skill-creator](https://github.com/antongulin/opencode-skill-creator) przeprowadza skille przez ewaluację — tworzy testowe scenariusze sesji i sprawdza, czy skill został poprawnie wywołany przez agenta. Pozwala to na optymalizację pola `description`, na podstawie którego LLM podejmuje decyzję o wczytaniu danego skilli do bieżącego zadania.

**Jak z tego skorzystać?**

1. Do `opencode.json` dodaj plugin `opencode-skill-creator`.
2. Na czas ewaluacji ustaw w `opencode.json` domyślnego agenta jako `"default_agent": "build"` oraz model, który nie zużywa premium-requestów, np. `"model": "github-copilot/gpt-5-mini"`.
3. Uruchom OpenCode ponownie i w trybie Build wpisz prompt, np. `Przeprowadź ewaluację triggerowania skilli`.

Plugin stworzy wiele testowych sesji ewaluacyjnych, a na końcu wyświetli tabelę z wynikami oraz propozycją ulepszenia opisów skilli.

## Praca z Agentem

### Zarządzanie kontekstem i sesjami

- `/new` – nowa sesja
- `/sessions` – lista przeszłych sesji
- `opencode --continue` – wraca do ostatniej sesji
- `/undo` i `/redo` pozwalają cofnąć/ponowić zmiany
- `/compact` – kompresje aktualną sesję i uwalnia zajęty kontekst

### Plan & Build

OpenCode domyślnie ma wbudowane kilka komend i kilku agentów. Przed realizacją zadania najlepiej jest użyć agenta/trybu **Plan** _(tylko czytanie/analiza)_. Kiedy plan będzie gotowy, należy przejść do agenta/trybu **Build** _(pełne uprawnienia)_ i rozpocząć pracę z kodem.

Aby nie rozpocząć pracy z zapełnionym kontekstem po iteracjach planowania i analizy, można sforkować ostatnią, finalną wiadomość z planem lub rozkazać agentowi zapisać plan w katalogu projektu jako `*.md`, a następnie wczytać go w nowej sesji w trybie tworzenia.

Po realizacji zadania, warto skorzystać z komendy `/review`.

> [!NOTE]
> Domyślna konfiguracja dla programistów zakłada korzystanie z systemu kilku wyspecjalizowanych agentów **Weave**. Wtedy należy zawsze zaczynać z agentem _Loom_. Szczegóły w `CODING.md`.

## Pisanie promptów

### Dodaj pliki projektu do kontekstu

Zastanów się, jakie konkretnie pliki wymagają edycji przez agenta, lub na jakich może się wzorować, a następnie dodaj je do prompta (`@`). Przyspieszy to pracę agenta. Inaczej będzie musiał przeszukiwać bazę kodu i domyślać się, o jakie pliki chodziło.

### Nie dodawaj do kontekstu zbyt wielu plików

Dodaj tylko te pliki, które Twoim zdaniem wymagają edycji. Zbyt duża ilość nieistotnego kodu rozproszy i zdezorientuje model językowy.

### Obsługa obrazów

Można wrzucać screeshoty – OpenCode interpretuje je jako kontekst _(np. mockupy UI lub błędy)_.

### Określ precyzyjnie oczekiwany rezultat

⛔ „Napraw błąd w uwierzytelnianiu”
✅ „Napraw błąd wylogowywania, przez który użytkownicy są wylogowywani po 5 minutach nieaktywności. Sesja powinna być utrzymywana przez 24 godziny”.

### Podaj kontekst przed instrukcjami

⛔ „Dodaj obsługę błędów”
✅ „Ten punkt końcowy API obsługuje przetwarzanie płatności. Obecnie ulega awarii bez komunikatu w przypadku błędów sieciowych. Dodaj obsługę błędów, która rejestruje błąd, zwraca przyjazny dla użytkownika komunikat i uruchamia alert”.

### Uwzględnij kryteria akceptacji

⛔ „Spraw, żeby działało szybciej”
✅ „Zoptymalizuj zapytanie wyszukiwania. Kryteria sukcesu: czas zapytania poniżej 100 ms dla 10 tys. rekordów, brak zmian w dokładności wyników, przejście istniejących testów”.

### Określ ograniczenia wprost

⛔ „Zrefaktoryzuj ten kod”
✅ „Zrefaktoryzuj ten kod, aby używał wzorca repozytorium. Ograniczenia: nie zmieniaj publicznego API, zachowaj wsteczną kompatybilność, utrzymaj ten sam poziom pokrycia testami”.
