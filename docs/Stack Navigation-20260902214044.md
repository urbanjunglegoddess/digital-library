# Stack Navigation

# The Stack Navigation: A Senior Engineer's Complete Breakdown
The navigation model that runs every mobile app you've ever used, and the one web engineers reinvent badly. Here's the push/pop stack from first principles to production code.

**Try it live:** the companion playground will let you push, pop, replace, and reset screens on a simulated device frame, flip between slide/fade/shared-element transitions, toggle iOS swipe-back vs. Android hardware-back, and watch the back stack render as a live LIFO list while it emits the matching code for React Navigation, Expo Router, SwiftUI, Compose, Flutter, and a web History-API router. It's built in a later pass — this doc is the reference it's built from.

**Audit a flow:** the companion audit angle will let you paste a navigation tree and flag the classic breakages — a screen that pushes itself infinitely, a modal that should have been a `replace`, a deep link with no synthesized back stack, a header title that never gets announced to screen readers.

This doc is part of the UJG Digital Asset Library. Siblings you'll want open beside it: the Button ([https://app.clickup.com/8495850/docs/838qa-81211/838qa-200231](https://app.clickup.com/8495850/docs/838qa-81211/838qa-200231)) reference (the gold standard), Cards ([https://app.clickup.com/8495850/docs/838qa-81211/838qa-200471](https://app.clickup.com/8495850/docs/838qa-81211/838qa-200471)), the ⭐ COMPONENT ASSET TEMPLATE (follow this) ([https://app.clickup.com/8495850/docs/838qa-81211/838qa-200531](https://app.clickup.com/8495850/docs/838qa-81211/838qa-200531)), and the 🎨 Design Styles (visual languages) ([https://app.clickup.com/8495850/docs/838qa-81211/838qa-200551](https://app.clickup.com/8495850/docs/838qa-81211/838qa-200551)). Stack Navigation is a **navigation pattern**, so it leans on its cousins hard — cross-reference **Bottom Tabs**, **Tab Navigation**, and the parent **Navigation** doc throughout.
* * *

## 1\. What Stack Navigation Actually Is
Stack navigation is a **navigation paradigm**, not a widget. It's the LIFO (last-in, first-out) stack of screens that models _hierarchical drill-down_: you start on a screen, **push** a new screen on top of it, and **pop** back to reveal the one underneath. The screen you left is still there, alive, waiting under the new one — that's the whole trick. It's a literal data structure (an array you push to and pop from) that the user experiences as "going deeper and coming back."

If you've used a phone, you already know it in your hands: Contacts list → tap a person → their detail → tap their address → a map. Four screens, one on top of the next. Hit back three times and you unwind exactly the way you came in. That trail is the stack.

The word "navigation" hides four very different things people lump together, and getting the distinction wrong is the #1 architecture mistake in mobile:

**Stack navigation (hierarchical):** one active screen with a _back trail_ underneath it. Drill in, back out. Parent → child → grandchild. This doc.
**Tab / Bottom Tabs navigation (parallel):** several _co-equal, sibling_ destinations you switch between — Home, Search, Profile. There's no "back" between tabs; they're peers, not parent-and-child. Each tab usually _contains its own stack_. (See **Bottom Tabs** and **Tab Navigation**.)
**Drawer navigation (parallel, hidden):** the same parallel-destinations idea as tabs, but tucked behind a slide-out panel.
**Modal / sheet presentation:** a screen that comes up _over_ everything (often from the bottom) to interrupt the flow for a focused task, then dismisses. Technically a stack push with a different transition and presentation semantics.

The single distinction juniors get wrong: **Tabs are for things that are the same level of importance; a Stack is for things where one leads to another.** If your "tabs" have a back button between them, they should've been a stack. If your "stack" makes users hit back five times to reach the thing they use most, it should've been a tab. Pick the structure that matches the _relationship_ between screens, not the one that's easiest to wire.

**The web analog.** The browser's History API _is_ a stack. `history.pushState()` is push; the back button is pop; `history.replaceState()` is replace. Every SPA router (React Router, Next.js, SvelteKit) is a stack navigator wearing a URL bar. Web engineers who've never touched mobile are already running a stack — they just call it "the history."
* * *

## 2\. Why It Matters
Navigation is the **skeleton of the app**. Get it wrong and nothing else you build matters, because users literally can't find it.

**It's the mental model users carry.** People have an internal sense of "where am I and how do I get back." A stack that matches that instinct feels effortless; one that violates it — back button that goes somewhere unexpected, a screen you can't escape — feels _broken_ even when every screen individually works. Navigation errors are the ones that generate one-star reviews.
**It's where users get trapped.** The most expensive navigation bug is the dead end: a screen with no back affordance, a flow that loops, a deep link that drops you somewhere with an empty stack and a back button that force-quits the app. Trapped users don't file bug reports — they uninstall.
**It's the accessibility frontier for screen changes.** When the screen changes, a sighted user sees it instantly. A screen-reader user hears _nothing_ unless you make the change announce itself. Focus must move to the new screen; the new title must be spoken. Most apps fail this silently, and it's the difference between usable and unusable for a blind user.
**It carries the brand's sense of motion.** The push transition — how a screen slides in, how the header title cross-fades, whether a tapped image _flies_ into its detail view — is a huge part of how "premium" an app feels. Cheap apps cut this; considered apps obsess over it.
**Deep links and notifications land** **_inside_** **it.** A push notification or a shared URL doesn't drop the user at the home screen — it drops them three levels deep. If you haven't engineered a synthesized back stack, their back button has nowhere to go, and the whole app feels like it fell out of the sky.
* * *

## 3\. Anatomy of a Stack Navigator
A stack navigator is two cooperating parts: the **stack itself** (the data) and the **nav header** (the chrome that reflects it).

**The stack (the back stack / navigation state):** an ordered array of _route entries_, bottom to top. `[Home, Contact, Address, Map]`. The last item is the active screen; everything below is suspended but retained. Each entry carries a route name, its params, a key/identity, and often its own preserved UI state (scroll position, form input).
**The active screen:** the top of the stack — the only one the user interacts with. The rest are painted underneath (or unmounted and rebuilt on pop, depending on the platform).
**The nav header (navigation bar / app bar / top bar):** the strip at the top that _reflects_ the stack. It is the stack's visible partner. Its parts:
**Back affordance (leading):** a back button (chevron + optional previous-screen title on iOS) shown automatically whenever there's a screen beneath. It's absent on the root because there's nothing to pop to.
**Title (center or leading):** names the current screen. On iOS it can collapse from a large title to an inline one on scroll.
**Right actions (trailing):** contextual controls for _this_ screen — Edit, Share, a "+" to add, an overflow menu.
**The transition/animator:** the thing that animates a push (new screen slides in from the trailing edge) and a pop (it slides back out), plus the interactive gesture driver (iOS edge-swipe).
**The gesture recognizer:** the interactive back — iOS's swipe-from-left-edge, which is _interruptible_ and tracks your finger, not just a tap.
**The presentation mode:** per-screen — is this a `card` (standard push, slides horizontally) or a `modal` (slides up from the bottom, has its own dismiss)?

The header and the stack are joined at the hip: **push a screen, the header updates its title and grows a back button; pop it, the header reverts.** In every major framework the header is _derived from_ the stack, not managed separately. That's why you configure the title as a property of the _screen_, not by mutating a header object.
* * *

## 4\. Scale & Density (values that matter)
Navigation chrome has platform-native dimensions. Fighting them makes your app feel foreign. Real values:

