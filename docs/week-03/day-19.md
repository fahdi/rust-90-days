---
title: "Day 19 - Clone & Copy Traits"
description: "Learn about clone & copy traits in Rust"
---

# Day 19: Clone & Copy Traits

<div class="lesson-meta">
  <span class="time">⏱️ 10 minutes</span>
  <span class="difficulty">📊 Intermediate</span>
  <span class="week">📅 Week 3</span>
</div>

## 🎯 Today's Goal

Understand why some types can be freely duplicated on assignment while others move, and know exactly when to derive `Copy`, when to call `.clone()`, and when to do neither.

## 📚 The Concept (3 min)

Yesterday you saw move semantics: assigning a `String` to a new variable transfers ownership, and the original becomes unusable. But this line works fine:

```rust
let x = 5;
let y = x; // x is still usable!
```

Why the difference? The `Copy` trait. Types that implement `Copy` are duplicated bit-for-bit on assignment instead of moved. Think of it like photocopying a sticky note versus handing over the keys to a warehouse. An `i32` is a sticky note, copying its 4 bytes is trivial, so Rust just does it. A `String` is a warehouse key, it points to heap memory, and silently duplicating the warehouse could be expensive (and duplicating just the key would mean two owners of one allocation, which Rust forbids).

`Copy` is reserved for simple, fixed-size values that live entirely on the stack: integers, floats, `bool`, `char`, and structs/tuples composed only of `Copy` types. Anything that owns heap data (`String`, `Vec`, `Box`) cannot be `Copy`.

`Clone` is the explicit, opt-in cousin. Calling `.clone()` says "yes, duplicate this, including any heap data it owns, I accept the cost." A `String` clone allocates new memory and copies the bytes, giving you two fully independent values.

The two traits are related: `Copy` requires `Clone` (every `Copy` type must also be `Clone`), and you typically derive them together with `#[derive(Clone, Copy)]`. One rule of thumb: if a type could be a `Copy` type, deriving it is usually a good idea, but you can't derive it if any field isn't `Copy`. Trying `#[derive(Copy)]` on a struct containing a `String` does NOT compile: "the trait `Copy` cannot be implemented for this type."

::: tip Key Insight
`Copy` is implicit and cheap (stack-only bit copy on every assignment); `Clone` is explicit and potentially expensive (`.clone()` may allocate). Rust makes the costly duplication visible in your code so it never happens by accident.
:::

## 💻 Hands-On Code (4 min)

### Example 1: Basic Usage

```rust
fn main() {
    // Copy types: assignment duplicates the value automatically
    let x: i32 = 42;
    let y = x;                 // x is copied, not moved
    println!("x = {}, y = {}", x, y); // both still usable

    // Non-Copy types: assignment moves ownership
    let name = String::from("Ferris");
    let name_clone = name.clone(); // explicit deep copy
    println!("original: {}", name);      // still valid thanks to clone
    println!("clone:    {}", name_clone);

    // Proof they are independent heap allocations
    let mut edited = name_clone;
    edited.push_str(" the Crab");
    println!("edited:   {}", edited);
    println!("original: {}", name); // untouched
}
```

### Example 2: Practical Application

```rust
#[derive(Debug, Clone, Copy)]
struct Point {
    x: f64,
    y: f64,
}

#[derive(Debug, Clone)]
struct Player {
    name: String,   // String prevents Copy — Clone only
    position: Point,
    score: u32,
}

fn distance_from_origin(p: Point) -> f64 {
    // Point is Copy, so passing it here does NOT move it
    (p.x * p.x + p.y * p.y).sqrt()
}

fn main() {
    let spawn = Point { x: 3.0, y: 4.0 };
    let dist = distance_from_origin(spawn); // spawn copied in
    println!("spawn {:?} is {} units from origin", spawn, dist);

    let player1 = Player {
        name: String::from("Alice"),
        position: spawn, // another copy of Point
        score: 120,
    };

    // Clone to create a save-game snapshot
    let mut snapshot = player1.clone();
    snapshot.score = 0; // reset the snapshot, not the original

    println!("live:     {:?}", player1);
    println!("snapshot: {:?}", snapshot);
}
```

