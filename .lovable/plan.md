Plan: Add a true native mobile app wrapper for the existing TalloTags web app using Capacitor.

Answers to your questions

How long will this take?
- Initial Capacitor setup and configuration: ~1–2 hours.
- Adding iOS and Android platforms and verifying builds: ~1–2 hours.
- Running on a simulator/emulator or physical device: depends on your local Xcode/Android Studio setup, usually minutes once tools are installed.
- App Store / Play Store submission and approval are separate and can take days to weeks (not included here).

Cloud resources and credits
- The app will continue to use the existing Lovable Cloud backend (auth, database, edge functions, CSV serving), so no new backend or significant extra cloud usage is required just for Capacitor.
- Capacitor itself does not consume Lovable Cloud credits; it is a local native wrapper.
- Build-mode code changes are usage-based, so I cannot give an exact credit number. Plan-mode messages cost 1 credit each. This setup is a medium-sized configuration task, not a full rebuild.

Will website updates also update the apps?
- Yes, with the right workflow. Capacitor wraps the web app, so the same React/Vite codebase powers both the website and the app.
- During development we will configure hot reload from the sandbox preview URL so changes appear immediately in the native app.
- For production, you have two paths:
  1. Bundle web assets inside the app. Pure UI/content updates require a new app build and app store resubmission.
  2. Over-the-air (OTA) updates can push web-layer changes without a full app store release, but that requires additional tooling (e.g., Ionic Appflow or a custom update mechanism) and is out of scope for the initial setup.
- Native-only changes (push notifications, camera access, etc.) always require a new app build and store submission.

What we will build

1. Install Capacitor dependencies
   - @capacitor/core
   - @capacitor/cli (dev dependency)
   - @capacitor/ios
   - @capacitor/android

2. Initialize Capacitor configuration
   - appId: app.lovable.10d8996ca49749c694d5e5e9b7476207
   - appName: tag-state-tracker
   - Add the sandbox preview URL to the server config for hot reload:
     ```json
     "server": {
       "url": "https://10d8996c-a497-49c6-94d5-e5e9b7476207.lovableproject.com?forceHideBadge=true",
       "cleartext": true
     }
     ```

3. Add native platforms
   - npx cap add ios
   - npx cap add android

4. Configure build output
   - Ensure Vite builds to the directory Capacitor expects (usually dist/).
   - Update build scripts if needed.

5. Sync web assets to native projects
   - npm run build
   - npx cap sync

6. Provide run instructions
   - iOS: npx cap run ios (requires macOS + Xcode)
   - Android: npx cap run android (requires Android Studio)
   - Physical device testing steps.

7. Update navigation links
   - Replace or disable any OnX / external map links that do not work well in native web views, unless already handled.

Out of scope for this plan
- App Store / Play Store developer account setup and submission.
- Push notifications, camera, or other native plugins.
- OTA update service.

After approval
I will make the code changes in this project. To test on a real device or emulator you will need to git pull the project, run npm install, then follow the iOS/Android steps above. After any later edit that touches native capabilities, run npx cap sync to keep the native projects in sync.