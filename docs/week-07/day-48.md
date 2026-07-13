---
title: "Day 48 - Custom Iterators"
description: "Learn about custom iterators in Rust"
---

# Day 48: Custom Iterators

<div class="lesson-meta">
  <span class="time">⏱️ 10 minutes</span>
  <span class="difficulty">📊 Advanced</span>
  <span class="week">📅 Week 7</span>
</div>

## 🎯 Today's Goal

Implement the `Iterator` trait on your own types so they plug directly into `for` loops and every adapter you learned this week, `map`, `filter`, `zip`, `sum`, and friends.

## 📚 The Concept (3 min)

Over the last two days you consumed iterators that Rust handed you, from vectors, ranges, and strings. Today you build your own. The surprise is how small the job is: the entire `Iterator` trait has exactly **one required method**.

```rust
trait Iterator {
    type Item;
    fn next(&mut self) -> Option<Self::Item>;
}
```

`type Item` declares what kind of value the iterator produces, and `next` returns `Some(value)` while there is more to give, then `None` when the sequence is exhausted. That's the whole contract.

Think of it like a vending machine for values. The machine (`&mut self`) keeps internal state, what it has dispensed so far. Every press of the button (`next`) either drops out an item (`Some`) or shows the "empty" light (`None`). Nobody peeks inside the machine; callers only press the button.

Here is the payoff, and it's a big one: the `Iterator` trait ships with **75+ provided methods**, `map`, `filter`, `take`, `zip`, `sum`, `collect`, all of them, and every single one is implemented in terms of `next`. Write one method and you inherit the entire toolkit. Your custom type immediately works in `for` loops, chains with adapters, and collects into collections, exactly like `Vec`'s iterator does.

Custom iterators also unlock sequences that no collection can hold: infinite streams (all Fibonacci numbers), generated-on-demand data (lines from a sensor), or stateful walks (nodes of a tree). Because iterators are lazy, "infinite" is fine, the consumer decides how many values to actually pull.

::: tip Key Insight
Implement `next` and you get everything else for free: every adapter and consumer in the iterator toolkit is built purely on repeated calls to `next`.
:::

## 💻 Hands-On Code (4 min)

### Example 1: Basic Usage

The classic `Counter`, it yields 1 through 5, then stops. Note how the struct's field *is* the iterator's state.

```rust
struct Counter {
    count: u32,
}

impl Counter {
    fn new() -> Counter {
        Counter { count: 0 }
    }
}

impl Iterator for Counter {
    type Item = u32;

    fn next(&mut self) -> Option<u32> {
        if self.count < 5 {
            self.count += 1;
            Some(self.count)
        } else {
            None
        }
    }
}

fn main() {
    let counter = Counter::new();

    for value in counter {
        println!("Got: {}", value);
    }

    // Adapters work for free once `next` exists
    let sum: u32 = Counter::new()
        .zip(Counter::new().skip(1))
        .map(|(a, b)| a * b)
        .filter(|x| x % 3 == 0)
        .sum();
    println!("Sum of products divisible by 3: {}", sum);
}
```

### Example 2: Practical Application

An **infinite** Fibonacci iterator. No collection could store this sequence, but laziness means the consumer simply takes what it needs. Using `checked_add` with the `?` operator makes the stream end cleanly instead of panicking on `u64` overflow.

```rust
struct Fibonacci {
    current: u64,
    next: u64,
}

fn fibonacci() -> Fibonacci {
    Fibonacci { current: 0, next: 1 }
}

impl Iterator for Fibonacci {
    type Item = u64;

    fn next(&mut self) -> Option<u64> {
        let new_next = self.current.checked_add(self.next)?;
        let result = self.current;
        self.current = self.next;
        self.next = new_next;
        Some(result)
    }
}

fn main() {
    // Infinite in spirit, but lazy: take only what you need
    let first_ten: Vec<u64> = fibonacci().take(10).collect();
    println!("First 10: {:?}", first_ten);

    let big_even_sum: u64 = fibonacci()
        .take_while(|&n| n < 1_000)
        .filter(|n| n % 2 == 0)
        .sum();
    println!("Sum of even Fibonacci numbers under 1000: {}", big_even_sum);

    // checked_add means we stop cleanly instead of overflowing
    let total_count = fibonacci().count();
    println!("Terms before u64 overflow: {}", total_count);
}
```

