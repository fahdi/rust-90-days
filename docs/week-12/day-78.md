---
title: "Day 78 - RefCell T  & Interior Mutability"
description: "Learn about refcell t  & interior mutability in Rust"
---

# Day 78: RefCell&lt;T&gt; & Interior Mutability

<div class="lesson-meta">
  <span class="time">⏱️ 10 minutes</span>
  <span class="difficulty">📊 Advanced</span>
  <span class="week">📅 Week 12</span>
</div>

## 🎯 Today's Goal

Understand interior mutability: how `RefCell<T>` lets you mutate data through a shared reference by moving borrow checking from compile time to runtime.

## 📚 The Concept (3 min)

Rust's borrowing rules normally say: either many immutable borrows or one mutable borrow, checked at compile time. But sometimes a value is logically immutable from the outside while needing internal mutation. A classic example is a mock object in tests: the trait method takes `&self`, yet your mock needs to record which calls happened. You cannot change the trait signature to `&mut self` just for the mock, so how do you mutate through `&self`?

`RefCell<T>` is the answer. It wraps a value and enforces the same borrowing rules, but at runtime instead of compile time. You call `.borrow()` to get an immutable `Ref<T>` and `.borrow_mut()` to get a mutable `RefMut<T>`. Internally, `RefCell` keeps a counter of active borrows. If you violate the rules, say, calling `borrow_mut()` while a `borrow()` is still alive, the program panics with `already borrowed: BorrowMutError` rather than failing to compile.

This is a trade-off, not a loophole. You gain flexibility for patterns the borrow checker cannot verify statically, and you pay with a small runtime cost and the risk of panics. `RefCell<T>` is strictly single-threaded (`!Sync`); for threads you use `Mutex<T>` instead. Related types in the same family: `Cell<T>` (moves values in and out, no references, good for `Copy` types) and `OnceCell<T>` (write-once initialization).

::: tip Key Insight
`RefCell<T>` does not remove Rust's borrow rules, it defers them to runtime. Break the rules and the program panics instead of failing to compile. Use it only when you know your access pattern is safe but the compiler can't prove it.
:::

## 💻 Hands-On Code (4 min)

### Example 1: Basic Usage

```rust
use std::cell::RefCell;

fn main() {
    let value = RefCell::new(10);

    // Mutate through an immutable binding
    *value.borrow_mut() += 5;

    println!("value = {}", value.borrow());

    // Multiple immutable borrows are fine
    let a = value.borrow();
    let b = value.borrow();
    println!("a = {}, b = {}", a, b);
    drop(a);
    drop(b);

    // try_borrow_mut lets us check instead of panicking
    let guard = value.borrow();
    match value.try_borrow_mut() {
        Ok(_) => println!("got mutable borrow"),
        Err(e) => println!("could not borrow mutably: {}", e),
    }
    drop(guard);
}
```

### Example 2: Practical Application

A logger that records messages through `&self`, the interior mutability pattern used by mock objects:

```rust
use std::cell::RefCell;

trait Logger {
    fn log(&self, message: &str); // note: &self, not &mut self
}

struct MemoryLogger {
    messages: RefCell<Vec<String>>,
}

impl Logger for MemoryLogger {
    fn log(&self, message: &str) {
        self.messages.borrow_mut().push(message.to_string());
    }
}

fn run_job(logger: &dyn Logger) {
    logger.log("job started");
    logger.log("job finished");
}

fn main() {
    let logger = MemoryLogger {
        messages: RefCell::new(Vec::new()),
    };
    run_job(&logger);

    for (i, msg) in logger.messages.borrow().iter().enumerate() {
        println!("{}: {}", i, msg);
    }
}
```

::: details Output
Example 1:
```
value = 15
a = 15, b = 15
could not borrow mutably: already borrowed
```

Example 2:
```
0: job started
1: job finished
```
:::

## 🎓 Key Takeaways (1 min)

<div class="takeaways">

✅ `RefCell<T>` enforces the borrow rules at runtime: many `borrow()`s or one `borrow_mut()`, never both  
✅ Violations panic (`BorrowError` / `BorrowMutError`); use `try_borrow` / `try_borrow_mut` to handle them gracefully  
✅ Interior mutability lets you mutate state behind `&self`, essential for mocks, caches, and observers  
✅ `RefCell<T>` is single-threaded only; reach for `Mutex<T>` or `RwLock<T>` across threads

</div>

## ⚠️ Common Pitfalls

::: warning Watch Out!
- Holding a `Ref` (from `borrow()`) alive while calling `borrow_mut()` in the same scope, classic runtime panic that the compiler won't catch
- Keeping a borrow guard across a function call that also borrows the same `RefCell`, the panic appears far from the original borrow
- Using `RefCell<T>` everywhere to "silence" the borrow checker instead of restructuring ownership, it hides bugs until runtime
:::

## ✅ Quick Challenge

Build a `Counter` struct whose `increment` method takes `&self` but still increases an internal count stored in a `RefCell<u32>`. Add a `get` method returning the current value.

```rust
use std::cell::RefCell;

struct Counter {
    count: RefCell<u32>,
}

fn main() {
    // Create a Counter, call increment three times via a
    // shared reference, then print the count (should be 3).
    println!("TODO");
}
```

<details>
<summary>💡 Hint</summary>

Inside `increment`, call `self.count.borrow_mut()` and dereference it with `*` to add 1. In `get`, return `*self.count.borrow()`.

</details>

<details>
<summary>✅ Solution</summary>

```rust
use std::cell::RefCell;

struct Counter {
    count: RefCell<u32>,
}

impl Counter {
    fn new() -> Self {
        Counter { count: RefCell::new(0) }
    }

    fn increment(&self) {
        *self.count.borrow_mut() += 1;
    }

    fn get(&self) -> u32 {
        *self.count.borrow()
    }
}

fn main() {
    let counter = Counter::new();
    let shared: &Counter = &counter;
    shared.increment();
    shared.increment();
    shared.increment();
    println!("count = {}", shared.get()); // count = 3
}
```

</details>

## 📖 Additional Resources

- [The Rust Book - RefCell and Interior Mutability](https://doc.rust-lang.org/book/ch15-05-interior-mutability.html)
- [std::cell module docs](https://doc.rust-lang.org/std/cell/)

---

<ProgressTracker />

<div class="lesson-nav">
  <a href="/week-12/">← Week 12 Overview</a>
  <a href="/week-12/day-79">Day 79: Rc&lt;RefCell&lt;T&gt;&gt; Pattern →</a>
</div>
