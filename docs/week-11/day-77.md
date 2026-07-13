---
title: "Day 77 - Rc<T> & Reference Counting"
description: "Learn about Rc<T> and reference counting in Rust"
---

# Day 77: Rc&lt;T&gt; & Reference Counting

<div class="lesson-meta">
  <span class="time">⏱️ 10 minutes</span>
  <span class="difficulty">📊 Advanced</span>
  <span class="week">📅 Week 11</span>
</div>

## 🎯 Today's Goal

Learn `Rc&lt;T&gt;`, the reference-counted smart pointer that gives one heap value *multiple owners*, and watch the count rise and fall with `Rc::strong_count`.

## 📚 The Concept (3 min)

Yesterday's `Box&lt;T&gt;` has exactly one owner. But some data structures genuinely need shared ownership. Picture two cons lists, `b` and `c`, that both continue into the same tail list `a`, like two river branches merging. Who owns `a`? With `Box`, the first list to absorb `a` moves it, and the second can't use it. With references you'd drown in lifetimes and still need an owner somewhere.

`Rc&lt;T&gt;` (Reference Counted) solves this: the heap allocation carries a **strong count** of how many `Rc` handles point at it. `Rc::clone(&a)` doesn't copy the data, it bumps the count and hands you another owner handle. Dropping any handle decrements the count; when it reaches zero, the value is freed. Deterministic cleanup, no garbage collector, and the bookkeeping is a single integer increment.

Two hard rules:

1. **Immutable access only.** If multiple owners could also mutate, Rust's aliasing guarantees would collapse. `Rc&lt;T&gt;` hands out shared `&T` access. (Interior mutability via `RefCell&lt;T&gt;`, combining into `Rc&lt;RefCell&lt;T&gt;&gt;`, is next week's topic.)
2. **Single-threaded only.** The count isn't atomic, so `Rc` doesn't implement `Send`. For threads, use its atomic sibling `Arc&lt;T&gt;`.

Convention note: write `Rc::clone(&a)` rather than `a.clone()`. Both do the same thing, but the explicit form signals "cheap count bump" to readers, distinguishing it from deep clones elsewhere in the code.

Also beware: two `Rc` values pointing at each other form a cycle whose counts never hit zero, a memory leak. `Weak&lt;T&gt;` exists for that; today we stick to acyclic sharing.

::: tip Key Insight
`Rc::clone` never copies the data, it increments a counter and returns another owning handle. The value lives exactly until the last handle drops. Shared ownership, immutable access, single thread.
:::

## 💻 Hands-On Code (4 min)

### Example 1: Basic Usage

Watching the strong count change as owners come and go:

```rust
use std::rc::Rc;

fn main() {
    let a = Rc::new(String::from("shared data"));
    println!("count after creating a = {}", Rc::strong_count(&a));

    let b = Rc::clone(&a);
    println!("count after creating b = {}", Rc::strong_count(&a));

    {
        let c = Rc::clone(&a);
        println!("count after creating c = {}", Rc::strong_count(&a));
        println!("c sees: {}", c);
    } // c dropped here

    println!("count after c goes out of scope = {}", Rc::strong_count(&a));
    println!("b still sees: {}", b);
}
```

### Example 2: Practical Application

The shared-tail cons list, impossible with `Box`, natural with `Rc`:

```rust
use std::rc::Rc;

enum List {
    Cons(i32, Rc<List>),
    Nil,
}

use List::{Cons, Nil};

fn sum(list: &List) -> i32 {
    match list {
        Cons(v, rest) => v + sum(rest),
        Nil => 0,
    }
}

fn main() {
    // a = 5 -> 10
    let a = Rc::new(Cons(5, Rc::new(Cons(10, Rc::new(Nil)))));
    // b = 3 -> a, c = 4 -> a: both share the same tail
    let b = Cons(3, Rc::clone(&a));
    let c = Cons(4, Rc::clone(&a));

    println!("sum b = {}", sum(&b));
    println!("sum c = {}", sum(&c));
    println!("owners of a's tail = {}", Rc::strong_count(&a));
}
```

::: details Output
```
count after creating a = 1
count after creating b = 2
count after creating c = 3
c sees: shared data
count after c goes out of scope = 2
b still sees: shared data
```
Example 2:
```
sum b = 18
sum c = 19
owners of a's tail = 3
```
:::

## 🎓 Key Takeaways (1 min)

<div class="takeaways">

✅ `Rc&lt;T&gt;` enables multiple owners of one heap value; the value is freed when the strong count hits zero  
✅ `Rc::clone(&x)` is a cheap counter increment, not a data copy, the explicit form is idiomatic to signal that  
✅ `Rc` gives immutable access only, and is single-threaded (`Arc&lt;T&gt;` is the thread-safe version)  
✅ `Rc::strong_count(&x)` lets you observe ownership; reference cycles leak, which `Weak&lt;T&gt;` addresses

</div>

## ⚠️ Common Pitfalls

::: warning Watch Out!
- Trying to mutate through an `Rc`, `Rc&lt;T&gt;` derefs to `&T` only; you need `Rc&lt;RefCell&lt;T&gt;&gt;` for shared mutability (Week 12)
- Using `Rc` across threads, it won't compile (`Rc` is not `Send`); reach for `Arc` instead
- Building parent-and-child structures where both hold strong `Rc`s to each other, the cycle's count never reaches zero and the memory leaks silently
:::

## ✅ Quick Challenge

Create one `Rc&lt;Vec&lt;i32&gt;&gt;` of numbers and share it with two "report" functions, one printing the max, one the total, without cloning the vector's data. Print the strong count before and after sharing. Starter code (compiles):

```rust
use std::rc::Rc;

fn main() {
    let data = Rc::new(vec![3, 9, 4, 1]);
    println!("count = {}", Rc::strong_count(&data));
    // TODO: report_max(...) and report_total(...) each taking an Rc handle
}
```

<details>
<summary>💡 Hint</summary>

Signature: `fn report_max(data: Rc&lt;Vec&lt;i32&gt;&gt;)`. Pass `Rc::clone(&data)` at each call site; inside, iterate as if it were a `&Vec&lt;i32&gt;` thanks to deref.

</details>

<details>
<summary>✅ Solution</summary>

```rust
use std::rc::Rc;

fn report_max(data: Rc<Vec<i32>>) {
    println!("max = {:?} (count inside = {})", data.iter().max(), Rc::strong_count(&data));
}

fn report_total(data: Rc<Vec<i32>>) {
    let total: i32 = data.iter().sum();
    println!("total = {} (count inside = {})", total, Rc::strong_count(&data));
}

fn main() {
    let data = Rc::new(vec![3, 9, 4, 1]);
    println!("count before sharing = {}", Rc::strong_count(&data));
    report_max(Rc::clone(&data));
    report_total(Rc::clone(&data));
    println!("count after sharing = {}", Rc::strong_count(&data));
}
```

Output:
```
count before sharing = 1
max = Some(9) (count inside = 2)
total = 17 (count inside = 2)
count after sharing = 1
```

Each function temporarily holds a second handle (count 2) and drops it on return, the vector itself is never copied.

</details>

## 📖 Additional Resources

- [The Rust Book - Rc&lt;T&gt;, the Reference Counted Smart Pointer](https://doc.rust-lang.org/book/ch15-04-rc.html)
- [Rust by Example - Rc](https://doc.rust-lang.org/rust-by-example/std/rc.html)

---

<ProgressTracker />

<div class="lesson-nav">
  <a href="/week-11/day-76">← Day 76: Box&lt;T&gt;</a>
  <a href="/week-12/">Week 12 Overview →</a>
</div>
