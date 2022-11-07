# Features

A *Feature* is an increment that adds <a onmouseover="showValue(this)" onmouseout="hideValue()">business value</a> to the product. Prefer *Minimal Marketable Features* (MMFs). An MMF is the smallest thing that can be shipped to production and add meaningful value.

It should be *minimal* so that it can be finished and deployed quickly. It should be *marketable* so that it can be prioritised over less important features. You don't have to make features minimal from the start, however. You shouldn't even try! Instead, your first focus should be on need, not feasibility. You will be given the opportunity to split them later.

If your top prioritised feature is very small you can finish and deploy it before starting another. That allows you to deploy more frequently and with less risk.

  <div class="flex">
    <input
        type="text"
        class="item-title"
        placeholder="What does the business need?">
    <div class="add-button no-select">+</div>
  </div>

  <div class="item epic feature no-select disclosed">
    <div class="chevron">+</div>
    <div class="title">Users</div>
    <div class="description">Users can have tasks assigned</div>
    <div class="collapsible">
      <div class="flex">
        <input type="text" class="item-title"
          placeholder="What's the next smallest valuable increment for this feature?">
        <div class="add-button no-select">+</div>
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
    <div class="description">It's too hard to reticulate the splines</div>
  </div>

<hr>

<h1>Tasks</h1>

  <div class="flex">
    <input
        type="text"
        class="item-title"
        placeholder="What needs to be done?">
    <div class="add-button no-select" onclick="emitUIEvent('add-button-clicked', {element: this, event, itemId: '{{id}}'})">+</div>
  </div>

  <div class="item item-Task no-select">
    <label></label>
    <span>Reticulate splines</span>
  </div>
