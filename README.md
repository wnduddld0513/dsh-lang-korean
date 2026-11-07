# dsh-lang-korean

DeepSeek Harness 한국어 언어팩입니다. 공식 로캘 API(`ctx.locale.addLanguage`, `ctx.locale.register(ns, 'ko', dict)`)로 한국어를 등록하며, 설치본 파일은 건드리지 않습니다.

## 사용

사이드바 **플러그인** 페이지에서 이 번들의 설정을 열어 언어팩을 켜고 끕니다.

| 언어팩 | 설정 필드 | 기본 동작 | 범위 |
|---|---|---|---|
| DeepSeek Harness 한글화 | `lang-korean.dsh` | 켜짐 | 공식 패키지의 화면 문구 사전 전체, 내장 플러그인 이름·설명 |
| better-dsh-session-deletetool 한글화 | `lang-korean.sessionDelete` | 해당 번들이 켜져 있으면 켜짐 | 로캘 사전 |
| dsh-claude-style 한글화 | `lang-korean.claudeStyle` | 해당 번들이 켜져 있으면 켜짐 | `{ zh, en }` 인라인 문구, 패키지 설명. 이름은 그대로 둡니다. |
| dsh-skills-manager 한글화 | `lang-korean.skillsManager` | 해당 번들이 켜져 있으면 켜짐 | 로캘 사전, 패키지 설명. 자체 업데이트 위젯 문구는 사전을 쓰지 않아 제외됩니다. |

플러그인 언어팩은 설정값이 비어 있으면 플러그인 관리자의 번들 목록(`pluginManager.listBundles`)을 따라갑니다. 해당 번들이 켜져 있고 오류 없이 설치돼 있으면 자동으로 켜지며, 번들을 설치하거나 켜고 끌 때마다 다시 판단합니다. 스위치를 직접 켜거나 끄면 그 값이 저장되고, 이후로는 자동 판단 대신 저장된 값을 따릅니다.

플러그인 번역은 플러그인이 업데이트돼도 깨지지 않습니다. 사전형 플러그인은 같은 네임스페이스·키로 한국어를 등록하므로 새 키나 바뀐 키는 영어로 나옵니다. `dsh-claude-style`은 로캘 레지스트리 대신 문구 객체에서 `entry[활성 언어]`를 직접 읽습니다. 그래서 이 언어팩이 켜진 동안은 `ko` 접근자를 둡니다. 이 접근자는 `zh`와 `en`을 자체 문자열 속성으로 가진 객체에 한해, 영어 원문에 해당하는 번역을 돌려줍니다. 원문이 바뀐 문구는 영어로 남습니다.

스위치를 켜면 사전 청크(`lib/client.dsh-ko.js`)를 불러온 뒤 한국어로 전환합니다. 끄면 모든 등록을 해제하고, 일반 → 언어에서 고른 언어로 돌아갑니다. 설정값은 프로필의 `cordis.patch.yml`에 저장됩니다.

다른 플러그인이 이미 `ko` 언어를 등록해 두었다면 정의를 중복 등록하지 않고 사전만 추가합니다. 그 플러그인이 언로드되면 이 플러그인이 정의를 넘겨받습니다.

## 요구 사항

- DeepSeek Harness 데스크톱 앱. 함께 설치되는 `dsh` CLI로 플러그인을 추가합니다. 웹 클라이언트가 있는 프로필이면 CLI만으로도 동작합니다.
- 빌드 도구는 필요 없습니다. 번역 청크(`lib/client.*-ko.js`)가 저장소에 들어 있습니다.
- 설치 명령의 `--profile` 값은 `%USERPROFILE%\.dsh\profiles\<이름>`(macOS·Linux는 `~/.dsh/profiles/<이름>`) 아래 폴더 이름입니다. 데스크톱 앱을 처음 쓰면 `desktop`입니다.

## 설치

### GitHub에서 설치

```
dsh plugin --profile desktop add github:wnduddld0513/dsh-lang-korean
```

### 로컬 사본에서 설치

코드를 고쳐 쓰거나 번역을 직접 손볼 때 씁니다. 링크 설치라 파일을 고치고 앱만 다시 시작하면 반영됩니다.

```
git clone https://github.com/wnduddld0513/dsh-lang-korean
dsh plugin --profile desktop add link:<클론한 디렉터리의 절대 경로>
```

### 플러그인 페이지에서 설치

사이드바 **플러그인** → **플러그인 추가**에 `https://github.com/wnduddld0513/dsh-lang-korean` 또는 로컬 경로를 넣어도 됩니다.

