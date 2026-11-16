---
description: >-
  This repository uses Keploy. Record the real dependency calls (HTTP/gRPC APIs, databases, queues) a test suite makes, then replay them so the tests run offline with no infrastructure, and measure offline coverage; start with `keploy mock status`.
applyTo: '**'
---

# Keploy mocking: record real dependency calls once, replay them offline

Keploy records the real traffic between the code under test and everything it
talks to -- HTTP and gRPC APIs, Postgres, MySQL, MongoDB, Redis, Kafka and more
-- while the test suite runs, then replays it so the same suite runs with every
dependency switched off. There is no SDK and no code change: Keploy wraps the
SAME test command at the network layer.

Use it instead of hand-written stubs, mock servers (`nock`, `httptest`,
`unittest.mock`, WireMock) or invented JSON fixtures. A stub encodes what you
guessed the dependency does; a recording is what it actually did.

## Always start with `keploy mock status`

Run it from the repository root. It reads the repo -- the recordings, what each
one's last replay proved, the CI configs, the coverage -- and prints a NEXT block:

```
phase:    uninitialized | recorded | verified_red | verified_green | ci_wired
summary:  where things stand
ask:      a question for the developer
run:      the command to run on "yes"
do:       what you must do around that command
options:  the other sensible next steps
```

`verified_red` covers four different things, and the `summary` says which:
the tests failed, the replay could not run, or the suite runs offline but
either wrote no coverage report to check against the `--min-coverage` floor
the repo sets, or covers less than that floor. Only the first is a problem
with the code.

- Relay `ask` to the developer **verbatim and wait**. Do not answer it yourself.
- On yes, do `do`, run `run`, then run `keploy mock status` again. Loop until
  `phase: verified_green`, or `ci_wired` once CI replays every recording.
- `keploy mock status --json` prints the same plus every recording's state, for
  when you need the detail. Its `work` says what that call read of the
  repository, by reader: files and bytes read, YAML trees built and documents
  decoded. Judge what status costs by these counts, not by how long it took:
  they are the same on any machine at any load.

## Setting Keploy up in a repository

1. **Find the test command** the project really uses (`package.json` scripts,
   `go test ./...`, `pytest`, `mvn test`, `bundle exec rspec`...). Use it
   exactly; Keploy wraps it, it does not replace it.
2. **Bring up the real dependencies** the tests talk to (`docker compose up -d`,
   a local database...). A recording is only as real as what answered it.
3. **Record**: `keploy mock record --local -c "<test command>"`
   (`--name <set>` to keep separate suites apart; the default set is `default`).
   It writes `keploy/<set>/mocks.yaml`, and `keploy/<set>/last-record.yaml`
   holding the command, which `keploy mock status` replays the recording with.
4. **Prove it offline**: stop the dependencies, then
   `keploy mock replay --local -c "<test command>" --on-miss fail`.
   `--on-miss fail` turns any call the recording does not have into an error
   instead of a silent trip to the real service. A pass here is the proof.
   Keploy writes the verdict to `keploy/<set>/last-replay.yaml` (git-ignored);
   that is what `keploy mock status` reads.
5. **Measure it** -- see *Offline coverage* below.
6. **Wire CI** -- `keploy mock status` gives the exact job in its `do:` once the
   replay is green. Add it, then run `keploy mock status` again: it reads the CI
   config and moves to `ci_wired`.
7. **Commit** `keploy.yml`, `keploy/` and the CI file. Keep `keploy/.gitignore`
   exactly as the CLI wrote it.

### `--local` or the Keploy registry

- `--local` keeps the recording in the repository, committed like a VCR
  cassette. No account, and CI needs no secret. This is what `keploy mock
  status` suggests for a repo with no recording yet.
- Without `--local`, Keploy records through the developer's Keploy account: the
  recording is uploaded to the Keploy registry and `keploy/.gitignore` excludes
  `mocks.yaml`. CI then replays **without** `--local` and needs `KEPLOY_API_KEY`
  from a CI secret.
- Ask the developer the first time; don't choose for them. Afterwards keep each
  recording where it lives -- `keploy mock status --json` reports every
  recording's `storage` (`repo`, `registry`, or `local_only`, which means no
  clone and no CI runner can see it), and its `run` commands already carry the
  right flag.
- If Keploy says it is not signed in, sign in as *Signing in* below says: the
  developer approves in their own browser, and you relay what to approve.

## Signing in

Some Keploy commands need the developer's Keploy account. How to sign in
depends on which command says it is not signed in:

- **A `keploy k8s` command** prints a NEXT block whose `phase` is `k8s_auth`.
  Follow that block's own `run` -- `keploy k8s login`, then `keploy k8s login
  --finish` -- as its blocks say: it is a sign-in of its own, so do not start
  `keploy login` for it. Every `keploy k8s login` block has phase `k8s_auth`,
  "signed in" included: read its `summary`.
- **Any other command** exits **5** with `reason: auth_required` in its run
  result. Sign in with the split sign-in, which is made for an agent's shell:

1. Run `keploy login --no-wait --json`, and read its `phase`:
   - `auth_signed_in` (exit 0): already signed in (an API key, or a saved
     session). There is nothing to approve: go back to what you were doing.
   - `auth_pending` (exit 0): its `ask` names a page to open and a short code
     to enter there -- or, from an older api-server, a single link with no
     code. Relay the `ask` to the developer exactly as printed, and wait.
   - `auth_failed`: relay its `ask`, and run its `run` only if they say yes.
2. The developer opens the page in their own browser, checks the code, and
   approves. Never open the page, type the code or approve it for them, and
   never ask for a password or a token: the session reaches the CLI by itself.
3. Run the block's `run` exactly as printed -- `keploy login --finish --json`,
   with any flag the block adds -- and read its `phase`:
   - `auth_signed_in` (exit 0): signed in -- or nothing was waiting, and this
     machine is signed in already. Go back to what you were doing.
   - `auth_pending` (exit 5): not approved yet. Ask the developer, then run it
     again; the code works until it expires. Its `options` offer to discard it
     and make a new one.
   - `auth_failed`: denied, expired or spent, or nothing was waiting. Tell the
     developer, and run its `run` for a new sign-in if they want one.

Do not run a plain `keploy login` from your shell: it waits for an approval at
a terminal. Without one it is refused at once (exit 5) in CI and in Claude
Code's shell, and anywhere else waits up to 3 minutes and gives up. In CI
nobody can approve a sign-in: the job needs `KEPLOY_API_KEY` from a CI secret.

Exit codes of `keploy login --no-wait` and `--finish`: **0** done -- signed
in, or a sign-in started; **5** not signed in yet (`auth_required`): a sign-in
still waiting for its approval or one that ended without a session, or a
refused API key; **8** a command line Keploy does not accept; **1** anything
else -- Keploy's server could not be reached, say,
or this machine signs in through the k8s-proxy (the block's `run` then adds
`--k8s-proxy-auth=false`). A run cut short (Ctrl-C) records `interrupted` in
its run result instead. Elsewhere a wrapped test command's own exit code
passes through unchanged; the run result's `reason` tells them apart.

## Offline coverage: the score

Offline coverage is the share of the code the test suite exercises **with every
dependency replayed by Keploy** -- the runner's own coverage number, measured in
a replay that proved nothing live was reached. It is what `keploy mock status`
reports, and what to push toward 100%.

Keploy reads the coverage report the test command writes during the replay:

| Stack | Make the test command write a report |
|---|---|
| Go | `go test -coverprofile=coverage.out ./...` |
| Python | `pytest --cov=<package> --cov-report=xml` |
| JavaScript / TypeScript | `jest --coverage`, `vitest run --coverage`, or `c8 --reporter=lcov` |
| Java | the JaCoCo `report` goal (`target/site/jacoco/jacoco.xml`) |
| anything else | pass `--coverage-report <path>` |

Only a report the replay itself wrote counts; a leftover from an earlier run is
ignored. **Gate on it** so it can only go up:
`keploy mock replay ... --on-miss fail --min-coverage <n>` fails when the suite
covers less than `n` percent, and also fails when no report was written -- a
floor that passes whenever it cannot measure is not a floor. Commit the floor as
`mock.minCoverage` in `keploy.yml`, or pass the flag in CI.

To raise it: write tests for the uncovered code, record their dependency calls
against the real services (without `KEPLOY_PROVEN=1`, re-recording overwrites
the set in place, so record the whole suite; with it, a record commits test by
test and keeps the tests it did not run), replay, and raise the floor to the
new number.

## Regression testing with it, every day

- After changing code: `keploy mock replay --local -c "<test command>" --on-miss fail`.
  The whole network-heavy suite runs in isolation, in seconds, with nothing up.
- `no recorded mock matched an outgoing call` means the code now makes a call
  the recording does not have. If a deliberate change added it, re-record
  against the real dependencies, or append just the new calls with
  `--on-miss record` (dependencies up). If no change explains it, that call IS
  the regression -- surface it.
- A test assertion that fails while every call matched is a regression in the
  code. Fix the code.
- **Never** edit `mocks.yaml` by hand, and never switch to `--on-miss
  passthrough`, to make a red replay green. The edits a set's `README.md`
  lists (under the proven switch, below) are another matter: they change what
  keploy ignores or skips, and keploy says what each did.
- A new test that talks to a dependency: record it, don't stub it. A hand-written
  stub already in the suite: replace it with a recording.
- `--strict` fails a replay when a call missed its recorded mock (a DNS lookup,
  or a connection that sent nothing, does not count), or when keploy could not
  read the miss list or whether the agent tracked every process the test
  command ran. Use it on native Linux CI runners.

## Under the proven switch (`KEPLOY_PROVEN=1`): a set's verdicts

With `KEPLOY_PROVEN=1`, `keploy mock record` records the suite against the real
dependencies (the record round), then judges it: it replays every test in the
full round, where it learns what varies between runs, and again in CI's shape
in the confirming round. Each test is kept, or quarantined in
`keploy/<set>/verdicts.yaml`, which `keploy mock replay` reads: a quarantined
test is skipped with keploy's reason. It runs on Linux only for now.

- **Read `keploy/<set>/README.md` first, when the set has one.** keploy writes
  it on each record: what each file is, the edits that are safe and what each
  does, and what keploy cannot do yet. keploy rewrites it, so keep
  no notes there, and needs none of it to work: `keploy mock explain --local`
  and `keploy mock check --local` read the set's files themselves.
- **An entry says why and what to do.** Each test's entry has `class` and
  `reason`, then `why` (the evidence, naming the calls or mocks) and `fix` (what
  to do), in keploy's words. Act on `fix`; never edit `why` or `fix`, which
  keploy rewrites. `keploy mock explain --local <test id or name>` (`--json` for data) says it
  all for one test: whether it runs, its evidence resolved to the recorded
  calls in `mocks.yaml`, what the set's last replay did with it (whether it ran
  it, and the calls that had no recorded answer), what each judging round of
  the last record did with it (the learn step's reason on each call it
  missed, and the file the round's output is in), and the lines of its entry
  to delete to run it again.
- **An entry holds for one recording** (`rec`). Any change to the test's mocks,
  by a record or by hand, makes it stop applying: the test runs, and the next
  record drops the entry and says so.
- **The record says what it decided**: `QUARANTINED` with the why, one `FIX` per
  class and reason, `RUNS AGAIN` for a test that replays now, and `DROPPED` for
  an entry that no longer applies (with the command that quarantines the test
  again, for one set by hand). Of each hand edit since the record before, a
  test's recording or the start-up, it says `EDIT KEPT` or `EDIT REPLACED`.
  Relay these lines to the developer.
- `keploy mock quarantine <test id> --reason "<why>"` sets a test aside by hand
  while it is being fixed; deleting its entry brings it back. `keploy mock
  judge` decides again on the recording as it is.
- **After any hand edit, run `keploy mock check --local`** (`--json` to read it as
  data). It reads the files as a replay does, offline, and names each mistake
  with its file, line and fix -- a document of `mocks.yaml` keploy cannot read, a
  mock name `mappings.yaml` names that `mocks.yaml` lacks, an entry the edit made
  stop applying -- and exits 1 on an error. Like `keploy mock replay`, check and
  explain read `keploy/<set>/` on disk only with `--local` (or keploy.yml's
  `mock.local: true`); without it they read what `keploy.lock` pins, and refuse
  where there is none.
- **In a project `keploy.lock` pins** (it sits next to `keploy.yml`, or
  `--lock` names it), the recordings are on Keploy Cloud and the skips are
  the lock's `skip:` lines, one under the test's entry, holding only for the
  digest that entry names. No replay or judge reads `verdicts.yaml` there
  (only a set's first locked record reads it, to carry its entries over as
  skip lines): the record,
  `keploy mock judge` and `keploy mock quarantine` write the skip lines, and the
  record's `RUNS AGAIN` and `DROPPED` lines name `keploy.lock`. Never edit a
  digest: replay refuses one it cannot verify. To skip a test, quarantine it;
  to run it again, `keploy mock quarantine --undo <test id>`; a new recording
  of the test runs it again too. `keploy mock explain` and `keploy mock check`
  read the lock: whether the test runs or which skip line skips it, and the
  skip lines that skip nothing. Any `keploy/<set>/` copy or `verdicts.yaml`
  git still tracks is ignored, and they say so. `keploy mock status` names the
  skips too. Commit `keploy.lock` with the change.
- **What a locked replay downloads.** `keploy mock replay` fetches only the
  recordings of the tests it runs, plus each set's start-up: not those of
  tests a skip line skips (unless `--all`), nor of tests a `-- -run` of whole
  tests leaves out. One exception: a partial record (`-- -run`) keeps its
  set's start-up, which holds each test's config and connection mocks as the
  last whole record pinned them, so a test re-recorded by a partial record
  since is fetched whole when left out, until a whole record of its set
  records it again. Its `pulled set` line counts each kind. Recordings are
  named by their sha256, so each one fetched is kept in a local cache and is
  never downloaded again: `keploy/mocks` in the user's cache folder
  (`~/.cache/keploy/mocks` on Linux; under sudo, the invoking user's), or
  `KEPLOY_MOCK_CACHE_DIR`. Each copy is checked against its hash when read; a
  copy that fails is fetched again. Each locked pull trims the cache to
  `KEPLOY_MOCK_CACHE_MB` (2048 by default), least recently used first, and
  removes only the files it wrote; `0` turns it off. In CI, cache the
  `keploy/mocks` folder itself (`~/.cache/keploy/mocks`, or your
  `KEPLOY_MOCK_CACHE_DIR`), keyed on `keploy.lock`'s hash, restoring the
  latest cache when there is no exact hit (GitHub's `restore-keys`): copies
  are named by their hash, so an older cache is always safe to start from.
  Never cache a parent such as `~/.cache`. A cache on a full disk never fails
  a pull by itself: the pull fetches into a temporary folder of its own
  (`TMPDIR`) and warns once. A pull fails only if `TMPDIR` cannot be written
  either, as on a one-disk machine whose disk is full.

## Per-test isolation (optional wiring)

By default a replay serves the whole recording to the whole suite. To give each
test only its own calls, have the runner mark test boundaries through the scope
API, and run the tests one at a time: `go test -p 1 -parallel 1`, Playwright
`--workers=1`, jest `--runInBand`, pytest without `-n`. Keploy does not keep
tests that run at the same time apart. Keploy exports its address into the
test command as `KEPLOY_MOCK_AGENT`, and the credential for it as
`KEPLOY_MOCK_AGENT_TOKEN`:

```
POST {KEPLOY_MOCK_AGENT}/agent/scope/begin  {"name": "<test>"}
POST {KEPLOY_MOCK_AGENT}/agent/scope/end    {"name": "<test>"}
Authorization: Bearer {KEPLOY_MOCK_AGENT_TOKEN}
```

Send that header on both calls whenever `KEPLOY_MOCK_AGENT_TOKEN` is set.
Without it the agent answers `401` and the test is not scoped, yet the run still
passes, with only a warning in Keploy's output to say why. Leave the header off
when the variable is not set: an older Keploy neither exports nor checks it. A
runner inside a container needs both variables passed in (`docker run -e
KEPLOY_MOCK_AGENT -e KEPLOY_MOCK_AGENT_TOKEN`, or both under the compose
service's `environment:`).

Add the test process's PID to both calls (`"pid": <test process pid>`: Node
`process.pid`, Python `os.getpid()`, Go `os.Getpid()`) only when the test
process starts the app itself and marks the suite and every app start (below):
Keploy reads from it which test started an app. Otherwise leave `pid` out.
A replay of a recording made with neither the suite mark nor an app-start mark
refuses a begin with a pid: `422`, naming the test, with the two ways out (add
the marks, or send no pid and run the tests one at a time). There a connection
the app opened outside a test, such as a pooled database connection opened at
start-up or between two tests, would be served every test's mocks. The test
fails, and `keploy mock replay` exits non-zero with an ERROR naming it, even
when the harness ignores the `422` and runs the test. With the marks, an app
the tests share but did not start, such as Playwright's `webServer` or a
server started before the suite, is served the open test's mocks while one
test is open, and its calls are refused while more than one is. A begin
without a pid narrows what the whole run is served to that test's calls, on
every connection. The pid does not keep tests that run at the same time
apart. At record, a call made by any other process (a child the test starts,
an app server the tests share) goes to whichever test was open when it was
made. A recording made this way has
`perTest: true` in `keploy mock status --json`. `perTest: false` after wiring
the calls means none of them took effect: check what they got back, for a
`401` first.

### Mark the suite and every app start

When the tests start the app themselves (end-to-end suites), Keploy gives every
app start its own start-up mocks: the calls the app makes while it boots are
served back only to that same start, never to another package's app or to a
restart. For that it needs two more calls.

**Suite marks.** Around the code that sets up a whole test package or session
(Go `TestMain`, a pytest session fixture, jest `globalSetup`), send a begin
before the app is started and an end after it is stopped, with the folder the
tests run in:

```
POST {KEPLOY_MOCK_AGENT}/agent/scope/begin  {"name": "<folder>", "pid": <test process pid>, "dir": "<folder>", "suite": true}
POST {KEPLOY_MOCK_AGENT}/agent/scope/end    {"name": "<folder>", "pid": <test process pid>, "dir": "<folder>", "suite": true}
```

Send `dir` (the test process's working folder) on every test's begin and end
as well. Keploy names each recorded set by this folder, relative to the git
root (`e2e/orders`); `keploy.yml` never decides it.

**App starts.** Find **every** function that starts or restarts the app --
`TestMain` or other package setup, a shared test helper, a restart helper, a
fixture -- and add one call right after the app is ready to serve:

```
POST {KEPLOY_MOCK_AGENT}/agent/app/start  {"port": <port the app listens on>, "pid": <the app's pid>}
Authorization: Bearer {KEPLOY_MOCK_AGENT_TOKEN}
```

`pid` is required and is the started app's own process id. Send these calls
only when `KEPLOY_MOCK_AGENT` is set, with the same header rule as the other
scope calls, and never fail the test when one is refused. A start that calls a
library to restart the app (a container restart, a supervisor) needs the same
call after that library returns. Run test packages one at a time
(`go test -p 1`); packages running at the same time cannot be told apart.

### Under the proven switch (`KEPLOY_PROVEN=1`)

Everything above is for runs without `KEPLOY_PROVEN=1`. Under it Keploy refuses
these calls (`422 upgrade_integration`): there a test marks its boundaries
through Keploy's scope protocol v1, which two integrations speak: go-sdk's
`keploytest` for `go test` (`go test -p 1`), and `@keploy/playwright` for
Playwright (`--workers=1 --retries=0`). Keploy runs one test process at a time
there and refuses a second. There is no integration for other frameworks: their
test process makes the calls by hand. It claims the run
(`POST {KEPLOY_MOCK_AGENT}/agent/instance` with `{"key": "<package folder>"}`,
the folder relative to the project) before its first test, then sends
each test's begin with `"canSkip": true`, skips the test when the begin answers
`"action": "skip"`, and sends its end, never with `pid`, `at`, `dir` or `suite`.

## Platform notes

- **Linux**: Keploy uses eBPF, so its agent runs as root: unless Keploy is
  itself run as root, it starts the agent with `sudo`. Where nobody is there to
  type a password -- your own shell, a CI runner -- that sudo has to work
  without one, as it does on GitHub-hosted runners. Capabilities granted to the
  binary with `setcap` do not remove the sudo, so do not ask the developer for
  them.
- **macOS**: a native command records directly on current Keploy builds
  (without `KEPLOY_PROVEN=1`, which runs on Linux only for now).
  Keploy also follows `npm`, `npx` and `pnpm` into the Node programs they
  start by name (jest, vitest, mocha), so `npm test` records too. It does not
  follow `yarn` or `make`, a package manager run through volta, or a native
  program a package script starts, among others, and warns before such a run
  that it may record nothing. After that warning, run what the launcher runs
  directly instead: the recipe's own command rather than `make test`, or the
  runner's own script through its interpreter rather than `yarn test` --
  `node node_modules/jest/bin/jest.js`, the path being the `bin` entry in the
  runner's `package.json`. Or run the tests in a container, which also works
  under Yarn Plug'n'Play, where there is no `node_modules`:
  `keploy mock record -c "docker compose run --rm tests" --container-name tests`.
- **docker compose**: a replay is proven as a native one is. The agent hands
  over which calls it served and missed as compose stops it, so `keploy mock
  status` reports the isolation as proven, and `--strict` works there too.

## When Keploy itself gets in your way

If a flag does not exist, a platform will not record, or a recording will not
match, **report it instead of working around it**: open
https://github.com/keploy/keploy/issues/new with the command you ran, the
platform and `keploy --version`. Do not quietly fall back to hand-written stubs
because Keploy failed -- that is the outcome Keploy exists to prevent.