| Element | iOS (pt) | Android / Material (dp) | Web (px) |
| ---| ---| ---| --- |
| Nav bar / top app bar height | 44 (+ safe-area top inset) | 56 (64 for medium) | 56–64 |
| Large-title bar (expanded) | 96+ | Large top app bar 152 | — |
| Back button tap target | 44×44 min | 48×48 min | 44×44 min |
| Title text | 17 (inline), 34 (large) | 22 (center), 24–28 (large) | 18–24 |
| Right action icon target | 44×44 | 48×48 | 44×44 |
| Push transition duration | ~350–500ms (spring) | ~300ms (emphasized) | 200–300ms |
| Edge-swipe activation zone | left ~20pt | (system back gesture edges) | n/a |

Rules that matter:

**Respect the safe-area inset.** The nav bar sits _below_ the notch/Dynamic Island / status bar. Hardcode `top: 44` and you'll paint under the clock on half the devices in the world. Use the platform's safe-area API every time.
**Back target stays ≥44/48px even when the chevron looks tiny.** The visible glyph is small; the hit area is not. This is the single most-missed touch-target rule in navigation.
**Title truncates, it doesn't wrap.** A nav title is one line. Long titles get an ellipsis; the _screen_ carries the full name, the bar carries a short one.
**Don't animate faster than the platform.** A 120ms push feels janky and cheap; users read the motion as "where did the previous screen go." Match the native curve.
* * *

## 5\. States (the part people forget)
A stack navigator has _system_ states most tutorials never mention. Missing these is the tell of an amateur build.

**Root / initial** — bottom of the stack. **No back button.** Hardware/browser back here either exits the app or does nothing intentional. The most-forgotten state: what happens when you're already home and press back?
**Pushed (depth ≥ 1)** — a screen with a back trail. Back affordance visible, gesture enabled.
**Pushing (transition in)** — new screen animating in over the old; old screen still mounted underneath. Taps should be blocked mid-transition or you get double-pushes.
**Popping (transition out)** — active screen animating away, revealing the one beneath.
**Interactive-pop in progress** — iOS swipe-back: the user's finger is dragging the top screen partway off. **Cancelable** — they can let go and snap it back. This is a _state_, not an event, and it's why you can't treat pop as instantaneous.
**Deep-linked / cold-start-deep** — the app opened directly onto a deep screen. Is the back stack synthesized (Home → Category → Product) or empty (Product with nowhere to go)? This state defines whether your deep links feel native or broken.
**Backgrounded / process-death restore (Android especially)** — the OS killed your app to reclaim memory; on relaunch you must _rebuild the entire stack and each screen's state_ from saved instance state. The stack is not guaranteed to survive in memory.
**Blocked-pop / unsaved-changes** — the user tries to pop but has an unsaved form. You must intercept the back (hardware, gesture, _and_ button) and confirm. Intercepting only the button and forgetting the Android hardware back / iOS swipe is the classic half-done version.
**Loading-on-push** — the pushed screen needs data. It appears immediately (empty/skeleton) then fills; you never block the transition on the network.
**Reset / replaced** — the whole stack was swapped (post-login: replace the auth stack with the app stack) so back can't return to the login screen.

Bonus, header-specific: **collapsed vs. expanded large title** (iOS), **transparent-over-content vs. opaque** (a header that fades in as you scroll a hero image), and **search-active** (the header morphs into a search field).
* * *

## 6\. Types & Variants
The stack pattern has recognizable flavors:

**Standard card stack:** the default. Screens slide horizontally, back trail accrues. 90% of your navigation.
**Modal stack / presentation:** a screen (or sub-stack) presented _over_ the current context, sliding up from the bottom, dismissed by swipe-down or a Cancel/Done pair instead of a back chevron. Used for self-contained tasks: compose, settings, a picker. iOS 13+ sheets with detents (half-height, full-height) are modal-stack variants.
**Nested stack (stack inside a tab):** each bottom tab owns its _own_ independent stack, so drilling into Search doesn't disturb Home's trail, and switching back to a tab restores exactly where you left it. This is the dominant real-world architecture — see §13.
**Stack inside a stack:** a modal that itself contains a multi-step flow (an onboarding wizard presented modally, with its own internal Next/Back).
**Wizard / flow stack:** a linear multi-step sequence (checkout: cart → shipping → payment → review) where "back" means "previous step" and you often `reset` to a confirmation at the end so back can't re-run the payment.
**Master–detail (split) on large screens:** the same stack that's full-screen on a phone becomes a two-pane list+detail on a tablet/desktop. The stack collapses/expands responsively (SwiftUI `NavigationSplitView`, Flutter adaptive).
**Shared-element / hero stack:** a push where an element (a photo, a card) visually _continues_ from the source screen into the destination, morphing in place instead of the whole screen sliding.
* * *

## 7\. When to Use a Stack (and When Not To)
Use a stack when screens have a **parent → child relationship** and the user needs to _drill in and come back_: list → detail, settings → sub-setting, feed → post → comments. If "back" is a meaningful, expected action between two screens, they belong in a stack.

Don't reach for a stack when:

**The destinations are peers, not parent/child.** Home, Search, Notifications, Profile are co-equal — that's **Bottom Tabs / Tab Navigation**, not a stack. Forcing peers into a stack means users hit back to "switch sections," which is wrong and disorienting.
**You're switching between many equal items.** That's a list or a tab bar, not an ever-growing stack.
**The task is a self-contained interruption.** Compose message, confirm a purchase, pick a date — present it _modally_ over the stack, don't push it into the main trail. Modal signals "finish this or cancel," push signals "you went deeper."
**The flow is genuinely flat.** A single-screen utility doesn't need a navigator at all.

Placement & structure heuristics:

**Tabs on the outside, stacks on the inside.** The near-universal pattern: a bottom tab bar at the root, each tab holding its own stack. Never the reverse (a tab bar that appears _inside_ a pushed detail screen is a smell).
**Keep the stack shallow.** If users routinely go 6+ deep, your information architecture is too nested — flatten it, or add a way to jump home. Deep stacks are exhausting to back out of.
**`replace`****\*\*\*\*, don't** **`push`****\*\*\*\*, when there's no logical "back."** After login, _replace_ the auth screen — pushing it leaves a back button to a screen the user should never see again.
**Reset at flow boundaries.** After a successful checkout, reset to a receipt so back can't re-submit payment.
* * *

## 8\. Stack Navigation Across Platforms & Systems
Same LIFO idea, very different house rules. Fluency here means you can read any codebase.

**Apple HIG (iOS/iPadOS):** the _navigation controller_ is foundational. Back button is a chevron plus (often) the previous screen's title. **Edge-swipe-to-go-back** is a system expectation — break it and iOS users feel betrayed. Large titles that collapse on scroll. Modals slide up as sheets with detents. On iPad, stacks become split views.
**Material Design (Google/Android):** the _top app bar_ with an up-arrow ("Up"). Crucially, Android has **two backs**: _Up_ (within-app hierarchy, in the app bar) and the system **Back** (hardware/gesture, which may leave the app). The predictive-back gesture (Android 14+) previews where back will take you. Emphasized-easing transitions; shared-element transitions are a first-class Material Motion pattern.
**Fluent (Microsoft):** back is a top-left arrow; navigation is often paired with a persistent nav pane on wide screens that collapses to a hamburger on narrow ones. Reveal/depth motion.
**Web (History API):** the browser _is_ the stack. `pushState`/`replaceState`/`popstate`, the URL as the source of truth, the browser's own back/forward buttons you don't control. **View Transitions API** is the new native way to animate between history entries — the web's answer to the push slide and shared-element hero.
**React Navigation / Expo Router (RN standard):** JS-driven stack with a **Native Stack** option that delegates to the real UIKit/Android navigators for native gestures and performance. Expo Router adds file-based routing (URLs = files) on top.
**Ant / enterprise web:** often _breadcrumb_\-driven rather than a literal push stack — the hierarchy is shown as a trail you can jump around in, not just pop one at a time.

The through-line: every platform gives you **push, pop, a header that reflects depth, a back affordance, and a transition.** Learn the model once; remap the API per platform.
* * *

