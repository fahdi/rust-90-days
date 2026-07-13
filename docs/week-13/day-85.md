---
title: "Day 85 - Async/Await Basics"
description: "Learn about async/await basics in Rust"
---

# Day 85: Async/Await Basics

<div class="lesson-meta">
  <span class="time">⏱️ 10 minutes</span>
  <span class="difficulty">📊 Advanced</span>
  <span class="week">📅 Week 13</span>
</div>

## 🎯 Today's Goal

Understand what `async fn` and `.await` actually produce, a state machine implementing the `Future` trait, and drive one to completion yourself with a tiny hand-written executor.

## 📚 The Concept (3 min)

Imagine a server handling 10,000 slow network connections. Spawning 10,000 OS threads would burn megabytes of stack each and drown the scheduler in context switches. Async solves this: instead of blocking a thread while waiting, a task *suspends itself* and hands the thread back, so a few threads can juggle thousands of waiting tasks.

The mechanism is the `Future` trait. A future is a value representing work that may not be finished yet. It has one essential method, `poll`, which either returns `Poll::Ready(value)` or `Poll::Pending` ("not done, wake me later via the `Waker` you gave me").

When you write `async fn fetch() -> u32 { ... }`, the compiler rewrites the body into an anonymous struct implementing `Future&lt;Output = u32&gt;`. Every `.await` point becomes a state in a generated state machine: local variables alive across the `.await` are stored in the struct, and each `poll` call resumes execution from the last suspension point.

