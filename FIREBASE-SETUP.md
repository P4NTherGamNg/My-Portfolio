# Firebase setup (one time, about 10 minutes)

1. Go to https://console.firebase.google.com and create a project (Analytics is not needed).
2. **Build → Firestore Database → Create database.** Choose any region (e.g. asia-south1), start in *production mode*.
3. **Build → Authentication → Get started → Email/Password → Enable.**
4. **Authentication → Users → Add user.** Enter your admin email + a strong password.
   Copy the **User UID** shown in that table.
5. **Firestore → Rules.** Paste the contents of `firestore.rules`, replace `PASTE_ADMIN_UID_HERE`
   with your UID, then click **Publish**.
6. **Project settings (gear) → Your apps → Web (</>)** → register an app. Copy the `firebaseConfig`
   values into `firebase-config.js`.
7. Upload ALL files to your hosting (index.html, admin.html, admin.js, site-data.js,
   firebase-config.js, script.js, style.css, images).
8. Open `https://YOUR-SITE/admin.html`, sign in, edit, press Save, then refresh the main site.

Notes
- Until step 6 is done, the website just shows its built-in content, so nothing breaks.
- The admin page is not linked from the website. Only your UID can write, so a stranger who finds the
  page still cannot change anything.
- Gallery images are compressed in the browser and saved in Firestore (free Spark plan, no card).
- Use **Authentication → Settings → User actions** to disable sign-ups if you want extra safety.

## Contact-form messages (Messages tab)
- Messages typed into the website's "Contact Me" form are saved in the Firestore `messages` collection and
  appear in **admin.html → Messages** (newest first, unread highlighted, delete / mark read / reply).
- IMPORTANT: if you set up Firebase before this feature existed, open Firestore → Rules and **publish the
  new `firestore.rules`** again (keep your own UID in it), otherwise sending/reading messages is blocked.
- If Firebase is unreachable, the form falls back to the old Google Sheets URL so no message is lost.