## 8b. The Back Button Is Three Different Buttons
This deserves its own section because it's where stacks break. "Back" is not one thing:

**iOS: the on-screen chevron + the edge-swipe gesture.** There is no hardware back on iOS. The _only_ backs are the header chevron and the interactive swipe from the left edge. The swipe is interruptible and must be honored — disabling it (which some custom headers accidentally do) is a top iOS complaint.
**Android: the app-bar Up arrow** **_and_** **the system Back.** These are **not the same**. _Up_ moves you up the app's hierarchy (parent screen). System _Back_ is chronological — it pops whatever you did last, and at the root it _leaves your app_. A screen reached from a notification might have Up going to a logical parent and Back going to whatever was on screen before. You must handle both, and the predictive-back gesture (14+) wants you to declare where back goes so it can preview it.
**Web: the browser's back/forward buttons + swipe + keyboard.** You don't own these. The user can go back with a button you didn't render, a two-finger swipe, `Alt+Left`, or by editing the URL. Your app has to stay correct no matter how they move through history — which is why the URL, not in-memory state, must be the source of truth.

**The rule:** intercepting "back" for an unsaved-changes guard means intercepting _all three paths on the relevant platform_ — the button, the gesture, and the hardware/browser back. Guarding only the button you rendered is the single most common half-done navigation feature.
* * *

## 9\. The Code
The biggest section. Stack navigation is heaviest on native/mobile, so this leans there — but the web analog gets full treatment because most UJG work ships on the web.

### 9.1 The Mental Model in Plain Data
Before any framework, understand that a stack navigator is _an array plus four operations_. Everything else is chrome.

type Route = { name: string; params?: Record<string, unknown>; key: string };

```typescript
class NavStack {
```

private stack: Route\[\] = \[\];

```typescript
get active() { return this.stack[this.stack.length - 1]; }
```

get canGoBack() { return this.stack.length > 1; }

```typescript
push(name: string, params?: Record<string, unknown>) {
    // Go DEEPER. Previous screen stays underneath, retained.
    this.stack.push({ name, params, key: crypto.randomUUID() });
```

}

```typescript
pop() {
    // Go BACK one. Only if there's something beneath the root.
    if (this.canGoBack) this.stack.pop();
```

}

```typescript
replace(name: string, params?: Record<string, unknown>) {
    // Swap the TOP screen. No new back entry (e.g. after login).
    this.stack[this.stack.length - 1] = { name, params, key: crypto.randomUUID() };
```

}

```typescript
reset(routes: Omit<Route, "key">[]) {
    // Blow away the whole trail and set a new one (e.g. post-checkout).
    this.stack = routes.map(r => ({ ...r, key: crypto.randomUUID() }));
```

}

```typescript
popToTop() { this.stack = this.stack.slice(0, 1); } // back to root in one shot
}
```

The four verbs — **push** (deeper), **pop** (back), **replace** (swap top, no back entry), **reset** (new trail) — are the entire vocabulary. `popToTop` and `popTo(name)` are conveniences on top. Every framework below is a skin over exactly this. Internalize the array and you'll never be confused by a navigation API again.

### 9.2 React Navigation — Native Stack (the React Native standard)
The default choice for RN. `createNativeStackNavigator` delegates to the _real_ platform navigators (UINavigationController on iOS, Fragment/Android navigation), so you get native gestures, native large titles, native performance — not a JS reimplementation.

```typescript
import { createNativeStackNavigator } from "@react-navigation/native-stack";
```

import { NavigationContainer } from "@react-navigation/native";

```typescript
export type RootStackParamList = {
  Contacts: undefined;
  ContactDetail: { id: string };       // typed params — the senior move
  EditContact: { id: string };
```

};

// Pass the param list as the generic — this is what actually types route.params and
// makes a wrong route name fail to compile (§16). An untyped createNativeStackNavigator()
// leaves route.params as `any`, silently defeating the "typed params" promise below.
const Stack = createNativeStackNavigator<RootStackParamList>();

```typescript
function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Contacts"
        screenOptions={{
          headerLargeTitle: true,              // iOS collapsing large title
          headerBackButtonDisplayMode: "minimal",
          gestureEnabled: true,                // iOS edge-swipe back
          animation: "slide_from_right",
        }}
      >
        <Stack.Screen name="Contacts" component={ContactsScreen}
          options={{ title: "Contacts" }} />
        <Stack.Screen name="ContactDetail" component={DetailScreen}
          options={({ route }) => ({ title: route.params.id })} />
        <Stack.Screen name="EditContact" component={EditScreen}
          options={{ presentation: "modal" }} />  {/* slides up, not across */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```

Driving it from a screen, with the four verbs and _typed_ params so a wrong route name won't compile:

import type { NativeStackScreenProps } from "@react-navigation/native-stack";

type Props = NativeStackScreenProps<RootStackParamList, "ContactDetail">;

```typescript
function DetailScreen({ navigation, route }: Props) {
  const { id } = route.params;               // fully typed
  return (
    <>
      <Button title="Edit" onPress={() => navigation.navigate("EditContact", { id })} />
      <Button title="Back" onPress={() => navigation.goBack()} />
      {/* after a save you don't want "back" to return to a stale form: */}
      <Button title="Done" onPress={() => navigation.popToTop()} />
    </>
  );
}
```

Why native stack, not the JS stack: the interactive swipe-back is the real UIKit one (interruptible, physics-correct), large titles are native, and there's no JS-thread jank during the transition. Reach for the JS `createStackNavigator` only when you need transition customization the native one won't allow.

### 9.3 Expo Router — file-based stack (URLs are files)
Expo Router puts a URL router over React Navigation: the file tree _is_ the navigation tree, which means the same routes work on iOS, Android, _and_ web with real URLs and deep links for free.

```plain
// app/_layout.tsx  — declares the stack
import { Stack } from "expo-router";
export default function Layout() {
  return (
    <Stack screenOptions={{ headerLargeTitle: true }}>
      <Stack.Screen name="index" options={{ title: "Contacts" }} />
      <Stack.Screen name="contact/[id]" options={{ title: "Detail" }} />
      <Stack.Screen name="edit/[id]" options={{ presentation: "modal" }} />
    </Stack>
  );
}
```

```plain
// app/contact/[id].tsx  — a screen
```

import { useLocalSearchParams, router, Link } from "expo-router";

```plain
export default function Contact() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <>
      <Link href={`/edit/${id}`}>Edit</Link>          {/* declarative push */}
      <Button title="Home" onPress={() => router.dismissAll()} />
      <Button title="Back"  onPress={() => router.back()} />
    </>
  );
}
```

`router.push`, `router.replace`, `router.back`, `router.dismissAll` map to the four verbs. Because routes are URLs, `myapp://contact/42` and `https://app.ujg.com/contact/42` land on the same screen with a synthesized parent — deep-linking (§9.9) is nearly free.

### 9.4 SwiftUI — `NavigationStack` (iOS 16+)
Apple rebuilt navigation around a **value-driven stack**: you bind an array `path`, and the stack _is_ that array. Append to push, remove to pop. This is the cleanest expression of "the stack is an array" in any framework.

```swift
struct RootView: View {
```

```plain
@State private var path: [Route] = []          // THE stack, as data
```

```swift
var body: some View {
        NavigationStack(path: $path) {
            ContactsList()
                .navigationTitle("Contacts")
                .navigationDestination(for: Route.self) { route in
                    switch route {
                    case .detail(let id): ContactDetail(id: id)
                    case .edit(let id):   EditContact(id: id)
                    }
                }
        }
    }
```

}

enum Route: Hashable { case detail(String), edit(String) }

```swift
// Push = append to the path. Pop = removeLast. Reset = replace the array.
struct ContactsList: View {
    var body: some View {
        List(contacts) { c in
            NavigationLink(value: Route.detail(c.id)) { Text(c.name) }
        }
    }
}
```

