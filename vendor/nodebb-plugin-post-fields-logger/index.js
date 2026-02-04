'use strict';

// Lazy-load user module to support both plugin context and testing
let _user = null;
function getUser() {
	if (!_user) {
		_user = require.main.require('./src/user');
	}
	return _user;
}

const plugin = {};

// Anonymous user placeholder data
const ANONYMOUS_USER = {
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
};

// Export for testing
plugin.ANONYMOUS_USER = ANONYMOUS_USER;

/**
 * Allows injecting a mock user module for testing
 * @param {Object} mockUser - Mock user module
 */
plugin._setUserModule = function (mockUser) {
	_user = mockUser;
};

/**
 * Checks if the caller is a moderator or admin
 * @param {number|null} uid - The user ID of the caller
 * @returns {Promise<boolean>} - True if the caller is a moderator or admin
 */
plugin.isCallerPrivileged = async function (uid) {
	if (!uid || uid <= 0) {
		return false;
	}
	const user = getUser();
	const [isAdminOrGlobalMod, isModOfAnyCategory] = await Promise.all([
		user.isAdminOrGlobalMod(uid),
		user.isModeratorOfAnyCategory(uid),
	]);
	return isAdminOrGlobalMod || isModOfAnyCategory;
};

/**
 * Masks user identity fields on a post for anonymous mode
 * @param {Object} post - The post object to mask
 * @returns {Object} - The post with masked user identity
 */
plugin.maskPostUserIdentity = function (post) {
	if (!post) {
		return post;
	}

	// Store original uid for reference but mask it
	post._originalUid = post.uid;
	post.uid = ANONYMOUS_USER.uid;

	// Replace user object with anonymous placeholder
	if (post.user) {
		post._originalUser = { ...post.user };
		post.user = { ...ANONYMOUS_USER };
	}

	// Clear any other identifying fields
	if (post.handle) {
		post._originalHandle = post.handle;
		post.handle = 'Anonymous';
	}

	return post;
};

/**
 * Main hook handler for filter:post.getFields
 * Implements anonymous mode: hides user identity for posts marked as anonymous
 * from all users except admins and moderators
 *
 * This hook marks posts as anonymous and stores original uid for later processing.
 * The actual user data masking happens in onTopicsAddPostData after NodeBB populates user info.
 */
plugin.onPostGetFields = async function (hookData) {
	// Access the caller information from the automatically-injected caller property
	const caller = hookData.caller || {};
	const callerUid = caller.uid !== undefined ? caller.uid : null;

	// Check if caller is a moderator or admin
	const isModeratorOrAdmin = await plugin.isCallerPrivileged(callerUid);

	// Process posts for anonymous mode
	if (hookData.posts && Array.isArray(hookData.posts)) {
		hookData.posts.forEach((post) => {
			// Check if post is marked as anonymous (from database)
			if (post && post.isAnonymous) {
				// Only mask uid if caller is NOT a moderator or admin
				if (!isModeratorOrAdmin) {
					// Store original uid before masking
					if (post._originalUid === undefined) {
						post._originalUid = post.uid;
					}
					post.uid = 0; // This will cause NodeBB to load guest user data
				}

				// Mark as anonymous post for template/UI purposes
				post.isAnonymousPost = true;
				// Store privilege info for use in later hooks
				post._callerIsPrivileged = isModeratorOrAdmin;
			}
		});
	}

	return hookData;
};

/**
 * Hook handler for filter:topics.addPostData
 * This fires AFTER NodeBB has populated user data on posts.
 * We use this to override the "Guest" user data with "Anonymous" for anonymous posts.
 *
 * This preserves normal guest functionality - only posts explicitly marked as
 * isAnonymous will show "Anonymous" instead of "Guest".
 */
plugin.onTopicsAddPostData = async function (hookData) {
	if (!hookData.posts || !Array.isArray(hookData.posts)) {
		return hookData;
	}

	hookData.posts.forEach((post) => {
		// Only process posts that were marked as anonymous
		if (post && post.isAnonymousPost) {
			// If caller is NOT privileged, replace user data with anonymous placeholder
			if (!post._callerIsPrivileged) {
				// Store original user data if not already stored
				if (post.user && !post._originalUser) {
					post._originalUser = { ...post.user };
				}

				// Replace with anonymous user data
				post.user = { ...ANONYMOUS_USER };

				// Also mask the handle if present
				if (post.handle && !post._originalHandle) {
					post._originalHandle = post.handle;
				}
				post.handle = 'Anonymous';
			}
			// For privileged users, keep the original user data
			// but they can see isAnonymousPost flag in the UI if needed
		}
	});

	return hookData;
};

module.exports = plugin;