::: details Output
```
Got: 1
Got: 2
Got: 3
Got: 4
Got: 5
Sum of products divisible by 3: 18
First 10: [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]
Sum of even Fibonacci numbers under 1000: 798
Terms before u64 overflow: 92
```
:::

## 🎓 Key Takeaways (1 min)

<div class="takeaways">

✅ `Iterator` has one required method, `next(&mut self)` returning `Option<Self::Item>`, plus an associated `type Item`  
✅ Implementing `next` unlocks all 75+ provided methods (`map`, `filter`, `take`, `sum`, `collect`) automatically  
✅ The struct's fields hold the iteration state; `next` mutates that state and hands out one value per call  
✅ Custom iterators can be infinite, laziness means values are only produced when a consumer asks

</div>

## ⚠️ Common Pitfalls

::: warning Watch Out!
- **Forgetting the terminating `None`.** If `next` always returns `Some`, any consuming call like `.count()`, `.sum()`, or a plain `for` loop runs forever. For deliberately infinite iterators (like Fibonacci above), always pair them with `take` or `take_while` before consuming.
- **Writing `fn next(&self)` instead of `fn next(&mut self)`.** The compiler rejects it as an incompatible trait signature, `next` must be able to advance the internal state, so it requires a mutable borrow.
- **Reusing an iterator after a `for` loop.** `for value in counter` moves `counter`, so touching it afterwards is a use-after-move error. Create a fresh one (as Example 1 does with `Counter::new()`), or loop over `&mut counter` to only borrow it.
:::

## ✅ Quick Challenge

Build a `Countdown` iterator: `Countdown::from(5)` should yield `5, 4, 3, 2, 1` and then stop. Implement `Iterator` so the `main` below prints a rocket-launch countdown.

```rust
// Starter code
struct Countdown {
    remaining: u32,
}

impl Countdown {
    fn from(start: u32) -> Countdown {
        Countdown { remaining: start }
    }
}

// TODO: implement Iterator for Countdown so it yields
// start, start-1, ..., 1 and then stops.

fn main() {
    let countdown = Countdown::from(5);
    // Uncomment once your Iterator impl is ready:
    // for n in countdown {
    //     println!("{}...", n);
    // }
    // println!("Liftoff!");
    let _ = countdown.remaining; // keeps the compiler quiet for now
}
```

<details>
<summary>💡 Hint</summary>

Return `None` when `remaining` is `0`. Otherwise, save the current value of `remaining`, decrement the field, and return `Some(saved_value)`. Be careful with the order, if you decrement first, you'll skip the starting number (and subtracting from `0` on a `u32` would panic in debug builds).

</details>

<details>
<summary>✅ Solution</summary>

```rust
struct Countdown {
    remaining: u32,
}

impl Countdown {
    fn from(start: u32) -> Countdown {
        Countdown { remaining: start }
    }
}

impl Iterator for Countdown {
    type Item = u32;

    fn next(&mut self) -> Option<u32> {
        if self.remaining == 0 {
            None
        } else {
            let current = self.remaining;
            self.remaining -= 1;
            Some(current)
        }
    }
}

fn main() {
    for n in Countdown::from(5) {
        println!("{}...", n);
    }
    println!("Liftoff!");

    // Bonus: adapters work automatically
    let evens: Vec<u32> = Countdown::from(10).filter(|n| n % 2 == 0).collect();
    println!("Even steps: {:?}", evens);
}
```

Output:

```
5...
4...
3...
2...
1...
Liftoff!
Even steps: [10, 8, 6, 4, 2]
```

</details>

## 📖 Additional Resources

- [The Rust Book - Ch. 13.2: Implementing the Iterator Trait](https://doc.rust-lang.org/book/ch13-02-iterators.html)
- [Rust by Example - Iterators](https://doc.rust-lang.org/rust-by-example/trait/iter.html)

---

<ProgressTracker />

<div class="lesson-nav">
  <a href="/week-07/day-47">← Day 47: Consuming Adapters</a>
  <a href="/week-07/day-49">Day 49: Closures Introduction →</a>
</div>