::: details Output
```
Example 1:
x = 42, y = 42
original: Ferris
clone:    Ferris
edited:   Ferris the Crab
original: Ferris

Example 2:
spawn Point { x: 3.0, y: 4.0 } is 5 units from origin
live:     Player { name: "Alice", position: Point { x: 3.0, y: 4.0 }, score: 120 }
snapshot: Player { name: "Alice", position: Point { x: 3.0, y: 4.0 }, score: 0 }
```
:::

## 🎓 Key Takeaways (1 min)

<div class="takeaways">

✅ `Copy` types (integers, floats, `bool`, `char`, and structs of only `Copy` fields) are duplicated implicitly on assignment, no move ever happens  
✅ `Clone` is explicit: `.clone()` performs a deep copy, including heap data, and its cost is visible at the call site  
✅ A type can only derive `Copy` if every field is `Copy`, one `String` or `Vec` field disqualifies the whole struct  
✅ `Copy` requires `Clone`, so derive them together: `#[derive(Clone, Copy)]`

</div>

## ⚠️ Common Pitfalls

::: warning Watch Out!
- **Deriving `Copy` on a struct with a `String` field.** `#[derive(Copy)] struct User { name: String }` does NOT compile, `String` owns heap memory, so a bit-for-bit copy would create two owners of the same allocation. Use `#[derive(Clone)]` and call `.clone()` instead.
- **Sprinkling `.clone()` to silence the borrow checker.** It works, but every clone of a `String` or `Vec` allocates and copies. Often a reference (`&value`) is what you actually wanted, you'll learn borrowing tomorrow.
- **Assuming `Clone` is always deep for every type.** Derived `Clone` clones each field, and for owned data like `String` that is a deep copy. But for shared-ownership types you'll meet later (like `Rc`), `.clone()` only bumps a reference count, read the type's docs rather than assuming.
:::

## ✅ Quick Challenge

Make `Config` copyable so it can be passed to `use_config` twice, then create a `Profile` struct holding a `String` username plus a `Config`, and clone it. Add the right derives, the compiler will tell you if you reach for `Copy` where it isn't allowed.

```rust
// Starter code
// TODO: add the right derives so this compiles and runs
struct Config {
    retries: u8,
    verbose: bool,
}

fn use_config(c: Config) {
    println!("retries={}, verbose={}", c.retries, c.verbose);
}

fn main() {
    let config = Config { retries: 3, verbose: true };
    use_config(config);
    // Uncomment the next line after adding your derives:
    // use_config(config);
}
```

<details>
<summary>💡 Hint</summary>

`u8` and `bool` are both `Copy`, so `Config` qualifies for `#[derive(Clone, Copy)]`. For the `Profile` struct, the `String` field means `Copy` is off the table, `#[derive(Clone)]` is as far as you can go, and you must call `.clone()` explicitly.

</details>

<details>
<summary>✅ Solution</summary>

```rust
#[derive(Debug, Clone, Copy)]
struct Config {
    retries: u8,
    verbose: bool,
}

#[derive(Debug, Clone)]
struct Profile {
    username: String, // String blocks Copy — Clone is the ceiling here
    config: Config,
}

fn use_config(c: Config) {
    println!("retries={}, verbose={}", c.retries, c.verbose);
}

fn main() {
    let config = Config { retries: 3, verbose: true };
    use_config(config); // copied in
    use_config(config); // still valid — Copy at work

    let profile = Profile {
        username: String::from("ferris"),
        config,
    };
    let backup = profile.clone(); // explicit deep copy
    println!("profile: {:?}", profile);
    println!("backup:  {:?}", backup);
}
```

</details>

## 📖 Additional Resources

- [The Rust Book - Ownership: Stack-Only Data (Copy)](https://doc.rust-lang.org/book/ch04-01-what-is-ownership.html#stack-only-data-copy)
- [Rust by Example - Clone](https://doc.rust-lang.org/rust-by-example/trait/clone.html)

---

<ProgressTracker />

<div class="lesson-nav">
  <a href="/week-03/day-18">← Day 18: Move Semantics</a>
  <a href="/week-03/day-20">Day 20: References & Borrowing →</a>
</div>
