# Feature Template

Use this template when describing a new or modified feature so reviewers and testers have a consistent checklist.

## Template

- **Feature:** A one-line description of the feature.
- **Summary:** A short paragraph explaining what the feature does and why it was added.
- **How it works:** Technical explanation of the design and flow (components touched, data flow, important edge cases).
- **How to test:** Step-by-step manual test instructions and any automated test commands.
- **Tests:** Link(s) to the actual automated test files that cover this feature.
- **Why tests are sufficient:** Short rationale describing what the tests cover and any remaining gaps.

## Anonymous Posts

- **Feature:** Per-post anonymous posting that hides the author's identity from regular users.
- **Summary:** When posting, a checkbox can be selected to post anonymously. Posts are shown as "Anonymous" to non-privileged viewers (regular users). Administrators and moderators see the original poster information. The plugin implements a two-stage hook flow to mask identities after NodeBB populates user data.
- **How it works:**
	- A plugin inspects posts on `filter:post.getFields` and, when `post.isAnonymous` is true, stores the original uid, sets `post.uid = 0` for non-privileged callers (forcing guest data to load), and flags `post.isAnonymousPost` and `_callerIsPrivileged`.
	- After NodeBB populates user objects, `filter:topics.addPostData` replaces the guest user object with an `ANONYMOUS_USER` placeholder (username/displayname = "Anonymous") for non-privileged viewers while preserving original user data for admins/mods.
	- The plugin uses an `ANONYMOUS_USER` constant as the masked user object and keeps `_originalUid`/_originalUser fields on the post for possible later use.

	**Frontend UI:**
	- The composer UI already includes a checkbox labeled "Post anonymously" injected by the client code in `public/src/app.js` when the composer is enhanced for topic/post creation.
	- Implementation details: the checkbox element has the attribute `data-composer-anonymous`; when changed the composer container receives `data-anonymous-post="1"` (or `0`) which can be read by client code that submits the post.
	- The checkbox is inserted after the `.title-container` inside the composer (only for `topics.post` actions). The label text is translatable and lives in the `public/language/*/user.json` files.
	- Note: wiring the composer to actually set `isAnonymous` on the saved post record (server-side) is part of the remaining work — the UI toggle is present and signals intent, but server-side persistence/toggle logic must consume that flag to set `isAnonymous` on post creation.
- **How to test:**
	1. Run the plugin's unit tests which cover masking and privilege visibility:

		 cd vendor/nodebb-plugin-anonymous-mode
		 npm test

		 Or run the project test runner targeting the plugin tests directly:

		 npm test -- .archiver_shadow/vendor/nodebb-plugin-anonymous-mode/test/anonymous-mode.js

	2. Manual/quick checks:
		 - Create or locate a post record and set `isAnonymous = true` (DB edit or plugin API).
		 - View the topic as a regular user: the post should show username/displayname "Anonymous".
		 - View the topic as an admin/mod: the post should show the original username.
- **Tests:** See the plugin README and tests:
	- [.archiver_shadow/vendor/nodebb-plugin-anonymous-mode/README.md](.archiver_shadow/vendor/nodebb-plugin-anonymous-mode/README.md)
	- [.archiver_shadow/vendor/nodebb-plugin-anonymous-mode/index.js](.archiver_shadow/vendor/nodebb-plugin-anonymous-mode/index.js)
	- [.archiver_shadow/vendor/nodebb-plugin-anonymous-mode/test/anonymous-mode.js](.archiver_shadow/vendor/nodebb-plugin-anonymous-mode/test/anonymous-mode.js)
- **Why tests are sufficient (for now):**
	- The tests exercise the two-stage hook pipeline (pre-mask + post-populate replacement), privilege-based visibility (admin/mod vs regular user), and guest preservation behavior. They assert that the displayed handle/user object is replaced with `ANONYMOUS_USER` for non-privileged viewers while original data remains available to privileged viewers.
	- Remaining gaps: a UI toggle and integration at post-creation time to set `isAnonymous` are not implemented here; those should be covered by integration tests or end-to-end tests once the UI/API is added. Concurrency/race conditions under heavy load are not covered by the unit tests and would benefit from stress tests.

