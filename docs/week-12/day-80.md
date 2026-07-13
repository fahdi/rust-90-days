---
title: "Day 80 - Arc T  for Threading"
description: "Learn about arc t  for threading in Rust"
---

# Day 80: Arc&lt;T&gt; for Threading

<div class="lesson-meta">
  <span class="time">⏱️ 10 minutes</span>
  <span class="difficulty">📊 Advanced</span>
  <span class="week">📅 Week 12</span>
</div>

## 🎯 Today's Goal

Use `Arc<T>` to share data across threads safely, and pair it with `Mutex<T>` when threads also need to mutate that data.

## 📚 The Concept (3 min)

Suppose you have a large read-only configuration and eight worker threads that all need it. You could clone the whole config per thread, wasteful. You could pass references, but `thread::spawn` requires `'static` data, and the compiler can't prove the config outlives every thread. What you want is shared ownership across threads.

`Rc<T>` is exactly shared ownership, but it's disqualified: its reference count is a plain integer, and two threads incrementing it simultaneously is a data race. That's why `Rc<T>` is `!Send`, the compiler will flatly refuse to move it into a spawned thread.

`Arc<T>` (Atomically Reference Counted) is the fix. It's the same idea as `Rc`, but the counter uses atomic CPU instructions, so increments and decrements are safe from any thread. The API mirrors `Rc`: `Arc::new`, `Arc::clone`, `Arc::strong_count`. Each thread gets its own clone of the handle; the data itself lives in one place on the heap and is freed when the last handle drops.

`Arc` alone gives shared read-only access. For shared mutation, you combine it with a lock: `Arc<Mutex<T>>` is the thread-safe analogue of yesterday's `Rc<RefCell<T>>`. `Mutex::lock()` blocks until the lock is free and returns a guard; the lock releases automatically when the guard goes out of scope. Where `RefCell` panics on conflicting access, `Mutex` simply makes the second thread wait.

Rule of thumb: atomics cost slightly more than plain integers, so keep using `Rc` in single-threaded code and reach for `Arc` only when crossing thread boundaries.

::: tip Key Insight
`Arc` = `Rc` with an atomic counter. Single-threaded sharing → `Rc<RefCell<T>>`; multithreaded sharing → `Arc<Mutex<T>>`. The compiler enforces the choice via the `Send`/`Sync` traits, so you can't get it wrong silently.
:::

## 💻 Hands-On Code (4 min)

### Example 1: Basic Usage

```rust
use std::sync::Arc;
use std::thread;

fn main() {
    let data = Arc::new(vec![1, 2, 3, 4, 5]);

    let mut handles = Vec::new();
    for id in 0..3 {
        let data = Arc::clone(&data);
        handles.push(thread::spawn(move || {
            let sum: i32 = data.iter().sum();
            println!("thread {} sees sum = {}", id, sum);
        }));
    }

    for h in handles {
        h.join().unwrap();
    }
    println!("main still owns the data: {:?}", data);
}
```

### Example 2: Practical Application

Ten threads each incrementing a shared counter 1000 times, the canonical `Arc<Mutex<T>>` example:

```rust
use std::sync::{Arc, Mutex};
use std::thread;

fn main() {
    let counter = Arc::new(Mutex::new(0u64));

    let mut handles = Vec::new();
    for _ in 0..10 {
        let counter = Arc::clone(&counter);
        handles.push(thread::spawn(move || {
            for _ in 0..1000 {
                let mut n = counter.lock().unwrap();
                *n += 1;
            } // lock released here each iteration
        }));
    }

    for h in handles {
        h.join().unwrap();
    }

    println!("final count = {}", counter.lock().unwrap());
}
```

::: details Output
Example 1 (thread lines may interleave in any order):
```
thread 0 sees sum = 15
thread 1 sees sum = 15
thread 2 sees sum = 15
main still owns the data: [1, 2, 3, 4, 5]
```

Example 2:
```
final count = 10000
```
:::

## 🎓 Key Takeaways (1 min)

<div class="takeaways">

✅ `Arc<T>` provides shared ownership across threads by making the reference count atomic  
✅ `Rc<T>` is `!Send`, the compiler physically prevents you from sending it to another thread  
✅ `Arc<Mutex<T>>` is the multithreaded counterpart of `Rc<RefCell<T>>`; the lock guard releases on scope exit  
✅ Clone the `Arc` before `thread::spawn` and `move` the clone in, the original stays usable in main

</div>

## ⚠️ Common Pitfalls

::: warning Watch Out!
- Forgetting `move` on the spawned closure, or moving the original `Arc` instead of a clone, clone first, move the clone
- Holding a `MutexGuard` across long work (or another `lock()` on the same mutex), serializes threads at best, deadlocks at worst
- Assuming `Arc<T>` alone allows mutation, it doesn't; wrap the inner data in `Mutex`/`RwLock`, or use atomics for simple counters
:::

## ✅ Quick Challenge

Spawn 4 threads that each push their thread id into a shared `Vec<usize>` protected by `Arc<Mutex<...>>`. After joining, print the vector's length and its sorted contents.

```rust
use std::sync::{Arc, Mutex};
use std::thread;

fn main() {
    let results: Arc<Mutex<Vec<usize>>> = Arc::new(Mutex::new(Vec::new()));
    // 1. Spawn 4 threads, each pushing its id
    // 2. Join them all
    // 3. Sort and print
    println!("{:?}", results.lock().unwrap());
}
```

<details>
<summary>💡 Hint</summary>

Inside the loop: `let results = Arc::clone(&results);` then `thread::spawn(move || results.lock().unwrap().push(id))`. After joining, lock once, `sort()`, then print.

</details>

<details>
<summary>✅ Solution</summary>

```rust
use std::sync::{Arc, Mutex};
use std::thread;

fn main() {
    let results: Arc<Mutex<Vec<usize>>> = Arc::new(Mutex::new(Vec::new()));

    let mut handles = Vec::new();
    for id in 0..4 {
        let results = Arc::clone(&results);
        handles.push(thread::spawn(move || {
            results.lock().unwrap().push(id);
        }));
    }

    for h in handles {
        h.join().unwrap();
    }

    let mut v = results.lock().unwrap();
    v.sort();
    println!("len = {}, contents = {:?}", v.len(), *v);
    // len = 4, contents = [0, 1, 2, 3]
}
```

</details>

## 📖 Additional Resources

- [The Rust Book - Shared-State Concurrency](https://doc.rust-lang.org/book/ch16-03-shared-state.html)
- [Rust by Example - Arc](https://doc.rust-lang.org/rust-by-example/std/arc.html)

---

<ProgressTracker />

<div class="lesson-nav">
  <a href="/week-12/day-79">← Day 79: Rc&lt;RefCell&lt;T&gt;&gt; Pattern</a>
  <a href="/week-12/day-81">Day 81: Weak&lt;T&gt; References →</a>
</div>
