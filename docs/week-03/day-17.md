---
title: "Day 17 - Ownership Rules"
description: "Learn about ownership rules in Rust"
---

# Day 17: Ownership Rules

<div class="lesson-meta">
  <span class="time">⏱️ 10 minutes</span>
  <span class="difficulty">📊 Intermediate</span>
  <span class="week">📅 Week 3</span>
</div>

## 🎯 Today's Goal

State Rust's three ownership rules and predict exactly when any value in a program gets freed — without a garbage collector and without manual `free()` calls.

## 📚 The Concept (3 min)

Yesterday you saw where values live (stack vs heap). Today's question is: who is responsible for cleaning them up? Rust's answer is **ownership**, governed by three rules:

1. **Every value has an owner** — the variable that holds it.
2. **There is exactly one owner at a time.**
3. **When the owner goes out of scope, the value is dropped** (its memory is freed).

Think of a coat check at a theater. When you hand over your coat, you get one ticket — the ticket *is* ownership. Only one ticket exists per coat (rule 2), and the coat stays in the cloakroom exactly as long as a valid ticket exists (rules 1 and 3). No one has to walk the racks looking for abandoned coats, because the ticket system makes cleanup automatic and precise.

Contrast this with the two traditional approaches. In C, *you* are the cleanup crew: forget a `free()` and you leak memory; call it twice and you corrupt it. In garbage-collected languages like Python or Java, a background process periodically sweeps up unused values — safe, but you pay runtime cost and you never know *when* memory is released. Rust takes a third path: the compiler tracks each value's single owner and inserts the cleanup code (a call to `drop`) at the exact point the owner's scope ends — the closing `}`. That's why using a variable after its scope closes does not just crash at runtime; it's rejected at compile time. This snippet does NOT compile:

```
{
    let s = String::from("hi");
}   // s is dropped here
println!("{}", s);  // error[E0425]: cannot find value `s` in this scope
```

Deterministic destruction is called **RAII** (Resource Acquisition Is Initialization), and it works for files, sockets, and locks — not just memory.

::: tip Key Insight
Every value has exactly one owner, and Rust frees the value at the precise, predictable moment that owner goes out of scope — cleanup is decided at compile time, not by a garbage collector at runtime.
:::

## 💻 Hands-On Code (4 min)

### Example 1: Basic Usage

Ownership follows scope. Each `String` here is freed at the closing brace of the block that owns it:

```rust
fn main() {
    let s = String::from("hello"); // s becomes the owner of this String

    {
        let inner = String::from("world"); // inner owns this String
        println!("{} {}", s, inner);
    } // inner goes out of scope here -> its String is freed

    println!("{} again", s);
} // s goes out of scope here -> its String is freed
```

### Example 2: Practical Application

You can *watch* rule 3 in action by implementing `Drop`, the trait Rust calls when an owner's scope ends. This pattern is how real Rust code auto-closes files and database connections:

```rust
struct Resource {
    name: String,
}

// Drop lets us watch the exact moment Rust frees a value
impl Drop for Resource {
    fn drop(&mut self) {
        println!("Releasing: {}", self.name);
    }
}

fn main() {
    let db = Resource {
        name: String::from("database connection"),
    };

    {
        let file = Resource {
            name: String::from("log file"),
        };
        println!("Using {} and {}", file.name, db.name);
    } // file's scope ends -> Rust calls drop on it right here

    println!("Still using {}", db.name);
} // db's scope ends -> dropped last
```

::: details Output
```
Using log file and database connection
Releasing: log file
Still using database connection
Releasing: database connection
```
:::

Notice `Releasing: log file` prints *before* `Still using...` — the drop happens at the inner `}`, not "sometime later" as a garbage collector would.

## 🎓 Key Takeaways (1 min)

<div class="takeaways">

✅ The three rules: every value has an owner, exactly one owner at a time, and the value is dropped when its owner goes out of scope  
✅ Cleanup happens deterministically at the closing `}` of the owner's scope — no garbage collector, no manual `free()`  
✅ Implementing the `Drop` trait lets a type run custom cleanup (close files, release connections) automatically  
✅ Multiple locals in the same scope are dropped in reverse declaration order (last declared, first dropped)

</div>

## ⚠️ Common Pitfalls

::: warning Watch Out!
- **Declaring a value inside a block but using it after the block.** The value is dropped at the inner `}`, so the compiler rejects any later use with "cannot find value in this scope." Declare it in the outer scope if you need it longer.
- **Assuming drops happen "eventually," like a garbage collector.** Rust frees values at an exact source location — the end of the owner's scope. If you hold a large buffer in a variable that lives to the end of `main`, that memory stays allocated the whole time, even if you stopped using it on line 3.
- **Calling `.drop()` as a method to free something early.** Rust forbids explicit calls to `Drop::drop` (error E0040) because it would run cleanup twice. Use the free function `drop(value)` instead — it works by *taking ownership*, which ends the value's life on the spot.
:::

## ✅ Quick Challenge

The program below allocates a `big_buffer`, finishes with it early, but keeps it alive through the long-running work — you can see in the output that it's dropped dead last. Free `big_buffer` immediately after the processing step, without deleting the variable. (Run it before and after your fix and compare the drop order.)

```rust
// Starter code
struct Noisy(&'static str);

impl Drop for Noisy {
    fn drop(&mut self) {
        println!("Dropped: {}", self.0);
    }
}

fn main() {
    let big_buffer = Noisy("big buffer");
    let config = Noisy("config");

    println!("processing with {}...", big_buffer.0);

    // TODO: free big_buffer HERE, before the long-running work below

    println!("long-running work using {}...", config.0);
}
```

<details>
<summary>💡 Hint</summary>

Remember the third pitfall: the standard library provides a function `drop(value)` that takes ownership of its argument. Once ownership moves into that function, the value's scope ends inside it — triggering rule 3 right there. (An inner `{ }` block around the first two lines that use `big_buffer` also works.)

</details>

<details>
<summary>✅ Solution</summary>

```rust
struct Noisy(&'static str);

impl Drop for Noisy {
    fn drop(&mut self) {
        println!("Dropped: {}", self.0);
    }
}

fn main() {
    let big_buffer = Noisy("big buffer");
    let config = Noisy("config");

    println!("processing with {}...", big_buffer.0);

    // drop() takes ownership of the value, so its scope ends right here
    drop(big_buffer);

    println!("long-running work using {}...", config.0);
}
```

Output after the fix:

```
processing with big buffer...
Dropped: big buffer
long-running work using config...
Dropped: config
```

Before the fix, the drop order was `config` then `big buffer` — reverse declaration order at the end of `main`.

</details>

## 📖 Additional Resources

- [The Rust Book - Ch. 4.1: What is Ownership?](https://doc.rust-lang.org/book/ch04-01-what-is-ownership.html)
- [Rust by Example - RAII and Ownership](https://doc.rust-lang.org/rust-by-example/scope/raii.html)

---

<ProgressTracker />

<div class="lesson-nav">
  <a href="/week-03/day-16">← Day 16: Stack vs Heap</a>
  <a href="/week-03/day-18">Day 18: Move Semantics →</a>
</div>
