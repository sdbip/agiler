# Features

Prefer Minimal Marketable Features (MMFs). An MMF is a value brought to the business. It should be *minimal* so that it can be finished quickly. It should be *marketable* so that it can be motivated to have value, and prioritised correctly.

Of course you don't have to make features minimal as you collect them. You will be given the possibility of splitting them later.

When you work, you should focus on one feature until it is completed before starting another feature.

  <div class="flex">
    <input
        type="text"
        class="item-title"
        placeholder="What does the business need?">
    <button class="add-button" onclick="emitUIEvent('add-button-clicked', {element: this, event, itemId: '{{id}}'})">+</button>
  </div>

  <div class="item feature no-select disclosed">
    <div class="chevron">+</div>
    <div class="title">Users</div>
    <div class="description">Users can have tasks assigned</div>
    <div class="collapsible">
      <div class="flex">
        <input type="text" class="item-title"
          placeholder="What are the MMFs?">
        <button class="add-button">+</button>
      </div>
      <div class="item feature no-select">
        <div class="title">Add Users</div>
      </div>
      <div class="item feature no-select">
        <div class="title">Delete Users</div>
      </div>
      <div class="item feature no-select">
        <div class="title">Assign tasks to Users</div>
      </div>
    </div>
  </div>
  <div class="item feature no-select">
    <div class="chevron">+</div>
    <div class="title">Redesign UI</div>
    <div class="description">It's too hard to reticulate the spleens</div>
  </div>

<hr>

<h1>Tasks</h1>

  <div class="flex">
    <input
        type="text"
        class="item-title"
        placeholder="What needs to be done?">
    <button class="add-button" onclick="emitUIEvent('add-button-clicked', {element: this, event, itemId: '{{id}}'})">+</button>
  </div>

  <div class="item item-Task no-select">
    <label></label>
    <span>Reticulate spleens</span>
  </div>

<hr>

## What is value?

Value can be direct: “Generate more sales.” It can be indirect: “Enable our users to perform these tasks that will increse sales.” Or it can be a learning experience: “Will this improve our sales?”

Value doesn't have to be related to income and sales. It depends on what your team's purpose is. Here are some examples:

- Save children from poverty
- Treat patients
- Avoid war
- Acquire the Babe Ruth baseball card