Programmatic control is just array mutation — which makes deep-linking trivial (you _assign_ the whole path):

```swift
// Deep link: open Detail(42) with Contacts synthesized underneath.
```

path = \[.detail("42")\] // Contacts (root) is always beneath; back works.

```swift
func popToRoot()  { path.removeAll() }
func pop()        { if !path.isEmpty { path.removeLast() } }
```

The header (title, back chevron, toolbar) is derived automatically. Right actions go in `.toolbar { ToolbarItem(placement: .topBarTrailing) { … } }`. The edge-swipe-back comes free — you don't wire it. `NavigationSplitView` is the same idea in a two-column, iPad/Mac-adaptive form.

### 9.5 Jetpack Compose — Navigation (Android)
Compose Navigation uses a `NavController` and a `NavHost` of composable destinations. Type-safe routes (via `@Serializable`) arrived to kill the old string-route footguns.

```kotlin
@Serializable object Contacts
@Serializable data class ContactDetail(val id: String)
```

@Serializable data class EditContact(val id: String)

```kotlin
@Composable
fun App() {
    val nav = rememberNavController()
    NavHost(navController = nav, startDestination = Contacts) {
        composable<Contacts> {
            ContactsScreen(onOpen = { id -> nav.navigate(ContactDetail(id)) })
        }
        composable<ContactDetail> { entry ->
            val args = entry.toRoute<ContactDetail>()
            DetailScreen(
                id = args.id,
                onEdit = { nav.navigate(EditContact(args.id)) },
                onBack = { nav.popBackStack() },
            )
        }
        composable<EditContact> { /* … */ }
    }
}
```

The **hardware/gesture back** is handled by the `NavController` automatically _when you use the Compose back stack_. To intercept it (unsaved changes), use `BackHandler` — and note this catches the system back, which is _separate_ from any Up arrow you render in the `TopAppBar`:

```kotlin
BackHandler(enabled = hasUnsavedChanges) {
    showDiscardDialog = true          // catches system back + predictive-back gesture
```

}

```kotlin
Scaffold(topBar = {
    TopAppBar(
        title = { Text("Edit contact") },
        navigationIcon = {                 // the "Up" affordance — distinct from system Back
            IconButton(onClick = { if (hasUnsavedChanges) showDiscardDialog = true else nav.navigateUp() }) {
                Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
            }
        },
    )
}) { /* … */ }
```

`AutoMirrored` matters: the back arrow flips direction in RTL locales automatically. `navigate(route) { popUpTo(Contacts) { inclusive = false } }` is how you `reset`/trim the back stack.

### 9.6 Flutter — Navigator 1.0 vs. 2.0
Flutter's `Navigator` is a literal stack of `Route` objects. There are two APIs, and knowing _which to use when_ is the senior distinction.

**Navigator 1.0 (imperative — great for simple push/pop):**

```dart
// Push (deeper)
Navigator.push(context, MaterialPageRoute(
  builder: (_) => ContactDetail(id: id),
```

)); // MaterialPageRoute gives the platform-correct transition automatically

```dart
Navigator.pop(context);                       // back
Navigator.pushReplacement(context, route);    // replace top (post-login)
```

Navigator.popUntil(context, (r) => r.isFirst);// pop to root

```dart
// Guard the back (unsaved changes) — covers Android hardware back + gesture:
PopScope(
  canPop: !hasUnsavedChanges,
  onPopInvokedWithResult: (didPop, _) {
    if (!didPop) _confirmDiscard(context);
  },
  child: EditContactForm(),
);
```

**Navigator 2.0 (declarative — for deep links, web URLs, and complex state-driven stacks):** you provide a `RouterDelegate` that builds the whole page stack from your app state, so the stack becomes a _pure function of state_. This is what you use when the URL must drive navigation (Flutter web) or when a deep link needs to reconstruct several pages at once. In practice most teams reach for `go_router` (which wraps 2.0):

```dart
final router = GoRouter(routes: [
  GoRoute(path: '/', builder: (_, __) => const ContactsScreen(), routes: [
    GoRoute(path: 'contact/:id', builder: (_, s) =>
        ContactDetail(id: s.pathParameters['id']!)),   // '/contact/42' → Contacts under Detail
  ]),
]);
// context.push('/edit/42'), context.pop(), context.go('/') — the four verbs, URL-shaped.
```

Rule: **Navigator 1.0 for a phone app's simple drill-downs; 2.0 / go\_router the moment URLs, deep links, or web enter the picture.**

### 9.7 The Web Analog — History API + a real router
On the web the stack already exists: it's the browser history. A minimal-but-honest client router shows the mapping explicitly.

```typescript
class WebStackRouter {
  // Named handler so it can be removed on teardown (an anonymous listener leaks forever).
  private onPopState = () => this.navigated(location.pathname);
  constructor(
    private render: (path: string) => void,
    private live: HTMLElement,   // a persistent <div aria-live="polite"> route-change region (§10)
  ) {
    // The browser's back/forward buttons fire popstate — the "pop" you don't control.
    window.addEventListener("popstate", this.onPopState);
    this.navigated(location.pathname);
  }
  push(path: string)    { history.pushState({}, "", path);   this.navigated(path); }  // deeper
  replace(path: string) { history.replaceState({}, "", path); this.navigated(path); } // swap top
  back()                { history.back(); }                                           // pop → popstate
  destroy()             { window.removeEventListener("popstate", this.onPopState); }  // cleanup

  // Every navigation — yours OR the browser's back — renders, THEN moves focus to the new
  // screen's <h1> and announces its title. §10 makes this non-negotiable: on the web nothing
  // announces a screen change for you, and focus left on the trigger orphans keyboard/SR users.
  private navigated(path: string) {
    this.render(path);
    const heading = document.querySelector<HTMLElement>("main h1");
    if (heading) {
      heading.setAttribute("tabindex", "-1");        // make the title programmatically focusable
      heading.focus();                                // pull focus off the trigger, onto the new screen
      this.live.textContent = heading.textContent;    // speak the new screen's name via the live region
    }
  }
}
```

Two things web engineers must internalize: (1) **the URL is the source of truth**, not an in-memory array — the user can retype it, share it, reload on it, so your stack must be reconstructable from the path alone; (2) **you don't own the back button** — the browser's back, the trackpad swipe, `Alt+Left`, and history-editing all fire the same `popstate`, so correctness can't depend on the user using _your_ back control. React Router, Next.js App Router, SvelteKit, and TanStack Router are all production versions of exactly this class.

### 9.8 Transitions — slide, shared-element, and the View Transitions API
The push isn't a cut; it's a _motion_ that tells the user which way they're going.

**The default slide (CSS, for the web router above).** New screen enters from the trailing edge, old screen parallaxes slightly and dims — that depth cue is what reads as "on top of."

```css
@keyframes push-in  { from { transform: translateX(100%); } to { transform: translateX(0); } }
@keyframes push-out { from { transform: translateX(0); } to { transform: translateX(-30%); opacity: .6; } }
.screen-entering { animation: push-in .3s cubic-bezier(.2,.8,.2,1); }
```

.screen-leaving { animation: push-out .3s cubic-bezier(.2,.8,.2,1); }

```css
@media (prefers-reduced-motion: reduce) {
  .screen-entering, .screen-leaving { animation: none; }  /* honor it — motion sickness is real */
}
```

**Shared-element / hero transition.** A tapped thumbnail _becomes_ the detail's header image — it flies and scales into place instead of the whole screen sliding. On the web, the **View Transitions API** does this natively by matching `view-transition-name`s across the two DOM states:

```css
.thumb-42        { view-transition-name: photo-42; }  /* on the list screen */
.detail-hero-42  { view-transition-name: photo-42; }  /* same name on the detail screen */
```

