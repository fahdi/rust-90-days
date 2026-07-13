---
title: "Day 16 - Stack vs Heap"
description: "Learn about stack vs heap in Rust"
---

# Day 16: Stack vs Heap

<div class="lesson-meta">
  <span class="time">⏱️ 10 minutes</span>
  <span class="difficulty">📊 Intermediate</span>
  <span class="week">📅 Week 3</span>
</div>

## 🎯 Today's Goal

Understand where Rust stores your data, stack or heap, and predict from a type alone whether assigning it makes a cheap copy or moves ownership.

## 📚 The Concept (3 min)

Yesterday you met ownership. Today you'll see the *why* behind it: memory layout.

Think of the **stack** as a stack of cafeteria trays. You can only add a tray on top or take the top one off, fast, orderly, no searching. When a function runs, its local variables go on top; when it returns, they all come off at once. The catch: every tray must be a **fixed, known size at compile time**. An `i32`, a `bool`, a `(f64, f64)` tuple, a `[u8; 16]` array, all fixed size, all stack-friendly.

The **heap** is more like a restaurant with a host. You say "I need a table for six," the allocator finds free space, and hands you back an *address*. That indirection makes the heap flexible, a `String` can grow from 6 bytes to 6 megabytes at runtime, but slower: allocation takes bookkeeping, and reaching the data means following a pointer.

Rust types combine both. A `String` is really three stack values, a pointer, a length, and a capacity (24 bytes total on a 64-bit machine), while the actual text lives on the heap. The same pattern applies to `Vec`, `Box`, and friends.

This split explains the move rules from Day 15. Copying stack data is trivial, so simple types implement `Copy` and assignment duplicates them. Copying heap data would be expensive and would create two owners of one allocation, so Rust *moves* ownership instead. For example, this does **NOT** compile:

```rust
let s1 = String::from("hi");
let s2 = s1;
println!("{}", s1); // error[E0382]: borrow of moved value: `s1`
```

Only the 24-byte stack part is copied to `s2`; the heap text is not, so `s1` is invalidated to prevent a double free.

::: tip Key Insight
Stack = fixed size, fast, freed automatically when scope ends. Heap = flexible size, reached through a pointer, owned by exactly one value. Whether a type is `Copy` or *moves* comes down to whether it owns heap data.
:::

## 💻 Hands-On Code (4 min)

### Example 1: Basic Usage

```rust
fn main() {
    // Stack: fixed size, known at compile time
    let age: u32 = 30;
    let point: (f64, f64) = (3.0, 4.0);

    // Heap: size can change at runtime
    let mut city = String::from("Lahore");
    city.push_str(", Pakistan");

    println!("age (stack): {}", age);
    println!("point (stack): {:?}", point);
    println!("city (heap-backed): {}", city);
    println!("city length grew to {} bytes", city.len());
}
```

### Example 2: Practical Application

```rust
use std::mem;

#[derive(Debug)]
struct SensorReading {
    values: [f64; 4],
    label: String,
}

fn main() {
    // Array data sits inline in the struct; the String's text is on the heap.
    let reading = SensorReading {
        values: [20.5, 21.0, 21.4, 22.1],
        label: String::from("greenhouse-a"),
    };

    // Box moves the whole struct onto the heap; the stack keeps only a pointer.
    let boxed: Box<SensorReading> = Box::new(reading);

    println!("boxed reading: {:?}", boxed);
    println!("size of SensorReading: {} bytes", mem::size_of::<SensorReading>());
    println!("size of Box<SensorReading>: {} bytes", mem::size_of::<Box<SensorReading>>());

    // Copy vs move in action
    let x = 5;   // i32 lives on the stack and is Copy
    let y = x;   // bit-for-bit copy; x is still usable
    println!("x = {}, y = {}", x, y);

    let s1 = String::from("hello");
    let s2 = s1; // heap data is NOT copied; ownership moves to s2
    println!("s2 = {}", s2);
}
```

