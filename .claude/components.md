# Component Inventory

## UI primitives — `src/components/ui/`

Basati su shadcn/ui + Radix UI. Usare named imports. Non modificare direttamente, aggiornare via shadcn CLI se necessario.

`badge` `button` `card` `checkbox` `dialog` `dropdown-menu` `input` `label` `pagination` `popover` `radio-group` `select` `separator` `skeleton` `sonner` (toast) `table` `tabs` `textarea` `tooltip`

---

## Custom components

### Shared
| Componente | Path | Descrizione |
|---|---|---|
| `BrandPicker` | `src/components/BrandPicker.tsx` | Dropdown selezione brand attivo |

### Questions — `src/components/questions/`
| Componente | Descrizione |
|---|---|
| `QuestionsListPage` | Pagina lista con tab navigation (approved/to_approve/rejected) |
| `QuestionsListTable` | Tabella domande con azioni riga |
| `QuestionsListFilters` | Filtri materia/argomento/search |
| `QuestionsListPagination` | Controlli paginazione |
| `QuestionCreatePage` | Full page per creazione/editing domanda |
| `QuestionTypeSelector` | Radio tipo (completamento/risposta_chiusa) |
| `DifficultySelector` | Select difficoltà |
| `HierarchySelector` | Cascading materia → argomento → sottoArgomento |
| `AlternativeItem` | Singola alternativa (testo + flag corretto) |
| `AlternativesList` | Lista alternative con add/remove |
| `QuestionContentEditor` | Textarea testo domanda |
| `QuestionFormActions` | Pulsanti Save/Cancel |
| `CopyableId` | Display ID con copy-to-clipboard |
| `AutosaveIndicator` | Indicatore stato salvataggio |
| `QuestionsViewDialog` | Modal dettaglio domanda |
| `QuestionsDeleteDialog` | Confirm delete singolo |
| `QuestionsBulkDeleteDialog` | Confirm bulk delete |
| `QuestionsExportDialog` | Export domande selezionate |
| `QuestionsListRowActions` | Menu azioni riga (view/edit/delete) |
| `ReviewerAssignDialog` | Assegna reviewer a domanda |

### Clients — `src/components/clients/`
| Componente | Descrizione |
|---|---|
| `ClientsPage` | Pagina lista clienti |
| `ClientsTable` | Tabella clienti |
| `ClientsFilters` | Search/filtri |
| `ClientsPagination` | Paginazione |
| `ClientsRowActions` | Menu azioni (impersonate, ordini, delete) |
| `ClientsDeleteDialog` | Confirm delete |
| `ClientsOrdersDialog` | Modal moduli/ordini cliente |
| `ClientsPromoteDialog` | Promuovi a staff — **disabilitato** |

### Staff — `src/components/staff/`
| Componente | Descrizione |
|---|---|
| `StaffPage` | Pagina lista staff |
| `StaffTable` | Tabella staff |
| `StaffFilters` | Search + filtro ruolo |
| `StaffPagination` | Paginazione |
| `StaffRowActions` | Menu azioni |
| `StaffChangeRoleDialog` | Cambio ruolo — **disabilitato** |

### Rich Editor — `src/components/rich-editor/`
Editor custom per contenuti rich (domande con formule LaTeX, tabelle, elenchi).

| File | Descrizione |
|---|---|
| `RichContentEditor.tsx` | Componente principale |
| `EditorToolbar.tsx` | Toolbar formattazione |
| `CustomCommandsPalette.tsx` | Slash commands (`/`) |
| `LatexPreview.tsx` | Preview equazioni KaTeX |
| `MathKeyboard.tsx` | Tastiera virtuale simboli matematici |
| `TableConfigDialog.tsx` | Dialog inserimento tabella |
| `latex-utils.ts` | Rendering KaTeX |
| `constants.ts` | Costanti editor |

---

## Custom Hooks — `src/lib/hooks/`

| Hook | Descrizione |
|---|---|
| `useStaffList(query)` | Lista staff con paginazione/search |
| `useClientsList(query)` | Lista clienti con paginazione/search |
| `useClientOrders(clientId)` | Moduli/ordini di un cliente |
| `useQuestionsList(query)` | Lista domande con filtri e tab |
| `useHierarchy()` | Materie/argomenti/sottoArgomenti con caching |
| `useQuestionForm(questionId?)` | State form domanda (validation, autosave, dirty tracking) |
| `useReviewerList()` | Lista staff con ruolo 'revisore' |
| `useBulkSelection(items)` | State selezione bulk + select-all |
| `useInsertSnippet()` | Inserimento snippet in editor |
