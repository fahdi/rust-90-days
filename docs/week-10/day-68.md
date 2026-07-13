---
title: "Day 68 - Associated Types"
description: "Learn about associated types in Rust"
---

# Day 68: Associated Types

<div class="lesson-meta">
  <span class="time">⏱️ 10 minutes</span>
  <span class="difficulty">📊 Advanced</span>
  <span class="week">📅 Week 10</span>
</div>

## 🎯 Today's Goal

Learn how associated types let a trait declare a placeholder type that each implementor fills in exactly once, and understand when to prefer them over generic type parameters.

## 📚 The Concept (3 min)

You've already met the most famous associated type without noticing: `Iterator` declares `type Item;`, and every implementor states what it yields, `Vec&lt;i32&gt;`'s iterator says `type Item = i32`. Why isn't `Iterator` just generic, like `trait Iterator&lt;T&gt;`?

The difference is about *how many* implementations a type may have. With a generic trait `Counter` could implement `Iterator&lt;i32&gt;` *and* `Iterator&lt;String&gt;` simultaneously, and then every call site would have to spell out which one it means, forever. With an associated type, each type implements the trait exactly once and declares its `Item` as part of that single implementation. Callers just write `T: Iterator` and refer to `T::Item`; the compiler already knows what it is.

So the rule of thumb: use a **generic parameter** when it makes sense to implement the trait multiple times for one type (like `From&lt;u8&gt;` and `From&lt;u16&gt;` both existing for one struct). Use an **associated type** when the relationship is one-to-one: "for this implementor, the output type is always X." It's an *output* of the implementation rather than an *input* chosen by the caller.

Associated types also make signatures dramatically cleaner. Compare `fn process&lt;I: Iterator&lt;Item = String&gt;&gt;(iter: I)` with the generic-trait alternative where the item type would infect every bound. Real-world traits lean on this heavily: `Iterator::Item`, `Add::Output`, `Deref::Target`, and `Future::Output` are all associated types.

::: tip Key Insight
Generic parameters are *inputs*, the caller picks them, and multiple impls can coexist. Associated types are *outputs*, the implementor picks them once, and the compiler infers them everywhere. One-to-one relationship? Use an associated type.
:::

## 💻 Hands-On Code (4 min)

### Example 1: Basic Usage

```rust
// A trait with an associated type: each container declares
// exactly one element type.
trait Container {
    type Item;

    fn first(&self) -> Option<&Self::Item>;
    fn size(&self) -> usize;
}

struct NumberStack {
    items: Vec<i32>,
}

impl Container for NumberStack {
    type Item = i32; // filled in exactly once

    fn first(&self) -> Option<&i32> {
        self.items.first()
    }

    fn size(&self) -> usize {
        self.items.len()
    }
}

fn main() {
    let stack = NumberStack { items: vec![10, 20, 30] };
    println!("size = {}", stack.size());
    println!("first = {:?}", stack.first());
}
```

### Example 2: Practical Application

```rust
// Implementing Iterator: the classic associated-type trait.
struct Countdown {
    current: u32,
}

impl Iterator for Countdown {
    type Item = u32;

    fn next(&mut self) -> Option<u32> {
        if self.current == 0 {
            None
        } else {
            self.current -= 1;
            Some(self.current + 1)
        }
    }
}

// A function bound on the associated type: only accepts
// iterators that yield u32.
fn total<I: Iterator<Item = u32>>(iter: I) -> u32 {
    iter.sum()
}

fn main() {
    let countdown = Countdown { current: 3 };
    for n in countdown {
        println!("{}...", n);
    }

    let again = Countdown { current: 4 };
    println!("sum = {}", total(again)); // 4+3+2+1
}
```

::: details Output
```
size = 3
first = Some(10)
```
Example 2:
```
3...
2...
1...
sum = 10
```
:::

## 🎓 Key Takeaways (1 min)

<div class="takeaways">

✅ `type Item;` inside a trait declares a placeholder that each implementor fills in exactly once  
✅ Associated types allow only ONE trait implementation per type; generic parameters allow many  
✅ Refer to them as `Self::Item` inside the trait and `T::Item` in bounds; constrain with `Iterator&lt;Item = u32&gt;`  
✅ The standard library uses them everywhere: `Iterator::Item`, `Add::Output`, `Deref::Target`

</div>

## ⚠️ Common Pitfalls

::: warning Watch Out!
- Reaching for `trait Foo&lt;T&gt;` when the type is really an output of the impl, you'll drown in type annotations at every call site.
- Writing `fn first(&self) -> Option&lt;&Item&gt;` instead of `Option&lt;&Self::Item&gt;`, associated types must be qualified with `Self::` inside the trait.
- Trying to implement `Iterator` twice for one struct with different `Item` types, the one-impl rule forbids it; use a wrapper type instead.
:::

## ✅ Quick Challenge

Define a trait `Transformer` with an associated type `Output` and a method `transform(&self, input: i32) -> Self::Output`. Implement it for `Stringifier` (output `String`) and `Doubler` (output `i32`), then use both in `main`.

```rust
// Starter code
trait Transformer {
    type Output;
    fn transform(&self, input: i32) -> Self::Output;
}

struct Stringifier;
struct Doubler;

fn main() {
    // TODO: implement Transformer for both structs and call transform
    println!("challenge");
}
```

<details>
<summary>💡 Hint</summary>

In each impl block write `type Output = String;` (or `= i32;`) first, then the method returns that type: `fn transform(&self, input: i32) -> String`.

</details>

<details>
<summary>✅ Solution</summary>

```rust
trait Transformer {
    type Output;
    fn transform(&self, input: i32) -> Self::Output;
}

struct Stringifier;
struct Doubler;

impl Transformer for Stringifier {
    type Output = String;
    fn transform(&self, input: i32) -> String {
        format!("value: {}", input)
    }
}

impl Transformer for Doubler {
    type Output = i32;
    fn transform(&self, input: i32) -> i32 {
        input * 2
    }
}

fn main() {
    let s = Stringifier.transform(21);
    let d = Doubler.transform(21);
    println!("{}", s); // value: 21
    println!("{}", d); // 42
}
```

</details>

## 📖 Additional Resources

- [The Rust Book - Associated Types](https://doc.rust-lang.org/book/ch20-02-advanced-traits.html#specifying-placeholder-types-in-trait-definitions-with-associated-types)
- [Rust by Example - Associated Types](https://doc.rust-lang.org/rust-by-example/generics/assoc_items/types.html)

---

<ProgressTracker />

<div class="lesson-nav">
  <a href="/week-10/day-67">← Day 67: Static vs Dynamic Dispatch</a>
  <a href="/week-10/day-69">Day 69: Project: Generic Data Store →</a>
</div>
