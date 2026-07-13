---
title: "Day 89 - Unsafe Rust Intro"
description: "Learn about unsafe rust intro in Rust"
---

# Day 89: Unsafe Rust Intro

<div class="lesson-meta">
  <span class="time">⏱️ 10 minutes</span>
  <span class="difficulty">📊 Expert</span>
  <span class="week">📅 Week 13</span>
</div>

## 🎯 Today's Goal

Learn what the `unsafe` keyword actually unlocks (and what it does not), work with raw pointers, and see the golden pattern: a small unsafe core wrapped in a safe, sound public API.

## 📚 The Concept (3 min)

The borrow checker is conservative: it rejects every program it cannot *prove* safe, which necessarily includes some programs that are in fact fine. Talking to C libraries, implementing `Vec` itself, memory-mapped hardware registers, all correct, all unprovable to the compiler. `unsafe` is the escape hatch: *"compiler, I have checked this invariant myself."*

An `unsafe` block grants exactly five extra powers:

1. Dereference raw pointers (`*const T`, `*mut T`)
2. Call `unsafe` functions (including all FFI/`extern` functions)
3. Implement `unsafe` traits (like `Send`/`Sync`)
4. Access or modify a mutable `static`
5. Access fields of a `union`

That is the whole list. `unsafe` does **not** disable the borrow checker for references, does not turn off type checking, and is not "anything goes" mode. References still must obey all rules; only raw pointers opt out, they may be null, dangling, or aliased, and none of that is checked until you dereference one.

The cultural contract matters as much as the mechanics. Idiomatic Rust keeps unsafe blocks tiny, comments each with a `// Safety:` justification, and wraps them in a safe API whose type signature makes misuse impossible. The standard library is exactly this: `Vec`, `String`, `Mutex` are full of unsafe internals, yet calling them is 100% safe because the invariants are maintained at the boundary. When something crashes, you audit the few `unsafe` blocks, not the whole program. That auditability is the point.

::: tip Key Insight
`unsafe` shifts responsibility, not semantics: the same undefined-behavior rules apply, but *you* must uphold them instead of the compiler. A well-designed unsafe block is one whose safety argument fits in a one-line comment above it.
:::

## 💻 Hands-On Code (4 min)

### Example 1: Basic Usage

Creating raw pointers is safe; dereferencing them requires `unsafe`.

```rust
fn main() {
    let mut value: i32 = 10;

    // Creating raw pointers: completely safe, no unsafe needed.
    let ptr_const: *const i32 = &value;
    let ptr_mut: *mut i32 = &mut value;

    // Dereferencing: this is the operation the compiler cannot verify.
    unsafe {
        println!("read through *const: {}", *ptr_const);
        *ptr_mut += 5;
        println!("after write through *mut: {}", *ptr_mut);
    }

    println!("value is now: {}", value);

    // Raw pointers can be inspected without unsafe:
    println!("pointer is null? {}", ptr_const.is_null());
}
```

### Example 2: Practical Application

The golden pattern, safe wrapper around an unsafe core. This is a simplified version of the real `slice::split_at_mut`, which the borrow checker cannot verify because it hands out two `&mut` into one slice.

```rust
fn split_at_mut(slice: &mut [i32], mid: usize) -> (&mut [i32], &mut [i32]) {
    let len = slice.len();
    assert!(mid <= len, "mid out of bounds"); // uphold the invariant BEFORE unsafe
    let ptr = slice.as_mut_ptr();

    // Safety: the two ranges [0, mid) and [mid, len) do not overlap,
    // and both lie inside the original allocation (checked by the assert).
    unsafe {
        (
            std::slice::from_raw_parts_mut(ptr, mid),
            std::slice::from_raw_parts_mut(ptr.add(mid), len - mid),
        )
    }
}

fn main() {
    let mut data = [1, 2, 3, 4, 5, 6];
    let (left, right) = split_at_mut(&mut data, 2);

    // Two simultaneous mutable views -- impossible with safe references alone.
    left[0] = 100;
    right[0] = 300;

    println!("left  = {:?}", left);
    println!("right = {:?}", right);
    println!("data  = {:?}", data);
}
```

::: details Output
Example 1:
```
read through *const: 10
after write through *mut: 15
value is now: 15
pointer is null? false
```

Example 2:
```
left  = [100, 2]
right = [300, 4, 5, 6]
data  = [100, 2, 300, 4, 5, 6]
```
:::

## 🎓 Key Takeaways (1 min)

<div class="takeaways">

✅ `unsafe` enables exactly five operations, raw pointer dereference, unsafe fn calls, unsafe trait impls, mutable statics, union fields, and nothing else  
✅ Creating and comparing raw pointers is safe; only dereferencing them is unsafe, because they carry no lifetime or aliasing guarantees  
✅ The borrow checker still runs inside `unsafe` blocks; references remain fully checked, `unsafe` is not an off switch  
✅ Sound design = validate invariants first (assert!), keep the unsafe block minimal, document with a `// Safety:` comment, expose only a safe API

</div>

## ⚠️ Common Pitfalls

::: warning Watch Out!
- Returning or storing a raw pointer past its referent's lifetime, the classic dangling pointer; the compiler will not stop you, and the crash happens far from the bug
- Creating two `&mut` to the same data via raw pointers and using them simultaneously, instant undefined behavior even if it "seems to work" (Miri catches this; the optimizer will eventually punish it)
- Believing `unsafe` code that compiles is correct: `unsafe` means *unchecked*, so run tests under `cargo miri` and keep blocks small enough to reason about manually
:::

## ✅ Quick Challenge

Write a safe function `first_and_last(slice: &[i32]) -> Option&lt;(i32, i32)&gt;` that uses raw pointer reads (`ptr.read()` or `*ptr`) inside an `unsafe` block to fetch the first and last elements, returning `None` for an empty slice so the unsafe code is never reached with invalid bounds.

```rust
// Starter code
fn first_and_last(slice: &[i32]) -> Option<(i32, i32)> {
    // 1. handle the empty case safely
    // 2. get slice.as_ptr(), read index 0 and index len-1 in unsafe
    let _ = slice;
    None
}

fn main() {
    println!("{:?}", first_and_last(&[10, 20, 30]));
    println!("{:?}", first_and_last(&[]));
}
```

<details>
<summary>💡 Hint</summary>

Check `slice.is_empty()` first, that check is exactly what makes the later `ptr.add(len - 1)` in-bounds. `ptr.add(n)` offsets by `n` elements, and `*ptr` inside `unsafe` reads the value (i32 is `Copy`).

</details>

<details>
<summary>✅ Solution</summary>

```rust
fn first_and_last(slice: &[i32]) -> Option<(i32, i32)> {
    if slice.is_empty() {
        return None;
    }
    let ptr = slice.as_ptr();
    // Safety: slice is non-empty, so indices 0 and len-1 are in bounds.
    unsafe { Some((*ptr, *ptr.add(slice.len() - 1))) }
}

fn main() {
    println!("{:?}", first_and_last(&[10, 20, 30])); // Some((10, 30))
    println!("{:?}", first_and_last(&[]));           // None
    println!("{:?}", first_and_last(&[7]));          // Some((7, 7))
}
```

</details>

## 📖 Additional Resources

- [The Rust Book - Relevant Chapter](https://doc.rust-lang.org/book/)
- [Rust by Example](https://doc.rust-lang.org/rust-by-example/)

---

<ProgressTracker />

<div class="lesson-nav">
  <a href="/week-13/day-88">← Day 88: Procedural Macros Overview</a>
  <a href="/week-13/day-90">Day 90: Final Project: Micro Web Server →</a>
</div>
