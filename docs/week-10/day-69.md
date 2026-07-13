---
title: "Day 69 - Project: Generic Data Store"
description: "Learn about project: generic data store in Rust"
---

# Day 69: Project: Generic Data Store

<div class="lesson-meta">
  <span class="time">⏱️ 10 minutes</span>
  <span class="difficulty">📊 Advanced</span>
  <span class="week">📅 Week 10</span>
</div>

## 🎯 Today's Goal

Put this week's skills together, generics, trait bounds, default implementations, and trait objects, by building a small in-memory data store that works with any value type.

## 📚 The Concept (3 min)

Every real application needs somewhere to keep records: users, sessions, products, cache entries. Before reaching for a database, you often want a simple in-memory store, and you definitely don't want to write `UserStore`, `ProductStore`, and `SessionStore` as three copy-pasted structs. This is exactly the problem generics were made for.

Today's project is a `Store&lt;T&gt;` built on `Vec&lt;(u32, T)&gt;`: auto-incrementing ids, insert, lookup, delete, and count. The struct itself needs *no* bounds, `Store&lt;T&gt;` should hold anything. Bounds belong on the methods that need them: a `find` method needs `T: PartialEq` to compare values, and a debug-print method needs `T: std::fmt::Debug`. This is a key design lesson: **put trait bounds on methods, not on the struct**, so users who never call `find` can store non-comparable types.

We'll also layer in this week's other tools. A `Describable` trait with a *default implementation* gives any store a free `summary()` method built on a required `len_hint()`. And because our store is generic over one `T`, we'll show how `Store&lt;Box&lt;dyn ...&gt;&gt;` combines generics with trait objects when you genuinely need mixed record types in one store.

This mirrors how real libraries are designed: `HashMap&lt;K, V&gt;` requires `K: Hash + Eq` only where hashing actually happens, and iterator adapters demand bounds only on the operations that use them.

::: tip Key Insight
Constrain methods, not structs. `impl&lt;T&gt; Store&lt;T&gt;` for universal operations, plus a second `impl&lt;T: PartialEq&gt; Store&lt;T&gt;` block for search operations, Rust lets you split impls by bound so every capability is pay-as-you-go.
:::

## 💻 Hands-On Code (4 min)

### Example 1: Basic Usage

```rust
struct Store<T> {
    items: Vec<(u32, T)>,
    next_id: u32,
}

impl<T> Store<T> {
    fn new() -> Self {
        Store { items: Vec::new(), next_id: 1 }
    }

    fn insert(&mut self, value: T) -> u32 {
        let id = self.next_id;
        self.next_id += 1;
        self.items.push((id, value));
        id
    }

    fn get(&self, id: u32) -> Option<&T> {
        self.items.iter().find(|(i, _)| *i == id).map(|(_, v)| v)
    }

    fn len(&self) -> usize {
        self.items.len()
    }
}

fn main() {
    let mut names: Store<String> = Store::new();
    let id1 = names.insert(String::from("Alice"));
    let id2 = names.insert(String::from("Bob"));

    println!("count = {}", names.len());
    println!("id {} -> {:?}", id1, names.get(id1));
    println!("id {} -> {:?}", id2, names.get(id2));
    println!("id 99 -> {:?}", names.get(99));
}
```

### Example 2: Practical Application

```rust
#[derive(Debug, PartialEq)]
struct User {
    name: String,
    age: u32,
}

struct Store<T> {
    items: Vec<(u32, T)>,
    next_id: u32,
}

// Universal operations: no bounds needed
impl<T> Store<T> {
    fn new() -> Self {
        Store { items: Vec::new(), next_id: 1 }
    }

    fn insert(&mut self, value: T) -> u32 {
        let id = self.next_id;
        self.next_id += 1;
        self.items.push((id, value));
        id
    }

    fn remove(&mut self, id: u32) -> Option<T> {
        let pos = self.items.iter().position(|(i, _)| *i == id)?;
        Some(self.items.remove(pos).1)
    }
}

// Search needs comparison: bound lives here only
impl<T: PartialEq> Store<T> {
    fn find_id(&self, value: &T) -> Option<u32> {
        self.items.iter().find(|(_, v)| v == value).map(|(i, _)| *i)
    }
}

// Printing needs Debug: separate impl block again
impl<T: std::fmt::Debug> Store<T> {
    fn dump(&self) {
        for (id, v) in &self.items {
            println!("#{} => {:?}", id, v);
        }
    }
}

fn main() {
    let mut users = Store::new();
    users.insert(User { name: String::from("Alice"), age: 30 });
    let bob_id = users.insert(User { name: String::from("Bob"), age: 25 });

    users.dump();

    let target = User { name: String::from("Bob"), age: 25 };
    println!("Bob's id: {:?}", users.find_id(&target));

    let removed = users.remove(bob_id);
    println!("removed: {:?}", removed);
    users.dump();
}
```

