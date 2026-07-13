---
title: "Day 84 - Smart Pointer Patterns"
description: "Learn about smart pointer patterns in Rust"
---

# Day 84: Smart Pointer Patterns

<div class="lesson-meta">
  <span class="time">⏱️ 10 minutes</span>
  <span class="difficulty">📊 Advanced</span>
  <span class="week">📅 Week 12</span>
</div>

## 🎯 Today's Goal

Consolidate the week: know every smart pointer's role, the standard combinations, and a decision procedure for picking the right one in real code.

## 📚 The Concept (3 min)

You now have the full toolbox; today is about choosing well. Each pointer answers one question:

- **`Box<T>`**, "I need this on the heap" (recursive types, huge values, trait objects). One owner, zero runtime cost beyond the allocation.
- **`Rc<T>` / `Arc<T>`**, "Who owns it? Several places do." Reference-counted shared ownership; `Rc` single-threaded, `Arc` atomic and thread-safe.
- **`Cell<T>` / `RefCell<T>`**, "I must mutate through `&self`." Interior mutability; `Cell` swaps values, `RefCell` hands out runtime-checked references.
- **`Mutex<T>` / `RwLock<T>`**, interior mutability that blocks instead of panicking; the threaded counterparts of `RefCell`.
- **`Weak<T>`**, "I want to observe without owning." Breaks cycles.

The combinations form a small grid worth memorizing. Single-threaded shared mutable state: `Rc<RefCell<T>>`. Multithreaded: `Arc<Mutex<T>>` (or `Arc<RwLock<T>>` when reads dominate). Back-edges in either world: `Weak<T>`. A heap-allocated trait object: `Box<dyn Trait>`; shared across threads: `Arc<dyn Trait>` (no lock needed if the trait only takes `&self` and the implementation is immutable).

The decision procedure: start with plain ownership and borrows, most code needs no smart pointer at all. Add `Box` only for size/recursion/dyn reasons. Add `Rc`/`Arc` only when two independent owners genuinely can't be restructured into one. Add `RefCell`/`Mutex` only when mutation through shared handles is unavoidable. Each step trades compile-time guarantees for runtime checks, so each step should be justified. When you find yourself typing `Rc<RefCell<Vec<Rc<RefCell<...>>>>>`, that's the signal to redesign, usually toward yesterday's arena pattern.

::: tip Key Insight
Pick pointers by answering two questions: *how many owners?* (one → `Box`/plain, many → `Rc`/`Arc`) and *who mutates?* (owner → `&mut`, sharers → `RefCell`/`Mutex`). Threading only changes which column you pick, never the shape of the answer.
:::

## 💻 Hands-On Code (4 min)

### Example 1: Basic Usage

Three pointers, three distinct jobs, one program:

```rust
use std::cell::RefCell;
use std::rc::Rc;

// Box: recursive type, impossible without indirection
#[derive(Debug)]
enum List {
    Cons(i32, Box<List>),
    Nil,
}

fn main() {
    // Box for recursion
    let list = List::Cons(1, Box::new(List::Cons(2, Box::new(List::Nil))));
    println!("list = {:?}", list);

    // Box for trait objects
    let shapes: Vec<Box<dyn Fn(f64) -> f64>> = vec![
        Box::new(|r| 3.14159 * r * r),
        Box::new(|s| s * s),
    ];
    for f in &shapes {
        println!("area(2.0) = {:.2}", f(2.0));
    }

    // Rc + RefCell for shared mutable state
    let scores = Rc::new(RefCell::new(vec![10, 20]));
    let judge = Rc::clone(&scores);
    judge.borrow_mut().push(30);
    println!("scores = {:?}, owners = {}", scores.borrow(), Rc::strong_count(&scores));
}
```

### Example 2: Practical Application

A tiny plugin registry using `Arc<dyn Trait>` shared across threads, no lock needed because plugins are immutable:

```rust
use std::sync::Arc;
use std::thread;

trait Plugin: Send + Sync {
    fn name(&self) -> &str;
    fn run(&self, input: i32) -> i32;
}

struct Doubler;
impl Plugin for Doubler {
    fn name(&self) -> &str { "doubler" }
    fn run(&self, input: i32) -> i32 { input * 2 }
}

struct Squarer;
impl Plugin for Squarer {
    fn name(&self) -> &str { "squarer" }
    fn run(&self, input: i32) -> i32 { input * input }
}

fn main() {
    let plugins: Arc<Vec<Arc<dyn Plugin>>> =
        Arc::new(vec![Arc::new(Doubler), Arc::new(Squarer)]);

    let mut handles = Vec::new();
    for input in [3, 4] {
        let plugins = Arc::clone(&plugins);
        handles.push(thread::spawn(move || {
            for p in plugins.iter() {
                println!("{}({}) = {}", p.name(), input, p.run(input));
            }
        }));
    }
    for h in handles {
        h.join().unwrap();
    }
}
```

::: details Output
Example 1:
```
list = Cons(1, Cons(2, Nil))
area(2.0) = 12.57
area(2.0) = 4.00
scores = [10, 20, 30], owners = 2
```

Example 2 (thread output may interleave; each thread prints):
```
doubler(3) = 6
squarer(3) = 9
doubler(4) = 8
squarer(4) = 16
```
:::

## 🎓 Key Takeaways (1 min)

<div class="takeaways">

✅ `Box` = heap + single owner; `Rc`/`Arc` = shared ownership; `RefCell`/`Mutex` = shared mutation; `Weak` = non-owning observer  
✅ The two canonical stacks: `Rc<RefCell<T>>` (single-thread) and `Arc<Mutex<T>>` (multi-thread), same shape, different runtime checks  
✅ Immutable shared data needs no lock: `Arc<T>` or `Arc<dyn Trait>` alone is enough, and it's faster  
✅ Escalate gradually, plain ownership → `Box` → `Rc`/`Arc` → interior mutability, and treat deeply nested pointer types as a redesign signal

</div>

## ⚠️ Common Pitfalls

::: warning Watch Out!
- Defaulting to `Arc<Mutex<T>>` in single-threaded code "to be safe", you pay atomic and lock costs for nothing; the compiler will tell you when you actually need them
- Wrapping already-immutable data in a `Mutex`, shared reads through `Arc<T>` need no lock at all
- Using `Box<dyn Trait>` where a generic `impl Trait` parameter would do, dynamic dispatch and allocation where monomorphization was free
:::

## ✅ Quick Challenge

For each scenario, pick the right type, then check yourself against the solution: (1) a recursive JSON-like enum; (2) a config read by 8 threads, never mutated; (3) an undo history shared by two editor views in one thread, both may push; (4) a child node's link back to its parent in an `Rc` tree.

```rust
fn main() {
    // Write your four answers as comments, e.g.:
    // 1) ???
    // 2) ???
    // 3) ???
    // 4) ???
    println!("Check the solution when done!");
}
```

<details>
<summary>💡 Hint</summary>

Ask the two questions from the Key Insight for each: how many owners, and who mutates? Then apply the thread rule (2 is multithreaded, 3 and 4 are not).

</details>

<details>
<summary>✅ Solution</summary>

```rust
fn main() {
    // 1) Box<T>            : recursion needs indirection; single owner, no sharing
    //    enum Json { Array(Vec<Json>), Object(Vec<(String, Box<Json>)>), ... }
    // 2) Arc<T>            : many threads, read-only: no Mutex required
    // 3) Rc<RefCell<Vec<Action>>> : one thread, two owners, both mutate
    // 4) Weak<Node>        : back-edge must not own, or the tree leaks
    println!("1) Box  2) Arc  3) Rc<RefCell<..>>  4) Weak");
}
```

</details>

## 📖 Additional Resources

- [The Rust Book - Smart Pointers (Ch. 15)](https://doc.rust-lang.org/book/ch15-00-smart-pointers.html)
- [Rust by Example - std library types](https://doc.rust-lang.org/rust-by-example/std.html)

---

<ProgressTracker />

<div class="lesson-nav">
  <a href="/week-12/day-83">← Day 83: Project: Graph Data Structure</a>
  <a href="/week-13/">Week 13 Overview →</a>
</div>
