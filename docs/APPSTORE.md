# Putting this app in the app stores

The site is already a complete PWA (manifest, offline service worker, icons,
standalone display). Store packaging wraps that PWA; no rewrite needed.

## Google Play (fastest, do this first)

1. Create a Play Console developer account ($25, one time).
2. Go to pwabuilder.com, enter the live URL, and generate the **Android**
   package (a Trusted Web Activity). Package name: `org.faithandresults.app`.
3. PWABuilder gives you a signing fingerprint. Paste it into
   `.well-known/assetlinks.json` (replacing the placeholder) and push; this
   proves you own the site so the app runs fullscreen without browser chrome.
4. Upload the `.aab` to Play Console, fill the listing (use the archive
   photos for screenshots), submit. Review is typically days.

## Apple App Store

1. Apple Developer Program ($99/year) plus access to a Mac with Xcode.
2. PWABuilder also generates an **iOS** Xcode wrapper project. Open it, set
   the bundle id (`org.faithandresults.app`), build, and submit via App
   Store Connect.
3. Honest warning: Apple sometimes rejects thin website wrappers under
   guideline 4.2 (minimum functionality). Our odds are decent because the
   app has offline mode, installable identity, applications with profiles,
   and the concierge, but expect possible review friction. If rejected, the
   fallback is Capacitor (capacitorjs.com) wrapping with a native plugin or
   two (push notifications is the usual unlock).

## The custom domain matters

Before packaging, finish the faithandresults.com cutover (Settings → Pages →
custom domain + DNS). Store apps should point at the real domain, not
github.io, so the packaged apps never need re-submission when hosting moves.

## Timeline reality for "next week"

- Play Store: achievable. Account + package + listing in a day, review in a
  few days.
- App Store: submission achievable within days if the Apple account and a
  Mac are ready; approval timing is Apple's call.