### 설치 후

1. DeepSeek Harness를 다시 시작합니다.
2. 사이드바 **플러그인**에서 `dsh-lang-korean` 번들이 켜져 있는지 확인합니다. 꺼져 있으면 켭니다.
3. 같은 항목의 설정을 열고 **DeepSeek Harness 한글화** 스위치를 켭니다. 켜는 순간 화면이 한국어로 바뀝니다.
4. 계속 한국어로 쓰려면 설정 → 일반 → 언어에서 `한국어`를 고릅니다. 앱을 다시 시작해도 유지됩니다.

지원 플러그인 언어팩은 해당 플러그인이 켜져 있으면 자동으로 켜집니다.

### 업데이트

```
dsh plugin --profile desktop remove dsh-lang-korean
dsh plugin --profile desktop add github:wnduddld0513/dsh-lang-korean
```

git 의존성은 설치 시점의 커밋에 고정됩니다. 그래서 위처럼 지웠다가 다시 넣으면 최신 커밋을 받습니다. 링크 설치였다면 `git pull` 후 앱만 다시 시작하면 됩니다.

### 제거

```
dsh plugin --profile desktop remove dsh-lang-korean
```

## 알려진 제한

- `dsh-claude-style`의 권한 선택기(다시 그리기)는 이름과 설명을 플러그인 코드에 중국어로 고정해 두고, 공식 사전은 활성 언어가 `zh`일 때만 읽습니다. 그래서 Full access 아래 설명 등은 한국어로 나오지 않습니다. 이 언어팩은 그 문자열을 건드리지 않습니다.
- `dsh-skills-manager`의 자체 업데이트 안내 22개, `better-dsh-session-deletetool`의 중국어 툴팁 3개는 사전을 거치지 않아 번역에서 빠졌습니다.
- `dsh-purge-community`도 `ko` 언어를 등록합니다. 그 플러그인이 나중에 로드되면 중복 등록으로 오류가 날 수 있습니다.
- `dsh-claude-style`·`dsh-skills-manager` 언어팩을 켜 둔 동안은 앱 전체의 `{ zh, en }` 문구 객체에 `ko` 접근자가 붙습니다. `'ko' in 객체`로 판정하는 다른 코드가 있으면 그동안 결과가 달라질 수 있습니다.

## 번역 갱신

DeepSeek Harness나 지원 플러그인을 업데이트한 뒤 다음 순서로 진행합니다. `i18n/`과 `scripts/`는 설치본에 포함되지 않으므로, 저장소를 `git clone`한 사본에서 실행합니다.

1. `node scripts/extract.mjs` — 설치본의 ja/en 원문을 `i18n/dsh/source.json`에 다시 기록합니다. 사전 등록에 잡히지 않은 일본어 문자열이 있으면 경고로 표시합니다.
2. `node scripts/extract-plugins.mjs` — 프로필(`~/.dsh/profiles/desktop/node_modules`)에 설치된 지원 플러그인의 영어 원문을 `i18n/<언어팩>/source.json`에 다시 기록합니다.
3. 각 `i18n/<언어팩>/ko.json`을 갱신합니다. `ui`는 네임스페이스 → 키 → 번역, `packageText`는 일본어 원문 → 번역, `englishText`는 영어 원문 → 번역입니다.
4. `node scripts/build.mjs` — 언어팩마다 `lib/client.<언어팩>-ko.js`를 생성합니다. `{placeholder}` 불일치나 U+200B/U+FEFF가 있으면 실패합니다. 번역이 빠진 항목과 원문에서 사라진 항목은 경고로만 표시하며, 빠진 항목은 화면에 영어로 나옵니다.

## 언어팩 추가

다음 네 단계를 거치면 해당 그룹 아래에 별도 스위치로 붙습니다.

1. `lib/client.js`의 `PACKS`에 항목(그룹, 청크, 그리고 기본값 또는 따라갈 번들 이름)을 추가합니다. 플러그인 그룹은 패키지 이름 순서로 둡니다.
2. `index.js`의 `Config`에 필드를 추가합니다. 번들을 따라가는 언어팩은 기본값 없이 둡니다.
3. 플러그인이면 `scripts/extract-plugins.mjs`의 `PLUGINS`에 추가합니다.
4. 같은 이름의 `i18n/<언어팩>/` 디렉터리를 만듭니다.

## 라이선스

MIT. 자세한 내용은 `LICENSE`를 참고하세요. 번역 대상 문구의 원문 권리는 각 원저작자에게 있습니다.
