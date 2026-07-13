---
title: "Day 66 - Trait Objects (dyn)"
description: "Learn about trait objects (dyn) in Rust"
---

# Day 66: Trait Objects (dyn)

<div class="lesson-meta">
  <span class="time">⏱️ 10 minutes</span>
  <span class="difficulty">📊 Advanced</span>
  <span class="week">📅 Week 10</span>
</div>

## 🎯 Today's Goal

Understand what `dyn Trait` means, why trait objects must live behind a pointer like `Box` or `&`, and how they let you store values of *different* concrete types in one collection.

## 📚 The Concept (3 min)

Generics have a limitation you'll hit fast: a `Vec<T>` holds values of exactly *one* type. Say you're building a drawing app with circles, squares, and text labels, all implementing a `Draw` trait. You want one list of everything on the canvas, in z-order, so you can loop and draw. `Vec<T: Draw>` can't do it, once `T` is chosen, the vector is circles-only or squares-only.

Trait objects solve this. `Box<dyn Draw>` means "a heap-allocated value of *some* type that implements `Draw`, we don't know which until runtime." A `Vec<Box<dyn Draw>>` can mix circles, squares, and labels freely.

Why the `Box` (or `&`, or `Rc`)? Different concrete types have different sizes, and Rust needs every vector slot to be the same size. A pointer is always the same size, so we store pointers. Behind the scenes, a trait object is a *fat pointer*: one pointer to the data, plus one pointer to a vtable, a table of function pointers for that concrete type's trait methods. Calling a method looks up the right function at runtime; this is dynamic dispatch (tomorrow's topic in depth).

One restriction: a trait must be *object-safe* (dyn-compatible) to be used as a trait object. Roughly, its methods can't return `Self` or take generic type parameters, the compiler wouldn't know what those mean without a concrete type.

::: tip Key Insight
`dyn Trait` trades a tiny runtime cost (a vtable lookup per call) for the ability to store heterogeneous types in one collection. Reach for it when you need "a list of different things that share a behavior."
:::

## 💻 Hands-On Code (4 min)

### Example 1: Basic Usage

```rust
trait Animal {
    fn speak(&self) -> String;
}

struct Dog;
struct Cat;

impl Animal for Dog {
    fn speak(&self) -> String {
        String::from("Woof!")
    }
}

impl Animal for Cat {
    fn speak(&self) -> String {
        String::from("Meow!")
    }
}

fn main() {
    // One vector, two different concrete types
    let animals: Vec<Box<dyn Animal>> = vec![Box::new(Dog), Box::new(Cat)];

    for animal in &animals {
        println!("{}", animal.speak());
    }
}
```

### Example 2: Practical Application

```rust
trait Draw {
    fn draw(&self) -> String;
}

struct Circle {
    radius: f64,
}

struct Square {
    side: f64,
}

struct Label {
    text: String,
}

impl Draw for Circle {
    fn draw(&self) -> String {
        format!("Circle(r={})", self.radius)
    }
}

impl Draw for Square {
    fn draw(&self) -> String {
        format!("Square(s={})", self.side)
    }
}

impl Draw for Label {
    fn draw(&self) -> String {
        format!("Label(\"{}\")", self.text)
    }
}

struct Canvas {
    shapes: Vec<Box<dyn Draw>>,
}

impl Canvas {
    fn new() -> Self {
        Canvas { shapes: Vec::new() }
    }

    fn add(&mut self, shape: Box<dyn Draw>) {
        self.shapes.push(shape);
    }

    fn render(&self) {
        for (i, shape) in self.shapes.iter().enumerate() {
            println!("Layer {}: {}", i, shape.draw());
        }
    }
}

fn main() {
    let mut canvas = Canvas::new();
    canvas.add(Box::new(Circle { radius: 2.5 }));
    canvas.add(Box::new(Square { side: 4.0 }));
    canvas.add(Box::new(Label { text: String::from("Hello") }));
    canvas.render();
}
```

::: details Output
```
Woof!
Meow!
```
Example 2:
```
Layer 0: Circle(r=2.5)
Layer 1: Square(s=4)
Layer 2: Label("Hello")
```
:::

## 🎓 Key Takeaways (1 min)

<div class="takeaways">

✅ `dyn Trait` is a type whose concrete implementation is decided at runtime, not compile time  
✅ Trait objects are unsized, so they must live behind a pointer: `Box<dyn T>`, `&dyn T`, or `Rc<dyn T>`  
✅ A `Vec<Box<dyn Trait>>` can hold many different concrete types, generics can't do that  
✅ Method calls go through a vtable (dynamic dispatch), and only object-safe traits can become trait objects

</div>

## ⚠️ Common Pitfalls

::: warning Watch Out!
- Writing `let x: dyn Animal = Dog;`, a bare `dyn Trait` has no known size; the compiler will demand a `Box`, `&`, or other pointer.
- Trying to make a trait object from a non-object-safe trait (e.g. one with methods returning `Self`, like `Clone`), you'll get "the trait cannot be made into an object."
- Forgetting you can't call inherent (non-trait) methods or downcast easily through `dyn Trait`, you only see the trait's interface.
:::

## ✅ Quick Challenge

Build a plugin system: a `Plugin` trait with `run(&self) -> String`, two plugin structs `Logger` and `Timer`, and a `run_all` function that takes `&[Box<dyn Plugin>]` and prints each result.

```rust
// Starter code
trait Plugin {
    fn run(&self) -> String;
}

struct Logger;
struct Timer;

fn main() {
    // TODO: implement Plugin for both structs,
    // build a Vec<Box<dyn Plugin>>, and run them all
    println!("plugins go here");
}
```

<details>
<summary>💡 Hint</summary>

The function signature is `fn run_all(plugins: &[Box<dyn Plugin>])`. Inside, iterate with `for p in plugins` and call `p.run()`.

</details>

<details>
<summary>✅ Solution</summary>

```rust
trait Plugin {
    fn run(&self) -> String;
}

struct Logger;
struct Timer;

impl Plugin for Logger {
    fn run(&self) -> String {
        String::from("Logger: wrote 3 entries")
    }
}

impl Plugin for Timer {
    fn run(&self) -> String {
        String::from("Timer: 42ms elapsed")
    }
}

fn run_all(plugins: &[Box<dyn Plugin>]) {
    for p in plugins {
        println!("{}", p.run());
    }
}

fn main() {
    let plugins: Vec<Box<dyn Plugin>> = vec![Box::new(Logger), Box::new(Timer)];
    run_all(&plugins);
}
```

</details>

## 📖 Additional Resources

- [The Rust Book - Trait Objects](https://doc.rust-lang.org/book/ch18-02-trait-objects.html)
- [Rust by Example - dyn](https://doc.rust-lang.org/rust-by-example/trait/dyn.html)

---

<ProgressTracker />

<div class="lesson-nav">
  <a href="/week-10/day-65">← Day 65: Default Implementations</a>
  <a href="/week-10/day-67">Day 67: Static vs Dynamic Dispatch →</a>
</div>
