---
title: "Day 52 - Fn, FnMut, FnOnce Traits"
description: "Learn about fn, fnmut, fnonce traits in Rust"
---

# Day 52: Fn, FnMut, FnOnce Traits

<div class="lesson-meta">
  <span class="time">⏱️ 10 minutes</span>
  <span class="difficulty">📊 Advanced</span>
  <span class="week">📅 Week 8</span>
</div>

## 🎯 Today's Goal

Understand the three closure traits, `Fn`, `FnMut`, and `FnOnce`, and choose the correct one as a trait bound when writing functions that accept or return closures.

## 📚 The Concept (3 min)

Yesterday you learned that closures capture variables from their environment. Today's question is: *how* does a closure use what it captured? Rust answers this with three traits, and every closure automatically implements one or more of them based on what its body does.

- **`FnOnce`**, the closure can be called *at least once*. It may consume (move out of) its captured values, so after one call there may be nothing left to call again. Every closure implements `FnOnce`.
- **`FnMut`**, the closure can be called *repeatedly* and may *mutate* its captured values. Think of a counter that increments state on every call.
- **`Fn`**, the closure can be called repeatedly and only *reads* its captures (or captures nothing). It's safe to call through a shared reference, even from multiple places.

A useful analogy: imagine borrowing a book. `Fn` is reading it, you can do that as many times as you like, and so can others. `FnMut` is writing notes in the margins, repeatable, but you need exclusive access. `FnOnce` is tearing out a page and mailing it to someone, you can only do that once.

These traits form a hierarchy: `Fn` is a subtrait of `FnMut`, which is a subtrait of `FnOnce`. A closure that merely reads implements all three; a closure that mutates implements `FnMut` and `FnOnce`; a closure that consumes implements only `FnOnce`. That's why bounds matter when *you* write a generic function: `FnOnce` is the most permissive bound for callers (any closure fits, but you may call it once), while `Fn` is the most restrictive (fewer closures qualify, but you can call it freely).

Note this is separate from the `move` keyword you saw on Day 51, `move` controls how values are *captured*; the trait is determined by what the body *does* with them.

::: tip Key Insight
The compiler picks the traits a closure implements from its body; you pick the trait *bound* from how your function calls it. Rule of thumb: bound with `FnOnce` if you call it once, `FnMut` if you call it repeatedly and it may mutate, `Fn` only if you need shared, read-only calls.
:::

## 💻 Hands-On Code (4 min)

### Example 1: Basic Usage

Three generic functions, one per trait, showing what each bound allows:

```rust
fn call_fn<F: Fn()>(f: F) {
    f();
    f(); // Fn can be called any number of times
}

fn call_fn_mut<F: FnMut()>(mut f: F) {
    f();
    f();
}

fn call_fn_once<F: FnOnce()>(f: F) {
    f(); // FnOnce can only be called once
}

fn main() {
    let name = String::from("Rust");

    // Fn: only reads captured data
    call_fn(|| println!("Hello, {name}!"));

    // FnMut: mutates captured data
    let mut count = 0;
    call_fn_mut(|| {
        count += 1;
        println!("count is now {count}");
    });
    println!("final count: {count}");

    // FnOnce: consumes captured data
    let goodbye = String::from("Goodbye!");
    call_fn_once(move || {
        let owned = goodbye; // moves the String out of the closure
        println!("{owned}");
    });
}
```

### Example 2: Practical Application

A mini data pipeline: `FnMut` for stateful transformation, a boxed `Fn` returned from a factory, and `FnOnce` for a consume-once report builder:

```rust
// FnMut bound: the closure may keep mutable running state between calls
fn process<F>(items: &[i32], mut op: F) -> Vec<i32>
where
    F: FnMut(i32) -> i32,
{
    items.iter().map(|&x| op(x)).collect()
}

// Fn bound: returned closure must be callable repeatedly through a shared ref
fn make_scaler(factor: i32) -> Box<dyn Fn(i32) -> i32> {
    Box::new(move |x| x * factor)
}

// FnOnce bound: the builder runs exactly once and may consume its captures
fn print_report<F: FnOnce() -> String>(build: F) {
    println!("{}", build());
}

fn main() {
    let data = [1, 2, 3, 4, 5];

    // FnMut: accumulates a sum while transforming
    let mut sum = 0;
    let doubled = process(&data, |x| {
        sum += x;
        x * 2
    });
    println!("doubled: {doubled:?}, input sum: {sum}");

    // Fn: reusable closure from a factory
    let triple = make_scaler(3);
    let tripled: Vec<i32> = data.iter().map(|&x| triple(x)).collect();
    println!("tripled: {tripled:?}");

    // FnOnce: consumes the captured String to build the message
    let title = String::from("Pipeline finished");
    print_report(move || format!("{title}: {} items", data.len()));
}
```