Two consequences follow. First, **futures are lazy**: calling an `async fn` does nothing until something polls the returned future. Second, **you need an executor**: `main` cannot be `async` in plain Rust because *someone* has to call `poll` in a loop. Runtimes like Tokio (tomorrow's topic) provide that loop, plus timers and non-blocking I/O. Today we build the smallest possible executor ourselves so the machinery is not magic.

::: tip Key Insight
`async`/`.await` is pure syntax sugar over the `Future` trait. An `async fn` returns instantly with an inert state machine; nothing runs until an executor repeatedly calls `poll` on it. Laziness is the defining difference from JavaScript promises, which start eagerly.
:::

## 💻 Hands-On Code (4 min)

### Example 1: Basic Usage

A minimal `block_on` executor that polls a future in a loop using a no-op waker.

```rust
use std::future::Future;
use std::pin::Pin;
use std::task::{Context, Poll, RawWaker, RawWakerVTable, Waker};

fn noop_raw_waker() -> RawWaker {
    fn noop(_: *const ()) {}
    fn clone(_: *const ()) -> RawWaker {
        noop_raw_waker()
    }
    static VTABLE: RawWakerVTable = RawWakerVTable::new(clone, noop, noop, noop);
    RawWaker::new(std::ptr::null(), &VTABLE)
}

fn block_on<F: Future>(mut fut: F) -> F::Output {
    let waker = unsafe { Waker::from_raw(noop_raw_waker()) };
    let mut cx = Context::from_waker(&waker);
    // Safety: we never move `fut` after pinning it on the stack.
    let mut fut = unsafe { Pin::new_unchecked(&mut fut) };
    loop {
        match fut.as_mut().poll(&mut cx) {
            Poll::Ready(val) => return val,
            Poll::Pending => continue, // busy-poll: fine for a demo
        }
    }
}

async fn answer() -> u32 {
    42
}

fn main() {
    let fut = answer(); // nothing has run yet -- futures are lazy
    println!("Future created, not yet polled.");
    let result = block_on(fut);
    println!("Result: {}", result);
}
```

### Example 2: Practical Application

Composing async functions with `.await`, the compiler chains the state machines for us.

```rust
use std::future::Future;
use std::pin::Pin;
use std::task::{Context, Poll, RawWaker, RawWakerVTable, Waker};

fn noop_raw_waker() -> RawWaker {
    fn noop(_: *const ()) {}
    fn clone(_: *const ()) -> RawWaker {
        noop_raw_waker()
    }
    static VTABLE: RawWakerVTable = RawWakerVTable::new(clone, noop, noop, noop);
    RawWaker::new(std::ptr::null(), &VTABLE)
}

fn block_on<F: Future>(mut fut: F) -> F::Output {
    let waker = unsafe { Waker::from_raw(noop_raw_waker()) };
    let mut cx = Context::from_waker(&waker);
    let mut fut = unsafe { Pin::new_unchecked(&mut fut) };
    loop {
        if let Poll::Ready(val) = fut.as_mut().poll(&mut cx) {
            return val;
        }
    }
}

async fn fetch_user_id() -> u64 {
    println!("  fetching user id...");
    7
}

async fn fetch_score(user_id: u64) -> u64 {
    println!("  fetching score for user {}...", user_id);
    user_id * 100
}

async fn pipeline() -> u64 {
    let id = fetch_user_id().await;   // suspension point 1
    let score = fetch_score(id).await; // suspension point 2
    score + 1
}

fn main() {
    println!("Running pipeline:");
    let total = block_on(pipeline());
    println!("Final score: {}", total);
}
```

::: details Output
Example 1:
```
Future created, not yet polled.
Result: 42
```

Example 2:
```
Running pipeline:
  fetching user id...
  fetching score for user 7...
Final score: 701
```
:::

## 🎓 Key Takeaways (1 min)

<div class="takeaways">

✅ An `async fn` returns a compiler-generated state machine implementing `Future`; the body does not execute when you call the function  
✅ `.await` marks a suspension point where the task can yield `Poll::Pending` and give the thread back to the executor  
✅ Futures must be pinned (`Pin`) before polling because the state machine may hold self-references across `.await` points  
✅ Plain Rust has no built-in executor, `block_on` loops calling `poll` until `Poll::Ready`, and real runtimes add wakers, timers, and non-blocking I/O

</div>

## ⚠️ Common Pitfalls

::: warning Watch Out!
- Calling an `async fn` and forgetting `.await`, the future is silently dropped and never runs (the compiler warns: "unused implementer of `Future` that must be used")
- Calling a blocking function like `std::thread::sleep` inside async code, it freezes the executor thread and stalls every other task scheduled on it
- Expecting `async` to mean parallel: two `.await`s in sequence run one after the other; concurrency requires joining/spawning futures
:::

## ✅ Quick Challenge

Write an async function `add_async(a: u32, b: u32) -> u32` and a second async function `double_sum(a, b)` that awaits `add_async` and doubles the result. Drive it with the `block_on` from Example 1 and print the answer for `(3, 4)`.

```rust
// Starter code
fn main() {
    // Bring in block_on from Example 1, then:
    // let result = block_on(double_sum(3, 4));
    // println!("{}", result); // should print 14
    println!("TODO");
}
```

<details>
<summary>💡 Hint</summary>

Copy `noop_raw_waker` and `block_on` verbatim from Example 1. Inside `double_sum`, `add_async(a, b).await * 2` is the whole body.

</details>

<details>
<summary>✅ Solution</summary>

```rust
use std::future::Future;
use std::pin::Pin;
use std::task::{Context, Poll, RawWaker, RawWakerVTable, Waker};

fn noop_raw_waker() -> RawWaker {
    fn noop(_: *const ()) {}
    fn clone(_: *const ()) -> RawWaker {
        noop_raw_waker()
    }
    static VTABLE: RawWakerVTable = RawWakerVTable::new(clone, noop, noop, noop);
    RawWaker::new(std::ptr::null(), &VTABLE)
}

fn block_on<F: Future>(mut fut: F) -> F::Output {
    let waker = unsafe { Waker::from_raw(noop_raw_waker()) };
    let mut cx = Context::from_waker(&waker);
    let mut fut = unsafe { Pin::new_unchecked(&mut fut) };
    loop {
        if let Poll::Ready(val) = fut.as_mut().poll(&mut cx) {
            return val;
        }
    }
}

async fn add_async(a: u32, b: u32) -> u32 {
    a + b
}

async fn double_sum(a: u32, b: u32) -> u32 {
    add_async(a, b).await * 2
}

fn main() {
    let result = block_on(double_sum(3, 4));
    println!("{}", result); // 14
}
```

</details>

## 📖 Additional Resources

- [The Rust Book - Relevant Chapter](https://doc.rust-lang.org/book/)
- [Rust by Example](https://doc.rust-lang.org/rust-by-example/)

---

<ProgressTracker />

<div class="lesson-nav">
  <a href="/week-13/">← Week 13 Overview</a>
  <a href="/week-13/day-86">Day 86: Tokio Runtime Intro →</a>
</div>
