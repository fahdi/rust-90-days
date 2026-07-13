---
title: "Day 23 - Slices"
description: "Learn about slices in Rust"
---

# Day 23: Slices

<div class="lesson-meta">
  <span class="time">⏱️ 10 minutes</span>
  <span class="difficulty">📊 Intermediate</span>
  <span class="week">📅 Week 4</span>
</div>

## 🎯 Today's Goal

Borrow a portion of an array, Vec, or String as a slice using range syntax, and write functions that accept `&[T]` or `&str` so they work with any contiguous sequence, without copying data.

## 📚 The Concept (3 min)

You've spent this week learning how references borrow a *whole* value. A **slice** is the natural next step: a reference to a *contiguous portion* of a collection. Think of a loaf of bread, you rarely need the whole loaf; you cut a few slices. The slices are still part of the loaf (no bread is duplicated), you just get a view into a section of it.

Under the hood, a slice is a "fat pointer": a pointer to the first element plus a length. That's it. Creating `&numbers[1..4]` doesn't copy elements 1 through 3, it records "start here, three elements long." This makes slices essentially free to create and pass around, no matter how big the underlying data is.

You create slices with range syntax:

- `&data[1..4]`, elements 1, 2, 3 (the end index is exclusive)
- `&data[..2]`, from the start up to (not including) index 2
- `&data[3..]`, from index 3 to the end
- `&data[..]`, the whole thing as a slice

Because a slice borrows the collection, all of the borrowing rules from Day 22 apply: while a slice exists, you can't mutate the collection it points into. That's a feature, it guarantees your slice never dangles or gets invalidated mid-use.

The type of an array or Vec slice is written `&[T]` (e.g., `&[i32]`), and the slice type for strings is `&str`. This is why idiomatic Rust functions take `&[T]` instead of `&Vec<T>`, and `&str` instead of `&String`: a `&Vec<T>` parameter only accepts Vecs, but `&[T]` accepts arrays, Vecs, and sub-slices alike, Rust converts automatically.

::: tip Key Insight
A slice is a borrowed *view* into existing data, a pointer plus a length, never a copy. Accepting `&[T]` or `&str` in your function signatures makes them work with arrays, Vecs, Strings, and sub-slices for free.
:::

## 💻 Hands-On Code (4 min)

### Example 1: Basic Usage

```rust
fn main() {
    let numbers = [10, 20, 30, 40, 50];

    // A slice borrows a range of the array: [start..end] (end is exclusive)
    let middle = &numbers[1..4];
    println!("middle = {:?}", middle);

    // Omit start or end to slice from the beginning or to the end
    let first_two = &numbers[..2];
    let last_three = &numbers[2..];
    let everything = &numbers[..];

    println!("first_two = {:?}", first_two);
    println!("last_three = {:?}", last_three);
    println!("everything = {:?}", everything);

    // Slices know their own length
    println!("middle has {} elements", middle.len());

    // String slices work the same way, over the bytes of a String
    let greeting = String::from("hello world");
    let hello = &greeting[0..5];
    let world = &greeting[6..];
    println!("{} + {}", hello, world);
}
```

### Example 2: Practical Application

```rust
// One function works for arrays, Vecs, and sub-slices: that's the power
fn average(readings: &[f64]) -> f64 {
    if readings.is_empty() {
        return 0.0;
    }
    let sum: f64 = readings.iter().sum();
    sum / readings.len() as f64
}

fn hottest(readings: &[f64]) -> Option<f64> {
    readings.iter().copied().fold(None, |max, r| match max {
        Some(m) if m >= r => Some(m),
        _ => Some(r),
    })
}

fn main() {
    // Data from an array
    let week1 = [21.5, 23.0, 19.8, 24.2, 22.1, 20.0, 25.3];

    // Data from a Vec
    let week2 = vec![18.4, 17.9, 21.2, 22.8];

    // Same functions handle both
    println!("Week 1 average: {:.1}°C", average(&week1));
    println!("Week 2 average: {:.1}°C", average(&week2));

    // Analyze just the weekend (last two days) with a sub-slice
    let weekend = &week1[5..];
    println!("Weekend average: {:.1}°C", average(weekend));

    if let Some(peak) = hottest(&week1) {
        println!("Hottest day of week 1: {:.1}°C", peak);
    }
}
```