::: details Output
```
age (stack): 30
point (stack): (3.0, 4.0)
city (heap-backed): Lahore, Pakistan
city length grew to 16 bytes
```

```
boxed reading: SensorReading { values: [20.5, 21.0, 21.4, 22.1], label: "greenhouse-a" }
size of SensorReading: 56 bytes
size of Box<SensorReading>: 8 bytes
x = 5, y = 5
s2 = hello
```
:::

Notice the sizes in Example 2: the struct is 56 bytes (a 32-byte array plus a 24-byte `String` header), but a `Box` of it is just 8 bytes, a single pointer. That's the heap indirection made visible.

## 🎓 Key Takeaways (1 min)

<div class="takeaways">

✅ The stack holds fixed-size data and is cleaned up automatically when a scope ends, no allocator involved  
✅ The heap holds data whose size can change at runtime; you reach it through a pointer stored on the stack  
✅ A `String` or `Vec` is a small stack header (pointer + length + capacity) pointing at heap contents  
✅ `Copy` types (integers, floats, bools, char, fixed arrays/tuples of `Copy` types) duplicate on assignment; heap-owning types move

</div>

## ⚠️ Common Pitfalls

::: warning Watch Out!
- **Assuming "the variable is on the stack, so there's no heap involved."** A local `String` variable *is* on the stack, but only its 24-byte header. The text lives on the heap, which is exactly why assigning it moves rather than copies.
- **Reaching for `Box::new` to "make things faster."** The heap is the *slower* option: `Box` adds an allocation and a pointer hop. Use it when you need it (recursive types, trait objects, very large values you want to move cheaply), not by default.
- **Expecting `&str` and `String` to behave the same in moves.** A `&str` literal like `"hello"` is a borrowed reference (the bytes are baked into the binary), so it's `Copy`. A `String` owns heap memory, so it moves. Mixing them up is the classic source of surprise E0382 errors.
:::

## ✅ Quick Challenge

Complete the TODOs: copy the stack value, then call `shout` on the `String`, and make `name` still printable *after* the call by changing `shout` to borrow instead of taking ownership.

```rust
fn main() {
    let count = 42;
    let name = String::from("Rust");

    // TODO 1: make a copy of `count` and print both values
    // TODO 2: pass `name` to `shout` and print the result
    // TODO 3: print `name` again after the call: make it work
    //         by having `shout` borrow instead of take ownership
    let _ = (count, name);
}

fn shout(text: String) -> String {
    text.to_uppercase()
}
```

<details>
<summary>💡 Hint</summary>

`count` is an `i32` (stack, `Copy`), so `let count_copy = count;` just works. For `name`, change the parameter type from `String` to `&str` and call it as `shout(&name)`, a `&String` coerces to `&str` automatically, and `name` keeps ownership of its heap data.

</details>

<details>
<summary>✅ Solution</summary>

```rust
fn main() {
    let count = 42;
    let name = String::from("Rust");

    let count_copy = count; // i32 is Copy: a cheap stack copy
    println!("count = {}, copy = {}", count, count_copy);

    let loud = shout(&name); // borrow: the heap data stays owned by `name`
    println!("loud = {}", loud);
    println!("name is still usable: {}", name);
}

fn shout(text: &str) -> String {
    text.to_uppercase()
}
```

Output:

```
count = 42, copy = 42
loud = RUST
name is still usable: Rust
```

</details>

## 📖 Additional Resources

- [The Rust Book - What is Ownership? (stack & heap section)](https://doc.rust-lang.org/book/ch04-01-what-is-ownership.html)
- [Rust by Example - Box, stack and heap](https://doc.rust-lang.org/rust-by-example/std/box.html)

---

<ProgressTracker />

<div class="lesson-nav">
  <a href="/week-03/day-15">← Day 15: What is Ownership?</a>
  <a href="/week-03/day-17">Day 17: Ownership Rules →</a>
</div>
