---
title: "Day 86 - Tokio Runtime Intro"
description: "Learn about tokio runtime intro in Rust"
---

# Day 86: Tokio Runtime Intro

<div class="lesson-meta">
  <span class="time">⏱️ 10 minutes</span>
  <span class="difficulty">📊 Advanced</span>
  <span class="week">📅 Week 13</span>
</div>

## 🎯 Today's Goal

Understand what an async runtime like Tokio actually provides, a scheduler, a reactor, and task spawning, and see how its worker-pool model maps onto concepts you can reproduce with plain threads and channels.

## 📚 The Concept (3 min)

Yesterday's `block_on` busy-polled a single future. That is uselessly inefficient for real programs: a web service needs *thousands* of tasks making progress concurrently, sleeping cheaply while waiting for sockets, and waking exactly when data arrives. That gap is what Tokio fills.

Tokio is the de-facto standard async runtime for Rust. It bundles three things:

1. **A scheduler**, a pool of worker threads (usually one per CPU core) that pull ready tasks from queues and poll them. Idle workers *steal* work from busy ones, keeping cores saturated.
2. **A reactor**, an event loop built on the OS notification APIs (epoll on Linux, kqueue on macOS). When a socket becomes readable, the reactor calls the task's `Waker`, moving it back onto a run queue. No busy-polling.
3. **Task spawning**, `tokio::spawn(future)` registers a lightweight task (a few hundred bytes, versus megabytes for an OS thread), which is why "10,000 concurrent connections" is routine.

In a Cargo project you add `tokio = { version = "1", features = ["full"] }` and write `#[tokio::main] async fn main() { ... }`. That attribute macro expands to ordinary code: build a `Runtime`, then `runtime.block_on(async_main_body)`.

Because these lessons stay dependency-free, today's examples build a *toy* version of the same architecture with `std::thread` and `std::sync::mpsc`: a queue of jobs, a pool of workers pulling from it, and results flowing back. Tokio's design is this pattern, refined: tasks instead of closures, wakers instead of blocking recv, work stealing instead of one shared queue.

::: tip Key Insight
Tokio is not part of the language. `async`/`.await` compile to state machines; Tokio is the library that stores those state machines, polls them on a thread pool, and uses OS event notifications to wake them at the right moment. Runtime and language are deliberately decoupled, you could swap in `async-std` or `smol`.
:::

## 💻 Hands-On Code (4 min)

### Example 1: Basic Usage

A single shared job queue with a pool of workers, the skeleton of a multi-threaded scheduler. (Std-only stand-in for `tokio::spawn`.)

```rust
use std::sync::mpsc;
use std::sync::{Arc, Mutex};
use std::thread;

fn main() {
    let (job_tx, job_rx) = mpsc::channel::<u32>();
    let (result_tx, result_rx) = mpsc::channel::<String>();
    let job_rx = Arc::new(Mutex::new(job_rx));

    let mut workers = Vec::new();
    for worker_id in 0..3 {
        let job_rx = Arc::clone(&job_rx);
        let result_tx = result_tx.clone();
        workers.push(thread::spawn(move || loop {
            let job = job_rx.lock().unwrap().recv();
            match job {
                Ok(n) => {
                    let msg = format!("worker {} handled task {}", worker_id, n);
                    result_tx.send(msg).unwrap();
                }
                Err(_) => break, // queue closed: shut down
            }
        }));
    }
    drop(result_tx);

    for task in 1..=6 {
        job_tx.send(task).unwrap(); // like tokio::spawn
    }
    drop(job_tx); // like runtime shutdown

    let mut results: Vec<String> = result_rx.iter().collect();
    results.sort(); // worker order is nondeterministic, sort for display
    for r in &results {
        println!("{}", r);
    }
    for w in workers {
        w.join().unwrap();
    }
    println!("all {} tasks completed", results.len());
}
```

### Example 2: Practical Application

Fan-out/fan-in: run "requests" concurrently and aggregate results, the shape of a typical `tokio::spawn` + `join` workload.

