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
$('posts').get(1).now().then(({ data }) => console.log(data.length)); // 1

// get all posts where title is 'My first post'
$('posts').get().where('title').is('My first post').then(({ data }) => console.log(data));
```

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

