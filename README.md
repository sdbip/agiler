# Agiler (name pending)

Agiler is a planning tool for agile development

## Implemented Features

- Tasks (simple todos, engineering tasks, decisions to be made, seeking external help...)

See [the Domain](#the-domain) for more information

## Building the Application

Use the yarn package manager

```shell
node install -g yarn
yarn install
```

Run npm scripts using `yarn «script»`:

```shell
yarn start # start backend & frontend servers
yarn lint  # check code standards
yarn test  # run Mocha tests
yarn build # lint and test
```

Build using `./jake`

```shell
./jake    # runs the full build
./jake -T # to list all tasks
```

This command lints and tests the JavaScript code:

```shell
cd client
./build [scan]
```

The optional `scan` argument starts a watch that will lint and test whenever a
JavaScript file is saved.

## CQRS/ES

Agiler employs CQRS, meaning that the backend is split in two separate
pipelines segregating Commands from Queries. The write model (command side)
defines the domain model and enforces business rules. The read model (query
side) knows nothing of business rules. It simply reads the current state as
data.

The write model employs event sourcing (ES) which means that each item in the
system is stored as a list of state changes instead of just its current state.
This is effective for enforcing rules, but not for reading the current state.
The read model has a *projection* of the same data. It only tracks the current
state, so it cannot tell what state an item has been in. Instead it will be
very efficient at reading and searching the current state of all items.

Since the read and write models are segregated, it is not guaranteed that they
will always agree on the exact same state. The write model holds the “truth,”
and the read model is a slightly delayed *projection* of that truth. We call
this *Eventual Consistency*. Any change applied to the write model will
eventually find its way to the read model. Normally that should take no more
than a few seconds (depending on solution). In our case there is no significant
delay at all.

To maintain the projection we use a one-way sync system. Currently that is an
`ImmediateSyncSystem` that is called by the write model. In a “normal” CQRS
setup, the sync system should poll the write model database.

## Conventions

Tests are named with two extensions:

- __\*.spec.ts__ for “backend” tests (code that runs on NodeJS)
- __\*.test.ts__ for “browser” tests (code that runs on client browsers)

## the Domain

YAGNI teaches that you should never produce anything that isn't motivated by a
higher goal (because You Are not Going to Need It, and everything will add
complexity and slow down the development effort). In that spirit, Agiler starts
with minimum marketable *features*. Features lead to *stories* and stories lead
to *tasks*.

### Tracability

We build software to perform some form of “business.” That “business” is
whatever our company/organisation exists to do, and more specifically why we
build our product. Business does not necessarily refer to banking or trading,
but can just as easily relate to health-care or benefit programs. Business
value can be healthy patients or reduced poverty as much as it can be
boatloads of money.

Everything we produce, every piece of code that we write, every structure we
design, and every piece of technology we use, should be traceable to adding
value to the business, learning more about the value, or enforcing the rules
of the business and its domain.

Traceability in Agiler works like this: At the top is the purpose and general
values of our product. Each feature serves to improve one of said values. A
large feature may be split in minor parts that bring noticable improvements.
To plan the implementation of a feature, we split it in stories. Each story
noticably advances the product to finishing the feature. We can show progress
after each story.

To finish a story, we need to make actual changes to our code, technology and
structure. We may also need to ask questions, establish communication lines
and many other things. To remind us of these TODOs we use tasks. A story
should be done when all its tasks are completed, and as long as any one task
is not done, neither is the story.

Our code starts with user and business goals. We can use the term “use case”
to refer to these interactions (even if the “user” may be another system).
The user will always have a goal when interacting with our product. At the
same time, the business (or societal law) may have opposing goals. Our first
tests describe these goals and the rules for when and how they may be achieved.
Only when we have established those rules do we plug in the rest of the
implementation needed to deliver the new functionality to real-world users. As
touted by YAGNI, we do not build technology, structure or even functionality
that is not needed to complete the current story.

### Features

Each feature should describe some business value that the product doesn't
currently provide. Delivering on this value will probably take some time so the
work will need to be divided up in smaller parts. When all the parts are done,
all the technical layers are functional and deployed, the feature is delivered.

If a feature is deemed to be non-minimal, it should be split up into smaller
parts that each deliver actual business value. These smaller parts are also
features. When a feature is ready to be implemented, we add *stories*.

### Stories

A story is a deliverable unit of work that will show progress to users and
stakeholders. Finishing a story is usually not a single step, but requires
finishing multiple *tasks*.

When the story is done, the production system (or at least some testing
environment) needs to have changed so that users can observe the progress.

A story is a vertical slice of the application. It needs to be functional
all the way out to the customer. It does not need to have the final structure
and design of the code, but it must have enough of the technology in place to
be operational by the users.

### Tasks

Tasks are things we need to do. In most cases they are engineering tasks
performed in the context of a story, but they could be added as simply
something that needs doing for whatever reason. Whatever the case, a task
is something you can just do now without further ado.

Tasks also don't have to be programming effort. Booking a meeting with another
team to get help with an integration is a valid task. So is emailing a user for
more information about a bug. Etc.

### Status Changes

You shouldn't mark a feature “in progress.” Instead it should be implicitly in
progress when any story is started. Similarly, the story should be considered
in progress when the first task is started.

Finishing the last task of a story should automatically finish the story. And
finishing the last story should finish the feature.

There is, however, a contradicting thought: in Scrum we need features and
stories to be “ready” before we can plan them in a sprint. There might be need
for such a moniker in our case too. And it might be possible that we can start
a task before the parent feature is ready. This is a thing to think about.

## Assignees and Late Binding

Many teams employ *early binding*. This means that they assign a developer to
a task before they are ready to start it, or even to a story to make them
responsible for its progress. This is not recommended for an agile team. In an
agile team, the entire team is responsible for finishing the stories with high
quality. Putting this responsibility on a single developer risks turning the
team into a group of individuals, which will impede progress in the long run.

Early binding makes it hard for idle hands to find the next task to work on as
all tasks will be taken. *Late binding* means that any task that isn't yet
started can be claimed immediately.

Too many in-progress items at any time is ineffective. It is perhaps highly
efficient, but efficiency is nothing compared to effectivity. A team that gets
things done is effective. A team that performs a lot of work is efficient. Work
is not valuable, however. Finishing is. You should optimise for effectivity
over efficiency.

Ideally the team should have only one task at a time and finish it together.
That is probably the most effective way of working. If it is not possible (or
desirable) to work together, each individual should have only one open task
at any time. Finish the task before claiming the next. That way those who have
easier tasks, or are quick to finish, can always pick up a new one and stay
productive. If all tasks are claimed they will have nothing to do.

It is also important to finish tasks. Starting tasks is not valuable.
Finishing them is. With too many tasks in progress switching between them will
take up most of your time.
