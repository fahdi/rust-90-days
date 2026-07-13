---
title: "Day 25 - Common Ownership Errors"
description: "Learn about common ownership errors in Rust"
---

# Day 25: Common Ownership Errors

<div class="lesson-meta">
  <span class="time">⏱️ 10 minutes</span>
  <span class="difficulty">📊 Intermediate</span>
  <span class="week">📅 Week 4</span>
</div>

## 🎯 Today's Goal

Recognize the three ownership errors you will hit most often, use-after-move, functions that steal ownership, and unnecessary cloning, and know the standard fix for each one on sight.

## 📚 The Concept (3 min)

By now you know the rules: every value has one owner, assignment of non-Copy types *moves* the value, and when the owner goes out of scope the value is dropped. Today is about what happens when you break those rules in practice, because the compiler errors you get are the same handful, over and over.

**Error #1: Use after move.** You assign a `String` to a new variable or pass it to a function, then try to use the original. The compiler says `borrow of moved value`. Think of ownership like handing someone your car keys: once you hand them over, you can't drive the car anymore. The fix is almost always one of two things, lend the keys instead (`&value`, a borrow) or get a second car made (`.clone()`).

**Error #2: Functions that steal ownership.** A function signature like `fn process(data: String)` takes ownership of its argument. The caller loses the value permanently. Nine times out of ten the function only needs to *read* the data, so the signature should be `fn process(data: &str)`, borrow, don't take.

**Error #3: Clone as a reflex.** When learners first fight the borrow checker, `.clone()` fixes everything, and litters the code with needless allocations. Cloning a 10 MB `String` copies 10 MB. A borrow copies one pointer. Reach for `&` first; reserve `.clone()` for when you genuinely need two independent owners.

One more thing that surprises people: simple scalar types like `i32`, `bool`, and `char` implement the `Copy` trait, so "moves" of these are actually cheap copies and the original stays valid. Move errors only bite on heap-owning types like `String`, `Vec`, and your own structs.

::: tip Key Insight
When the compiler says "value moved here," ask one question: does the receiver need to *own* the data, or just *look at* it? If it just needs to look, pass a reference, that fixes the vast majority of ownership errors.
:::

Here's the classic error, so you recognize it. **This does NOT compile:**

```rust
let s1 = String::from("hello");
let s2 = s1;              // ownership moves to s2
println!("{}", s1);       // ERROR: borrow of moved value: `s1`
```

## 💻 Hands-On Code (4 min)

### Example 1: Basic Usage

```rust
fn main() {
    // Error #1: use after move, and how to fix it
    let original = String::from("Rust");

    // FIX A: borrow instead of moving
    let borrowed = &original;
    println!("Borrowed: {}", borrowed);
    println!("Original still works: {}", original);

    // FIX B: clone when you truly need two owners
    let copy = original.clone();
    println!("Clone: {}", copy);
    println!("Original still works: {}", original);

    // Note: integers implement Copy, so no move happens at all
    let a = 42;
    let b = a;
    println!("a = {}, b = {} (both fine, i32 is Copy)", a, b);
}
```

### Example 2: Practical Application

```rust
// Error #2: functions that steal ownership, fixed with borrowing

// BAD design (would consume the vec): fn total(scores: Vec<i32>) -> i32
// GOOD design: borrow a slice instead (&Vec<i32> coerces to &[i32])
fn total(scores: &[i32]) -> i32 {
    scores.iter().sum()
}

// Needs to change the data? Take a mutable reference.
fn add_bonus(scores: &mut Vec<i32>, bonus: i32) {
    for score in scores.iter_mut() {
        *score += bonus;
    }
}

fn main() {
    let mut scores = vec![85, 92, 78];

    println!("Total before bonus: {}", total(&scores));

    add_bonus(&mut scores, 5);

    // scores is still usable, we only ever lent it out
    println!("Scores after bonus: {:?}", scores);
    println!("Total after bonus: {}", total(&scores));
}
```

::: details Output
```
--- Example 1 ---
Borrowed: Rust
Original still works: Rust
Clone: Rust
Original still works: Rust
a = 42, b = 42 (both fine, i32 is Copy)

--- Example 2 ---
Total before bonus: 255
Scores after bonus: [90, 97, 83]
Total after bonus: 270
```
:::

## 🎓 Key Takeaways (1 min)

<div class="takeaways">

✅ "Borrow of moved value" means ownership already transferred, fix it by borrowing with `&` or, if you need two owners, with `.clone()`  
✅ Function parameters like `String` or `Vec` *consume* the caller's value; prefer `&str` or `&[T]` when the function only reads  
✅ `Copy` types (`i32`, `bool`, `char`, `f64`) never move, the "use after move" error only applies to heap-owning types  
✅ Use `&mut` when a function must modify data in place; the caller keeps ownership afterward

</div>

## ⚠️ Common Pitfalls

::: warning Watch Out!
- **Using a value after passing it to a function.** `process(s); println!("{}", s);` fails because the call moved `s` into the function. Change the signature to borrow (`fn process(s: &str)`) rather than restructuring your caller.
- **Cloning to silence the compiler.** `.clone()` makes errors vanish but performs a full deep copy every time. If you find a `.clone()` on every other line, the real fix is usually a `&` at a function boundary.
- **Moving inside a loop.** Passing an owned value into a function *inside* a `for` loop fails on the second iteration, the first iteration already moved it. Borrow in the loop body instead.
:::

## ✅ Quick Challenge

The program below compiles, but it clones the string twice just to dodge move errors. Refactor `shout` and `count_chars` so the program compiles and prints the same output with **zero** calls to `.clone()`.

```rust
// Starter code
fn shout(message: String) -> String {
    message.to_uppercase()
}

fn count_chars(text: String) -> usize {
    text.chars().count()
}

fn main() {
    let greeting = String::from("hello, rustacean");

    let loud = shout(greeting.clone());          // clone #1: remove me
    let length = count_chars(greeting.clone());  // clone #2: remove me
    println!("Loud: {}", loud);
    println!("Length: {}", length);
    println!("Original: {}", greeting);
}
```

<details>
<summary>💡 Hint</summary>

Neither function needs to own the string, they only read it. Change each parameter to a borrowed type (yesterday's `&str` is perfect), then pass `&greeting` at the call sites.

</details>

<details>
<summary>✅ Solution</summary>

```rust
fn shout(message: &str) -> String {
    message.to_uppercase()
}

fn count_chars(text: &str) -> usize {
    text.chars().count()
}

fn main() {
    let greeting = String::from("hello, rustacean");

    let loud = shout(&greeting);
    let length = count_chars(&greeting);
    println!("Loud: {}", loud);
    println!("Length: {}", length);
    println!("Original: {}", greeting);
}
```

Output:

```
Loud: HELLO, RUSTACEAN
Length: 16
Original: hello, rustacean
```

`&greeting` coerces to `&str` automatically, both functions merely borrow, and `greeting` remains fully usable in `main`, no allocations wasted.

</details>

## 📖 Additional Resources

- [The Rust Book - Understanding Ownership](https://doc.rust-lang.org/book/ch04-00-understanding-ownership.html)
- [Rust by Example - Ownership and Moves](https://doc.rust-lang.org/rust-by-example/scope/move.html)

---

<ProgressTracker />

<div class="lesson-nav">
  <a href="/week-04/day-24">← Day 24: String Slices Deep Dive</a>
  <a href="/week-04/day-26">Day 26: Dangling References →</a>
</div>