```typescript
// Wrap the navigation that swaps the DOM; the browser tweens matching names.
function navigateWithTransition(update: () => void) {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  // No View Transitions support, OR the user asked for less motion → just swap, no tween.
  // Guarding here (not only in CSS) matters: startViewTransition's default cross-fade runs
  // even when your keyframes are `none`, so a reduced-motion user still gets an unwanted fade.
  if (!document.startViewTransition || reduce) return update();
  document.startViewTransition(update);
}
```

Native equivalents: SwiftUI `.matchedGeometryEffect` / `.navigationTransition(.zoom)`, Android **shared-element transitions** (a first-class Material Motion pattern, and native in Compose), Flutter `Hero(tag: 'photo-42')`. Same concept everywhere: **name the element on both screens; the framework tweens between them.** View Transitions is the web finally getting the native mobile hero for free.

### 9.9 Deep-Linking INTO a Stack (synthesizing the back stack)
The make-or-break feature. A notification or shared URL for `/orders/42/tracking` must not dump the user on a tracking screen with a dead back button. You **synthesize** the stack the user _would have_ built: `Home → Orders → Order 42 → Tracking`, so back walks out naturally.

```typescript
// React Navigation: declare how URLs map to the nested stack.
const linking = {
  prefixes: ["myapp://", "https://app.ujg.com"],
  config: {
    screens: {
      Home: "",
      Orders: {
        screens: {
          OrderList: "orders",
          OrderDetail: "orders/:id",
          Tracking: "orders/:id/tracking",   // deep target — parents synthesized above it
        },
      },
    },
  },
};
// <NavigationContainer linking={linking}> — RN builds Home→Orders→Detail→Tracking automatically.
```

The pattern in every framework:

**iOS / SwiftUI:** assign the whole `path` array — `path = [.orders, .order("42"), .tracking("42")]`. Because the stack _is_ the array, one assignment reconstructs the trail.
**Android:** `NavDeepLinkBuilder` (or `navController.navigate(deepLink)`) builds a synthetic back stack that respects your navigation graph's parent hierarchy.
**Web:** the router derives parents from the URL segments — `/orders/42/tracking` implies `/orders/42` and `/orders` as ancestors if your route tree is nested. The browser back walks the _history_, but "up" logic uses the path hierarchy.

**The test:** cold-start the app from a deep link and press back once. If you land on the logical parent, you did it right. If the app closes or shows a blank root, you shipped the amateur version.

### 9.10 State Preservation Across Push/Pop (and process death)
When you push, the screen beneath **stays alive** — its scroll position, form input, and in-flight requests persist, and popping back reveals it exactly as left. That's the promise of a stack, and breaking it (rebuilding the parent from scratch on pop, losing scroll) is a top-tier "feels cheap" bug.

Two distinct problems:

**Within a session:** don't unmount the parent on push. RN native stack, SwiftUI, and Compose keep lower entries mounted by default; the mistake is usually a state library that resets, or a `key` that changes and forces a remount. Store scroll/filter state _in the screen_, not in a parent that re-renders.
**Across process death (Android, and iOS under memory pressure):** the OS can kill your app while backgrounded and you must **rebuild the entire stack** on relaunch. The navigation state must be serializable and saved.

```typescript
// React Navigation: persist and restore the whole navigation state across process death.
<NavigationContainer
  initialState={restoredState}                 // loaded from storage on launch
  onStateChange={(state) => persist(NAV_KEY, state)}  // save every change
>
```

Android's `rememberSaveable` / `SavedStateHandle` and iOS `NSUserActivity`/scene restoration do the same job natively: the stack is _data_, so save the data. Never assume the in-memory stack survives backgrounding.

### 9.11 Nested Navigators — a Stack inside a Tab
The dominant real-world architecture: a bottom tab bar where **each tab owns its own stack**, so the tabs are parallel and persistent while each one drills independently. (See **Bottom Tabs** for the tab layer.)

```typescript
const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();
```

const SearchStack = createNativeStackNavigator();

```typescript
function HomeStackNav() {
  return (
    <HomeStack.Navigator>
      <HomeStack.Screen name="Feed" component={Feed} />
      <HomeStack.Screen name="Post" component={Post} />
    </HomeStack.Navigator>
  );
```

}

```typescript
function Root() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="HomeTab" component={HomeStackNav} />
      <Tab.Screen name="SearchTab" component={SearchStackNav} />
    </Tab.Navigator>
  );
}
```

The behaviors this buys you, that users unconsciously expect:

**Independent trails:** drilling deep in Search doesn't touch Home's stack. Switch tabs and back, and Search is exactly where you left it.
**Tap-active-tab-to-pop-to-root:** tapping the _already-selected_ tab pops its stack to the top. This is a real convention (Instagram, Twitter) — wire it, don't skip it.
**Header ownership:** the _stack_ renders the header, not the tab bar. The tab bar stays at the bottom across the whole stack (or hides on deeper screens if you choose). A tab bar appearing _above_ a pushed detail is the classic nesting-order mistake.
**Cross-tab navigation:** deep links and "see in Home" actions can target a screen in another tab's stack; the navigator resolves the tab _and_ the depth.

### 9.12 Testing the Stack
You test _navigation behavior_, not pixels: does pushing show the right screen, does back reveal the previous one, does a guard block the pop, is the new screen announced.

```typescript
// React Navigation with Testing Library — render the real navigator, drive it like a user.
```

import { render, screen, fireEvent } from "@testing-library/react-native";

```typescript
test("push shows detail, back returns to list", async () => {
  render(<App />);                                   // real NavigationContainer + stack
```

expect(screen.getByText("Contacts")).toBeTruthy(); // root

```typescript
fireEvent.press(screen.getByText("Ada Lovelace")); // push detail
```

expect(await screen.findByText("Contact detail")).toBeTruthy();

```typescript
fireEvent.press(screen.getByLabelText("Back"));    // pop
  expect(screen.getByText("Contacts")).toBeTruthy(); // back at root
```

});

```typescript
test("unsaved-changes guard blocks the pop", async () => {
  render(<App />);
  fireEvent.press(screen.getByText("Ada Lovelace"));
  fireEvent.press(await screen.findByText("Edit"));
  fireEvent.changeText(screen.getByLabelText("Name"), "changed");
  fireEvent.press(screen.getByLabelText("Back"));
  expect(screen.getByText("Discard changes?")).toBeTruthy();  // intercepted, not popped
});
```

```typescript
// E2E on a real device build (Detox / Maestro) — the only place gestures and hardware back are real.
// Maestro flow (YAML): prove the iOS swipe-back and Android hardware back both work.
// - launchApp
// - tapOn: "Ada Lovelace"
// - assertVisible: "Contact detail"
// - back                      # exercises platform back (hardware on Android, swipe on iOS)
// - assertVisible: "Contacts"
```

```typescript
// Deep-link test — cold start onto a deep screen, assert back reaches the parent.
test("deep link synthesizes a back stack", async () => {
  render(<App />, { initialUrl: "myapp://orders/42/tracking" });
  expect(await screen.findByText("Tracking")).toBeTruthy();
  fireEvent.press(screen.getByLabelText("Back"));
  expect(screen.getByText("Order 42")).toBeTruthy();  // synthesized parent, not a dead end
});
```

What to assert (and skip):

**Do test:** the right screen mounts on push, back reveals the previous screen, guards intercept _all_ back paths, deep links synthesize parents, focus moves and the title is announced (query `byRole`/`byLabelText` — proves a11y).
**Don't test:** transition pixel positions, exact animation timings, header hex colors.
**Bonus:** run `axe` on each web screen after navigation; assert an `aria-live` region announced the new screen name.

### 9.13 React Router — nested routes as the screen stack (web)
On the web, React Router is the stack most UJG React apps actually ship. Nested routes _are_ the parent→child trail: an `<Outlet />` renders the child inside the parent, and the URL segments are the back stack. `useNavigate` gives you the four verbs; `navigate(-1)` is pop, and `{ replace: true }` is the post-login swap.

