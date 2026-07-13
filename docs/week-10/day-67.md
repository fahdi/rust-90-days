---
title: "Day 67 - Static vs Dynamic Dispatch"
description: "Learn about static vs dynamic dispatch in Rust"
---

# Day 67: Static vs Dynamic Dispatch

<div class="lesson-meta">
  <span class="time">⏱️ 10 minutes</span>
  <span class="difficulty">📊 Advanced</span>
  <span class="week">📅 Week 10</span>
</div>

## 🎯 Today's Goal

Understand the difference between static dispatch (`impl Trait` / generics, resolved at compile time) and dynamic dispatch (`dyn Trait`, resolved at runtime), and know when to choose each.

## 📚 The Concept (3 min)

When you call `shape.area()` through a trait, *someone* has to decide which concrete function actually runs, `Circle::area` or `Square::area`. Rust gives you two ways to make that decision, and the choice affects performance, binary size, and flexibility.

**Static dispatch** happens with generics: `fn print_area&lt;T: Shape&gt;(s: &T)`. At compile time, Rust performs *monomorphization*, it generates a separate copy of the function for every concrete type you call it with. `print_area::&lt;Circle&gt;` and `print_area::&lt;Square&gt;` become two distinct functions in the binary, each calling `area` directly. Zero runtime cost, and the compiler can inline aggressively. The price: larger binaries (one copy per type) and slower compilation.

**Dynamic dispatch** happens with trait objects: `fn print_area(s: &dyn Shape)`. Exactly one copy of the function exists. The trait object carries a vtable pointer, and each method call follows that pointer to find the right function at runtime. The cost is one indirect call per method, usually a few nanoseconds, plus the compiler can't inline through it. The reward: one function serves every type, including types that don't exist yet when your library is compiled, and you can put mixed types in one collection.

Rule of thumb: default to static dispatch (generics, `impl Trait`) for hot paths and simple cases; use `dyn` when you need heterogeneous collections, plugin-style extensibility, or want to shrink binary size.

::: tip Key Insight
Static dispatch asks "which type?" at *compile time* and pays with binary size; dynamic dispatch asks at *runtime* and pays with a vtable lookup. Neither is "better", they trade compile-time knowledge for runtime flexibility.
:::

## 💻 Hands-On Code (4 min)

### Example 1: Basic Usage

```rust
trait Speak {
    fn speak(&self) -> String;
}

struct Dog;
struct Robot;

impl Speak for Dog {
    fn speak(&self) -> String {
        String::from("Woof")
    }
}

impl Speak for Robot {
    fn speak(&self) -> String {
        String::from("Beep")
    }
}

// Static dispatch: monomorphized per concrete type
fn speak_static<T: Speak>(s: &T) {
    println!("static:  {}", s.speak());
}

// Dynamic dispatch: one function, vtable lookup at runtime
fn speak_dynamic(s: &dyn Speak) {
    println!("dynamic: {}", s.speak());
}

fn main() {
    let dog = Dog;
    let robot = Robot;

    speak_static(&dog);
    speak_static(&robot);
    speak_dynamic(&dog);
    speak_dynamic(&robot);
}
```

### Example 2: Practical Application

```rust
trait Processor {
    fn process(&self, input: i32) -> i32;
}

struct Doubler;
struct Squarer;

impl Processor for Doubler {
    fn process(&self, input: i32) -> i32 {
        input * 2
    }
}

impl Processor for Squarer {
    fn process(&self, input: i32) -> i32 {
        input * input
    }
}

// Static: caller picks ONE processor type; great for hot loops
fn run_pipeline_static<P: Processor>(p: &P, data: &[i32]) -> Vec<i32> {
    data.iter().map(|&x| p.process(x)).collect()
}

// Dynamic: mixed processors in one list, chosen at runtime
fn run_pipeline_dynamic(stages: &[Box<dyn Processor>], mut value: i32) -> i32 {
    for stage in stages {
        value = stage.process(value);
    }
    value
}

fn main() {
    let data = [1, 2, 3];
    println!("{:?}", run_pipeline_static(&Doubler, &data));
    println!("{:?}", run_pipeline_static(&Squarer, &data));

    // A pipeline mixing different stages: needs dyn
    let stages: Vec<Box<dyn Processor>> = vec![Box::new(Doubler), Box::new(Squarer)];
    println!("{}", run_pipeline_dynamic(&stages, 3)); // (3*2)^2 = 36
}
```

