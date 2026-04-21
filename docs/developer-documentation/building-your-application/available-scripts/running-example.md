---
sidebar_position: 2
---

# Running an Example

RADFish ships with several different [boilerplate examples](../../examples-and-templates#examples). These examples demonstrate core functions identified as critical for NOAA application development. You can use these examples as a reference point to build out your own implementation. Or, they may serve as inspiration for your own designs and best practices.

For instance, there's an example that demonstrates how to build a multi-step form that caches each step within IndexedDB. Caching the form allows it to be referenced without a network connection. In order to run this example, you can run this command:

`npx @nmfs-ocio/create-radfish-app my-app --example multistep-form`

This will clone the code from the `multistep-form` onto your machine. It also spawns a new web process on port `3000` or another port if that is already taken.

Feel free to use this code and modify it for your needs!