```plain
import { createBrowserRouter, RouterProvider, Outlet, Link, useNavigate, useParams } from "react-router-dom";

// The route tree IS the stack: /contacts → /contacts/:id → /contacts/:id/edit
const router = createBrowserRouter([
  {
    path: "/contacts",
    element: <ContactsLayout />,          // renders <Outlet/> for its children
    children: [
      { index: true, element: <ContactsList /> },
      {
        path: ":id",
        loader: async ({ params }) => getContact(params.id),  // data before the screen paints
        element: <ContactDetail />,
        children: [{ path: "edit", element: <EditContact /> }],
      },
    ],
  },
]);

export default function App() { return <RouterProvider router={router} />; }

function ContactDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  return (
    <>
      <Link to="edit">Edit</Link>                         {/* declarative push, URL-relative */}
      <button onClick={() => navigate(`/contacts/${id}`, { replace: true })}>Save</button> {/* replace top */}
      <button onClick={() => navigate(-1)}>Back</button>  {/* pop — same as the browser back */}
      <Outlet />                                          {/* the pushed child renders here */}
    </>
  );
}
```

Because the URL is the source of truth, a shared link like `/contacts/42/edit` reconstructs the whole trail — the loaders for `/contacts` and `/contacts/42` run to synthesize the parents (§9.9). Guard an unsaved-changes pop with `useBlocker`, which intercepts the browser back and in-app navigations both.

### 9.14 Next.js App Router — file-based stack with server components
Next.js's App Router is the file tree as the navigation tree, the same idea as Expo Router but for the web. Nested `layout.tsx` files persist across pushes (they don't remount when a child changes), which is how you keep a header or tab bar mounted while the screen underneath swaps. `useRouter` carries the verbs; server components let the pushed screen fetch on the server before it streams in.

```plain
// app/orders/[id]/page.tsx — a screen; params arrive server-side, data fetched before paint
export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await getOrder(id);                       // runs on the server, no client spinner
  return <OrderDetail order={order} />;
}
```

```plain
"use client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export function OrderActions({ id }: { id: string }) {
  const router = useRouter();
  return (
    <>
      <Link href={`/orders/${id}/tracking`}>Track</Link>   {/* push, prefetched on hover */}
      <button onClick={() => router.replace("/orders")}>Done</button> {/* replace — no back to this */}
      <button onClick={() => router.back()}>Back</button>  {/* pop */}
    </>
  );
}
```

`<Link>` prefetches the next route in the background so the push feels instant (§14). A parallel route + intercepting route (`(.)photo/[id]`) is how Next models a modal that deep-links to a full page on reload — the canonical "modal-over-stack that survives a shared URL" pattern.

### 9.15 Vue Router — the web stack in Vue
Vue Router is Vue's official stack over the History API. `createRouter` with `createWebHistory` gives you real URLs; `router.push` / `router.replace` / `router.back` / `router.go` are the verbs one-for-one. Nested routes render through `<router-view />`, and `scrollBehavior` restores scroll on pop — the stack promise that back reveals the screen exactly as you left it.

```plain
import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
  history: createWebHistory(),
  scrollBehavior(to, from, saved) { return saved ?? { top: 0 }; }, // restore scroll on pop
  routes: [
    { path: "/contacts", component: ContactsLayout, children: [   // nested = the back trail
      { path: "", component: ContactsList },
      { path: ":id", component: ContactDetail, props: true },
      { path: ":id/edit", component: EditContact, props: true },
    ]},
  ],
});

// Guard the pop when a form is dirty — catches browser back + in-app nav.
router.beforeEach((to, from) => {
  if (from.meta.dirty && !confirm("Discard changes?")) return false;
});
```

```plain
<script setup>
import { useRouter, useRoute } from "vue-router";
const router = useRouter();
const route = useRoute();
</script>
<template>
  <router-link :to="`/contacts/${route.params.id}/edit`">Edit</router-link>  <!-- push -->
  <button @click="router.replace(`/contacts/${route.params.id}`)">Save</button> <!-- replace -->
  <button @click="router.back()">Back</button>                                 <!-- pop -->
  <router-view />                                                              <!-- child renders here -->
</template>
```

### 9.16 SvelteKit — file routing plus a stack store
SvelteKit routes are folders (`src/routes/contacts/[id]/+page.svelte`), and `goto()` drives navigation over the History API. For screen-stack UI that isn't a full URL change — a wizard, a nested modal flow — a tiny Svelte store models the LIFO array directly, giving you the four verbs without leaving the page.

```plain
// src/lib/stack.ts — a hand-rolled screen stack as a Svelte store (the array + four verbs)
import { writable } from "svelte/store";
type Screen = { name: string; params?: Record<string, unknown> };

function createStack(initial: Screen) {
  const { subscribe, update } = writable<Screen[]>([initial]);
  return {
    subscribe,
    push:    (s: Screen) => update(a => [...a, s]),                 // deeper
    pop:     ()          => update(a => a.length > 1 ? a.slice(0, -1) : a), // back (never past root)
    replace: (s: Screen) => update(a => [...a.slice(0, -1), s]),    // swap top
    reset:   (s: Screen) => update(() => [s]),                      // new trail
  };
}
export const wizard = createStack({ name: "cart" });
```

```plain
<!-- +page.svelte — drive URL-level pushes with goto, screen-level pushes with the store -->
<script>
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";
  import { wizard } from "$lib/stack";
  $: id = $page.params.id;
</script>

<button on:click={() => goto(`/contacts/${id}/edit`)}>Edit</button>            <!-- URL push -->
<button on:click={() => goto(`/contacts/${id}`, { replaceState: true })}>Save</button> <!-- replace -->
<button on:click={() => history.back()}>Back</button>                          <!-- pop -->
<button on:click={() => wizard.push({ name: "shipping" })}>Next step</button>  <!-- in-page stack push -->
```

SvelteKit's `load` functions run for the destination and its parent layouts, so a deep link reconstructs the ancestor data the same way React Router's loaders do.

### 9.17 Angular Router — with route reuse for state preservation
Angular's Router is config-driven: a `Routes` array with nested `children` and a `<router-outlet>`. `router.navigate` pushes, `Location.back()` pops, and `{ replaceUrl: true }` swaps the top. Angular's distinctive lever is `RouteReuseStrategy` — by default Angular destroys a component on navigate-away, which loses scroll and form state on pop; a reuse strategy detaches and caches the component so the stack's "screen underneath survives" promise holds.

```plain
const routes: Routes = [
  { path: "contacts", component: ContactsLayout, children: [    // nested = the trail
    { path: "", component: ContactsListComponent },
    { path: ":id", component: ContactDetailComponent,
      canDeactivate: [unsavedChangesGuard] },                   // guard the pop
    { path: ":id/edit", component: EditContactComponent },
  ]},
];

@Component({ /* ... */ })
export class ContactDetailComponent {
  constructor(private router: Router, private location: Location) {}
  edit(id: string) { this.router.navigate(["contacts", id, "edit"]); }   // push
  save(id: string) { this.router.navigate(["contacts", id], { replaceUrl: true }); } // replace
  back()           { this.location.back(); }                             // pop
}
```

```plain
// Cache detached screens so back restores them with scroll/form intact.
export class StackReuseStrategy implements RouteReuseStrategy {
  private store = new Map<string, DetachedRouteHandle>();
  shouldDetach(route: ActivatedRouteSnapshot) { return route.data["reuse"] === true; }
  store(route: ActivatedRouteSnapshot, handle: DetachedRouteHandle) {
    this.store.set(route.routeConfig!.path!, handle);
  }
  shouldAttach(route: ActivatedRouteSnapshot) { return this.store.has(route.routeConfig?.path ?? ""); }
  retrieve(route: ActivatedRouteSnapshot) { return this.store.get(route.routeConfig?.path ?? "") ?? null; }
  shouldReuseRoute(a: ActivatedRouteSnapshot, b: ActivatedRouteSnapshot) { return a.routeConfig === b.routeConfig; }
}
// providers: [{ provide: RouteReuseStrategy, useClass: StackReuseStrategy }]
```

