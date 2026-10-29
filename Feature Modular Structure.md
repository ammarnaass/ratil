---
name: feature-modular-structure
description: Enforces a professional, modular file structure whenever a new feature, module, screen, page, component, API, or service is created in a software project. Splits the feature into small, single-responsibility files organized in a dedicated feature folder instead of one big file. Use this skill whenever the user asks to add, create, build, implement, or scaffold any feature (login, cart, profile, payments, dashboard, notifications, CRUD, etc.), even if they do not mention structure, folders, or clean code. Also use when refactoring a large file into smaller ones. Trigger on Arabic requests too, such as "أضف ميزة" or "أنشئ ميزة" or "اعمل feature" or "قسّم الملفات".
---

# Feature Modular Structure

Every feature lives in its own folder and is split into small files, each with ONE clear responsibility. Never put a whole feature in a single file.

## Core rules

1. **One feature = one folder.** All code of the feature lives together (colocation). Nothing about the feature is scattered across unrelated folders, except truly shared code.
2. **One file = one responsibility.** If you can't describe a file's job in one short sentence, split it.
3. **Size limits.** Aim for files under ~150 lines. Over 250 lines, split it. Functions under ~40 lines.
4. **Layers don't leak.** UI never talks to the network directly. Data access never contains UI logic. Business rules never live in UI components.
5. **Public API via an index file.** The rest of the app imports from the feature's entry point only, never from its internal files.
6. **Shared code goes in `shared/`.** If two or more features need it, move it to shared. Features never import from each other's internals.
7. **Follow the existing project first.** Before creating anything, inspect the project's stack, folder layout, naming conventions, and lint/format config, and adapt to them. Use the generic layout below only when the project has no convention.

## Workflow

1. **Inspect** the project: language/framework, existing feature folders, naming style (kebab-case, camelCase, PascalCase), test setup.
2. **Plan** the file list before writing code. Briefly show the user the tree you are about to create.
3. **Create** the folder and small files, one responsibility each.
4. **Wire** everything through the feature's index/entry file and register it (routes, DI container, store, etc.) in the one place the project expects.
5. **Verify**: no circular imports, no file over the limits, naming consistent, imports use the entry point.
6. **Summarize** what was created in a short tree with one line per file.

## Generic layout (use when the project has no convention)

```
features/
└── <feature-name>/
    ├── index.<ext>            # Public API: the only file others import
    ├── components/            # UI pieces (small, presentational)
    │   ├── <Feature>Form.<ext>
    │   └── <Feature>List.<ext>
    ├── pages/ (or screens/)   # Route-level composition only
    ├── hooks/ (or controllers/)   # State + UI logic
    ├── services/ (or api/)    # Network / data-source calls
    ├── repositories/          # Optional: data access abstraction
    ├── models/ (or types/)    # Entities, DTOs, interfaces
    ├── utils/                 # Pure helpers specific to this feature
    ├── constants/             # Keys, enums, config values
    ├── validators/            # Validation schemas / rules
    ├── tests/                 # Mirrors the structure above
    └── README.md              # Optional: 5-10 lines on the feature
```

Only create the folders the feature actually needs. Do not create empty folders or placeholder files.

## Responsibilities per file type

| Type | Does | Never does |
|---|---|---|
| Component / Widget | Renders UI from props | Fetches data, holds business rules |
| Page / Screen | Composes components, connects to hooks | Contains heavy logic or styling details |
| Hook / Controller / ViewModel | Manages state and UI logic, calls services | Renders UI, builds HTTP requests |
| Service / API | Talks to server or storage | Touches UI or state |
| Model / Type | Describes data shape | Contains side effects |
| Validator | Validates input | Mutates data |
| Util | Pure function, no side effects | Depends on feature state |
| Constants | Holds fixed values | Contains logic |

## Mapping to common stacks

Adapt the generic layout to the stack:

- **React / Next.js / Vue:** `components/`, `hooks/` (or `composables/`), `services/`, `types/`, `index.ts`. One component per file, styles beside the component.
- **Flutter:** `data/` (models, datasources, repositories), `domain/` (entities, usecases), `presentation/` (pages, widgets, controllers/bloc). One widget per file.
- **Node / Express / NestJS:** `controller`, `service`, `repository`, `dto/`, `entity`, `routes`, `validation`. Controller only handles HTTP; service holds business rules.
- **Laravel:** Controller, FormRequest, Service, Repository, Model, Resource, Policy, each in its own file.
- **Django:** `models.py`, `serializers.py`, `views.py`, `urls.py`, `services.py`, `selectors.py`, `tests/` split into modules once they grow.
- **Android (Kotlin) / iOS (Swift):** feature package with `ui/`, `viewmodel/`, `data/`, `domain/`, one class per file.

## Naming conventions

- Folder names: lowercase, descriptive, by feature not by type at the top level (`features/auth`, not `controllers/auth-stuff`).
- File names reveal responsibility: `login-form`, `auth.service`, `user.model`, `use-login` (match the project's casing style).
- No vague names: avoid `helpers`, `misc`, `common2`, `temp`, `utils2`.
- One exported main thing per file, and the file name matches it.

## Splitting an existing large file

When asked to refactor or when a file is too big:

1. Identify the distinct responsibilities (UI, state, data, types, helpers).
2. Extract the lowest-level pieces first (types, constants, pure helpers), then services, then logic, then UI.
3. Keep behavior identical. Do not change logic while moving it.
4. Update imports and re-export through the entry file.
5. Run the existing tests or build to confirm nothing broke.

## Quality checklist (run before finishing)

- [ ] Feature has its own folder with a clear entry file
- [ ] Every file has a single responsibility
- [ ] No file exceeds ~250 lines
- [ ] No UI code inside services, no network code inside components
- [ ] Types/models and constants are separated from logic
- [ ] Other parts of the app import only from the entry file
- [ ] No circular dependencies, no duplicated code that belongs in `shared/`
- [ ] Naming matches the project's existing conventions
- [ ] Tests (if the project has them) are placed in the matching structure

## Output format when answering

1. A short tree of the files created.
2. The code of each file, in its own code block with the file path above it.
3. One line per file explaining its role.
4. Any registration step (route, store, module) the user must know about.

## Example

Request: "Add a login feature."

```
features/auth/
├── index.ts
├── components/
│   ├── LoginForm.tsx
│   └── PasswordInput.tsx
├── pages/
│   └── LoginPage.tsx
├── hooks/
│   └── useLogin.ts
├── services/
│   └── auth.service.ts
├── validators/
│   └── login.schema.ts
├── types/
│   └── auth.types.ts
├── constants/
│   └── auth.constants.ts
└── tests/
    └── useLogin.test.ts
```

Not one `Login.tsx` containing the form, validation, API call, and types together.
