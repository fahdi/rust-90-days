---
title: "Day 75 - Static Lifetime"
description: "Learn about static lifetime in Rust"
---

# Day 75: Static Lifetime

<div class="lesson-meta">
  <span class="time">⏱️ 9 minutes</span>
  <span class="difficulty">📊 Advanced</span>
  <span class="week">📅 Week 11</span>
</div>

## 🎯 Today's Goal

Understand what `'static` really means, data valid for the entire program, where it comes from, and why compiler suggestions to "just add `'static`" are usually a trap.

## 📚 The Concept (3 min)

`'static` is the longest possible lifetime: the reference is valid from wherever it's created until the program exits. Two things naturally have it:

1. **String literals.** Every `&str` literal like `"hello"` is baked into the compiled binary itself, so a reference to it can never dangle. Its full type is `&'static str`.
2. **`static` items and constants.** `static GREETING: &str = "hi";` lives at a fixed address for the whole program run.

That's the honest supply of `'static` data. The trouble starts with demand. You'll see `'static` as a *bound*, `T: 'static`, in APIs like `std::thread::spawn`. This bound doesn't mean "T must be a reference to static data"; it means "T contains no references shorter than `'static`." Owned types like `String`, `Vec&lt;u8&gt;`, and `i32` all satisfy `T: 'static` because they contain no borrows at all. That distinction trips up almost everyone: a `String` created at runtime is `'static`-compatible; a `&str` borrowed from it is not.

Why does `thread::spawn` require this? The spawned thread might outlive the function that created it, so it can't be allowed to borrow from that function's stack. Requiring `'static` forces you to *move ownership* into the thread.

The trap: when the borrow checker complains about a lifetime, `rustc` sometimes suggests adding `'static`. Nine times out of ten the real fix is restructuring ownership (return a `String`, clone, or move), claiming a short-lived borrow is `'static` just moves the error or forces leaking. Reach for `'static` deliberately, not as an escape hatch.

::: tip Key Insight
`T: 'static` means "no non-static borrows inside T," not "lives in the binary." Owned runtime values like `String` pass the bound; the fix for a `'static` error is almost always ownership, not annotation.
:::

## 💻 Hands-On Code (4 min)

### Example 1: Basic Usage

String literals are `&'static str` and survive any scope:

```rust
fn pick_banner(premium: bool) -> &'static str {
    // Both candidates live in the binary, so returning either is always safe.
    if premium { "Welcome back, VIP!" } else { "Welcome!" }
}

fn main() {
    let banner;
    {
        banner = pick_banner(true);
    } // inner scope ends — no problem, the data isn't on any stack
    println!("{}", banner);

    static VERSION: &str = "1.0.3";
    println!("version {}", VERSION);
}
```

### Example 2: Practical Application

The `'static` *bound* in `thread::spawn`, owned data passes, borrows must be moved:

```rust
use std::thread;

fn main() {
    let owned_msg = String::from("hello from a thread");

    // `move` transfers ownership of `owned_msg` into the closure.
    // String: 'static holds (it owns its data), so spawn accepts it.
    let handle = thread::spawn(move || {
        println!("{}", owned_msg);
        owned_msg.len()
    });

    let len = handle.join().unwrap();
    println!("thread returned length {}", len);
}
```

Without `move`, the closure would borrow `owned_msg` from `main`'s stack, and the compiler rejects it, because the thread could (in general) outlive `main`'s frame.

::: details Output
```
Welcome back, VIP!
version 1.0.3
```
Example 2:
```
hello from a thread
thread returned length 19
```
:::

## 🎓 Key Takeaways (1 min)

<div class="takeaways">

✅ `&'static str` is the type of every string literal, the bytes live in the binary for the program's whole run  
✅ `T: 'static` as a bound means "contains no non-static references", owned types like `String` and `i32` qualify  
✅ `thread::spawn` requires `'static` closures because a thread may outlive its spawner; `move` satisfies it by transferring ownership  
✅ Treat compiler hints to add `'static` with suspicion, the real fix is usually returning/moving owned data

</div>

## ⚠️ Common Pitfalls

::: warning Watch Out!
- Confusing `&'static T` (a reference to program-long data) with `T: 'static` (a type containing no short borrows), a runtime `String` satisfies the second, not the first
- Blindly following "consider adding `'static`" compiler suggestions on function signatures, it usually shifts the error to the caller instead of fixing ownership
- Using `Box::leak` to mint `&'static` references casually, it works, but the memory is never reclaimed; it's for genuinely program-long data like parsed config
:::

## ✅ Quick Challenge

This program fails to compile because the closure borrows `name` from `main`. Fix it two ways: (1) with `move`, (2) by making `name` a `&'static str` literal instead of a `String`.

```rust
use std::thread;

fn main() {
    let name = String::from("Rustacean");
    let handle = thread::spawn(|| {
        // println!("hi, {}", name); // uncomment: error E0373, closure may outlive `main`
        println!("hi from thread");
    });
    handle.join().unwrap();
    println!("main still owns: {}", name);
}
```

<details>
<summary>💡 Hint</summary>

Fix 1: `thread::spawn(move || ...)`, but then `main` can't use `name` afterward (move the last `println!` or clone). Fix 2: `let name: &'static str = "Rustacean";`, copies of `&'static str` can go anywhere.

</details>

<details>
<summary>✅ Solution</summary>

```rust
use std::thread;

fn main() {
    // Fix 2: a literal is &'static str — freely copyable into the closure.
    let name: &'static str = "Rustacean";
    let handle = thread::spawn(move || {
        println!("hi, {}", name);
    });
    handle.join().unwrap();
    // &'static str is Copy, so main can still use it:
    println!("main still owns: {}", name);
}
```

Output:
```
hi, Rustacean
main still owns: Rustacean
```

With a `String`, `move` also compiles, but ownership transfers, so the final `println!` would need `name.clone()` captured instead.

</details>

## 📖 Additional Resources

- [The Rust Book - The Static Lifetime](https://doc.rust-lang.org/book/ch10-03-lifetime-syntax.html#the-static-lifetime)
- [Common Rust Lifetime Misconceptions - 'static](https://github.com/pretzelhammer/rust-blog/blob/master/posts/common-rust-lifetime-misconceptions.md)

---

<ProgressTracker />

<div class="lesson-nav">
  <a href="/week-11/day-74">← Day 74: Struct Lifetimes</a>
  <a href="/week-11/day-76">Day 76: Box&lt;T&gt; →</a>
</div>
