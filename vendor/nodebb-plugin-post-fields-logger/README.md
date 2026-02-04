# NodeBB Anonymous Posting Plugin

A NodeBB plugin that enables anonymous posting mode, allowing users to post anonymously while keeping their identity hidden from regular users. Admins and moderators can always see the original poster's identity.

## Purpose

This plugin provides a privacy-focused feature that allows users to post anonymously. The implementation uses a two-stage hook approach to ensure that:
- Regular users see "Anonymous" instead of the actual username
- Admins and moderators can always see the original poster's identity
- Normal guest posting functionality is preserved

This plugin currently does not implement a UI for toggling anonymous mode for posts. The isAnonymous field in the database needs to be modified by another plugin or manually in the database.

## Installation

This plugin is included as a default plugin in NodeBB and is installed automatically via npm as a local file dependency from the `vendor/` directory.

When you run `npm install`, npm automatically creates a symlink from `node_modules/nodebb-plugin-post-fields-logger` to `vendor/nodebb-plugin-post-fields-logger`.

No manual setup is required - the symlink is created automatically during the npm install process.

## Features

### Anonymous Posting Mode
- **Per-post setting**: Posts can be marked as anonymous via the `isAnonymous` field (stored in database)
- **Privilege-based visibility**:
  - Regular users see "Anonymous" as the poster name
  - Admins and moderators see the original username
  - Post author sees "Anonymous" (unless they are admin/mod)
- **Guest preservation**: Normal guest posts remain unaffected and display as "Guest"

### Two-Stage Processing

The plugin uses a two-stage hook approach to handle anonymous posts correctly:

#### Stage 1: `filter:post.getFields`
- Marks posts as anonymous (`isAnonymousPost: true`)
- Masks the `uid` to 0 for non-privileged users (triggers NodeBB's guest user data loading)
- Stores original `uid` in `_originalUid` for reference
- Records privilege level in `_callerIsPrivileged`

#### Stage 2: `filter:topics.addPostData`
- Fires after NodeBB populates user data on posts
- Replaces "Guest" user data with "Anonymous" user data for anonymous posts
- Only applies to non-privileged viewers
- Preserves original user data for admins/mods

## How It Works

### Database Integration
The plugin expects posts to have an `isAnonymous` field in the database. This field should be:
- Set to `true` when a post is marked as anonymous
- Passed in the `hookData` during post retrieval
- Stored persistently in the post record

### Display Behavior

| Scenario | Display Name |
|----------|-------------|
| Regular guest post | "Guest" (or custom handle if enabled) |
| Anonymous post (regular user viewing) | "Anonymous" |
| Anonymous post (admin/mod viewing) | Original username |
| Anonymous post (author viewing, non-admin) | "Anonymous" |

### Hook Information

- **Hooks**:
  - `filter:post.getFields` - Stage 1 processing
  - `filter:topics.addPostData` - Stage 2 processing
- **Type**: Filter hooks (must return the data unchanged)
- **Fires when**:
  - `filter:post.getFields`: NodeBB retrieves post fields from the database
  - `filter:topics.addPostData`: NodeBB adds post data to topic responses

## Files

- `index.js` - Main plugin code with hook handlers and anonymous mode logic
- `test/anonymous-mode.js` - Comprehensive unit tests (35 tests covering all scenarios)
- `plugin.json` - NodeBB plugin configuration with hook registrations
- `package.json` - NPM package metadata
- `README.md` - This file

## Testing

The plugin includes comprehensive unit tests covering:
- Anonymous post masking for different user types
- Privilege-based visibility (admins, mods, regular users)
- Guest post preservation
- Mixed post scenarios
- Integration between both hook stages

Run tests with:
```bash
cd vendor/nodebb-plugin-post-fields-logger
npm test
```

## Default Plugin

This plugin is integrated into NodeBB as a default plugin:
- Listed in `install/package.json` as: `"nodebb-plugin-post-fields-logger": "file:vendor/nodebb-plugin-post-fields-logger"`
- Added to the default plugins list in `src/install.js`
- Automatically activated during `./nodebb setup`

## Implementation Notes

### Why Two Stages?

NodeBB's user data processing pipeline has multiple stages:
1. Posts are retrieved with basic fields
2. User data is loaded and populated
3. User data is processed and formatted

The plugin uses two hooks to work with this pipeline:
- **Stage 1** (`filter:post.getFields`) runs early and masks the `uid`
- **Stage 2** (`filter:topics.addPostData`) runs after user data is populated and replaces the "Guest" data with "Anonymous"

This approach ensures that:
- The masking happens at the right time in the pipeline
- Normal guest functionality is preserved
- The solution is robust and doesn't conflict with other plugins

### Anonymous User Placeholder

The plugin defines an `ANONYMOUS_USER` constant with the following properties:
```javascript
{
  uid: 0,
  username: 'Anonymous',
  displayname: 'Anonymous',
  userslug: '',
  picture: null,
  'icon:text': '?',
  'icon:bgColor': '#888888',
  status: 'offline',
  signature: '',
  reputation: 0,
  postcount: 0,
  topiccount: 0,
  banned: false,
  'banned:expire': 0,
  groupTitle: '',
}
```

This data is used to replace the user information for anonymous posts when viewed by non-privileged users.