::: details Output
```
Hello, Rust!
Hello, Rust!
count is now 1
count is now 2
final count: 2
Goodbye!
```

Example 2:

```
doubled: [2, 4, 6, 8, 10], input sum: 15
tripled: [3, 6, 9, 12, 15]
Pipeline finished: 5 items
```
:::

## 🎓 Key Takeaways (1 min)

<div class="takeaways">

✅ Every closure implements `FnOnce`; add `FnMut` if it doesn't consume captures, and `Fn` if it doesn't mutate them either, the compiler decides from the body  
✅ The hierarchy is `Fn: FnMut: FnOnce`, so a `Fn` closure can be passed anywhere a `FnMut` or `FnOnce` is expected  
✅ When writing generic functions, prefer the most permissive bound your call pattern allows: `FnOnce` for one call, `FnMut` for repeated calls with state, `Fn` for shared read-only calls  
✅ `move` changes how a closure *captures* (by value instead of by reference); the trait it implements depends only on what the body *does* with the captures

</div>

## ⚠️ Common Pitfalls

::: warning Watch Out!
- **Bounding with `Fn` when the caller's closure mutates state.** `process(&data, |x| { sum += x; x })` fails to compile against an `F: Fn(i32) -> i32` bound, because a mutating closure only implements `FnMut` and `FnOnce`. Loosen the bound to `FnMut`, this does NOT compile otherwise.
- **Forgetting `mut` on the parameter for `FnMut`.** Even with the right bound, `fn apply<F: FnMut()>(f: F) { f(); }` does NOT compile, calling a `FnMut` requires a mutable binding, so you need `mut f: F`.
- **Assuming `move` makes a closure `FnOnce`-only.** `move || println!("{name}")` still implements `Fn`: it owns `name` but only reads it. A closure is `FnOnce`-only when its body moves a capture *out* (e.g., returns it or drops it), not when it captures by value.
:::

## ✅ Quick Challenge

The function below runs a closure `n` times, but its trait bound is too strict: uncomment the `repeat(5, |i| total += i)` line and the program stops compiling. Fix `repeat` so both calls in `main` work.

```rust
// Starter code
fn repeat<F>(n: u32, f: F)
where
    F: Fn(u32), // TODO: is Fn the right bound here?
{
    for i in 0..n {
        f(i);
    }
}

fn main() {
    let mut total = 0;
    // Uncomment this line — it won't compile until you fix the bound:
    // repeat(5, |i| total += i);
    repeat(3, |i| println!("tick {i}"));
    println!("total: {total}");
}
```

<details>
<summary>💡 Hint</summary>

A closure that writes to `total` implements `FnMut` but not `Fn`. Two changes are needed: loosen the bound, and remember that calling a `FnMut` requires the parameter itself to be mutable (`mut f: F`). Thanks to the trait hierarchy, the read-only `println!` closure still qualifies.

</details>

<details>
<summary>✅ Solution</summary>

```rust
fn repeat<F>(n: u32, mut f: F)
where
    F: FnMut(u32), // FnMut accepts closures that mutate their captures
{
    for i in 0..n {
        f(i);
    }
}

fn main() {
    let mut total = 0;
    repeat(5, |i| total += i); // 0 + 1 + 2 + 3 + 4
    println!("total: {total}");

    repeat(3, |i| println!("tick {i}")); // read-only closures still work
}
```

Output:

```
total: 10
tick 0
tick 1
tick 2
```

</details>

## 📖 Additional Resources

- [The Rust Book - Closures: Fn Traits](https://doc.rust-lang.org/book/ch13-01-closures.html)
- [Rust by Example - Closures as input parameters](https://doc.rust-lang.org/rust-by-example/fn/closures/input_parameters.html)

---

<ProgressTracker />

<div class="lesson-nav">
  <a href="/week-08/day-51">← Day 51: move Closures</a>
  <a href="/week-08/day-53">Day 53: Iterator Performance →</a>
</div>