* * *

## 10\. Accessibility (non-negotiable)
When the screen changes, sighted users see it; everyone else needs to be _told_. This is where most apps fail silently.

**Move focus to the new screen.** On push, focus must land on the new screen — ideally its header/title or first element — not stay orphaned on the button that triggered the push. On web, set focus to the new view's `<h1>`/main region programmatically after navigation.
**Announce the new screen.** Screen-reader users need the new screen's _name_ spoken. iOS/Android nav controllers do this natively when you set the title. On web there's no automatic announcement — use a **route-change live region** (`aria-live="polite"`) that you update with the new page title on every navigation, or move focus to a labeled heading.
**The title is the label.** Each screen's nav title must be meaningful out of context ("Order 42 tracking," not "Details"), because it's what gets announced and what appears in the back button's "back to \_\_\_" affordance.
**Back must be reachable and labeled.** The back control needs an accessible name ("Back," or "Back to Orders"). Icon-only back chevrons need an `aria-label`/`contentDescription`. Never rely on the gesture alone — a screen-reader user swipes to move the reading cursor, not to go back.
**Respect the platform back.** Don't trap focus in a way that defeats the hardware/gesture back. If you intercept back for a guard, the confirmation dialog itself must be focus-managed and announced.
**Motion.** Honor `prefers-reduced-motion` / "Reduce Motion" — swap the slide/hero for a cross-fade or cut. Parallax and hero flights are exactly the motion that triggers vestibular discomfort.
**Headings & landmarks (web).** Each screen is a `<main>` with an `<h1>`; the nav header is a `<header>`/`role="banner"` region. Screen-reader users navigate by landmark and heading, so a new screen with no `<h1>` is a new screen they can't orient in.
**RTL.** Back chevrons and slide direction mirror in right-to-left locales — "back" comes from the _right_. Use logical/auto-mirrored icons and logical properties so it's automatic.
* * *

## 11\. Innovative & Emerging Ideas
The stack looks solved but keeps evolving, and 2026 is a genuinely interesting year for it:

**View Transitions API, cross-document (2025+):** the browser now animates _between full page loads_, not just SPA state swaps — MPAs get native push/hero transitions with zero JS. The web's navigation is finally as fluid as native, and it's declarative.
**Android predictive back (default in 15+):** the back gesture _previews_ where you'll land — you see the previous screen peek in as you drag, and can cancel. It forces apps to _declare_ their back destination ahead of time, which is making navigation graphs more honest.
**Speculative / instant navigation:** the Speculation Rules API prefetches and pre-renders the likely-next screen so the push is instant. The stack push feels like it already happened.
**Shared-element as a baseline, not a flourish:** with View Transitions on the web and native support everywhere, hero transitions are becoming the _default_ expectation for list→detail, not a premium extra.
**Server-driven navigation:** the back stack described by the backend (a JSON navigation graph) so product can reshape flows without an app release — big in super-apps.
**Fluid, interruptible everything:** iOS-style _interruptible_ transitions (grab the screen mid-push, throw it back) spreading to Android and web via spring-based animators.
**Spatial / depth-aware stacks (visionOS carryover):** screens with real z-depth and parallax, where "deeper in the stack" is literally further back in space.
**AI-routed navigation:** "take me to my last order's tracking" resolving to a synthesized deep stack, the agent driving the same push/pop verbs a tap would.