```rust
use std::sync::mpsc;
use std::thread;
use std::time::{Duration, Instant};

fn simulated_request(id: u32) -> u32 {
    // Pretend this is a network call taking ~50ms.
    thread::sleep(Duration::from_millis(50));
    id * 10
}

fn main() {
    let start = Instant::now();
    let (tx, rx) = mpsc::channel();

    for id in 1..=4 {
        let tx = tx.clone();
        thread::spawn(move || {
            tx.send(simulated_request(id)).unwrap();
        });
    }
    drop(tx);

    let mut total = 0;
    for value in rx {
        total += value;
    }

    println!("sum of responses: {}", total);
    println!("ran 4 x 50ms requests concurrently: {}", start.elapsed().as_millis() < 150);
}
```

::: details Output
Example 1 (after sorting; worker/task pairing varies run to run):
```
worker 0 handled task 1
worker 1 handled task 2
worker 2 handled task 3
worker 0 handled task 4
worker 1 handled task 5
worker 2 handled task 6
all 6 tasks completed
```
Note: which worker handles which task is nondeterministic, only the final count line is guaranteed.

Example 2:
```
sum of responses: 100
ran 4 x 50ms requests concurrently: true
```
:::

## 🎓 Key Takeaways (1 min)

<div class="takeaways">

✅ Tokio = scheduler (worker thread pool with work stealing) + reactor (epoll/kqueue-driven wakeups) + utilities (timers, TCP, channels)  
✅ `#[tokio::main]` is just a macro that builds a `Runtime` and calls `block_on` on your async main body  
✅ `tokio::spawn` creates a task costing hundreds of bytes, not an OS thread costing megabytes, that is the entire scaling argument  
✅ The runtime is a library choice, not a language feature; async code is portable across executors if it avoids runtime-specific APIs

</div>

## ⚠️ Common Pitfalls

::: warning Watch Out!
- Calling blocking code (`std::thread::sleep`, heavy computation, blocking file I/O) inside a Tokio task starves the worker thread, use `tokio::time::sleep` or `spawn_blocking` instead
- Forgetting to enable Tokio features in Cargo.toml (`features = ["full"]` while learning), you get confusing "not found" errors for `tokio::main` or `tokio::net`
- Assuming `tokio::spawn`ed tasks finish before main exits, you must `.await` the returned `JoinHandle`, just as we `join()` threads above
:::

## ✅ Quick Challenge

Using the fan-out pattern from Example 2, spawn 5 workers where worker `n` computes the square of `n`, collect all results through one channel, and print their sum (should be 55 for 1..=5).

```rust
// Starter code
use std::sync::mpsc;
use std::thread;

fn main() {
    let (tx, rx) = mpsc::channel::<u32>();
    // spawn 5 threads, each sends n * n
    // then drop(tx) and sum everything from rx
    let _ = (tx, rx);
    println!("TODO");
}
```

<details>
<summary>💡 Hint</summary>

Clone `tx` into each thread with `let tx = tx.clone();` before `thread::spawn(move || ...)`. Drop the original `tx` after the loop so `rx.iter()` terminates.

</details>

<details>
<summary>✅ Solution</summary>

```rust
use std::sync::mpsc;
use std::thread;

fn main() {
    let (tx, rx) = mpsc::channel::<u32>();
    for n in 1..=5u32 {
        let tx = tx.clone();
        thread::spawn(move || {
            tx.send(n * n).unwrap();
        });
    }
    drop(tx);
    let sum: u32 = rx.iter().sum();
    println!("sum of squares: {}", sum); // 55
}
```

</details>

## 📖 Additional Resources

- [The Rust Book - Relevant Chapter](https://doc.rust-lang.org/book/)
- [Rust by Example](https://doc.rust-lang.org/rust-by-example/)

---

<ProgressTracker />

<div class="lesson-nav">
  <a href="/week-13/day-85">← Day 85: Async/Await Basics</a>
  <a href="/week-13/day-87">Day 87: Macros: macro_rules! →</a>
</div>
