---
title: "Day 76 - Box<T>"
description: "Learn about Box<T>, Rust's heap-allocating smart pointer"
---

# Day 76: Box&lt;T&gt;

<div class="lesson-meta">
  <span class="time">⏱️ 10 minutes</span>
  <span class="difficulty">📊 Advanced</span>
  <span class="week">📅 Week 11</span>
</div>

## 🎯 Today's Goal

Learn `Box<T>`, Rust's simplest smart pointer: single-owner heap allocation, and why it's the key to recursive types like linked lists.

## 📚 The Concept (3 min)

By default Rust puts local values on the stack. `Box<T>` moves a value to the **heap** and leaves a pointer on the stack. The box *owns* the heap value: when the box goes out of scope, the heap memory is freed automatically. No garbage collector, no manual `free`, plain ownership, just with the data living elsewhere.

Why would you want that? Three classic reasons:

1. **Recursive types.** Consider a cons list: `enum List { Cons(i32, List), Nil }`. The compiler must know a type's size at compile time, but this definition nests `List` inside itself infinitely, size unknowable, error `E0072`. Wrap the recursion in a box, `Cons(i32, Box<List>)`, and the field becomes a pointer of known, fixed size. Trees, linked lists, and ASTs all use this trick.
2. **Large data, cheap moves.** Moving a `Box<[u8; 1_000_000]>` copies 8 bytes (the pointer), not a megabyte.
3. **Trait objects.** `Box<dyn Trait>` stores *some* type implementing a trait when the concrete type varies at runtime, you met this with `Box<dyn Error>` in error handling.

Ergonomically, a box is nearly invisible: it implements `Deref`, so you call methods on a `Box<T>` exactly as on a `T`, and `*b` gets the inner value. What it does *not* give you is shared ownership, a box has exactly one owner, and assigning it moves it. When two owners genuinely need the same heap data, that's tomorrow's tool: `Rc<T>`.

::: tip Key Insight
`Box<T>` = heap allocation + single ownership. Its killer feature is having a known size (one pointer) regardless of what it points to, which is exactly what recursive type definitions need.
:::

## 💻 Hands-On Code (4 min)

### Example 1: Basic Usage

Boxing a value, using it transparently, automatic cleanup:

```rust
fn main() {
    let b = Box::new(41);
    // Deref makes the box transparent: arithmetic and methods just work.
    let answer = *b + 1;
    println!("boxed value: {}", b);
    println!("answer: {}", answer);

    // Single ownership: this is a move, not a copy of the heap data.
    let b2 = b;
    println!("moved into b2: {}", b2);
    // println!("{}", b); // error[E0382]: borrow of moved value: `b`
} // b2 dropped here; heap memory freed automatically
```

### Example 2: Practical Application

The recursive cons list that only compiles because of `Box`:

```rust
enum List {
    Cons(i32, Box<List>),
    Nil,
}

use List::{Cons, Nil};

fn sum(list: &List) -> i32 {
    match list {
        Cons(value, rest) => value + sum(rest),
        Nil => 0,
    }
}

fn main() {
    // 1 -> 2 -> 3
    let list = Cons(1, Box::new(Cons(2, Box::new(Cons(3, Box::new(Nil))))));
    println!("sum of list = {}", sum(&list));
}
```

Try removing the `Box` from the enum definition: `Cons(i32, List)` fails with "recursive type has infinite size" and the compiler itself suggests inserting a `Box`.

::: details Output
```
boxed value: 41
answer: 42
moved into b2: 41
```
Example 2:
```
sum of list = 6
```
:::

## 🎓 Key Takeaways (1 min)

<div class="takeaways">

✅ `Box::new(v)` moves `v` to the heap; the box owns it and frees it on drop, ordinary ownership rules apply  
✅ Boxes make recursive types possible: a `Box<List>` field is pointer-sized, breaking the infinite-size cycle  
✅ `Deref` makes boxes transparent, call methods directly, use `*b` to reach the value  
✅ `Box` is single-owner; assignment moves it, use `Rc<T>` (Day 77) when multiple owners are required

</div>

## ⚠️ Common Pitfalls

::: warning Watch Out!
- Boxing small values "for performance", a stack `i32` is faster than a heap one; box for recursion, trait objects, or genuinely large payloads
- Expecting `let b2 = b;` to copy the heap data, it moves the box; use `.clone()` if you truly need a second copy (it deep-clones the contents)
- Writing `Cons(i32, &List)` to fix the recursive-size error, references drag in lifetime parameters and someone still has to own each node; `Box` owns it cleanly
:::

## ✅ Quick Challenge

Extend the cons list with a `len` function that counts elements, then build a list of 4 numbers and print both its length and sum. Starter code (compiles):

```rust
enum List {
    Cons(i32, Box<List>),
    Nil,
}

use List::{Cons, Nil};

fn sum(list: &List) -> i32 {
    match list {
        Cons(value, rest) => value + sum(rest),
        Nil => 0,
    }
}

fn main() {
    let list = Cons(10, Box::new(Cons(20, Box::new(Nil))));
    println!("sum = {}", sum(&list));
    // TODO: len(&list), and a 4-element list
}
```

<details>
<summary>💡 Hint</summary>

`len` has the same shape as `sum`: match on the node, return `1 + len(rest)` for `Cons` and `0` for `Nil`.

</details>

<details>
<summary>✅ Solution</summary>

```rust
enum List {
    Cons(i32, Box<List>),
    Nil,
}

use List::{Cons, Nil};

fn sum(list: &List) -> i32 {
    match list {
        Cons(value, rest) => value + sum(rest),
        Nil => 0,
    }
}

fn len(list: &List) -> usize {
    match list {
        Cons(_, rest) => 1 + len(rest),
        Nil => 0,
    }
}

fn main() {
    let list = Cons(
        1,
        Box::new(Cons(2, Box::new(Cons(3, Box::new(Cons(4, Box::new(Nil))))))),
    );
    println!("len = {}", len(&list));
    println!("sum = {}", sum(&list));
}
```

Output:
```
len = 4
sum = 10
```

</details>

## 📖 Additional Resources

- [The Rust Book - Using Box&lt;T&gt; to Point to Data on the Heap](https://doc.rust-lang.org/book/ch15-01-box.html)
- [Rust by Example - Box, stack and heap](https://doc.rust-lang.org/rust-by-example/std/box.html)

---

<ProgressTracker />

<div class="lesson-nav">
  <a href="/week-11/day-75">← Day 75: Static Lifetime</a>
  <a href="/week-11/day-77">Day 77: Rc&lt;T&gt; & Reference Counting →</a>
</div>
