# Attendance test data guide

This project contains 28 Playwright cases in `tests/attendance.spec.js`. Playwright reads the project `.env` from a path relative to `playwright.config.js`; the operating-system environment can still override `.env` values. The example file is safe to copy and contains no login credentials.

## Current project state

- The current `.env` already has `BASE_URL`, `RUN_ATTENDANCE_MUTATIONS=true`, and `ATTENDANCE_ALLOW_CLOCK_ACTIONS=true`. Those values were preserved.
- No attendance fixture values were present when this guide was prepared. Empty fixture entries are intentional: a name in `.env` cannot create or prove that a matching Horilla record exists.
- One saved storage state exists at `playwright/.auth/user.json`. Its Employee/Manager/Admin role has not been verified. The file is ignored by Git and should stay local.
- There is no Horilla application source in this workspace. The public Horilla 2.3.0 release notes deprecate Daily Work Status and say Day-wise summary replaces it. TC15–TC17 therefore remain explicitly N/A until a replacement route and UI are verified in the demo. Do not map them to Monthly Summary by assumption. [Horilla 2.3.0 release notes](https://github.com/horilla/horilla-hr/releases/tag/2.3.0)

## Environment variables

For record text, copy a unique substring from the real row shown in Horilla. Do not invent a value to make `requireEnv()` pass. Where a record has a supported note/name field, use an `AUTO_TC##_...` prefix; do not rename demo employees or change their permissions.

| Variable | Type | Test case(s) | Required value / meaning |
|---|---|---|---|
| `BASE_URL` | Connection config | All | Horilla instance URL. Existing `.env` value is preserved. |
| `PLAYWRIGHT_STORAGE_STATE` | Account/session config | All | Local Playwright state file. Defaults to `playwright/.auth/user.json`; set to an existing Employee or Manager state for separate runs. |
| `RUN_ATTENDANCE_MUTATIONS` | Safety flag | TC09, TC11–TC14, TC27–TC28 | Must be `true` before tests that approve, submit, create, or edit attendance/policy data proceed. Current `.env` already has `true`; it was not changed. |
| `ATTENDANCE_ALLOW_CLOCK_ACTIONS` | Safety flag | TC18–TC20 | Must be `true` in addition to the mutation flag before real check-in/out actions proceed. Current `.env` already has `true`; it was not changed. |
| `ATTENDANCE_EMPLOYEE_NAME` | Identity fixture | TC04 | Exact signed-in employee name expected on My Attendances. |
| `ATTENDANCE_OTHER_EMPLOYEE_NAME` | Identity fixture | TC04 | Another existing employee name that must not appear in the signed-in employee's records. |
| `ATTENDANCE_OVERNIGHT_RECORD_TEXT` | Record selector | TC07 | Unique text from an actual attendance spanning two calendar dates. |
| `ATTENDANCE_PENDING_RECORD_TEXT` | Record selector | TC09 | Unique text from an actual pending attendance row that the manager can validate/approve. |
| `ATTENDANCE_SEARCH_KEYWORD` | Search input | TC10 | Optional search term. If empty, the test uses its existing fallback. It is not a record-existence assertion. |
| `ATTENDANCE_OT_RECORD_TEXT` | Record selector | TC11 | Unique text from an overtime attendance awaiting approval. |
| `ATTENDANCE_REQUEST_DATE` | Form input | TC12 | Missed attendance date, `YYYY-MM-DD`, for the test employee and assigned shift. |
| `ATTENDANCE_REQUEST_CHECK_IN` | Form input | TC12 | Requested check-in time, `HH:mm`. |
| `ATTENDANCE_REQUEST_CHECK_OUT` | Form input | TC12 | Requested check-out time, `HH:mm`. |
| `ATTENDANCE_CORRECTION_RECORD_TEXT` | Record selector | TC13 | Unique text from an existing attendance that can be corrected. |
| `ATTENDANCE_CORRECTION_CHECK_IN` | Form input | TC13 | Valid replacement check-in time, `HH:mm`. |
| `ATTENDANCE_CORRECTION_CHECK_OUT` | Form input | TC13 | Valid replacement check-out time, `HH:mm`. |
| `ATTENDANCE_REQUEST_DECISION` | Behavior config | TC14 | `approve` or `reject`; defaults to `approve`. The request row must still exist and be pending. |
| `ATTENDANCE_REQUEST_RECORD_TEXT` | Record selector | TC14 | Unique text from a real pending attendance request. |
| `ATTENDANCE_EMPLOYEE_FILTER` | Search input | TC16 | Optional employee filter text. TC16 is currently N/A in the demo, so this value cannot enable it. |
| `ATTENDANCE_DAILY_STATUS_FIXTURE` | Status fixture | TC17 | Comma-separated real status labels. TC17 is currently N/A in the demo, so this value cannot enable it. |
| `ATTENDANCE_CLOCK_TEST_USER` | Identity fixture | TC18–TC20 | Exact visible employee/user name expected in the attendance activity log. Requires an existing Employee session and linked employee record. |
| `ATTENDANCE_DUPLICATE_ACTION` | Behavior config | TC20 | `check-in` or `check-out`. This test attempts a real clock action when the button is enabled. |
| `ATTENDANCE_LATE_RECORD_TEXT` | Record selector | TC21 | Unique text from an actual late-arrival row. |
| `ATTENDANCE_EARLY_RECORD_TEXT` | Record selector | TC22 | Unique text from an actual early-departure row. |
| `ATTENDANCE_MONTHLY_EXPECTED_PRESENT` | Optional assertion fixture | TC24 | Exact visible present-count text for the chosen stable month/employee. Empty means no fixed count assertion. |
| `ATTENDANCE_MONTHLY_EXPECTED_HOURS` | Optional assertion fixture | TC24 | Exact visible hour-total text for the chosen stable month/employee. Empty means no fixed hour assertion. |
| `ATTENDANCE_EXPECT_POLICY_ACCESS` | Behavior config | TC26 | `true` (default) expects policy content; `false` expects an access-denied result. |
| `ATTENDANCE_NEW_POLICY_NAME` | New-record name | TC27 | Unique name such as `AUTO_TC27_TimePolicy_YYYYMMDD_HHmm`; the test creates this policy. Do not set until an authorized Admin session and the create form are confirmed. |
| `ATTENDANCE_POLICY_NAME` | Existing-record selector | TC26, TC28 | Unique visible name of a real policy. For TC28, use a dedicated disposable `AUTO_...` policy because the test saves a valid update and does not restore the old value. |
| `ATTENDANCE_POLICY_BOUNDARY_LABEL` | Field selector | TC28 | Exact visible label of the policy field whose boundary is being tested. |
| `ATTENDANCE_POLICY_INVALID_VALUE` | Form input | TC28 | Invalid value for the confirmed field type; use a value Horilla visibly rejects. |
| `ATTENDANCE_POLICY_VALID_VALUE` | Form input | TC28 | Valid value for the same field; the test saves it. |

## Data preparation and verification

The test file reads records; it does not create all prerequisites. Use the existing Horilla Employee, Manager, and Admin accounts only. Do not create accounts or change roles/permissions for this suite. In the current workspace, the saved account role is unknown, so verify it in Horilla before running role-dependent cases.

Prepare independent test fixtures. For any supported request description/note field, prefix the test data with `AUTO_TC##_` and a timestamp. If no such field exists, use an existing record and set the matching `*_RECORD_TEXT` to a unique visible substring; do not alter unrelated employee names.

| Test case(s) | Data to prepare in Horilla | UI path and verification |
|---|---|---|
| TC04 | Two existing employees: the logged-in employee and a different employee. No account creation is needed. | Sign in with the existing Employee session; open **Attendance → My Attendances**. Copy the signed-in name and a different employee name into the two variables. Verify the first is visible and the second is absent before running. |
| TC07 | An actual overnight attendance whose in-date and out-date differ. | Open **Attendance → My Attendances** and find a row with check-in and check-out on different dates. If none exists, an overnight shift/attendance must be prepared by an authorized existing Manager/Admin; do not create or modify a shift until its actual setup UI and consequences are confirmed. Copy row text. |
| TC09 | A pending attendance record with a visible Validate/Approve action. | Open **Attendance → Attendances** as an existing Manager/Admin. Confirm a real pending row and action exist, then copy its row text. If no such row exists, the test cannot be prepared from `.env` alone; use the demo's visible, supported attendance workflow and verify the pending state first. |
| TC11 | A pending overtime attendance row tied to an employee/shift. | Open **Attendance → Attendances** as an authorized Manager/Admin. Confirm the row is actually overtime and pending approval; copy its text. The current test then approves it and checks Monthly Summary, so use disposable test data. |
| TC12 | An employee with an assigned shift and a missed day with no existing attendance/request conflict. | Open **Attendance → Attendance Requests** as an existing Employee. Use the displayed create/request flow and enter the real missed date and times. Verify the new request appears before using those values. This submits a real request. |
| TC13 | An existing attendance row eligible for correction. | Open **Attendance → My Attendances** as the employee who owns the row. Confirm the visible correction/edit action and current times; use a dedicated row and valid replacement times. Verify the row before running. This submits a real correction request. |
| TC14 | A separate pending attendance request and a Manager/Admin session able to decide it. | Open **Attendance → Attendance Requests** as an existing Manager/Admin. Confirm the request is pending and the chosen action is visible. TC14 consumes the pending state; do not reuse an already approved/rejected row. |
| TC18 | An Employee session eligible to check in, not already checked in for the active shift. | Open **Attendance → My Attendances**; verify Check-in is enabled. The test creates a real clock event and checks **Attendance → Check-in / Check-out Log**. |
| TC19 | An Employee with a real active check-in session and enabled Check-out. | Open **Attendance → My Attendances**; verify the active session and enabled Check-out. The test closes that session. It is not independent of clock state; do not run after TC18 unless intentionally testing the same session. |
| TC20 | An Employee in the exact state needed for an out-of-sequence/duplicate action. | Verify the selected action and button state on **Attendance → My Attendances**. If the button is enabled, the test clicks it and may create a real clock event. Use only an authorized isolated test account. |
| TC21 | A real late-arrival record produced under the employee's assigned shift and grace policy. | Open **Attendance → Late Arrival & Early Departure** as a role allowed to view this report. Confirm the row is classified as late, then copy its visible text. Do not change shared shift policy to force the result. |
| TC22 | A real early-departure record under the assigned shift/policy. | Use the same report and verify the row is classified as early departure before copying its text. |
| TC27 | No existing row is needed; the test creates a new Time Policy. | Open **Attendance → Time Policies** as an authorized Admin. Verify the visible Create/Add form before setting a unique `AUTO_TC27_...` name. The test saves a real policy; remove it manually after the run if the demo's UI permits and it is no longer needed. |
| TC28 | A dedicated existing Time Policy with a boundary field whose label and accepted values are known. | Open **Attendance → Time Policies** as an authorized Admin. Use a disposable `AUTO_TC28_...` policy, confirm the exact field label and valid/invalid values in the UI, then set the variables. TC28 persists the valid value and does not restore the prior value. |
| TC15–TC17 | No fixture can make the absent Daily Work Status page available. | These are N/A in the current demo. Horilla 2.3.0 says Day-wise summary replaces the deprecated page, but its route/UI has not been verified as equivalent for these requirements. Do not use another page as a substitute without that verification. |

### Role requirements

- **Employee session:** TC04–TC07, TC12–TC13, TC18–TC20. TC12/TC13 create requests; TC18–TC20 perform real clock actions.
- **Manager/Admin attendance-authorized session:** TC09, TC11, TC14, and usually TC21–TC23/TC24–TC25 depending on the demo's permissions. The supplied Admin can exercise these workflows where the UI grants access, but this does not verify Manager-specific permissions.
- **Admin or policy-authorized session:** TC26–TC28. TC27 creates a policy; TC28 edits one.
- TC01–TC03 and TC08/TC10 also need the Attendance dashboard/list permissions configured for the active session.
- The user confirmed the demo provides only an Admin account and does not permit creating Employee/Manager accounts. `playwright/.auth/user.json` is the sole saved state. TC04–TC07, TC12–TC13, and TC18–TC20 cannot be verified as Employee. Use the supplied Admin session for authorized Manager/Admin workflows when their records and controls exist; this does not verify Manager-specific permissions. `.gitignore` excludes local state files.

## Every `test.skip()` condition

| Test case(s) | Skip condition |
|---|---|
| TC02 | Dashboard has no recognized date/period control, or the period select has fewer than two options. |
| TC03 | Dashboard has no date control; its type is unsupported; or selecting the old range does not produce the expected empty state. |
| TC04, TC07, TC09, TC11–TC14, TC17–TC22, TC27–TC28 | A required environment value is blank/missing. TC17 is already N/A and will skip before reading its fixture. |
| TC06 | No recognized date/shift filter is visible on My Attendances. |
| TC07 | The displayed table does not expose separate in-date and out-date columns. |
| TC08 | No validation/overtime/validated tabs are recognized. |
| TC09, TC11, TC14 | The configured pending record is absent, or its required approval/validation action is absent. |
| TC10 | Search, filter, and export controls are all absent. |
| TC12 | Create control, required date/time fields, or submit control is absent. |
| TC13 | The configured row/action, correction fields, or submit control is absent. |
| TC14, TC20 | A configured action value is invalid; or its action/button is absent. |
| TC15–TC17 | Explicit N/A: Daily Work Status is unavailable and no equivalent route/UI has been verified. This is an environment limitation, not a selector fallback. |
| TC18–TC19 | Clock button is absent or disabled for the current Employee's shift state. |
| TC23 | Filter and export controls are both absent. |
| TC25 | Month/date control and previous/next controls are absent. |
| TC27 | Create control, policy-name field, or save control is absent. |
| TC28 | Edit action, boundary field, or save control is absent. |

`test.skip()` inside `requireRecordRow()` also means the particular record text did not match any visible row. Locator/control skips do not identify a missing `.env` value; inspect the reason reported by Playwright to distinguish them.

## Running tests

From the project directory:

```powershell
npm.cmd test -- --list
npm.cmd test -- --grep "TC04"
npm.cmd test
```

To save sessions for existing roles, open each command, sign in to the corresponding existing account in the browser window, then close the window so Playwright writes the state file:

```powershell
.\node_modules\.bin\playwright.cmd codegen --save-storage=playwright/.auth/employee.json https://hr.demo.horilla.com
.\node_modules\.bin\playwright.cmd codegen --save-storage=playwright/.auth/manager.json https://hr.demo.horilla.com
```

Do not share the generated JSON files; they contain authenticated session data. They are local-only and ignored by Git.

Run Employee and Manager/Admin cases in separate invocations if they use separate existing states. The environment variable `PLAYWRIGHT_STORAGE_STATE` selects the local state file for that invocation. For example, after the existing Employee and Manager states have been saved:

```powershell
$env:PLAYWRIGHT_STORAGE_STATE = 'playwright/.auth/employee.json'
npm.cmd test -- --grep 'TC04'
Remove-Item Env:PLAYWRIGHT_STORAGE_STATE

$env:PLAYWRIGHT_STORAGE_STATE = 'playwright/.auth/manager.json'
npm.cmd test -- --grep 'TC26'
Remove-Item Env:PLAYWRIGHT_STORAGE_STATE
```

Keep all state files local; `.gitignore` excludes `playwright/.auth/`.

Before enabling a mutation case, confirm its required record exists and set the exact fixture values. Do not fill blank row selectors with made-up names. Clock cases can perform real check-in/out actions, and TC09/11–14/27–28 can change persistent records.

## Latest test runs

Playwright loaded `.env` (32 entries) for the targeted runs on 2026-11-06. No attendance request, clock event, or policy was saved during these runs.

- **TC06:** Pass after its Clear locator was narrowed to exclude the observed notification button posting to `/delete-all-notifications/`.
- **TC08:** Fail. No visible validation/overtime tab was available; the failure screenshot remained on Dashboard after the attendance route request returned HTTP 200.
- **TC21–TC26:** 3 passed, 3 skipped. TC24–TC26 passed; TC21 and TC22 had no matching visible late/early rows; TC23 had no filter/export control.
- **TC27:** Skip. The Time Policies screen showed Grace Time and Validation Condition tabs, with no Create/Add control. The former broad `new` locator could select a notification control; it now looks only for Create/Add.
- **TC12:** an earlier full-run artifact records a timeout while clicking Create. The page stayed on the request list, and its trace contains no write request. The case requires an Employee account, which is not available in this demo.

A separate read-only check with `ATTENDANCE_POLICY_NAME` temporarily set to the configured AUTO policy name confirmed that this policy does not exist in the list. The `.env` value was not changed. TC28 therefore has no real policy to edit, and its form/value inputs remain unconfigured. The current demo also lacks the controls required for TC27.

The older full suite result of **7 passed, 2 failed, 19 skipped** predates the latest `.env` edits and is historical. Current full-suite totals are not reported because only targeted runs have been made since those edits. Employee-only cases remain unavailable; mutation cases require dedicated AUTO records before they can safely change attendance data.

Current blank values that block environment checks:

- **TC12, TC18–TC20:** the saved browser session is Admin; use an existing Employee session for these Employee cases. TC18–TC20 also require `ATTENDANCE_CLOCK_TEST_USER` and `ATTENDANCE_DUPLICATE_ACTION`. Choose the action only after checking the Employee's real clock state.
- **TC28:** `ATTENDANCE_POLICY_NAME`, `ATTENDANCE_POLICY_INVALID_VALUE`, `ATTENDANCE_POLICY_VALID_VALUE`. These must match a real disposable AUTO policy and the exact field/value rules shown in Horilla; TC28 persists the valid update.
- **Not blockers for runnable cases:** `ATTENDANCE_DAILY_STATUS_FIXTURE` and `ATTENDANCE_EMPLOYEE_FILTER` belong to N/A TC17 and TC16; `ATTENDANCE_SEARCH_KEYWORD` and `ATTENDANCE_MONTHLY_EXPECTED_PRESENT` / `ATTENDANCE_MONTHLY_EXPECTED_HOURS` are optional.

No attendance request, clock event, or policy was created or changed during the targeted rerun.