**For UJG:** on the web builds, adopt the View Transitions API for list→detail hero moments (it's the single biggest "this feels native" upgrade available right now), keep transitions spring-based and reduced-motion-guarded, and treat deep-link back-stack synthesis as table stakes for anything with shareable URLs.
* * *

## 12\. UX Killers (mistakes that bleed trust silently)
None of these crash. They just make the app feel broken, and users leave without telling you why.

**The dead-end screen.** A screen you reach (usually via deep link or notification) with no back affordance and an empty stack — back exits the app. The most common and most fatal navigation bug. _Always_ synthesize a back stack.
**`push`** **where you needed** **`replace`****\*\*\*\*.** Logging in with `push` leaves a back button to the login screen; users tap it and are confused or logged-out. Post-auth, post-checkout, and post-onboarding are _replace_/_reset_ moments, not pushes.
**The infinite self-push.** A screen that can push another instance of itself (profile → "mutual friend" → their profile → …) with no depth limit. The stack grows to 40 and back takes a minute. Cap depth or `popTo`.
**Ignoring the hardware/gesture back.** Guarding only your rendered back button and forgetting Android hardware back / iOS swipe means users blow past your unsaved-changes guard and lose work.
**Tab-switch that resets the stack.** Switching away from a tab and back should restore its exact depth and scroll. Rebuilding it from the root each time makes the app feel amnesiac.
**Blocking the transition on the network.** Pushing a screen and showing a spinner _before_ the screen appears makes navigation feel sluggish. Show the screen immediately with a skeleton; load into it.
**Silent screen changes for screen readers.** No focus move, no announcement — a blind user taps and has no idea the screen changed. Invisible to you, total blocker for them.
**Losing scroll/form state on pop.** Back to a list that jumped to the top, or a form that cleared, breaks the core promise of a stack: "the screen underneath is exactly as I left it."
**A back button that lies.** Header "Up" going somewhere different from what the user expects, or different from system Back with no reason. Back must be predictable above all else.

**The through-line:** navigation failures don't throw errors — they erode the feeling that the app is _solid_. A user who gets trapped or loses work once trusts the app less forever. Audit your flows the way you'd audit a checkout.
* * *

## 13\. Advanced Patterns
The senior-move versions of everything above.

**The unsaved-changes guard, done completely.** Intercept _every_ back path, not just the button:

```typescript
// React Navigation: usePreventRemove catches button, iOS swipe, AND Android hardware back.
```

import { usePreventRemove } from "@react-navigation/native";

```typescript
usePreventRemove(hasUnsavedChanges, ({ data }) => {
  Alert.alert("Discard changes?", "You have unsaved edits.", [
    { text: "Keep editing", style: "cancel" },
    { text: "Discard", style: "destructive", onPress: () => navigation.dispatch(data.action) },
  ]);
});
```

**Type-safe routes everywhere.** The whole class of "navigated to a screen that needs an `id` without passing one" bugs vanishes when params are typed: RN's `ParamList` generic, Compose's `@Serializable` typed routes, SwiftUI's `Hashable` route enum, Expo/`go_router` typed builders. If your navigation uses stringly-typed route names and untyped params, that's the junior version — a rename silently breaks a link with no compile error.

**Result-passing on pop.** A child screen (a picker) returns a value to its parent. Don't reach into global state — pass a callback param or use the platform's result API (Compose `SavedStateHandle` on the previous entry, SwiftUI binding, RN param callback). The parent asked a question; the popped child answers it.

**Conditional stacks (auth gating).** Render _different_ navigators based on auth state rather than pushing/guarding a login screen — swapping the whole tree means there's no back-to-login footgun and no half-authed states:

```plain
{user ? <AppStack /> : <AuthStack />}   // the whole navigator swaps; no reset gymnastics
```

**Freeze off-screen screens.** `react-freeze` / `enableFreeze()` suspends rendering of screens below the top so a busy parent doesn't burn CPU while covered. Native stack does this for you; JS stacks need the hint.

**Reset to a receipt.** After an irreversible action (payment, submit), `reset` the stack to a confirmation screen so back cannot re-trigger the action — a navigation-level idempotency guard that pairs with the server-side one from the Button doc.

**Cross-platform, one route table.** Expo Router / a URL-shaped route table lets iOS, Android, and web share _one_ navigation definition, so a deep link, a web URL, and an in-app push all resolve identically. One source of truth for the whole app's structure.
* * *

## 14\. Performance & Cost
Navigation feels free; at scale it isn't.

**Keep lower screens mounted, but frozen.** The stack's promise (state preserved underneath) means you _don't_ unmount parents — but you _should_ stop them rendering while covered. Native stack + `enableFreeze()` cut the CPU of a deep stack dramatically. The balance: retain state, suspend work.
**Lazy-load screen code.** Don't ship every screen's JS/bundle up front. Route-based code-splitting (`React.lazy` per screen, Expo Router's automatic splitting, dynamic imports in web routers) means the checkout screen's code loads when you push toward it, not at app launch.
**Don't block the transition.** Render the pushed screen immediately with a skeleton; fetch into it. A push that waits on the network before appearing reads as lag even when the data is fast.
**Animate compositor-only properties.** Transitions should move `transform`/`opacity` only — never `width`/`height`/`left`, which reflow every frame. This is why native stacks run the transition on the UI thread off the JS thread: no JS jank mid-push.
**Prune the stack.** An unbounded stack is retained memory: every screen underneath holds its component tree and data. Cap depth, `popToTop` at natural boundaries, and reset after flows so the array doesn't grow forever.
**Prefetch the likely next screen.** For predictable drill-downs (list → detail), prefetch the detail's data on hover/press-in or via Speculation Rules so the push is instant. Spend the network before the tap, not after.
* * *

## 15\. Security
Stack navigation is a paradigm, not a form or endpoint, but it touches real security surfaces that teams miss because they think "it's just navigation."

**The URL is not authorization.** A deep link to `/admin/billing` and the route existing does not mean this user may see it. Hiding a screen from the stack (not rendering its push trigger) is UX, never a security boundary. The route's loader/handler must independently re-check auth on every request. A user can type the URL, share it, or hit the endpoint directly regardless of what the nav showed them.

**Deep-link params are attacker-controllable.** A shared URL like `myapp://orders/42/tracking` carries an ID the user can edit. The server must authorize that _this_ user owns order 42, not trust it because it came from your own link structure.

**`replace`** **after auth is a security pattern, not just UX.** If you `push` the app stack after login instead of `replace`/`reset`, the back button returns to the login screen, which may re-display credentials, session tokens, or pre-filled email. Always replace or reset the auth stack post-login.

**State restoration and sensitive data.** If you persist the navigation state for process-death restoration (§9.10), that serialized state may contain route params with PII (user IDs, order numbers, tokens). Encrypt or scope it, and clear it on logout. A restored stack from a previous session that still shows another user's data is a privacy leak.

**Predictive back and route leakage (Android 14+).** The predictive back gesture previews the _previous_ screen. If that previous screen contains sensitive content (a payment form, a message), the preview may flash it before the user commits to going back. Test your sensitive screens with predictive back enabled.

**Open-redirect via navigation params.** If any route accepts a `returnTo` or `next` param that drives a post-action navigation, validate it against an allowlist. An unvalidated redirect target in a navigation param is a phishing vector.

**Modal stacks and clickjacking.** A modal presentation (sheet, dialog) with a high-stakes confirm button is iframe-jackable on web. Defend with `Content-Security-Policy: frame-ancestors 'none'` at the HTTP header level.
* * *

## 16\. Senior-Level Checklist (ship-ready)
Before a stack navigator is "done":

Right paradigm chosen: stack for hierarchy, tabs for peers, modal for interruptions.
Root screen has no back button; root-level back exits/does-nothing intentionally.
Every non-root screen has a reachable, labeled back affordance (≥44/48px target).
Back guard (unsaved changes) intercepts the button **and** hardware/gesture/browser back.
`replace`/`reset` used after login, checkout, onboarding — no back-to-a-dead-screen.
Deep links synthesize a real back stack; cold-start + one back reaches a logical parent.
Navigation state is serializable and survives process death (Android) / scene restore (iOS).
Nested stacks in tabs keep independent, preserved trails; tap-active-tab pops to root.
Route params are typed; a wrong route name won't compile.
Screen change moves focus and announces the new title (native, or web `aria-live`/`<h1>` focus).
Transitions honor `prefers-reduced-motion`; RTL mirrors back direction and slide.
Scroll/form state preserved on the screen beneath across push/pop.
Lower screens frozen while covered; screen code lazy-loaded; transition never network-blocked.
* * *

## 17\. Visual Styles (the same stack, eleven skins)
Design systems are _whose_ rules; visual styles are _which look_. The nav header, back button, and transitions can wear any skin — but **the skin never changes the behavior**: the LIFO stack, the four verbs, focus movement, screen announcement, back-path handling, and the ≥44/48px targets stay identical across all eleven. Full guidance lives in the 🎨 Design Styles (visual languages) ([https://app.clickup.com/8495850/docs/838qa-81211/838qa-200551](https://app.clickup.com/8495850/docs/838qa-81211/838qa-200551)) doc.

**Flat:** solid-fill header, crisp hairline divider under it, plain chevron, straight horizontal slide. Reads instantly, scales fast.
**Material:** elevated top app bar with a subtle shadow that appears on scroll, ripple on the back button, emphasized-easing slide and first-class shared-element transitions.
**Glassmorphism:** translucent header with `backdrop-filter: blur()` over the content scrolling beneath it — iOS's classic frosted nav bar. Guard title contrast against whatever scrolls under.
**Liquid Glass (the 2026 trend):** Apple's iOS 26 / macOS Tahoe language — the nav bar is a _refractive_ translucent material with a specular rim and a sheen that shifts as content scrolls under and as the device moves, not a static blur. SwiftUI emits it natively via `.glassEffect()`; the web is an honest approximation. The pushed screen's material catches light as it slides. This is where navigation chrome is heading.
**Neumorphism:** header and back button as soft same-color extrusions with dual light/dark shadows. Pretty, contrast-poor — accent only, never for the primary back affordance.
**Skeuomorphism:** a bevelled "real bar" with gradient and inner highlight, a back button that looks physically pressable, page-turn-ish transitions. The tactile retro look.
**Neo-Brutalism:** thick black-bordered header, hard offset shadow, zero radius, a chunky back button, an unapologetic hard slide. High personality.
**Claymorphism:** big-radius puffy header, soft glow, a pill back button — friendly and toy-like.
**Aurora / Gradient:** animated multi-hue gradient header on dark; the pushed screen fades through the gradient. Premium — honor `prefers-reduced-motion`.
**Minimal / Swiss:** near-invisible chrome — a thin type-driven title, a bare chevron, generous whitespace, an almost-instant cut. Typography does the wayfinding.
**UJG Brand (the house default):** Goldenrod chevron and title accents on a deep Eminence/Night header, confident radius, a warm glow under the bar, and a spring-based slide with a subtle Goldenrod hero flight on list→detail. The Afro-Futurist look: dark, saturated, the refraction sings against it, and the back affordance always keeps its ≥44px target and visible focus ring.

**Rule that never changes:** style is skin, behavior is the skeleton. Guard glass / liquid-glass / neumorphism for title contrast; guard aurora / liquid-glass for `prefers-reduced-motion`; guard every skin for the back target size and the focus ring.
* * *

**Bottom line:** stack navigation is a data structure — an array you push to and pop from — wearing a nav header and a slide animation. Master the four verbs (push, pop, replace, reset), pick it over tabs only when screens are parent-and-child, handle _all three_ back buttons, synthesize the back stack for deep links, preserve state across the stack and across process death, and announce screen changes to assistive tech. Get those right and you've built the skeleton every good app hangs on — the part users never notice because it never traps them. Cross-reference **Bottom Tabs** and **Tab Navigation** for the parallel-destination layer that wraps this one, and the parent **Navigation** doc for the whole system.