::: details Output
```
count = 2
id 1 -> Some("Alice")
id 2 -> Some("Bob")
id 99 -> None
```
Example 2:
```
#1 => User { name: "Alice", age: 30 }
#2 => User { name: "Bob", age: 25 }
Bob's id: Some(2)
removed: Some(User { name: "Bob", age: 25 })
#1 => User { name: "Alice", age: 30 }
```
:::

## 🎓 Key Takeaways (1 min)

<div class="takeaways">

✅ One generic `Store&lt;T&gt;` replaces N copy-pasted concrete stores  
✅ Multiple `impl` blocks with different bounds make capabilities pay-as-you-go (`PartialEq` only for search, `Debug` only for dumping)  
✅ `Option` is the natural return type for lookups and removals that can miss  
✅ Deriving `Debug` and `PartialEq` on your record types unlocks the bounded methods for free

</div>

## ⚠️ Common Pitfalls

::: warning Watch Out!
- Putting `T: PartialEq + Debug` on the struct definition itself, that forces every user to satisfy bounds they may never need.
- Using `Vec` index positions as ids, after a `remove`, positions shift and old "ids" silently point at the wrong record. Store explicit ids.
- Forgetting `#[derive(PartialEq)]` on your record type, then being confused why `find_id` "doesn't exist", bounded methods vanish when bounds aren't met.
:::

## ✅ Quick Challenge

Extend the store with an `update(&mut self, id: u32, value: T) -> bool` method that replaces the value at `id` (returning `true` if found) and a `Store::filter_ids` method requiring `T: PartialEq` that returns all ids whose value equals a target.

```rust
// Starter code
struct Store<T> {
    items: Vec<(u32, T)>,
    next_id: u32,
}

impl<T> Store<T> {
    fn new() -> Self {
        Store { items: Vec::new(), next_id: 1 }
    }
    fn insert(&mut self, value: T) -> u32 {
        let id = self.next_id;
        self.next_id += 1;
        self.items.push((id, value));
        id
    }
    // TODO: add update()
}

// TODO: add impl<T: PartialEq> block with filter_ids()

fn main() {
    let mut s = Store::new();
    s.insert(10);
    s.insert(20);
    // exercise your new methods here
}
```

<details>
<summary>💡 Hint</summary>

For `update`, use `iter_mut()` to get mutable access to the tuples. For `filter_ids`, chain `iter().filter(...).map(...).collect()` into a `Vec&lt;u32&gt;`.

</details>

<details>
<summary>✅ Solution</summary>

```rust
struct Store<T> {
    items: Vec<(u32, T)>,
    next_id: u32,
}

impl<T> Store<T> {
    fn new() -> Self {
        Store { items: Vec::new(), next_id: 1 }
    }
    fn insert(&mut self, value: T) -> u32 {
        let id = self.next_id;
        self.next_id += 1;
        self.items.push((id, value));
        id
    }
    fn update(&mut self, id: u32, value: T) -> bool {
        for (i, v) in self.items.iter_mut() {
            if *i == id {
                *v = value;
                return true;
            }
        }
        false
    }
}

impl<T: PartialEq> Store<T> {
    fn filter_ids(&self, target: &T) -> Vec<u32> {
        self.items
            .iter()
            .filter(|(_, v)| v == target)
            .map(|(i, _)| *i)
            .collect()
    }
}

fn main() {
    let mut s = Store::new();
    let a = s.insert(10);
    s.insert(20);
    s.insert(20);

    println!("updated: {}", s.update(a, 20)); // true
    println!("ids of 20: {:?}", s.filter_ids(&20)); // [1, 2, 3]
    println!("updated missing: {}", s.update(99, 5)); // false
}
```

</details>

## 📖 Additional Resources

- [The Rust Book - Generic Data Types](https://doc.rust-lang.org/book/ch10-01-syntax.html)
- [Rust by Example - Generics](https://doc.rust-lang.org/rust-by-example/generics.html)

---

<ProgressTracker />

<div class="lesson-nav">
  <a href="/week-10/day-68">← Day 68: Associated Types</a>
  <a href="/week-10/day-70">Day 70: Operator Overloading →</a>
</div>
