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
	- **Backend - Masking Posts on Retrieval:** A plugin inspects posts on `filter:post.getFields` and, when `post.isAnonymous` is true, stores the original uid, sets `post.uid = 0` for non-privileged callers (forcing guest data to load), and flags `post.isAnonymousPost` and `_callerIsPrivileged`. The plugin uses an `ANONYMOUS_USER` constant as the masked user object and keeps `_originalUid`/_originalUser fields on the post for possible later use.
	- **Backend - User Object Replacement:** After NodeBB populates user objects, `filter:topics.addPostData` replaces the guest user object with an `ANONYMOUS_USER` placeholder (username/displayname = "Anonymous") for non-privileged viewers while preserving original user data for admins/mods.
	- **Frontend - Checkbox UI:** The composer UI includes a checkbox labeled "Post Anonymously" injected by the client code in `public/src/app.js` when the composer is enhanced for topic/post creation. The checkbox element has the attribute `data-composer-anonymous`; when changed the composer container receives `data-anonymous-post="1"` (or `0`). The checkbox is inserted after the `.title-container` inside the composer (only for `topics.post` actions), and the label text is translatable in `public/language/*/user.json` files.
	- **Frontend-to-Backend - Post Creation Flow:** The `filter:composer.submit` hook in `public/src/app.js` reads the `data-anonymous-post` attribute and sets `composerData.isAnonymous` accordingly. The backend in `src/posts/create.js` then consumes this flag and persists it as `postData.isAnonymous` on the post record in the database.
- **How to test:**
	1. Run the plugin's unit tests which cover masking and privilege visibility:

		 cd vendor/nodebb-plugin-post-fields-logger
		 npm test

		 Or run the project test runner targeting the plugin tests directly:

		 npm test -- vendor/nodebb-plugin-post-fields-logger/test/anonymous-mode.js

	2. Manual/quick checks:
		 - Create a post through the UI by clicking "Post Anonymously" checkbox in the composer.
		 - View the topic as a regular user: the post should show username/displayname "Anonymous".
		 - View the topic as an admin/mod: the post should show the original username with full user details.
- **Tests:** See the plugin README and tests:
	- [vendor/nodebb-plugin-post-fields-logger/README.md](vendor/nodebb-plugin-post-fields-logger/README.md) - Plugin documentation
	- [vendor/nodebb-plugin-post-fields-logger/index.js](vendor/nodebb-plugin-post-fields-logger/index.js) - Plugin implementation with hooks
	- [vendor/nodebb-plugin-post-fields-logger/test/anonymous-mode.js](vendor/nodebb-plugin-post-fields-logger/test/anonymous-mode.js) - Comprehensive test suite including stage 1/2 hooks, privilege-based visibility, post creation flow, and edge cases
- **Why tests are sufficient:**
	- The tests provide comprehensive coverage across multiple test suites:
		- **Stage 1 Hook (`filter:post.getFields`) Tests:** Validates UID masking for non-privileged viewers, preserves original UID for privileged viewers (admins/mods), and handles privilege detection correctly.
		- **Stage 2 Hook (`filter:topics.addPostData`) Tests:** Verifies user object replacement with `ANONYMOUS_USER` placeholder for non-privileged viewers, preserves original user data for privileged viewers, and correctly handles mixed anonymous/non-anonymous posts.
		- **Privilege-Based Visibility Tests:** Tests instructor viewing student anonymous post (shows real identity), student viewing another student's anonymous post (shows "Anonymous"), and post author viewing their own anonymous post.
		- **Post Creation Flow Tests:** Validates that the `filter:composer.submit` hook captures checkbox state and `src/posts/create.js` persists the `isAnonymous` flag to the database, covering the complete frontend-to-backend integration.
		- **Edge Cases:** String/boolean type coercion for Redis storage ("true" as truthy), false/0 values not triggering masking, double-processing protection (`_originalUid`/`_originalUser`/`_originalHandle` preservation), missing caller context defaults to masking, handle field conditional setting, and `ANONYMOUS_USER` constant immutability.
	- Together, the tests ensure that posts created with the anonymous flag are properly stored and retrieved with correct visibility behavior based on viewer privileges throughout the entire system lifecycle.

