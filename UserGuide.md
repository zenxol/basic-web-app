# Feature Template

Use this template when describing a new or modified feature so reviewers and testers have a consistent checklist.

## Template

- **Feature:** A one-line description of the feature.
- **Summary:** A short paragraph explaining what the feature does and why it was added.
- **How it works:** Technical explanation of the design and flow (components touched, data flow, important edge cases).
- **How to test:** Step-by-step manual test instructions and any automated test commands.
- **Tests:** Link(s) to the actual automated test files that cover this feature.
- **Why tests are sufficient:** Short rationale describing what the tests cover and any remaining gaps.

## Example (remove after adding documentation)

- **Feature:** Persist topic teasers when the latest post changes.
- **Summary:** Ensure category teaser and first post preview update when a new post is added or removed.
- **How it works:** When a post is created or deleted the topics module updates the category's teaser references and refreshes cached category API responses. The change is exercised through the `topics.post`, `topics.reply`, and category read pathways.
- **How to test:**
	1. Run the test suite that includes posts/topics behavior.
	2. Or manually: create a topic, verify category teaser shows that post; create another topic/post, verify teaser updates; delete the newest post and verify teaser reverts.
	3. Run focused tests with: `npm test -- test/posts.js`
- **Tests:** See [test/posts.js](test/posts.js) and related assertions in [test/topics.js](test/topics.js).
- **Why tests are sufficient:** The linked tests create topics and posts via the same public APIs used in production, assert expected teaser PID and post content ordering, and cover create/delete flows and permission edge cases. These exercises validate both the data mutation and the API responses; any remaining gaps (e.g., race conditions under heavy concurrency) should be noted as follow-up performance tests.

---

When adding a new feature, copy the Template section and fill the fields. Link the concrete test files so reviewers can quickly jump to the assertions that verify behavior.

