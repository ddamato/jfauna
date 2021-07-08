# jFauna

jQuery-like chainable methods to make FaunaDB more accessible

## Installation
```sh
npm i jfauna
```

## Usage
```js
const jFauna = require('jfauna');
const serverClient = require('./faunadb-serverclient');

const $ = new jFauna(serverClient);

// get first post
$('posts').get(1).now().then((posts) => console.log(posts.length)); // 1

// get all posts where title is 'My first post'
$('posts').get().where('title').is('My first post').then((posts) => posts[0].title); // 'My first post'
```

## API

It starts by creating a new instance of `jFauna` and passing in your server client instance as the argument. This allows the instance to make calls to your database with the correct permissions.

```js
const $ = new jFauna(serverClient);
```

From here, you can make simple queries to your database. One of the easiest things to do is to create/reference a collection.

```js
await $('posts'); // Either create or reference a collection called 'posts'
```

This will either create the collection if it doesn't exist or start the query using this collection.

### CRUD

From the collection, you can query using the following CRUD commands:

- `.create(data)` - Creates documents in the collection 
- `.get(amount)` - Gets the specified number of documents (requires longer chain).
- `.update(data)` - Updates the documents in the collection (requires longer chain).
- `.remove(amount)` - Deletes the specified number documents (requires longer chain).

### Chaining

All the CRUD methods (except `.create()`) have the following chains possible. Each returns a promise.

- `.now()` - Executes the query now on the collection. If no amount is set prior, the default is 64 (FaunaDB default).
- `.where(field).is(value)` - Executes a search on the collection for where a given field equals the given value.
- `.where(field).isnt(value)` - Executes a search on the collection for where a given field does not equal the given value.

### Examples

```js
// Create a user
$('users').create({ name: 'Jane Doe', email: 'old@email.com' });

// Update email address for user(s)
$('users').update({ email: 'new@email.com' }).where('email').is('old@email.com');

// Get the first user named Jane Doe
$('users').get(1).where('name').is('Jane Doe');

// Deleting all users (collection still exists)
$('users').delete().now();
```

## Future ideas

- Case-insensitive searching
- Customized methods (change `.is()` to `.equals()`)
- `.includes(value)` - partial search
- `.between(lower).and(upper)` - range search
- `.lt(number)`, `.gt(number)`, `.lte(number)`, `.gte(number)` - numbers / dates

## Purpose

I really loved the idea of FaunaDB, easy database of JSON blobs that you could query in static site hosting platforms. It's conceptually good for small projects where you need to store data but the language of constructing queries is super ugly.

This is what you need to do to get all entries (documents) in a table (collection), assuming you have the database and client:

```fql
CreateIndex({
  name: 'all-posts',
  source: Collection('Posts'),
})

Map(
  Paginate(
    Match(
      Index('all-posts')
    )
  ),
  Lambda(
    'x',
    Get(
      Var('x')
    )
  )
)
```

This, doesn't look fun to construct at all. Imagine trying to get entries for a specific kind of value. Probably much worse!

So, I dove into the language and began trying to make an abstraction layer for the language that helps do common operations without the need to know what's happening under-the-hood. As a user just looking to store data, I don't want to need to construct an index everytime I make a query. It should just make the query and be smart enough to know the index.

I also made this to have chainable methods that look alot like jQuery or testing assertion libraries. This gets the composition looking closer to the description of the request in easily readable terms. I've also begun to build this with jQuery's no-failure principle. The application shouldn't stop because you've made a mistake, but we should still log if something goes wrong. Not everything is prepared to sliently fail this way yet.

