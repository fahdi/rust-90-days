---
title: "Day 20 - References & Borrowing"
description: "Learn about references & borrowing in Rust"
---

# Day 20: References & Borrowing

<div class="lesson-meta">
  <span class="time">⏱️ 10 minutes</span>
  <span class="difficulty">📊 Intermediate</span>
  <span class="week">📅 Week 3</span>
</div>

## 🎯 Today's Goal

Pass values to functions with `&` references so the caller keeps ownership, and read borrowed data safely without cloning or moving anything.

## 📚 The Concept (3 min)

This week you learned that passing a `String` to a function *moves* it, the caller can't use it afterward. That's correct but often inconvenient: most functions just want to *look at* data, not keep it. Rust's answer is **borrowing**.

A reference, written `&value`, lets a function access a value **without taking ownership**. Think of it like a library book: the library (the owner) lends you the book, you read it, and when you're done the book goes back on the shelf. You never owned it, so you're not allowed to burn it (drop it), and the library can lend it to the next reader. Creating a reference is called *borrowing* for exactly this reason.

In code, the pattern has two halves:

- The **caller** lends with `&`: `calculate_length(&greeting)`
- The **function** declares it accepts a loan: `fn calculate_length(s: &String)`

When the reference goes out of scope at the end of the function, nothing is dropped, the parameter never owned the data, so there's nothing for it to clean up. The original value in the caller stays fully usable.

References you create with plain `&` are **immutable** by default: you can read through them, but not modify. This is a feature, not a limitation, you can hand out many immutable references at once and Rust guarantees nobody mutates the data underneath you. (Tomorrow, Day 21, covers `&mut` references, which allow modification under stricter rules.)

Borrowing is also cheaper than the `clone()` escape hatch from Day 19: a reference is just a pointer, while a clone copies the entire heap allocation.

::: tip Key Insight
`&T` means "access without ownership." The function can read the value, but the caller keeps it, no move, no clone, no double-free, because a reference never triggers a drop.
:::

## 💻 Hands-On Code (4 min)

### Example 1: Basic Usage

```rust
fn calculate_length(s: &String) -> usize {
    s.len()
} // s goes out of scope here, but since it never owned the String,
  // nothing is dropped.

fn main() {
    let greeting = String::from("Hello, Rustaceans!");

    // &greeting creates a reference: we lend the value, not move it
    let length = calculate_length(&greeting);

    // greeting is still valid because ownership never left main
    println!("The string \"{}\" has {} characters.", greeting, length);
}
```

### Example 2: Practical Application

```rust
struct Order {
    id: u32,
    total: f64,
}

// Borrows the whole vector: read-only access is all we need
fn revenue(orders: &Vec<Order>) -> f64 {
    orders.iter().map(|o| o.total).sum()
}

fn biggest_order(orders: &Vec<Order>) -> &Order {
    let mut best = &orders[0];
    for order in orders {
        if order.total > best.total {
            best = order;
        }
    }
    best
}

fn main() {
    let orders = vec![
        Order { id: 101, total: 24.50 },
        Order { id: 102, total: 89.99 },
        Order { id: 103, total: 12.75 },
    ];

    // Both functions borrow `orders`; neither takes ownership,
    // so we can keep calling functions on the same data.
    let total = revenue(&orders);
    let top = biggest_order(&orders);

    println!("Processed {} orders", orders.len());
    println!("Total revenue: ${:.2}", total);
    println!("Biggest order: #{} at ${:.2}", top.id, top.total);
}
```

::: details Output
```
The string "Hello, Rustaceans!" has 18 characters.
```
```
Processed 3 orders
Total revenue: $127.24
Biggest order: #102 at $89.99
```
:::

## 🎓 Key Takeaways (1 min)

<div class="takeaways">

✅ `&value` creates a reference, the function borrows the data and the caller keeps ownership  
✅ When a reference goes out of scope, nothing is dropped, because the reference never owned the value  
✅ Plain `&` references are read-only: you can call methods like `.len()` but cannot modify the data  
✅ Prefer borrowing over `clone()` when a function only needs to read, a reference is a cheap pointer, a clone copies the heap

</div>

## ⚠️ Common Pitfalls

::: warning Watch Out!
- **Forgetting the `&` at the call site.** If the signature is `fn describe(city: &String)` but you call `describe(city)`, the types don't match: you passed an owned `String` where a `&String` was expected. This does NOT compile, `expected &String, found String`. Borrowing requires `&` in *both* places.
- **Trying to mutate through an immutable reference.** `fn add_suffix(s: &String) { s.push_str("!"); }` does NOT compile, `cannot borrow *s as mutable`. Plain `&` is a read-only loan; you need `&mut` (Day 21) to modify.
- **Cloning out of habit.** Reaching for `.clone()` every time the compiler complains about a move works, but it silently copies entire heap allocations. If the function only reads the data, a `&` reference gives you the same result for the cost of one pointer.
:::

## ✅ Quick Challenge

The program below compiles, but `describe` takes ownership of `city`, so the last `println!` is stuck commented out. Change `describe` to *borrow* instead, without using `clone()`, then uncomment the final line and confirm the original value is still usable.

```rust
// Fix this program so it compiles WITHOUT cloning:
// make `describe` borrow instead of taking ownership.
fn describe(city: String) -> String {
    format!("{} is a great place to visit!", city)
}

fn main() {
    let city = String::from("Lahore");
    let blurb = describe(city);
    println!("{}", blurb);
    // Uncomment this line once you've fixed `describe`:
    // println!("Original value still usable: {}", city);
}
```

<details>
<summary>💡 Hint</summary>

Two edits: change the parameter type from `String` to `&String`, and change the call from `describe(city)` to `describe(&city)`. The body of `describe` doesn't need to change at all, `format!` is happy to read through a reference.

</details>

<details>
<summary>✅ Solution</summary>

```rust
// `describe` now borrows the String instead of taking ownership
fn describe(city: &String) -> String {
    format!("{} is a great place to visit!", city)
}

fn main() {
    let city = String::from("Lahore");
    let blurb = describe(&city); // lend it with &
    println!("{}", blurb);
    println!("Original value still usable: {}", city);
}
```

Output:

```
Lahore is a great place to visit!
Original value still usable: Lahore
```

</details>

## 📖 Additional Resources

- [The Rust Book - References and Borrowing](https://doc.rust-lang.org/book/ch04-02-references-and-borrowing.html)
- [Rust by Example - Borrowing](https://doc.rust-lang.org/rust-by-example/scope/borrow.html)

---

<ProgressTracker />

<div class="lesson-nav">
  <a href="/week-03/day-19">← Day 19: Clone & Copy Traits</a>
  <a href="/week-03/day-21">Day 21: Mutable References →</a>
</div>
