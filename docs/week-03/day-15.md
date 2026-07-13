---
title: "Day 15 - What is Ownership?"
description: "Learn about what is ownership? in Rust"
---

# Day 15: What is Ownership?

<div class="lesson-meta">
  <span class="time">⏱️ 10 minutes</span>
  <span class="difficulty">📊 Intermediate</span>
  <span class="week">📅 Week 3</span>
</div>

## 🎯 Today's Goal

Understand what ownership means in Rust and why it exists, you'll be able to explain who "owns" a value, when that value is freed, and what happens when ownership passes into and out of a function.

## 📚 The Concept (3 min)

Every language needs a plan for cleaning up memory. Garbage-collected languages (Python, JavaScript, Go) run a background process that periodically finds unused data and frees it. C and C++ make *you* call `free`/`delete` manually, and forgetting (or doing it twice) causes some of the worst bugs in software. Rust takes a third path: **ownership**.

The idea is simple: every value in a Rust program has exactly one variable that owns it. When that owner goes out of scope, Rust automatically inserts the cleanup code at compile time. No garbage collector pausing your program, no manual `free` to forget. The compiler proves your memory management is correct before the program ever runs.

Think of it like a library book. The library card system tracks exactly one borrower at a time. When you return the book (your scope ends), the library handles re-shelving automatically. You never have to remember to shred the book yourself, and two people can't both walk off believing they're responsible for the same copy.

Ownership can *move*. When you pass a `String` to a function or assign it to another variable, responsibility for cleanup transfers to the new owner. The old variable is no longer valid, the compiler simply won't let you use it. For example, this does **NOT** compile:

```rust
let s1 = String::from("hello");
let s2 = s1;              // ownership moves to s2
println!("{}", s1);       // ERROR: borrow of moved value `s1`
```

That refusal to compile *is the feature*: an entire class of bugs (use-after-free, double-free, data races) becomes impossible. This week we'll unpack each piece of this system.

::: tip Key Insight
Every value has exactly one owner. When the owner goes out of scope, the value is freed, automatically, deterministically, with zero runtime cost.
:::

## 💻 Hands-On Code (4 min)

### Example 1: Basic Usage

Scopes decide when a value is cleaned up:

```rust
fn main() {
    let name = String::from("Rustacean");
    println!("Hello, {}!", name);

    {
        let inner = String::from("scoped value");
        println!("Inside block: {}", inner);
    } // `inner` goes out of scope here, Rust frees it automatically

    println!("Back outside: {} is still alive", name);
} // `name` is freed here
```

### Example 2: Practical Application

Ownership flows into functions through parameters and back out through return values:

```rust
fn shout(message: String) -> String {
    message.to_uppercase() // ownership of the result moves to the caller
}

fn describe(city: String) -> (String, usize) {
    let letters = city.len();
    (city, letters) // hand ownership back, along with extra info
}

fn main() {
    let greeting = String::from("welcome to week three");
    let loud = shout(greeting);
    // `greeting` was moved into shout(), only `loud` exists now
    println!("{}", loud);

    let city = String::from("Grand Rapids");
    let (city, letters) = describe(city);
    println!("{} has {} characters", city, letters);
}
```

::: details Output
```
Hello, Rustacean!
Inside block: scoped value
Back outside: Rustacean is still alive
WELCOME TO WEEK THREE
Grand Rapids has 12 characters
```
:::

## 🎓 Key Takeaways (1 min)

<div class="takeaways">

✅ Every value in Rust has exactly one owner, the variable bound to it  
✅ When the owner goes out of scope, the value is freed automatically (no garbage collector, no manual `free`)  
✅ Assigning a `String` to another variable or passing it to a function *moves* ownership, the old variable becomes unusable  
✅ Functions can hand ownership back to the caller through their return value

</div>

## ⚠️ Common Pitfalls

::: warning Watch Out!
- **Using a variable after passing it to a function.** `let s = String::from("hi"); print_it(s); println!("{}", s);` fails to compile because `s` was moved into `print_it`, the function is now responsible for it, and it was freed when the function ended.
- **Assuming assignment copies like in Python or JavaScript.** In those languages `b = a` leaves both usable (they share a reference). In Rust, `let b = a;` on a `String` *invalidates* `a`. It's a transfer, not a copy.
- **Fighting the compiler by cloning everything.** When you hit a "value moved" error, sprinkling `.clone()` everywhere works but hides the design question: who should actually own this data? We'll cover the right tools (Clone on Day 19, borrowing on Day 20).
:::

## ✅ Quick Challenge

Write a function `add_label` that takes ownership of a `String` and returns a new `String` in the form `Item: coffee`. Call it from `main` and print the result.

```rust
// Starter code
fn main() {
    let item = String::from("coffee");
    // TODO 1: write a function `add_label` below main that takes
    //         ownership of a String and returns "Item: <contents>"
    // TODO 2: call it here and print the result
    println!("{}", item);
}
```

<details>
<summary>💡 Hint</summary>

The function signature is `fn add_label(item: String) -> String`. Inside, `format!("Item: {}", item)` builds the new string. After the call, the original `item` variable in `main` is moved, print the *returned* value instead.

</details>

<details>
<summary>✅ Solution</summary>

```rust
fn main() {
    let item = String::from("coffee");
    let labeled = add_label(item);
    println!("{}", labeled);
    // Note: `item` can no longer be used here: add_label took ownership,
    // and the String was consumed to build `labeled`.
}

fn add_label(item: String) -> String {
    format!("Item: {}", item)
}
```

Output:

```
Item: coffee
```

</details>

## 📖 Additional Resources

- [The Rust Book - Ch. 4.1: What is Ownership?](https://doc.rust-lang.org/book/ch04-01-what-is-ownership.html)
- [Rust by Example - Ownership and Moves](https://doc.rust-lang.org/rust-by-example/scope/move.html)

---

<ProgressTracker />

<div class="lesson-nav">
  <a href="/week-03/">← Week 3 Overview</a>
  <a href="/week-03/day-16">Day 16: Stack vs Heap →</a>
</div>
