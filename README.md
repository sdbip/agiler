# Agiler (name pending)

Agiler is a planning tool for agile development

## the Domain

YAGNI teaches that you should never produce anything that isn't motivated by a
higher goal (because You Are not Going to Need It, and everything will add
complexity and slow down the development effort). In that spirit, Agiler starts
with minimum marketable *features*. Features lead to *stories* and stories lead
to *tasks*.

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