::: details Output
```
static:  Woof
static:  Beep
dynamic: Woof
dynamic: Beep
```
Example 2:
```
[2, 4, 6]
[1, 4, 9]
36
```
:::

## 🎓 Key Takeaways (1 min)

<div class="takeaways">

✅ Static dispatch (generics/`impl Trait`) resolves calls at compile time via monomorphization, fastest, but one function copy per type  
✅ Dynamic dispatch (`&dyn Trait`, `Box&lt;dyn Trait&gt;`) resolves via a vtable at runtime, one copy, slight indirection cost  
✅ Only dynamic dispatch allows heterogeneous collections and runtime-chosen implementations  
✅ Default to static for performance-critical code; use `dyn` for flexibility and smaller binaries

</div>

## ⚠️ Common Pitfalls

::: warning Watch Out!
- Assuming `dyn` is "slow", the vtable lookup is nanoseconds; the real cost is usually lost inlining, and it rarely matters outside hot loops.
- Believing generics are free, heavy monomorphization can bloat binaries and compile times significantly in large codebases.
- Mixing the two syntaxes up: `fn f(x: impl Trait)` is *static* dispatch (sugar for a generic), while `fn f(x: &dyn Trait)` is *dynamic*.
:::

## ✅ Quick Challenge

Write a trait `Formatter` with `fmt_value(&self, v: i32) -> String`, two implementations (`Plain` returning `"3"`-style, `Fancy` returning `"<<3>>"`), then write BOTH a generic function `show_static` and a trait-object function `show_dynamic` that print a formatted value, and call each with both formatters.

```rust
// Starter code
trait Formatter {
    fn fmt_value(&self, v: i32) -> String;
}

struct Plain;
struct Fancy;

fn main() {
    // TODO: implement Formatter for Plain and Fancy,
    // then write show_static and show_dynamic and call them
    println!("challenge");
}
```

<details>
<summary>💡 Hint</summary>

The signatures you need are `fn show_static&lt;F: Formatter&gt;(f: &F, v: i32)` and `fn show_dynamic(f: &dyn Formatter, v: i32)`. Both bodies can be identical.

</details>

<details>
<summary>✅ Solution</summary>

```rust
trait Formatter {
    fn fmt_value(&self, v: i32) -> String;
}

struct Plain;
struct Fancy;

impl Formatter for Plain {
    fn fmt_value(&self, v: i32) -> String {
        format!("{}", v)
    }
}

impl Formatter for Fancy {
    fn fmt_value(&self, v: i32) -> String {
        format!("<<{}>>", v)
    }
}

fn show_static<F: Formatter>(f: &F, v: i32) {
    println!("{}", f.fmt_value(v));
}

fn show_dynamic(f: &dyn Formatter, v: i32) {
    println!("{}", f.fmt_value(v));
}

fn main() {
    show_static(&Plain, 3);   // 3
    show_static(&Fancy, 3);   // <<3>>
    show_dynamic(&Plain, 7);  // 7
    show_dynamic(&Fancy, 7);  // <<7>>
}
```

</details>

## 📖 Additional Resources

- [The Rust Book - Performance of Generics](https://doc.rust-lang.org/book/ch10-01-syntax.html#performance-of-code-using-generics)
- [Rust by Example - dyn](https://doc.rust-lang.org/rust-by-example/trait/dyn.html)

---

<ProgressTracker />

<div class="lesson-nav">
  <a href="/week-10/day-66">← Day 66: Trait Objects (dyn)</a>
  <a href="/week-10/day-68">Day 68: Associated Types →</a>
</div>
