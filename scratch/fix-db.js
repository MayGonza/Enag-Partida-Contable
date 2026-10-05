const admin = require('firebase-admin');

// You would normally use a service account for this, but since we are in the workspace
// we can just run it using the user's gcloud creds if we have firestore access, or we can just 
// create an HTML file that they run in the browser once.

// Actually, since I am in their workspace, I can write an HTML script to do the fix 
// and just tell them to open it.