::: details Output
Example 1:
```
middle = [20, 30, 40]
first_two = [10, 20]
last_three = [30, 40, 50]
everything = [10, 20, 30, 40, 50]
middle has 3 elements
hello + world
```

Example 2:
```
Week 1 average: 22.3°C
Week 2 average: 20.1°C
Weekend average: 22.6°C
Hottest day of week 1: 25.3°C
```
:::

## 🎓 Key Takeaways (1 min)

<div class="takeaways">

✅ A slice (`&[T]` or `&str`) is a pointer + length into existing data, creating one never copies elements  
✅ Range syntax `[start..end]` is end-exclusive; `[..n]`, `[n..]`, and `[..]` cover the common shorthand cases  
✅ Prefer `&[T]` over `&Vec<T>` and `&str` over `&String` in function parameters, callers can pass arrays, Vecs, Strings, and sub-slices  
✅ Slices are borrows, so Day 22's rules apply: the underlying collection can't be mutated while a slice into it is alive

</div>

## ⚠️ Common Pitfalls

::: warning Watch Out!
- **Out-of-bounds ranges panic at runtime, not compile time.** `&numbers[2..10]` on a 5-element array compiles fine but panics when it runs. Slice bounds are checked at runtime, use `.get(2..10)`, which returns an `Option`, when the range comes from user input.
- **Mutating a collection while a slice into it exists.** This does NOT compile: `let mut v = vec![1, 2, 3]; let s = &v[..]; v.push(4); println!("{:?}", s);`, `push` needs a mutable borrow, but `s` holds an immutable one. The compiler stops you because `push` could reallocate the Vec and leave `s` pointing at freed memory.
- **Slicing a String in the middle of a multi-byte character.** String ranges are *byte* indices, not character indices. `&"héllo"[0..2]` panics because `é` occupies bytes 1 and 2. Tomorrow's lesson digs into this properly.
:::

## ✅ Quick Challenge

Complete `sum_slice` so it adds up every element of a slice, then split the `scores` array into its first three and last three elements using range syntax and print each half's sum. The final line should print 489 for the full array.

```rust
// Starter code
fn sum_slice(numbers: &[i32]) -> i32 {
    // TODO: return the sum of all elements in the slice
    0
}

fn main() {
    let scores = [85, 92, 78, 64, 99, 71];

    // TODO: create a slice of the first three scores
    // TODO: create a slice of the last three scores
    // TODO: print the sum of each half using sum_slice

    println!("All scores sum: {}", sum_slice(&scores));
}
```

<details>
<summary>💡 Hint</summary>

`&scores[..3]` gives you the first three elements and `&scores[3..]` gives you the rest. Inside `sum_slice`, a plain `for n in numbers` loop works, iterating a `&[i32]` yields references you can add directly to a total. (Or try the one-liner: `numbers.iter().sum()`.)

</details>

<details>
<summary>✅ Solution</summary>

```rust
fn sum_slice(numbers: &[i32]) -> i32 {
    let mut total = 0;
    for n in numbers {
        total += n;
    }
    total
}

fn main() {
    let scores = [85, 92, 78, 64, 99, 71];

    let first_half = &scores[..3];
    let second_half = &scores[3..];

    println!("First half sum: {}", sum_slice(first_half));
    println!("Second half sum: {}", sum_slice(second_half));
    println!("All scores sum: {}", sum_slice(&scores));
}
```

Output:
```
First half sum: 255
Second half sum: 234
All scores sum: 489
```

</details>

## 📖 Additional Resources

- [The Rust Book - The Slice Type](https://doc.rust-lang.org/book/ch04-03-slices.html)
- [Rust by Example - Arrays and Slices](https://doc.rust-lang.org/rust-by-example/primitives/array.html)

---

<ProgressTracker />

<div class="lesson-nav">
  <a href="/week-04/day-22">← Day 22: Borrowing Rules</a>
  <a href="/week-04/day-24">Day 24: String Slices Deep Dive →</a>
</div>
